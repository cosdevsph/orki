"""
PayMongo Integration Diagnostics
=================================

This script checks if all components of the payment system are working correctly.
Run this to debug payment flow issues.

Usage:
    python services/paymongo/diagnostics.py
"""

import os
import sys
import json
import requests
from urllib.parse import urljoin

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.conf import settings
from users.models import Subscription, UserProfile
from services.paymongo.payment_service import PayMongoService


def check_environment_variables():
    """Check if all required environment variables are set."""
    print("\n" + "=" * 80)
    print("1️⃣  CHECKING ENVIRONMENT VARIABLES")
    print("=" * 80)
    
    required_vars = {
        "PAYMONGO_SECRET_KEY": "PayMongo API Secret Key",
        "PAYMONGO_PUBLIC_KEY": "PayMongo Public Key",
        "PAYMONGO_WEBHOOK_SECRET": "PayMongo Webhook Secret",
        "ALLOWED_HOSTS": "Allowed hosts (must include ngrok URL)",
        "FRONTEND_URL": "Frontend URL",
    }
    
    all_ok = True
    for var, description in required_vars.items():
        value = os.environ.get(var, "")
        if value:
            # Mask sensitive values
            if "SECRET" in var or "KEY" in var:
                display = value[:10] + "..." + value[-5:] if len(value) > 20 else "***"
            else:
                display = value
            print(f"✅ {var}: {display}")
        else:
            print(f"❌ {var}: NOT SET - {description}")
            all_ok = False
    
    return all_ok


def check_paymongo_credentials():
    """Test PayMongo API credentials."""
    print("\n" + "=" * 80)
    print("2️⃣  CHECKING PAYMONGO CREDENTIALS")
    print("=" * 80)
    
    try:
        secret_key = os.environ.get("PAYMONGO_SECRET_KEY", "")
        if not secret_key:
            print("❌ PAYMONGO_SECRET_KEY not set")
            return False
        
        print(f"📝 Secret Key (first 10 chars): {secret_key[:10]}...")
        print("✅ Credentials loaded")
        return True
    except Exception as e:
        print(f"❌ Error checking credentials: {e}")
        return False


def check_database():
    """Check if database is accessible."""
    print("\n" + "=" * 80)
    print("3️⃣  CHECKING DATABASE")
    print("=" * 80)
    
    try:
        user_count = UserProfile.objects.count()
        sub_count = Subscription.objects.count()
        print(f"✅ Database is accessible")
        print(f"   - Total users: {user_count}")
        print(f"   - Total subscriptions: {sub_count}")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False


def check_webhook_endpoint():
    """Check if webhook endpoint is accessible."""
    print("\n" + "=" * 80)
    print("4️⃣  CHECKING WEBHOOK ENDPOINT")
    print("=" * 80)
    
    # Get ngrok URL from ALLOWED_HOSTS or environment
    allowed_hosts = os.environ.get("ALLOWED_HOSTS", "").split(",")
    ngrok_url = None
    
    for host in allowed_hosts:
        host = host.strip()
        if "ngrok" in host or "." in host:
            ngrok_url = host
            break
    
    if not ngrok_url:
        print("⚠️  Could not find ngrok URL in ALLOWED_HOSTS")
        print(f"   ALLOWED_HOSTS: {allowed_hosts}")
        return False
    
    # Clean up URL
    if not ngrok_url.startswith("http"):
        ngrok_url = f"https://{ngrok_url}"
    
    webhook_url = urljoin(ngrok_url, "/api/v1/payments/webhook/")
    
    print(f"🔗 Testing webhook endpoint: {webhook_url}")
    
    try:
        # Test with OPTIONS request (should be allowed)
        response = requests.options(webhook_url, timeout=10)
        print(f"✅ Webhook endpoint is accessible (status: {response.status_code})")
        return True
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to {webhook_url}")
        print("   - Is ngrok running?")
        print("   - Is Django running?")
        print("   - Is the URL correct?")
        return False
    except Exception as e:
        print(f"⚠️  Webhook endpoint check failed: {e}")
        return True  # Still ok, endpoint might exist


def check_user_subscription():
    """Check a test user's subscription status."""
    print("\n" + "=" * 80)
    print("5️⃣  CHECKING USER SUBSCRIPTION")
    print("=" * 80)
    
    try:
        # Try to get user ID 1
        user = UserProfile.objects.filter(id=1).first()
        
        if not user:
            print("⚠️  No user with ID 1 found")
            return False
        
        print(f"✅ Found user: {user.email}")
        
        # Check subscription
        try:
            sub = Subscription.objects.get(user=user)
            print(f"✅ User has subscription:")
            print(f"   - Status: {sub.status}")
            print(f"   - Is Active: {sub.is_active}")
            print(f"   - Expiry Date: {sub.expiry_date}")
            print(f"   - Last Webhook Event ID: {sub.last_webhook_event_id}")
            return True
        except Subscription.DoesNotExist:
            print(f"⚠️  User has no subscription record")
            return False
    except Exception as e:
        print(f"❌ Error checking subscription: {e}")
        return False


def check_payment_flow():
    """Test creating a checkout (without actually redirecting)."""
    print("\n" + "=" * 80)
    print("6️⃣  TESTING PAYMENT FLOW")
    print("=" * 80)
    
    try:
        # Try to create a checkout session
        test_user_id = 1
        test_email = "test@example.com"
        
        print(f"📝 Creating test checkout for user {test_user_id}...")
        checkout = PayMongoService.create_checkout(test_user_id, test_email)
        
        print(f"✅ Checkout created successfully:")
        print(f"   - Reference ID: {checkout['reference_id'][:20]}...")
        print(f"   - Checkout URL: {checkout['checkout_url'][:50]}...")
        return True
    except Exception as e:
        print(f"❌ Payment flow error: {e}")
        return False


def print_summary(results):
    """Print a summary of all checks."""
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    
    total = len(results)
    passed = sum(1 for r in results if r)
    
    status = "✅ ALL CHECKS PASSED" if passed == total else f"⚠️  {passed}/{total} checks passed"
    print(f"\n{status}\n")
    
    if passed < total:
        print("❌ Issues found:")
        issues = [
            ("Environment Variables", results[0]),
            ("PayMongo Credentials", results[1]),
            ("Database", results[2]),
            ("Webhook Endpoint", results[3]),
            ("User Subscription", results[4]),
            ("Payment Flow", results[5]),
        ]
        for name, result in issues:
            if not result:
                print(f"   - {name}")
        
        print("\n💡 Troubleshooting:")
        print("   1. Make sure ngrok is running: ngrok http 8000")
        print("   2. Update .env with correct ngrok URL in ALLOWED_HOSTS")
        print("   3. Make sure Django is running: python manage.py runserver")
        print("   4. Make sure PayMongo webhook URL matches ngrok URL")


def main():
    """Run all diagnostics."""
    print("\n")
    print("🔧" * 40)
    print("PayMongo Integration Diagnostics")
    print("🔧" * 40)
    
    results = [
        check_environment_variables(),
        check_paymongo_credentials(),
        check_database(),
        check_webhook_endpoint(),
        check_user_subscription(),
        check_payment_flow(),
    ]
    
    print_summary(results)
    
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
