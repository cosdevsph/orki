from django.db import models
from django.utils import timezone


class UserProfile(models.Model):
    """
    Represents a registered Orki user, identified by their Firebase UID.
    Django's built-in User model is NOT used so that Firebase remains the
    single source of truth for credentials.
    """

    EXAM_CHOICES = [
        ("LEPT", "Licensure Examination for Professional Teachers"),
        ("CSE", "Career Service Examination"),
        ("PmLE", "Psychometricians Licensure Examination"),
        ("CLE", "Criminologist Licensure Examination"),
    ]

    PROFESSIONAL_TITLE_MAP = {
        "LEPT": "LPT",
        "CSE": "CSE Passer",
        "PmLE": "RPM",
        "CLE": "RCrim",
    }

    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField(max_length=254)
    display_name = models.CharField(max_length=255, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    exam_type = models.CharField(max_length=20, choices=EXAM_CHOICES, blank=True)
    exam_date = models.DateField(null=True, blank=True, help_text="Target date for the actual exam")
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_profiles"

    @property
    def professional_title(self) -> str:
        """Derived title based on exam type (e.g. LEPT → LPT)."""
        return self.PROFESSIONAL_TITLE_MAP.get(self.exam_type, "")

    def __str__(self) -> str:
        return f"{self.display_name or self.email} ({self.firebase_uid[:8]}…)"


class Subscription(models.Model):
    """
    Production-grade subscription tracking model.
    
    Status flow:
    - no_subscription (initial)
    - active (after webhook payment.paid)
    - expired (after expiry_date)
    - cancelled (manual cancellation)
    
    CRITICAL: webhook is the ONLY source of truth for payment confirmation.
    """

    STATUS_CHOICES = [
        ("no_subscription", "No Subscription"),
        ("active", "Active Subscriber"),
        ("expired", "Subscription Expired"),
        ("cancelled", "Subscription Cancelled"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("gcash", "GCash"),
        ("paymaya", "PayMaya"),
        ("card", "Credit/Debit Card"),
        ("qrph", "QRPh"),
        ("unknown", "Unknown"),
    ]

    # User reference
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name="subscription")
    
    # Plan information
    plan_name = models.CharField(max_length=100, default="Orki Basic ₱49")
    amount_php = models.DecimalField(max_digits=10, decimal_places=2, default=49.00)
    currency = models.CharField(max_length=3, default="PHP")
    
    # Status & payment method
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="no_subscription", db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default="unknown", blank=True)
    
    # PayMongo integration
    paymongo_checkout_id = models.CharField(
        max_length=255, blank=True, db_index=True, 
        help_text="PayMongo checkout session ID"
    )
    paymongo_payment_id = models.CharField(
        max_length=255, blank=True, db_index=True, 
        help_text="PayMongo payment ID (source of truth)"
    )
    paymongo_reference_number = models.CharField(
        max_length=255, blank=True, 
        help_text="PayMongo reference number for user communication"
    )
    
    # Webhook idempotency: store webhook event ID to prevent duplicate processing
    last_webhook_event_id = models.CharField(
        max_length=255, blank=True, db_index=True, 
        help_text="Last webhook event ID processed (idempotency)"
    )
    
    # Timestamps - CRITICAL for access control
    start_date = models.DateTimeField(null=True, blank=True, help_text="When subscription became active")
    expiry_date = models.DateTimeField(null=True, blank=True, help_text="When subscription expires (now + 30 days)")
    payment_confirmed_at = models.DateTimeField(null=True, blank=True, help_text="When webhook confirmed payment")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subscriptions"
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['paymongo_payment_id']),
            models.Index(fields=['last_webhook_event_id']),
            models.Index(fields=['expiry_date']),
        ]

    @property
    def is_active(self) -> bool:
        """
        Check if subscription is currently active.
        BACKEND MUST use this for access control.
        """
        if self.status != "active":
            return False
        
        # Check expiry date
        if self.expiry_date and self.expiry_date < timezone.now():
            return False
        
        return True

    @property
    def is_expired(self) -> bool:
        """Check if subscription has expired."""
        if not self.expiry_date:
            return False
        return self.expiry_date < timezone.now()

    def mark_as_active_via_webhook(self, webhook_event_id: str, payment_id: str, 
                                   payment_method: str = "unknown") -> None:
        """
        Called by webhook handler after payment.paid confirmation.
        Sets subscription to active with 30-day expiry.
        
        Args:
            webhook_event_id: PayMongo webhook event ID (for idempotency)
            payment_id: PayMongo payment ID
            payment_method: Payment method used (gcash, paymaya, card, qrph)
        """
        from django.utils import timezone
        
        now = timezone.now()
        expiry = now + timezone.timedelta(days=30)
        
        self.status = "active"
        self.paymongo_payment_id = payment_id
        self.payment_method = payment_method
        self.last_webhook_event_id = webhook_event_id
        self.start_date = now
        self.expiry_date = expiry
        self.payment_confirmed_at = now
        self.save(
            update_fields=[
                "status", "paymongo_payment_id", "payment_method", "last_webhook_event_id",
                "start_date", "expiry_date", "payment_confirmed_at", "updated_at"
            ]
        )

    def __str__(self) -> str:
        return f"{self.user.email} — {self.get_status_display()} (expires: {self.expiry_date})"
