# ORKI SUBSCRIPTION SYSTEM - TESTING GUIDE

## Testing Overview

This guide covers testing the complete payment system from user signup to premium access unlock.

---

## Part 1: Environment Setup for Testing

### Prerequisites
```bash
# Backend
cd orki-backend
source venv/Scripts/activate  # Windows
pip install -r requirements.txt
python manage.py migrate

# Frontend
cd orki-frontend
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
PAYMONGO_SECRET_KEY=sk_test_amVoYeyRF43ZC42BFEiNVrKR
PAYMONGO_WEBHOOK_SECRET=whsk_fZajyMBVBmVgRWKpF9SbminE
FRONTEND_URL=http://localhost:3000
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Part 2: Local Testing (No Real Payment)

### Test 1: Check Subscription Status

**Before Purchase:**
```bash
curl -X GET http://localhost:8000/api/v1/users/subscription/ \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

**Expected Response:**
```json
{
  "status": "no_subscription",
  "is_active": false,
  "plan_name": null,
  "expiry_date": null,
  "days_remaining": null
}
```

### Test 2: Create Checkout Session

```bash
curl -X POST http://localhost:8000/api/v1/payments/checkout/ \
  -H "Content-Type: application/json" \
  -H "Cookie: sessionid=YOUR_SESSION_ID" \
  -d '{
    "payment_methods": ["gcash", "paymaya"]
  }'
```

**Expected Response:**
```json
{
  "checkout_url": "https://checkout.paymongo.com/p/cs_xxxxx",
  "reference_id": "cs_xxxxx",
  "amount": 49.00,
  "currency": "PHP",
  "status": "pending"
}
```

**Copy the checkout_url and visit in browser**

### Test 3: Test Webhook Locally (Without Real Payment)

Use ngrok to expose local server:

```bash
# Terminal 1: Backend
cd orki-backend
python manage.py runserver

# Terminal 2: ngrok
ngrok http 8000

# Note the URL: https://xxxx-yyyy-zzzz.ngrok.io
```

Update PayMongo Dashboard:
- Webhooks > Your Webhook > Edit Endpoint URL
- Change to: `https://xxxx-yyyy-zzzz.ngrok.io/api/v1/payments/webhook/`

Then test webhook (see section 3 below).

---

## Part 3: Integration Testing (PayMongo Sandbox)

### Setup: Switch to PayMongo Test Mode

1. Go to https://dashboard.paymongo.com/
2. Top left dropdown: Switch to **TEST MODE**
3. Confirm you're in test mode (should show "TEST" in header)

### Test Flow 1: Card Payment

**Step 1: User Signs Up**
```
Frontend: Sign up at http://localhost:3000/signup
- Email: test@example.com
- Password: TestPass123!
- Confirm registration
```

**Step 2: Navigate to Subscribe Page**
```
http://localhost:3000/subscribe
Shows: "₱49 - 30 Days Premium Access"
```

**Step 3: Click Subscribe**
```
POST /api/v1/payments/checkout/
Response: checkout_url
Redirect to PayMongo checkout page
```

**Step 4: Complete Test Payment (Card)**
```
Payment Method: Card
Card Number: 4242 4242 4242 4242
Expiry: 12/25 (any future date)
CVC: 123 (any 3 digits)
Click "Pay"
```

**Step 5: Verify Payment Processed**
```
PayMongo confirms payment: ✓
Webhook fires: checkout_session.payment.paid
Backend receives webhook
```

**Step 6: Check Backend Logs**
```
Look for:
✓ Webhook signature verified
✓ Subscription activated
✓ Expires: 2026-06-14
✓ Status: active
```

**Step 7: Verify Subscription Status**
```bash
curl -X GET http://localhost:8000/api/v1/users/subscription/ \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

**Expected Response:**
```json
{
  "status": "active",
  "is_active": true,
  "plan_name": "orki_premium_monthly",
  "amount_php": 49.00,
  "currency": "PHP",
  "payment_method": "card",
  "expiry_date": "2026-06-14T10:30:00Z",
  "days_remaining": 31,
  "payment_confirmed_at": "2026-05-14T10:30:00Z"
}
```

**Step 8: Test Access Control**

Before subscription:
```bash
curl -X GET http://localhost:8000/api/v1/exams/
Response: 403 Forbidden
```

After subscription (same user):
```bash
curl -X GET http://localhost:8000/api/v1/exams/
Response: 200 OK + exam list
```

---

### Test Flow 2: GCash Payment

**Repeat Test Flow 1 but use:**
```
Payment Method: GCash (select from dropdown)
Mobile Number: Any 11-digit number
OTP: 111111 (PayMongo accepts any in test mode)
```

**Expected Result:** Same as card - subscription activated

---

### Test Flow 3: Idempotency (Duplicate Webhook)

**Purpose:** Verify PayMongo can't charge twice

**Step 1:** Complete successful payment (above)

**Step 2:** Manually send same webhook twice

```bash
# Save webhook event ID from first payment
EVENT_ID="evt_xxxxx"  # From webhook logs

# Send same event twice
curl -X POST http://localhost:8000/api/v1/payments/webhook/ \
  -H "X-Paymongo-Signature: t=xxx,v1=xxx" \
  -d '{"id": "'"$EVENT_ID"'", ...}'
```

**Expected Result:**
- First webhook: Subscription activated
- Second webhook: "Already processed" (logged)
- User NOT charged twice

---

## Part 4: Frontend Integration Tests

### Test 1: Subscribe Page Renders

```bash
cd orki-frontend
npm run dev
# Visit http://localhost:3000/subscribe
```

**Check:**
- ✓ ₱49 price displayed
- ✓ "Subscribe Now" button visible
- ✓ Payment method info shown
- ✓ No console errors

### Test 2: Paywall Shows for Non-Subscribers

```
cd orki-frontend
npm run dev
# Visit http://localhost:3000/exams (without subscription)
```

**Check:**
- ✓ "🔒 Premium Feature" paywall shown
- ✓ "Subscribe Now - ₱49" button visible
- ✓ Click button → redirects to /subscribe

### Test 3: Premium Content Unlocks After Payment

```
1. Not subscribed: Visit /exams → See paywall
2. Click "Subscribe Now"
3. Complete payment
4. Webhook fires
5. Refresh /exams → Exams now visible
```

**Check:**
- ✓ Paywall disappears
- ✓ Exams/Flashcards display
- ✓ "Active subscription • Expires in 31 days" shown

### Test 4: Subscription Expiry Display

```
Database: Manually set expiry_date to 2 days from now
curl -X GET /api/v1/users/subscription/
```

**Check:**
- ✓ days_remaining: 2
- ✓ Frontend shows "⏰ Expires in 2 days"

---

## Part 5: Error Handling Tests

### Error 1: Invalid Webhook Signature

**Test:** Send webhook with wrong signature
```bash
curl -X POST http://localhost:8000/api/v1/payments/webhook/ \
  -H "X-Paymongo-Signature: INVALID" \
  -d '{"type": "checkout_session.payment.paid", ...}'
```

**Expected:**
- ✓ 401 Unauthorized response
- ✓ Subscription NOT activated
- ✓ Logged: "Signature verification failed"

### Error 2: Missing User

**Test:** Webhook with non-existent user_id
```json
{
  "metadata": {
    "user_id": 99999,
    "user_email": "nonexistent@example.com"
  }
}
```

**Expected:**
- ✓ 400 Bad Request or 500 Error
- ✓ Subscription NOT created
- ✓ Logged error with user_id

### Error 3: Checkout Before Redirect

**Test:** Create checkout but don't complete payment
```bash
POST /api/v1/payments/checkout/
Get checkout_url
Don't click link, wait 5 minutes
```

**Check Subscription Status:**
```bash
GET /api/v1/users/subscription/
Response: status = "no_subscription"
```

**Expected:**
- ✓ No subscription created yet
- ✓ Exams still locked
- ✓ Can retry subscription

---

## Part 6: Database Verification Tests

### Query 1: Check Subscription Created

```sql
SELECT id, user_id, status, payment_method, start_date, expiry_date
FROM subscriptions
WHERE user_id = 1;
```

**Expected Columns Populated:**
- ✓ user_id: 1
- ✓ status: "active"
- ✓ payment_method: "gcash" or "card" etc
- ✓ start_date: Recent (now)
- ✓ expiry_date: 30 days from now

### Query 2: Verify Idempotency Field

```sql
SELECT id, last_webhook_event_id
FROM subscriptions
WHERE user_id = 1;
```

**Expected:**
- ✓ last_webhook_event_id: "evt_xxxxx" (not null)

### Query 3: Check Payment Reference

```sql
SELECT id, paymongo_payment_id, paymongo_checkout_id
FROM subscriptions
WHERE user_id = 1;
```

**Expected:**
- ✓ paymongo_payment_id: "payment_xxxxx"
- ✓ paymongo_checkout_id: "cs_xxxxx"

---

## Part 7: Performance Tests

### Load Test: Multiple Checkouts

```bash
# Create 10 checkouts rapidly
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/v1/payments/checkout/ \
    -H "Cookie: sessionid=$SESSION_ID"
done
```

**Check:**
- ✓ All return successfully (< 2s each)
- ✓ No rate limiting
- ✓ Database not corrupted

### Load Test: Webhook Idempotency

```bash
# Send same webhook 5 times rapidly
for i in {1..5}; do
  curl -X POST http://localhost:8000/api/v1/payments/webhook/ \
    -H "X-Paymongo-Signature: $SIGNATURE" \
    -d "$WEBHOOK_PAYLOAD"
done
```

**Check:**
- ✓ All return 200 OK
- ✓ Subscription only updated once
- ✓ User only charged once

---

## Part 8: Production-like Testing

### Simulate Production Environment

```bash
# 1. Set DEBUG = False
# 2. Set ALLOWED_HOSTS = ['yourdomain.com']
# 3. Set HTTPS = True
# 4. Use ngrok for HTTPS redirect

ngrok http 8000
# Get https://xxxx-yyyy-zzzz.ngrok.io

# Update PayMongo webhook endpoint
# Settings > Developers > Webhooks > Edit

# Test complete flow
```

### HTTPS Verification

```bash
# Test webhook over HTTPS
curl -X POST https://xxxx-yyyy-zzzz.ngrok.io/api/v1/payments/webhook/ \
  -H "X-Paymongo-Signature: ..." \
  --insecure  # Only for ngrok testing
```

---

## Part 9: Cross-Browser Testing

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Test Scenarios:**
1. Subscribe page loads
2. Redirect to PayMongo works
3. Payment completes
4. Redirect back to Orki works
5. Subscription status updates

---

## Part 10: Test Checklist

### Backend Tests
- [ ] Checkout creates session with metadata
- [ ] Webhook signature verification works
- [ ] Idempotency prevents duplicate processing
- [ ] Subscription status updated correctly
- [ ] Expiry date set to 30 days
- [ ] Payment method stored correctly
- [ ] Database indexes working

### Frontend Tests
- [ ] Subscribe page renders
- [ ] Paywall shows for non-subscribers
- [ ] Payment redirect works
- [ ] Subscription status fetches
- [ ] Premium content unlocks
- [ ] Days remaining displays
- [ ] No console errors

### Integration Tests
- [ ] Complete payment flow (card)
- [ ] Complete payment flow (GCash)
- [ ] Idempotency with duplicate webhook
- [ ] Error handling for invalid signatures
- [ ] Expiry calculation correct
- [ ] Database audit trail

### Performance Tests
- [ ] Multiple checkouts process quickly
- [ ] Webhook idempotency fast
- [ ] No database locks
- [ ] API response times < 2s

### Security Tests
- [ ] Webhook signature verified
- [ ] Session cookies secure (HttpOnly, SameSite)
- [ ] CSRF tokens working
- [ ] User can't access others' subscriptions
- [ ] Frontend can't fake subscription
- [ ] Secrets not logged

---

## Troubleshooting

### Webhook Not Triggering

```
1. Check ngrok URL matches PayMongo webhook
2. Check ngrok is running
3. Check Django server running
4. Check PayMongo is in TEST mode
5. Check PayMongo dashboard webhook enabled
6. Check "checkout_session.payment.paid" selected
```

### Payment Shows but Subscription Not Active

```
1. Check webhook logs in Django
2. Check webhook delivery in PayMongo dashboard
3. Verify signature with test payload
4. Check subscription.last_webhook_event_id in database
5. Check user_id matches in metadata
```

### CORS/Session Errors

```
1. Verify session cookie being sent
2. Check ALLOWED_HOSTS includes frontend domain
3. Check CSRF token in session
4. Check SameSite cookie policy
```

---

**Test Execution Time:** ~2 hours for complete suite  
**Recommended Frequency:** Before each production deployment

