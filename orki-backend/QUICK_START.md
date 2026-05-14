# ORKI SUBSCRIPTION SYSTEM - QUICK START GUIDE

## 30-Second Overview

The Orki subscription system allows users to pay ₱49 via PayMongo (GCash, Maya, Card, QRPh) to unlock Exams & Flashcards for 30 days.

```
User → Subscribe Button → PayMongo Checkout → Payment Confirmation → Webhook → Subscription Active
```

---

## Files You Need to Know About

### Backend Files (Django)

| File | Purpose |
|------|---------|
| `users/models.py` | Subscription model (status, expiry_date, payment fields) |
| `services/paymongo/payment_service.py` | PayMongo API integration (create checkout, verify signature) |
| `services/paymongo/webhook_handler.py` | Webhook processing (payment confirmation, idempotency) |
| `users/views.py` | API endpoints (checkout, webhook, subscription status) |
| `core/permissions.py` | IsSubscriber permission (backend access control) |
| `users/urls.py` | URL routing to endpoints |
| `users/serializers.py` | Response formatting |

### Documentation Files

| File | Purpose |
|------|---------|
| `WEBHOOK_SETUP.md` | How to configure PayMongo webhook in dashboard |
| `FRONTEND_INTEGRATION.md` | Frontend API usage examples |
| `ARCHITECTURE.md` | System design and data flow |
| `TESTING_GUIDE.md` | How to test the complete system |

---

## API Endpoints (3 Total)

### 1. Get Subscription Status
```
GET /api/v1/users/subscription/
Response: { status, is_active, expiry_date, days_remaining, ... }
```

### 2. Create Checkout Session
```
POST /api/v1/payments/checkout/
Body: { "payment_methods": ["gcash", "paymaya"] }  # optional
Response: { checkout_url, reference_id, amount }
```

### 3. Webhook Endpoint
```
POST /api/v1/payments/webhook/
Headers: X-Paymongo-Signature (HMAC-SHA256)
PayMongo sends: { type: "checkout_session.payment.paid", data: {...} }
```

---

## Database Schema

### Subscription Table
```sql
CREATE TABLE subscriptions (
    id INT PRIMARY KEY,
    user_id INT UNIQUE,
    status VARCHAR (20),              -- "active", "no_subscription", "expired"
    payment_method VARCHAR (20),      -- "gcash", "paymaya", "card", "qrph"
    paymongo_payment_id VARCHAR (50),
    paymongo_checkout_id VARCHAR (50),
    last_webhook_event_id VARCHAR (50), -- Idempotency key
    start_date DATETIME,
    expiry_date DATETIME,
    payment_confirmed_at DATETIME,
    amount_php DECIMAL (10, 2),       -- ₱49.00
    currency VARCHAR (3)              -- "PHP"
);
```

---

## Setup Checklist

### Backend Setup
```
✓ Enhanced Subscription model (users/models.py)
✓ PayMongo service (services/paymongo/payment_service.py)
✓ Webhook handler (services/paymongo/webhook_handler.py)
✓ API views (users/views.py)
✓ Permission class (core/permissions.py)
✓ Database migration: python manage.py migrate users
✓ Environment variables set (.env)
```

### PayMongo Dashboard Setup
```
1. Go to https://dashboard.paymongo.com/
2. Settings → Developers → Webhooks
3. Create new webhook
4. Endpoint: https://yourdomain.com/api/v1/payments/webhook/
5. Event: checkout_session.payment.paid (ONLY THIS ONE)
6. Copy webhook secret → Add to .env as PAYMONGO_WEBHOOK_SECRET
```

### Frontend Setup
```
✓ Subscribe button calls: POST /api/v1/payments/checkout/
✓ Redirect to returned checkout_url
✓ Check subscription status: GET /api/v1/users/subscription/
✓ Show paywall if is_active = false
✓ Show premium content if is_active = true
```

---

## Security Highlights

### 1. Webhook Verification
```python
# PayMongo sends: X-Paymongo-Signature header
# We verify: HMAC-SHA256(body, webhook_secret)
# Prevents: Fake webhooks, tampering

Signature is ONLY source of truth for payment confirmation
```

### 2. Idempotency
```python
# PayMongo might send same webhook twice (network retry)
# We store: last_webhook_event_id in database
# Result: User charged once, not twice
```

### 3. Session Security
```python
# Frontend cookies: HttpOnly, SameSite=Lax
# Backend permission: IsSubscriber checks actual subscription
# Result: Frontend can't fake subscription by setting cookie
```

---

## Common Tasks

### Task 1: Check If User Has Subscription

```bash
# Backend: Get subscription
subscription = request.user_profile.subscription
if subscription.is_active:
    # Show exams/flashcards
else:
    # Show paywall

# Frontend: Call API
fetch('/api/v1/users/subscription/')
  .then(r => r.json())
  .then(sub => {
    if (sub.is_active) showPremiumContent()
    else showPaywall()
  })
```

### Task 2: Create Checkout

```bash
# Frontend: Send POST request
const response = await fetch('/api/v1/payments/checkout/', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({
    payment_methods: ['gcash', 'paymaya']
  })
})

const { checkout_url } = await response.json()
window.location.href = checkout_url
```

### Task 3: Handle Webhook (Backend)

```python
# Django automatically routes to PayMongoWebhookView
# View verifies signature
# View calls WebhookHandler.process_webhook()
# Handler:
#   1. Extracts payment_id, user_id from metadata
#   2. Checks idempotency (last_webhook_event_id)
#   3. Creates/updates subscription
#   4. Sets status = "active"
#   5. Sets expiry_date = now + 30 days
#   6. Logs success

# No action needed - automatic!
```

### Task 4: Protect Endpoint

```python
from core.permissions import IsSubscriber

class ExamsView(APIView):
    permission_classes = [IsSessionAuthenticated, IsSubscriber]
    
    def get(self, request):
        # Only subscribed users reach here
        # Unsubscribed users get 403 Forbidden
        return Response(exams)
```

---

## Testing Quick Path

### Test Locally (5 minutes)
```bash
# 1. Start backend
python manage.py runserver

# 2. Start frontend
npm run dev

# 3. Test without payment
GET /api/v1/users/subscription/
# Should show: "no_subscription", is_active: false

# 4. Test checkout endpoint
POST /api/v1/payments/checkout/
# Should return: checkout_url, reference_id
```

### Test With PayMongo (15 minutes)
```bash
# 1. ngrok local server
ngrok http 8000

# 2. Update PayMongo webhook endpoint
# 3. Switch to TEST MODE in PayMongo dashboard
# 4. Use test card: 4242 4242 4242 4242
# 5. Complete payment
# 6. Check webhook delivered
# 7. Verify subscription status changed to "active"
```

---

## Monitoring

### Key Queries
```sql
-- Check subscription count
SELECT COUNT(*) FROM subscriptions WHERE status = 'active';

-- Check recent subscriptions
SELECT * FROM subscriptions ORDER BY payment_confirmed_at DESC LIMIT 10;

-- Check expiring subscriptions (next 7 days)
SELECT * FROM subscriptions 
WHERE status = 'active' AND expiry_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY);

-- Check webhook events
SELECT last_webhook_event_id, COUNT(*) FROM subscriptions GROUP BY last_webhook_event_id;
```

### Logs to Check
```
Django Logs:
- "[PayMongo] Creating checkout session..."
- "✓ Webhook signature verified"
- "✓ Subscription activated"
- "⚠ Webhook error: ..."

PayMongo Dashboard:
- Settings → Webhooks → Recent Deliveries
- Check for 200 status (success)
- Check for 401 status (signature failed)
```

---

## Cost Breakdown

| Component | Cost |
|-----------|------|
| Subscription Price | ₱49 / month per user |
| PayMongo Fee | ~2.9% + ₱9 per transaction |
| Database | Included in hosting |
| Total Cost to User | ₱49 |
| Revenue per Transaction | ~₱47 (after fees) |

---

## Troubleshooting Quick Answers

| Problem | Solution |
|---------|----------|
| Webhook not firing? | Check PayMongo webhook endpoint URL matches, check "checkout_session.payment.paid" selected |
| 401 webhook error? | Verify PAYMONGO_WEBHOOK_SECRET in .env matches PayMongo dashboard, must start with 'whsk_' |
| User not unlocked? | Check webhook delivered (200 status in PayMongo), check subscription.status in database is "active" |
| Session cookie error? | Check FRONTEND_URL in .env, check ALLOWED_HOSTS includes frontend domain |
| Payment created but no checkout? | Check PayMongo API keys correct, check 4900 centavos = ₱49 |

---

## Next Steps

1. **PayMongo Webhook Setup**
   - Read: [WEBHOOK_SETUP.md](WEBHOOK_SETUP.md)
   - Action: Configure webhook in PayMongo dashboard

2. **Frontend Integration**
   - Read: [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)
   - Action: Add subscribe button, payment method selector, paywall

3. **Test Complete Flow**
   - Read: [TESTING_GUIDE.md](TESTING_GUIDE.md)
   - Action: Run through all test scenarios

4. **Deploy to Production**
   - Update PAYMONGO_WEBHOOK_SECRET in production .env
   - Update webhook endpoint URL to production domain
   - Test with live payment (or test mode in test environment)
   - Monitor webhook deliveries

---

## Emergency Contacts

**If Webhook Fails:**
1. Check PayMongo dashboard for delivery status
2. Check Django logs for error message
3. Verify webhook secret
4. Manually check database (subscription might be updated despite webhook error)

**If User Says "Still Locked After Paying":**
1. Check GET /api/v1/users/subscription/ → is_active should be true
2. Check database: SELECT * FROM subscriptions WHERE user_id = X;
3. Check if status = "active" AND expiry_date > now()
4. If false, webhook didn't fire - check PayMongo dashboard

**If Multiple Charges Appear:**
1. Check database idempotency field: last_webhook_event_id
2. If same event_id for multiple rows → duplicate subscription created (shouldn't happen)
3. Report to PayMongo support with webhook event IDs

---

## Key Metrics Dashboard (Weekly Check)

```
- Total Subscriptions: SELECT COUNT(*) FROM subscriptions WHERE status = 'active';
- New Subscriptions This Week: SELECT COUNT(*) FROM subscriptions WHERE payment_confirmed_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
- Webhook Success Rate: (successful deliveries / total deliveries) in PayMongo dashboard
- Payment Methods Used: SELECT payment_method, COUNT(*) FROM subscriptions GROUP BY payment_method;
- Average Days to Expiry: SELECT AVG(DATEDIFF(expiry_date, NOW())) FROM subscriptions WHERE status = 'active';
```

---

## Related Documentation

- [Complete Architecture](ARCHITECTURE.md) - System design details
- [Webhook Setup](WEBHOOK_SETUP.md) - PayMongo configuration
- [Frontend Integration](FRONTEND_INTEGRATION.md) - API usage examples
- [Testing Guide](TESTING_GUIDE.md) - Comprehensive test scenarios

---

**Created:** 2026-05-14  
**Version:** 1.0  
**Status:** Production Ready
