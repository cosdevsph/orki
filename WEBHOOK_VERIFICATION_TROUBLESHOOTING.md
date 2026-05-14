# WEBHOOK SIGNATURE VERIFICATION - TROUBLESHOOTING GUIDE

## Your Issue

**Symptom:** PayMongo checkout loads endlessly, webhook verification fails (hanging/not verifying)

**Root Cause:** The signature header format parsing was incorrect. PayMongo sends signatures as `t=timestamp,v1=signature` but the code was trying to compare the entire string directly.

---

## FIX APPLIED ✓

I've updated `payment_service.py` to correctly:
1. **Parse the signature header** - Extract the `v1` part from `t=timestamp,v1=signature_here`
2. **Compare only the v1 signature** - Not the entire header string
3. **Add debug logging** - Shows expected vs received signatures
4. **Improve error messages** - Better visibility into what's failing

---

## STEP-BY-STEP VERIFICATION

### Step 1: Verify Your Webhook Secret is Set

```bash
# In PowerShell
$env:PAYMONGO_WEBHOOK_SECRET
# Should output: whsk_xxxxx...
```

If it's empty, add to your `.env` file:
```env
PAYMONGO_WEBHOOK_SECRET=whsk_fZajyMBVBmVgRWKpF9SbminE
```

**CRITICAL:** Must start with `whsk_` (not `sk_test_`)

---

### Step 2: Check PayMongo Dashboard Configuration

1. Go to: https://dashboard.paymongo.com/developers/webhooks
2. Click your webhook endpoint
3. **Verify Settings:**
   - ✅ Event selected: `checkout_session.payment.paid` (ONLY this one)
   - ✅ Endpoint URL: Points to your server (http://localhost:8000 for local, https://yourdomain.com for prod)
   - ✅ Webhook is ENABLED (toggle should be ON)

4. **Check Recent Deliveries:**
   - Should show recent webhook attempts
   - Status codes: 200 = success, 401 = signature failed, 500 = server error

---

### Step 3: Test Locally with Debug Script

Run this script to test signature verification:

```bash
cd orki-backend
python manage.py shell

# Then paste the contents of debug_webhook_signature.py
# Or run: exec(open('debug_webhook_signature.py').read())
```

**Expected Output:**
```
✓ Webhook secret configured
✓ Starts with 'whsk_': True
✓ Parsed header successfully
✅ SIGNATURE VERIFICATION PASSED!
```

If it shows `❌ SIGNATURE VERIFICATION FAILED`, your secret is wrong or doesn't match PayMongo.

---

### Step 4: Restart Django and Test

```bash
# Stop current server (Ctrl+C)
# Restart Django
python manage.py runserver

# Watch logs while testing
# You'll see:
# 📦 Request Body (first 200 chars): {...}
# 🔐 Signature Header: t=12345,v1=abcdef...
# ✓ Webhook signature verified successfully
# ✓ Subscription activated
```

---

### Step 5: Test Actual Payment

1. Go to: http://localhost:3000/subscribe
2. Click "Subscribe Now"
3. Use test card: `4242 4242 4242 4242`
4. Expiry: Any future date (e.g., 12/25)
5. CVC: Any 3 digits (e.g., 123)
6. Click Pay

**Watch Django logs:**
```
🔔 WEBHOOK REQUEST RECEIVED
📦 Request Body (first 200 chars): {"id":"evt_...", ...
🔐 Signature Header: t=1234567890,v1=abcdef123...
🔐 Verifying webhook signature...
✓ Webhook signature verified
✓ Subscription activated for user...
✓ Expires: 2026-06-14
```

**Then check database:**
```bash
python manage.py shell
>>> from users.models import Subscription
>>> sub = Subscription.objects.filter(user_id=1).first()
>>> print(f"Status: {sub.status}")
>>> print(f"Expiry: {sub.expiry_date}")
>>> print(f"Is Active: {sub.is_active}")
```

Should show:
```
Status: active
Expiry: 2026-06-14 ...
Is Active: True
```

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: "Missing X-Paymongo-Signature header"

**Problem:** Webhook is arriving without signature header

**Causes:**
- Endpoint URL mismatch in PayMongo dashboard
- Webhook not properly configured
- Using wrong endpoint URL format

**Solution:**
1. Check PayMongo Dashboard > Webhooks
2. Verify endpoint URL matches exactly
3. For local testing with ngrok:
   ```bash
   ngrok http 8000
   # Copy URL: https://xxxx-yyyy-zzzz.ngrok.io
   # Update PayMongo endpoint to: https://xxxx-yyyy-zzzz.ngrok.io/api/v1/payments/webhook/
   ```

---

### Issue 2: "Webhook signature mismatch"

**Problem:** Signature verification fails

**Causes:**
- `PAYMONGO_WEBHOOK_SECRET` doesn't match PayMongo
- Secret expired or regenerated
- Wrong secret (using API key instead of webhook secret)

**Solution:**
1. Check `.env` has correct secret:
   ```bash
   echo $env:PAYMONGO_WEBHOOK_SECRET
   ```
2. Go to PayMongo Dashboard > Developers > Webhooks
3. Click your webhook
4. Copy the **Webhook Secret** (starts with `whsk_`)
5. Update `.env`:
   ```env
   PAYMONGO_WEBHOOK_SECRET=whsk_[paste here]
   ```
6. Restart Django: `python manage.py runserver`

---

### Issue 3: Webhook shows 500 status in PayMongo Dashboard

**Problem:** Webhook arrives but Django returns 500 error

**Solution:**
1. Check Django logs for error message
2. Common issues:
   - Database error: Check `python manage.py migrate`
   - Import error: Check all imports exist
   - User not found: Check user exists before payment
3. Look for stack trace in terminal

---

### Issue 4: Status 200 in PayMongo but user still locked

**Problem:** Webhook shows 200 (success) but exams still locked

**Causes:**
- Subscription row created but not updated
- Status not changed to "active"
- Expiry date not set

**Solution:**
1. Check database:
   ```bash
   python manage.py shell
   >>> from users.models import Subscription
   >>> sub = Subscription.objects.filter(user_id=1).first()
   >>> print(f"Status: {sub.status}")
   >>> print(f"Expiry: {sub.expiry_date}")
   >>> print(f"Last event ID: {sub.last_webhook_event_id}")
   ```
2. If status is not "active", check logs for webhook error
3. If last_webhook_event_id is set, webhook was processed
4. Manually verify: `sub.is_active` should return True

---

### Issue 5: "Webhook checkout link loading endlessly"

**Problem:** PayMongo checkout page never loads or hangs

**Causes:**
- Incorrect `FRONTEND_URL` in `.env`
- Invalid payment methods list
- API key issues

**Solution:**
1. Check `.env`:
   ```env
   PAYMONGO_SECRET_KEY=sk_test_amVoYeyRF43ZC42BFEiNVrKR
   FRONTEND_URL=http://localhost:3000
   ```
2. Verify `PAYMONGO_SECRET_KEY` exists and is valid
3. Check checkout creation in logs:
   ```
   [PayMongo] Creating checkout session...
   ✓ Checkout session created
   checkout_url: https://checkout.paymongo.com/p/cs_...
   ```
4. If checkout fails, check PayMongo API key format (must be `sk_test_`)

---

## DEBUGGING CHECKLIST

Before contacting support, verify:

- [ ] `PAYMONGO_WEBHOOK_SECRET` set in `.env`
- [ ] Secret starts with `whsk_` (not `sk_test_`)
- [ ] PayMongo webhook endpoint URL is correct
- [ ] PayMongo webhook event is `checkout_session.payment.paid` (ONLY)
- [ ] PayMongo webhook is ENABLED
- [ ] Django running: `python manage.py runserver`
- [ ] Database migrated: `python manage.py migrate users`
- [ ] Test signature verification script passes
- [ ] Logs show signature verification pass/fail
- [ ] PayMongo Dashboard shows webhook delivery status

---

## LOGS TO CHECK

### Django Terminal Logs
```
Watch for:
- 🔔 WEBHOOK REQUEST RECEIVED
- 🔐 Verifying webhook signature...
- ✓ Webhook signature verified successfully
- ✓ Subscription activated for user
- ✗ Webhook signature mismatch
- ✗ EMPTY request body
```

### PayMongo Dashboard Logs
```
Settings > Developers > Webhooks
Click your webhook > Recent Deliveries
Check:
- Status: 200 (success)
- Response: {"status": "success", ...}
- Headers: X-Paymongo-Signature header present
```

---

## PRODUCTION SETUP

Before deploying to production:

1. **Get Production Webhook Secret:**
   - PayMongo Dashboard (SWITCH TO LIVE MODE)
   - Developers > Webhooks
   - Create new webhook for production
   - Copy production webhook secret

2. **Update .env:**
   ```env
   PAYMONGO_SECRET_KEY=sk_live_xxxxx  # Not sk_test_!
   PAYMONGO_WEBHOOK_SECRET=whsk_xxxxx  # Production secret
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Test:**
   - Make test purchase with real payment method
   - Verify webhook delivers (PayMongo Dashboard)
   - Check subscription activated in database

---

## QUICK REFERENCE

| Item | Value |
|------|-------|
| Webhook Secret Format | `whsk_xxxxx` (26+ chars) |
| Webhook Event Type | `checkout_session.payment.paid` |
| Signature Header Name | `X-Paymongo-Signature` |
| Signature Header Format | `t=timestamp,v1=hex_signature` |
| Endpoint URL (local) | `http://localhost:8000/api/v1/payments/webhook/` |
| Endpoint URL (ngrok) | `https://xxxx-yyyy-zzzz.ngrok.io/api/v1/payments/webhook/` |
| Expected Status | 200 OK |

---

**Updated:** 2026-05-14  
**Status:** Signature verification fixed and debugged
