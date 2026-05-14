# WEBHOOK VERIFICATION - QUICK REFERENCE

## THE FIX (What Changed)

**Before (Broken):**
```python
is_valid = hmac.compare_digest(expected_signature, signature_header)
# This compared ENTIRE header: "t=1234567890,v1=abc123..."
# ❌ FAILS because format doesn't match
```

**After (Fixed):**
```python
# 1. Parse header: "t=1234567890,v1=abc123..." → extract v1=abc123...
signature_parts = {}
for part in signature_header.split(','):
    key, value = part.split('=', 1)
    signature_parts[key.strip()] = value.strip()

# 2. Get only the v1 signature
received_signature = signature_parts.get('v1')

# 3. Compare just the v1 part
is_valid = hmac.compare_digest(expected_signature, received_signature)
# ✅ WORKS because both are hex strings
```

---

## WHAT PAYMONGO SENDS

```
Header: X-Paymongo-Signature
Format: t=TIMESTAMP,v1=SIGNATURE

Example:
t=1621234567,v1=abcdef123456789abcdef123456789abcdef123456

We need:
- Extract the "v1" value
- Ignore the "t" value (timestamp)
- Compare v1 with our calculated HMAC-SHA256
```

---

## 5-MINUTE CHECKLIST

```
☐ Restart Django: Ctrl+C, then python manage.py runserver
☐ Check .env: PAYMONGO_WEBHOOK_SECRET=whsk_xxxxx
☐ Verify PayMongo Dashboard: Webhook endpoint URL correct
☐ Run test: python manage.py shell, paste debug_webhook_signature.py
☐ Check logs: Watch for ✓ Webhook signature verified
☐ Test payment: Use 4242 4242 4242 4242 card
☐ Verify DB: SELECT * FROM subscriptions; should show status="active"
```

---

## IF IT STILL DOESN'T WORK

### Check 1: Is the secret correct?
```bash
# Print secret (should show whsk_xxxxx)
echo $env:PAYMONGO_WEBHOOK_SECRET

# If empty, add to .env:
PAYMONGO_WEBHOOK_SECRET=whsk_fZajyMBVBmVgRWKpF9SbminE
```

### Check 2: Is webhook configured?
```
PayMongo Dashboard:
1. Settings > Developers > Webhooks
2. Click your webhook
3. Check: checkout_session.payment.paid event selected
4. Check: Endpoint URL correct
5. Check: Status = ENABLED
```

### Check 3: Check the logs
```bash
# Watch Django logs
python manage.py runserver

# Look for either:
✓ Webhook signature verified successfully  (GOOD)
✗ Webhook signature mismatch              (BAD - fix secret)
✗ EMPTY request body                      (BAD - check body reading)
✗ Missing v1 signature in header          (BAD - PayMongo issue)
```

### Check 4: Check PayMongo Dashboard delivery status
```
1. Webhooks > Recent Deliveries
2. Click most recent webhook
3. Check Status: 200 (success) or 401 (signature failed)
4. View Response tab to see our response
```

---

## DATABASE CHECK

```bash
python manage.py shell

from users.models import Subscription
sub = Subscription.objects.filter(user_id=1).first()

# Should show:
print(sub.status)                  # 'active'
print(sub.is_active)              # True
print(sub.expiry_date)            # Future date
print(sub.payment_confirmed_at)   # Recent time
print(sub.last_webhook_event_id)  # 'evt_xxxxx'
print(sub.paymongo_payment_id)    # 'payment_xxxxx'
```

---

## SIGNATURE VERIFICATION FLOW

```
PayMongo Webhook Arrives
        ↓
Extract X-Paymongo-Signature header
        ↓
Parse format: t=TIMESTAMP,v1=SIGNATURE
        ↓
Extract v1 part → received_signature
        ↓
Calculate: HMAC-SHA256(webhook_secret, request_body)
        ↓
Compare: received_signature == expected_signature
        ↓
✓ Match? → Process payment, update subscription
✗ Mismatch? → Return 401, log error
```

---

## ENVIRONMENT VARIABLES

```env
# Required - MUST have both
PAYMONGO_SECRET_KEY=sk_test_amVoYeyRF43ZC42BFEiNVrKR
PAYMONGO_WEBHOOK_SECRET=whsk_fZajyMBVBmVgRWKpF9SbminE

# Optional but recommended
FRONTEND_URL=http://localhost:3000
```

---

## COMMON MISTAKES

❌ Using `sk_test_` as webhook secret → Should be `whsk_`  
❌ Comparing entire header string → Should extract `v1` only  
❌ Wrong endpoint URL in PayMongo → Webhook won't arrive  
❌ Event type = ALL → Should be only `checkout_session.payment.paid`  
❌ Secret rotated but .env not updated → Use new secret  

---

## SUCCESS INDICATORS

✅ PayMongo Dashboard shows 200 status  
✅ Django logs show "✓ Webhook signature verified"  
✅ Database shows status = "active"  
✅ expiry_date = now + 30 days  
✅ payment_confirmed_at = recent  
✅ Frontend checks GET /api/v1/users/subscription/ → is_active: true  
✅ Exams/Flashcards unlock  

---

## FILES TO CHECK

- `.env` - Has PAYMONGO_WEBHOOK_SECRET
- `payment_service.py` - verify_webhook_signature() method
- `views.py` - PayMongoWebhookView logs request
- `webhook_handler.py` - process_webhook() calls verify
- Database - subscriptions table has entry
- PayMongo Dashboard - Recent Deliveries shows 200 status

---

**Version:** 2.0 (Fixed signature parsing)  
**Last Updated:** 2026-05-14  
**Status:** Ready to test
