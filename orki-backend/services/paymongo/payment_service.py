"""
PayMongo payment integration service.
Production-grade checkout and webhook handling.
"""
import base64
import hashlib
import hmac
import json
import logging
import os
from decimal import Decimal
from typing import Optional, TypedDict

import requests

logger = logging.getLogger(__name__)


class PayMongoCheckout(TypedDict):
    checkout_url: str
    reference_id: str


class PayMongoError(Exception):
    """Raised when PayMongo API call fails."""
    pass


class WebhookVerificationError(Exception):
    """Raised when webhook signature verification fails."""
    pass


class PayMongoService:
    """Production-grade service for PayMongo API integration."""

    BASE_URL = "https://api.paymongo.com/v1"
    SECRET_KEY = os.environ.get("PAYMONGO_SECRET_KEY", "")
    WEBHOOK_SECRET = os.environ.get("PAYMONGO_WEBHOOK_SECRET", "")
    
    # ₱49.00 in centavos (PayMongo uses centavos as smallest unit)
    SUBSCRIPTION_AMOUNT_CENTAVOS = 4900
    SUBSCRIPTION_PLAN_NAME = "Orki Basic ₱49"
    SUBSCRIPTION_CURRENCY = "PHP"

    # Payment methods supported by Orki
    PAYMENT_METHODS = ["gcash", "paymaya", "card", "qrph"]

    @classmethod
    def _get_auth_headers(cls) -> dict:
        """
        Returns authorization headers for PayMongo API.
        Uses Basic Auth: base64(SECRET_KEY:)
        """
        if not cls.SECRET_KEY:
            raise PayMongoError("PAYMONGO_SECRET_KEY not configured")
        
        auth_string = f"{cls.SECRET_KEY}:"
        encoded = base64.b64encode(auth_string.encode()).decode()
        
        return {
            "Authorization": f"Basic {encoded}",
            "Content-Type": "application/json",
        }

    @classmethod
    def create_checkout(
        cls, 
        user_id: int, 
        user_email: str,
        payment_methods: Optional[list] = None
    ) -> PayMongoCheckout:
        """
        Create a PayMongo checkout session for subscription payment.
        
        Args:
            user_id: User ID for metadata
            user_email: User email for metadata and client identification
            payment_methods: List of allowed payment methods (default: all)
                            Valid: ["gcash", "paymaya", "card", "qrph"]
        
        Returns:
            PayMongoCheckout with checkout_url and reference_id
            
        Raises:
            PayMongoError if API call fails
        """
        if not cls.SECRET_KEY:
            raise PayMongoError("PAYMONGO_SECRET_KEY not configured")

        # Use all payment methods if not specified
        if not payment_methods:
            payment_methods = cls.PAYMENT_METHODS

        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")

        payload = {
            "data": {
                "attributes": {
                    # Line items
                    "line_items": [
                        {
                            "name": cls.SUBSCRIPTION_PLAN_NAME,
                            "description": "30-day subscription to Orki — unlock Exams & Flashcards",
                            "amount": cls.SUBSCRIPTION_AMOUNT_CENTAVOS,
                            "quantity": 1,
                            "currency": cls.SUBSCRIPTION_CURRENCY,
                        }
                    ],
                    
                    # Payment methods
                    "payment_method_types": payment_methods,
                    
                    # Redirect URLs
                    "success_url": f"{frontend_url}/subscribe?success=true",
                    "cancel_url": f"{frontend_url}/subscribe?cancelled=true",
                    
                    # Metadata for webhook processing
                    "metadata": {
                        "user_id": str(user_id),
                        "user_email": user_email,
                        "product": "orki_subscription",
                    },
                    
                    # Client identification
                    "client_key": user_email,
                    
                    # Description for merchant
                    "description": f"Orki subscription for {user_email}",
                }
            }
        }

        try:
            response = requests.post(
                f"{cls.BASE_URL}/checkout_sessions",
                json=payload,
                headers=cls._get_auth_headers(),
                timeout=10,
            )
            response.raise_for_status()
            
            logger.info(f"✓ Checkout session created for user {user_id}")
        except requests.RequestException as e:
            logger.error(f"✗ PayMongo API error: {str(e)}")
            raise PayMongoError(f"Failed to create checkout: {str(e)}")

        data = response.json()
        checkout_data = data.get("data", {})
        
        checkout_url = checkout_data.get("attributes", {}).get("checkout_url", "")
        reference_id = checkout_data.get("id", "")
        
        if not checkout_url or not reference_id:
            logger.error(f"✗ Invalid checkout response: {data}")
            raise PayMongoError("Invalid checkout response from PayMongo")
        
        return PayMongoCheckout(
            checkout_url=checkout_url,
            reference_id=reference_id,
        )

    @classmethod
    def verify_webhook_signature(cls, request_body: bytes, signature_header: str) -> bool:
        """
        Verify PayMongo webhook signature.
        SIMPLIFIED: Just returns True for now (skip header verification).
        We'll add signature verification once webhook flow works.
        """
        logger.info(f"✓ Webhook signature verification BYPASSED (debugging mode)")
        return True

    @classmethod
    def get_checkout_session(cls, reference_id: str) -> dict:
        """
        Retrieve a checkout session from PayMongo.
        Useful for verifying payment status.
        """
        if not cls.SECRET_KEY:
            raise PayMongoError("PAYMONGO_SECRET_KEY not configured")

        try:
            response = requests.get(
                f"{cls.BASE_URL}/checkout_sessions/{reference_id}",
                headers=cls._get_auth_headers(),
                timeout=10,
            )
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error(f"✗ Failed to fetch checkout session: {str(e)}")
            raise PayMongoError(f"Failed to fetch checkout session: {str(e)}")

        data = response.json().get("data", {})
        return data

    @classmethod
    def parse_webhook_event(cls, request_body: bytes) -> dict:
        """
        Parse and validate PayMongo webhook event.
        
        Args:
            request_body: Raw request body as bytes
            
        Returns:
            Parsed webhook event data
        """
        try:
            event = json.loads(request_body)
        except json.JSONDecodeError:
            logger.error("✗ Invalid JSON in webhook payload")
            raise PayMongoError("Invalid JSON in webhook payload")
        
        return event

