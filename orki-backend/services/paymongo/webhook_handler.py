"""
PayMongo Webhook Handler
========================

CRITICAL: This is the ONLY source of truth for payment confirmation.

Process:
1. Receive webhook from PayMongo
2. Verify webhook signature
3. Check idempotency (webhook event ID)
4. Extract payment info and user metadata
5. Mark subscription as ACTIVE with 30-day expiry
6. Log all actions for audit

Webhook Security:
- All payments MUST come through webhook
- NEVER trust client claims about payment
- Verify signature on every webhook
- Prevent duplicate processing
"""
import json
import logging
from typing import Optional

from django.utils import timezone

from users.models import Subscription, UserProfile
from .payment_service import PayMongoService, WebhookVerificationError, PayMongoError

logger = logging.getLogger(__name__)


class WebhookHandler:
    """Handles PayMongo webhook events."""

    @staticmethod
    def handle_checkout_session_payment_paid(event_data: dict) -> dict:
        """
        Handle 'checkout_session.payment.paid' webhook event.
        
        This event is triggered when payment is successfully confirmed.
        Sets subscription to ACTIVE.
        
        Args:
            event_data: Webhook event data from PayMongo
            
        Returns:
            Response dict with status and message
            
        Raises:
            ValueError if event data is invalid
        """
        # Extract event metadata from the 'data' wrapper
        event_id = event_data.get("data", {}).get("id")
        logger.info(f"Processing webhook event: {event_id}")
        
        if not event_id:
            logger.error("Missing event ID in webhook")
            raise ValueError("Missing event ID")
        
        # Extract payment information from webhook
        # PayMongo structure: event.data.attributes.data = checkout_session
        checkout_session = event_data.get("data", {}).get("attributes", {}).get("data", {})
        checkout_attributes = checkout_session.get("attributes", {})
        
        # Get user metadata from checkout
        metadata = checkout_attributes.get("metadata", {})
        user_id = metadata.get("user_id")
        user_email = metadata.get("user_email")
        
        # Get the payment from the payments array
        payments = checkout_attributes.get("payments", [])
        if not payments:
            logger.error("No payments found in checkout")
            raise ValueError("No payments in checkout")
        
        payment_data = payments[0]  # Get first payment
        payment_id = payment_data.get("id")
        payment_attributes = payment_data.get("attributes", {})
        payment_status = payment_attributes.get("status")  # Should be "paid"
        payment_method_obj = payment_attributes.get("payment_method", {})
        payment_method = payment_method_obj.get("type", "unknown")
        
        logger.info(f"Payment: {payment_id}, Status: {payment_status}, Method: {payment_method}, User: {user_id}")
        
        # Validation
        if not user_id or not user_email:
            logger.error(f"✗ Missing user metadata in webhook. Metadata: {metadata}")
            raise ValueError("Missing user metadata in webhook")
        
        if payment_status != "paid":
            logger.warning(f"⚠ Payment status is '{payment_status}', expected 'paid'")
            raise ValueError(f"Payment not in 'paid' status: {payment_status}")
        
        # Convert user_id to int
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            logger.error(f"✗ Invalid user_id: {user_id}")
            raise ValueError(f"Invalid user_id: {user_id}")
        
        # ─────────────────────────────────────────────────────────────────────
        # IDEMPOTENCY CHECK: Prevent duplicate processing
        # ─────────────────────────────────────────────────────────────────────
        try:
            subscription = Subscription.objects.get(user_id=user_id)
            
            if subscription.last_webhook_event_id == event_id:
                logger.warning(f"⚠ Duplicate webhook event detected. Event ID: {event_id}")
                logger.warning(f"   Subscription already processed this event.")
                return {
                    "success": True,
                    "message": "Webhook already processed (idempotent)",
                    "user_id": user_id,
                    "event_id": event_id,
                }
        except Subscription.DoesNotExist:
            logger.info(f"ℹ No existing subscription for user {user_id}. Creating new.")
        
        # ─────────────────────────────────────────────────────────────────────
        # GET OR CREATE USER & SUBSCRIPTION
        # ─────────────────────────────────────────────────────────────────────
        try:
            user_profile = UserProfile.objects.get(id=user_id)
            logger.info(f"✓ Found user: {user_profile.email}")
        except UserProfile.DoesNotExist:
            logger.error(f"✗ User {user_id} not found in database")
            raise ValueError(f"User {user_id} not found")
        
        # Verify email matches
        if user_profile.email != user_email:
            logger.warning(f"⚠ Email mismatch. DB: {user_profile.email}, Webhook: {user_email}")
            # Don't fail - webhook might have different email format
        
        # ─────────────────────────────────────────────────────────────────────
        # CREATE OR UPDATE SUBSCRIPTION
        # ─────────────────────────────────────────────────────────────────────
        subscription, created = Subscription.objects.get_or_create(user=user_profile)
        
        if created:
            logger.info(f"✓ Created new subscription for user {user_id}")
        else:
            logger.info(f"✓ Updating existing subscription for user {user_id}")
        
        # Mark subscription as active via webhook (this sets all dates and status)
        # Map payment method from PayMongo format to our format
        payment_method_normalized = WebhookHandler._normalize_payment_method(payment_method)
        
        subscription.mark_as_active_via_webhook(
            webhook_event_id=event_id,
            payment_id=payment_id,
            payment_method=payment_method_normalized,
        )
        
        logger.info(f"Subscription marked as ACTIVE")
        logger.info(f"  - Plan: {subscription.plan_name}")
        logger.info(f"  - Amount: ₱{subscription.amount_php}")
        logger.info(f"  - Payment Method: {subscription.payment_method}")
        logger.info(f"  - Start Date: {subscription.start_date}")
        logger.info(f"  - Expiry Date: {subscription.expiry_date}")
        logger.info(f"Webhook processed successfully: User {user_id} subscription activated")
        
        return {
            "success": True,
            "message": "Subscription activated successfully",
            "user_id": user_id,
            "user_email": user_email,
            "event_id": event_id,
            "subscription_status": subscription.status,
            "expiry_date": subscription.expiry_date.isoformat(),
        }

    @staticmethod
    def _normalize_payment_method(paymongo_method: str) -> str:
        """
        Normalize PayMongo payment method to Orki format.
        
        PayMongo uses: "card", "gcash", "paymaya", "qrph", etc.
        Map to: ("gcash", "paymaya", "card", "qrph")
        """
        method_map = {
            "card": "card",
            "gcash": "gcash",
            "paymaya": "paymaya",
            "qrph": "qrph",
        }
        
        normalized = method_map.get(paymongo_method, "unknown")
        logger.info(f"Payment method: {paymongo_method} → {normalized}")
        return normalized

    @staticmethod
    def process_webhook(request_body: bytes, signature_header: str) -> dict:
        """
        Main webhook processing entry point.
        
        Args:
            request_body: Raw request body as bytes
            signature_header: X-Paymongo-Signature header value
            
        Returns:
            Response dict
            
        Raises:
            WebhookVerificationError if signature is invalid
            PayMongoError if processing fails
        """
        # ─────────────────────────────────────────────────────────────────────
        # STEP 1: VERIFY WEBHOOK SIGNATURE
        # ─────────────────────────────────────────────────────────────────────
        logger.info("🔐 Verifying webhook signature...")
        
        try:
            if not PayMongoService.verify_webhook_signature(request_body, signature_header):
                logger.error("✗ Webhook signature verification failed")
                raise WebhookVerificationError("Invalid webhook signature")
        except Exception as e:
            logger.error(f"✗ Webhook verification error: {str(e)}")
            raise WebhookVerificationError(f"Webhook verification failed: {str(e)}")
        
        logger.info("✓ Webhook signature verified")
        
        # ─────────────────────────────────────────────────────────────────────
        # STEP 2: PARSE WEBHOOK EVENT
        # ─────────────────────────────────────────────────────────────────────
        logger.info("📋 Parsing webhook event...")
        
        try:
            event = PayMongoService.parse_webhook_event(request_body)
        except Exception as e:
            logger.error(f"✗ Failed to parse webhook event: {str(e)}")
            raise PayMongoError(f"Failed to parse webhook: {str(e)}")
        
        logger.info("✓ Webhook event parsed")
        
        # ─────────────────────────────────────────────────────────────────────
        # STEP 3: ROUTE TO HANDLER BASED ON EVENT TYPE
        # ─────────────────────────────────────────────────────────────────────
        # PayMongo nests the event type in data.attributes.type
        event_type = event.get("data", {}).get("attributes", {}).get("type")
        logger.info(f"📌 Event type: {event_type}")
        
        if event_type == "checkout_session.payment.paid":
            return WebhookHandler.handle_checkout_session_payment_paid(event)
        else:
            # Ignore other webhook types (we only care about payment.paid)
            logger.info(f"ℹ Ignoring webhook event type: {event_type}")
            return {
                "success": True,
                "message": f"Event type '{event_type}' ignored",
            }
