"""
send_daily_study_reminders
==========================
Django management command that sends the daily study-reminder email to every
user who has ``daily_study_reminders = true`` in their Firestore preferences
AND whose preferred study time (hour) matches the current UTC hour.

Usage
-----
Run once per hour via cron (or any scheduler):

    # crontab  -e
    0 * * * * cd /path/to/orki-backend && python manage.py send_daily_study_reminders

Or target a specific hour for testing:

    python manage.py send_daily_study_reminders --dry-run
    python manage.py send_daily_study_reminders --hour 20

Architecture
------------
- User emails/UIDs live in Django's UserProfile table.
- Notification preferences live in Firestore: users/{uid}.preferences
- The command batch-fetches Firestore docs to minimise round-trips, then
  filters locally for users whose reminder hour matches now (UTC).
"""

from __future__ import annotations

import random
from datetime import datetime, timezone as tz
from typing import Any

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand, CommandError
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from services.firebase.firestore import get_firestore_client
from users.models import UserProfile

# ─── Motivational quotes ──────────────────────────────────────────────────────

STUDY_QUOTES: list[tuple[str, str]] = [
    (
        "Success is the sum of small efforts, repeated day in and day out.",
        "Robert Collier",
    ),
    (
        "The secret of getting ahead is getting started.",
        "Mark Twain",
    ),
    (
        "You don't have to be great to start, but you have to start to be great.",
        "Zig Ziglar",
    ),
    (
        "Education is not the filling of a pail, but the lighting of a fire.",
        "W.B. Yeats",
    ),
    (
        "Believe you can and you're halfway there.",
        "Theodore Roosevelt",
    ),
    (
        "The expert in anything was once a beginner.",
        "Helen Hayes",
    ),
    (
        "Push yourself, because no one else is going to do it for you.",
        "Unknown",
    ),
    (
        "Dream it. Wish it. Do it.",
        "Unknown",
    ),
    (
        "Great things never come from comfort zones.",
        "Unknown",
    ),
    (
        "It always seems impossible until it's done.",
        "Nelson Mandela",
    ),
    (
        "Don't watch the clock; do what it does. Keep going.",
        "Sam Levenson",
    ),
    (
        "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        "Winston Churchill",
    ),
    (
        "Little by little, a little becomes a lot.",
        "Tanzanian Proverb",
    ),
    (
        "The harder you work for something, the greater you'll feel when you achieve it.",
        "Unknown",
    ),
    (
        "Study while others are sleeping; work while others are loafing; prepare while "
        "others are playing; and dream while others are wishing.",
        "William Arthur Ward",
    ),
    (
        "There is no substitute for hard work.",
        "Thomas Edison",
    ),
    (
        "An investment in knowledge pays the best interest.",
        "Benjamin Franklin",
    ),
    (
        "Learning is not attained by chance; it must be sought for with ardor and attended "
        "to with diligence.",
        "Abigail Adams",
    ),
    (
        "The beautiful thing about learning is that no one can take it away from you.",
        "B.B. King",
    ),
    (
        "Education is the passport to the future, for tomorrow belongs to those who prepare "
        "for it today.",
        "Malcolm X",
    ),
]

# ─── Exam display names ───────────────────────────────────────────────────────

EXAM_DISPLAY: dict[str, str] = {
    "LEPT": "Licensure Examination for Professional Teachers (LEPT)",
    "CSE": "Career Service Examination (CSE)",
    "PmLE": "Psychometricians Licensure Examination (PmLE)",
    "CLE": "Criminologist Licensure Examination (CLE)",
}


class Command(BaseCommand):
    help = (
        "Send daily study-reminder emails to users whose preferred study time "
        "matches the current UTC hour and who have daily_study_reminders enabled."
    )

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument(
            "--hour",
            type=int,
            default=None,
            help="Override the current UTC hour (0-23) for testing.",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print recipients and preview without sending any emails.",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        target_hour: int = (
            options["hour"]
            if options["hour"] is not None
            else datetime.now(tz=tz.utc).hour
        )
        dry_run: bool = options["dry_run"]

        self.stdout.write(
            self.style.MIGRATE_HEADING(
                f"[send_daily_study_reminders] target hour={target_hour:02d}:xx UTC"
                + (" (DRY RUN)" if dry_run else "")
            )
        )

        # ── 1. Load all user profiles from Django DB ─────────────────────────
        profiles = list(
            UserProfile.objects.filter(
                onboarding_completed=True,
            ).values("firebase_uid", "email", "first_name", "display_name", "exam_type", "exam_date")
        )

        if not profiles:
            self.stdout.write("No eligible user profiles found.")
            return

        self.stdout.write(f"Checking {len(profiles)} user profile(s)…")

        # ── 2. Batch-fetch Firestore preference docs ─────────────────────────
        db = get_firestore_client()
        refs = [db.collection("users").document(p["firebase_uid"]) for p in profiles]

        # Firestore get_all() fetches up to 500 docs in a single RPC
        snapshots: dict[str, Any] = {}
        BATCH = 500
        for i in range(0, len(refs), BATCH):
            for snap in db.get_all(refs[i : i + BATCH]):
                if snap.exists:
                    snapshots[snap.id] = snap.to_dict()

        # ── 3. Filter by preference + hour match ─────────────────────────────
        recipients: list[dict] = []
        for profile in profiles:
            uid = profile["firebase_uid"]
            doc = snapshots.get(uid, {})
            prefs = doc.get("preferences", {})

            if not prefs.get("daily_study_reminders", False):
                continue

            preferred_time: str = prefs.get("preferred_study_time", "20:00")
            try:
                pref_hour = int(preferred_time.split(":")[0])
            except (ValueError, IndexError):
                pref_hour = 20  # sensible fallback

            if pref_hour != target_hour:
                continue

            recipients.append(
                {
                    **profile,
                    "preferred_time": preferred_time,
                }
            )

        if not recipients:
            self.stdout.write(
                self.style.WARNING(
                    f"No users scheduled for hour {target_hour:02d}:xx UTC."
                )
            )
            return

        self.stdout.write(
            f"Sending to {len(recipients)} recipient(s) at hour {target_hour:02d}:xx UTC…"
        )

        # ── 4. Send emails ────────────────────────────────────────────────────
        frontend_url: str = getattr(settings, "FRONTEND_URL", "https://orki.cosedevs.com")
        sent = 0
        failed = 0

        for user in recipients:
            try:
                self._send_reminder(user, frontend_url, dry_run=dry_run)
                sent += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"  {'[DRY RUN] ' if dry_run else ''}→ {user['email']}"
                    )
                )
            except Exception as exc:  # noqa: BLE001
                failed += 1
                self.stdout.write(
                    self.style.ERROR(f"  ✗ {user['email']}: {exc}")
                )

        summary = f"Done. Sent: {sent}, Failed: {failed}."
        self.stdout.write(
            self.style.SUCCESS(summary) if not failed else self.style.WARNING(summary)
        )

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _send_reminder(
        self,
        user: dict,
        frontend_url: str,
        *,
        dry_run: bool,
    ) -> None:
        quote_text, quote_author = random.choice(STUDY_QUOTES)

        first_name: str = (
            user.get("first_name")
            or (user.get("display_name") or "").split()[0]
            or "there"
        )
        exam_type: str = user.get("exam_type") or ""
        exam_name: str = EXAM_DISPLAY.get(exam_type, "your upcoming exam")

        # Days-until-exam countdown
        days_until_exam: int | None = None
        if user.get("exam_date"):
            today = datetime.now(tz=tz.utc).date()
            delta = (user["exam_date"] - today).days
            if 0 <= delta <= 90:
                days_until_exam = delta

        context = {
            "first_name": first_name,
            "exam_name": exam_name,
            "quote_text": quote_text,
            "quote_author": quote_author,
            "study_url": f"{frontend_url}/exams",
            "profile_url": f"{frontend_url}/profile",
            "unsubscribe_url": f"{frontend_url}/profile",
            "streak_days": None,           # TODO: populate from analytics if needed
            "days_until_exam": days_until_exam,
        }

        html_body = render_to_string("users/emails/daily_reminder.html", context)
        text_body = strip_tags(html_body)

        subject = f"📚 Time to study, {first_name}! Your daily Orki session awaits"

        if dry_run:
            self.stdout.write(f"\n    Subject : {subject}")
            self.stdout.write(f"    To      : {user['email']}")
            self.stdout.write(f"    Quote   : "{quote_text}" — {quote_author}\n")
            return

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user["email"]],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)
