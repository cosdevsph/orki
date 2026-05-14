"""
WEBHOOK SIGNATURE DEBUGGING SCRIPT
===================================

Use this script to test if your webhook signature verification is working.
This helps you understand what PayMongo is sending and if our verification works.

Usage:
    python manage.py shell < debug_webhook.py

Or paste this into: python manage.py shell
"""

import hmac
import hashlib
import json
import os
from django.conf import settings

# Get webhook secret from settings
WEBHOOK_SECRET = os.environ.get("PAYMONGO_WEBHOOK_SECRET", "")

print("=" * 80)
print("WEBHOOK SIGNATURE VERIFICATION DEBUGGING")
print("=" * 80)

# Check if secret is configured
if not WEBHOOK_SECRET:
    print("❌ ERROR: PAYMONGO_WEBHOOK_SECRET not set in .env")
    print("   Add this to .env: PAYMONGO_WEBHOOK_SECRET=whsk_xxxxx")
else:
    print(f"✓ Webhook secret configured (length: {len(WEBHOOK_SECRET)} chars)")
    print(f"✓ Starts with 'whsk_': {WEBHOOK_SECRET.startswith('whsk_')}")

print()
print("-" * 80)
print("TEST 1: Verify a sample webhook payload")
print("-" * 80)

# Sample test payload (you'll replace this with actual payload from PayMongo)
test_payload = {
    "id": "evt_test_12345",
    "type": "checkout_session.payment.paid",
    "data": {
        "id": "payment_test_12345",
        "attributes": {
            "status": "paid",
            "payment_method_type": "gcash"
        },
        "relationships": {
            "checkout": {
                "data": {
                    "attributes": {
                        "metadata": {
                            "user_id": "1",
                            "user_email": "test@example.com"
                        }
                    }
                }
            }
        }
    }
}

# Convert to JSON bytes (this is what PayMongo sends)
request_body = json.dumps(test_payload).encode()
print(f"Request body: {request_body[:100]}...")
print(f"Request body length: {len(request_body)} bytes")

# Calculate expected signature
expected_signature = hmac.new(
    WEBHOOK_SECRET.encode(),
    request_body,
    hashlib.sha256
).hexdigest()

print()
print(f"Expected signature (hex): {expected_signature}")
print()

# Simulate PayMongo header format
simulated_header = f"t=1234567890,v1={expected_signature}"
print(f"Simulated PayMongo header: {simulated_header}")

# Now test parsing and verification
print()
print("-" * 80)
print("TEST 2: Parse and verify the header")
print("-" * 80)

signature_parts = {}
try:
    for part in simulated_header.split(','):
        key, value = part.split('=', 1)
        signature_parts[key.strip()] = value.strip()
    print(f"✓ Parsed header successfully")
    print(f"  - t (timestamp): {signature_parts.get('t')}")
    print(f"  - v1 (signature): {signature_parts.get('v1')[:20]}...")
except Exception as e:
    print(f"✗ Failed to parse header: {e}")

received_sig = signature_parts.get('v1')
is_valid = hmac.compare_digest(expected_signature, received_sig)

print()
if is_valid:
    print("✅ SIGNATURE VERIFICATION PASSED!")
else:
    print("❌ SIGNATURE VERIFICATION FAILED!")
    print(f"   Expected: {expected_signature}")
    print(f"   Got:      {received_sig}")

print()
print("-" * 80)
print("TEST 3: What to check in PayMongo Dashboard")
print("-" * 80)
print("""
1. Go to: https://dashboard.paymongo.com/developers/webhooks
2. Find your webhook endpoint: /api/v1/payments/webhook/
3. Click "Recent Deliveries"
4. Find your most recent webhook
5. Check:
   - Status: Should be 200 (success)
   - Response: Should show success message
   - Request/Response JSON visible?

If Status is 401:
   → Signature verification failed
   → Check PAYMONGO_WEBHOOK_SECRET matches dashboard
   → Make sure it starts with 'whsk_'

If Status is 500:
   → Server error (check Django logs)
   → Might be JSON parsing issue
   → Check database connection

If Status is 2xx but still not working:
   → Webhook might be processed but subscription not updating
   → Check database: SELECT * FROM subscriptions WHERE user_id = X
""")

print()
print("-" * 80)
print("NEXT STEPS")
print("-" * 80)
print("""
1. Run this script to confirm signature verification works
2. Check PayMongo Dashboard webhook delivery status
3. Compare the signature in the webhook with what we calculated
4. If signatures match but still failing, check logs:
   - Django: python manage.py runserver
   - PayMongo Dashboard: Recent Deliveries > Response tab
5. Verify database is updating:
   - SELECT * FROM subscriptions WHERE user_id = 1;
   - Check if status, payment_confirmed_at, expiry_date are updated
""")

print()
print("=" * 80)
