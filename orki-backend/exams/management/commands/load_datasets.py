"""
management/commands/load_datasets.py

Django management command that imports JSON question datasets into the database.

Usage:
    python manage.py load_datasets
    python manage.py load_datasets --exam_type LEPT
    python manage.py load_datasets --exam_type CSE --subject verbal
    python manage.py load_datasets --dry_run
"""
from django.core.management.base import BaseCommand

from services.datasets.loader import load_all_datasets


class Command(BaseCommand):
    help = "Load JSON question datasets into MockExam and MockExamQuestion models."

    def add_arguments(self, parser):
        parser.add_argument(
            "--exam_type",
            type=str,
            default=None,
            help="Filter by exam type: LEPT, CSE, PmLE, or CLE",
        )
        parser.add_argument(
            "--subject",
            type=str,
            default=None,
            help="Filter by subject name fragment (e.g. 'english', 'verbal')",
        )
        parser.add_argument(
            "--dry_run",
            action="store_true",
            default=False,
            help="Scan dataset files and report counts without writing to the database",
        )

    def handle(self, *args, **options):
        exam_type = options.get("exam_type")
        subject = options.get("subject")
        dry_run = options.get("dry_run")

        if dry_run:
            from services.datasets.loader import get_dataset_files, load_dataset_file  # noqa: PLC0415
            files = get_dataset_files(exam_type=exam_type, subject=subject)
            self.stdout.write(self.style.WARNING(f"DRY RUN — found {len(files)} dataset file(s):"))
            total_questions = 0
            for f in files:
                data = load_dataset_file(f)
                if data:
                    q_count = len(data.get("questions", []))
                    total_questions += q_count
                    self.stdout.write(f"  {f.relative_to(f.parent.parent.parent)} — {q_count} questions")
            self.stdout.write(self.style.SUCCESS(f"\nTotal: {total_questions} questions across {len(files)} files."))
            return

        self.stdout.write(self.style.MIGRATE_HEADING("Loading Orki question datasets…"))
        results = load_all_datasets(exam_type=exam_type, subject=subject)

        if not results:
            self.stdout.write(self.style.WARNING("No dataset files found. Check the datasets/ directory."))
            return

        total_created = total_skipped = 0
        for path, (created, skipped) in results.items():
            total_created += created
            total_skipped += skipped
            self.stdout.write(f"  {path}: +{created} created, {skipped} skipped")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {total_created} questions created, {total_skipped} already existed."
            )
        )
