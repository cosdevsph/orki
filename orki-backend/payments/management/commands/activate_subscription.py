"""
Management command: activate_subscription

Manually activates a subscription for a user whose PayMongo checkout
completed but whose Firestore subscription was never updated (webhook
missed, verify fallback failed, or production env misconfigured).

Usage:
    # By Firebase UID (preferred — document ID in subscriptions collection)
    python manage.py activate_subscription --uid <firebase_uid>

    # By email (looks up UID from Firestore users collection)
    python manage.py activate_subscription --email sky05922@gmail.com

    # Force-activate without PayMongo confirmation (use only when you have
    # manually confirmed payment in the PayMongo dashboard)
    python manage.py activate_subscription --uid <firebase_uid> --force

Examples:
    python manage.py activate_subscription --email sky05922@gmail.com
    python manage.py activate_subscription --uid abc123xyz --force
"""
import logging
from datetime import datetime, timedelta, timezone as tz

from django.core.management.base import BaseCommand, CommandError

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Manually activate a user subscription via PayMongo checkout sync or force-activate."

    def add_arguments(self, parser):
        group = parser.add_mutually_exclusive_group(required=True)
        group.add_argument("--uid", help="Firebase UID of the user")
        group.add_argument("--email", help="Email of the user (looks up UID from Firestore)")
        parser.add_argument(
            "--force",
            action="store_true",
            default=False,
            help=(
                "Force-activate without contacting PayMongo. "
                "Only use after manually confirming payment in the PayMongo dashboard."
            ),
        )
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Subscription duration in days when using --force (default: 30)",
        )

    def handle(self, *args, **options):
        uid = options["uid"]
        email = options["email"]
        force = options["force"]
        days = options["days"]

        # ── Resolve UID ────────────────────────────────────────────────────
        if email and not uid:
            uid = self._resolve_uid_from_email(email)
            if not uid:
                raise CommandError(f"No Firestore user found with email: {email}")
            self.stdout.write(f"Resolved uid={uid} for email={email}")

        # ── Fetch current subscription ─────────────────────────────────────
        from services.firebase.firestore import get_subscription, update_subscription
        sub = get_subscription(uid)

        self.stdout.write(f"\nCurrent subscription for uid={uid}:")
        self.stdout.write(f"  status          : {sub.get('status', 'N/A')}")
        self.stdout.write(f"  is_active       : {sub.get('is_active', False)}")
        self.stdout.write(f"  checkout_id     : {sub.get('paymongo_checkout_id', 'N/A')}")
        self.stdout.write(f"  expiry_date     : {sub.get('expiry_date', 'N/A')}")

        if sub.get("is_active"):
            self.stdout.write(self.style.SUCCESS("\nSubscription is already active — nothing to do."))
            return

        if force:
            self._force_activate(uid, sub, days, update_subscription)
            return

        checkout_id = sub.get("paymongo_checkout_id", "")
        if not checkout_id:
            raise CommandError(
                "No paymongo_checkout_id found in Firestore subscription document. "
                "Use --force if you have manually confirmed payment in PayMongo."
            )

        self._sync_from_paymongo(uid, checkout_id)

    # ── Helpers ────────────────────────────────────────────────────────────

    def _resolve_uid_from_email(self, email: str):
        """Look up Firebase UID from Firestore users collection by email."""
        from services.firebase.firebase_admin import get_firebase_app
        get_firebase_app()
        from firebase_admin import firestore as fb_firestore
        db = fb_firestore.client()
        docs = db.collection("users").where("email", "==", email).limit(1).stream()
        for doc in docs:
            return doc.id  # document ID is the Firebase UID
        return None

    def _sync_from_paymongo(self, uid: str, checkout_id: str):
        """Fetch checkout from PayMongo and activate if payment is confirmed."""
        from services.paymongo import PayMongoError, PayMongoService
        from services.paymongo.webhook_handler import WebhookHandler

        self.stdout.write(f"\nFetching checkout {checkout_id} from PayMongo...")
        try:
            checkout_data = PayMongoService.get_checkout_session(checkout_id)
        except PayMongoError as exc:
            raise CommandError(
                f"PayMongo API error: {exc}\n"
                "Check that PAYMONGO_SECRET_KEY is set correctly in your environment. "
                "Use --force if you have manually confirmed payment in the PayMongo dashboard."
            )

        checkout_attrs = checkout_data.get("attributes", {})
        self.stdout.write(f"  checkout status : {checkout_attrs.get('status', 'unknown')}")

        payments = checkout_attrs.get("payments", [])
        if payments:
            pay_status = payments[0].get("attributes", {}).get("status", "unknown")
            self.stdout.write(f"  payment status  : {pay_status}")

        result = WebhookHandler.sync_from_checkout_session(uid, checkout_data)

        if result.get("is_active"):
            self.stdout.write(self.style.SUCCESS(
                f"\n✓ Subscription ACTIVATED for uid={uid}\n"
                f"  expires: {result.get('expiry_date', 'N/A')}"
            ))
        else:
            raise CommandError(
                f"Payment not confirmed by PayMongo: {result.get('detail')}\n"
                "If you are sure the user paid (check PayMongo dashboard), use --force."
            )

    def _force_activate(self, uid: str, sub: dict, days: int, update_subscription):
        """Force-activate without contacting PayMongo."""
        now = datetime.now(tz.utc)
        expiry = now + timedelta(days=days)
        checkout_id = sub.get("paymongo_checkout_id", "")

        self.stdout.write(self.style.WARNING(
            f"\n⚠  Force-activating subscription for uid={uid} "
            f"(no PayMongo confirmation)..."
        ))

        update_subscription(uid, {
            "status": "active",
            "plan_name": "Orki Basic ₱49",
            "amount_php": 49.00,
            "payment_method": "manual_activation",
            "paymongo_checkout_id": checkout_id,
            "start_date": now.isoformat(),
            "expiry_date": expiry.isoformat(),
            "payment_confirmed_at": now.isoformat(),
        })

        self.stdout.write(self.style.SUCCESS(
            f"\n✓ Subscription FORCE-ACTIVATED for uid={uid}\n"
            f"  expires: {expiry.date()}\n"
            f"  (No payment record — for manual confirmation only)"
        ))
