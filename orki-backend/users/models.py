from django.db import models


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
