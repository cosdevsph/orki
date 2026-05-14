# ORKI SUBSCRIPTION SYSTEM - ARCHITECTURE GUIDE

## System Overview

The Orki subscription system is a production-grade payment platform enabling 30-day subscriptions to unlock premium features (Exams & Flashcards) via PayMongo payment gateway.

**Payment Flow:**
```
User → Subscribe Button → Checkout Session → PayMongo Checkout
                                                      ↓
                                              User Completes Payment
                                                      ↓
                                           PayMongo Webhook Event
                                                      ↓
                                      Backend Verifies Signature
                                                      ↓
                                     Subscription Activated (30 days)
                                                      ↓
                                        Exams & Flashcards Unlock
```

---

## Components

### 1. Database Layer (Django Models)

**File:** `orki-backend/users/models.py`

**Subscription Model:**
```python
class Subscription(models.Model):
    # Basic Info
    user = OneToOneField(UserProfile)
    plan_name = "orki_premium_monthly"  # Fixed plan name
    amount_php = 49.00  # Cost in Philippine Pesos
    currency = "PHP"

    # Status Tracking
    status = CharField(
        choices=[
            ("active", "Active"),
            ("no_subscription", "No Subscription"),
            ("expired", "Expired"),
            ("cancelled", "Cancelled"),
        ],
        default="no_subscription"
    )
    
    # Payment Tracking
    payment_method = CharField()  # gcash, paymaya, card, qrph
    paymongo_checkout_id = CharField()  # Reference to checkout session
    paymongo_payment_id = CharField()  # PayMongo payment ID
    
    # Idempotency
    last_webhook_event_id = CharField()  # Prevent duplicate processing
    
    # Timeline
    start_date = DateTimeField()  # When subscription started
    expiry_date = DateTimeField()  # When subscription expires
    payment_confirmed_at = DateTimeField()  # When webhook confirmed
    
    # Calculated Property
    @property
    def is_active(bool):
        return (status == "active" and 
                (not expiry_date or expiry_date > now()))
```

**Database Indexes:**
- `(user, status)` - Fast user lookup by status
- `paymongo_payment_id` - Fast payment lookup
- `last_webhook_event_id` - Idempotency checking
- `expiry_date` - For auto-expiry queries

---

### 2. Payment Service (PayMongo Integration)

**File:** `orki-backend/services/paymongo/payment_service.py`

**Key Functions:**

#### `create_checkout(user_id, user_email, payment_methods=None)`
Creates a checkout session with PayMongo.

```python
# Logic:
1. Build checkout request with metadata (user_id, user_email)
2. Include selected payment methods (or all 4)
3. Set amount to 4900 centavos (₱49.00)
4. Send to PayMongo API via HTTPS
5. Return checkout URL for redirect

# Request:
{
  "data": {
    "attributes": {
      "send_email_receipt": false,
      "show_payment_instructions": true,
      "redirect": {
        "success": "https://orki.com/subscribe/success",
        "failed": "https://orki.com/subscribe/failed"
      },
      "line_items": [
        {
          "currency": "PHP",
          "amount": 4900,
          "description": "Orki Premium Subscription (30 days)",
          "name": "Premium Access"
        }
      ],
      "payment_method_types": ["gcash", "paymaya", "card", "qrph"],
      "metadata": {
        "user_id": "123",
        "user_email": "user@example.com",
        "product": "orki_subscription"
      }
    }
  }
}
```

#### `verify_webhook_signature(request_body, signature_header)`
Verifies webhook authenticity using HMAC-SHA256.

```python
# Logic:
1. Extract X-Paymongo-Signature header
2. Calculate HMAC-SHA256(request_body, webhook_secret)
3. Compare with timing-safe comparison (prevent timing attacks)
4. Raise WebhookVerificationError if mismatch

# Security: Uses constant-time comparison
```

#### `parse_webhook_event(request_body)`
Parses JSON webhook payload safely.

#### `get_checkout_session(reference_id)`
Retrieves checkout session status from PayMongo API.

---

### 3. Webhook Handler (Payment Confirmation)

**File:** `orki-backend/services/paymongo/webhook_handler.py`

**Entry Point:** `process_webhook(request_body, signature_header)`

```
Webhook arrives → Verify signature (HMAC-SHA256)
                      ↓
                  Parse event
                      ↓
                  Check type == "checkout_session.payment.paid"
                      ↓
              Get payment ID & method
                      ↓
        Fetch user metadata (user_id, user_email)
                      ↓
        Check idempotency (last_webhook_event_id)
                      ↓
            Get/create Subscription
                      ↓
        Call mark_as_active_via_webhook()
                      ↓
            Log success with separator
```

**Key Security Features:**

1. **Signature Verification:** HMAC-SHA256 with constant-time comparison
   ```python
   # PayMongo sends: X-Paymongo-Signature: t=timestamp,v1=signature
   # We verify: hmac_new(secret, body, sha256).digest()
   ```

2. **Idempotency Check:** Prevent duplicate processing
   ```python
   if subscription.last_webhook_event_id == event_id:
       return "Already processed"  # Don't charge twice
   ```

3. **Payment Status Validation:** Only "paid" status
   ```python
   if payment.status != "paid":
       return "Invalid status"
   ```

4. **Comprehensive Logging:** Audit trail
   ```python
   logger.info("=" * 80)
   logger.info(f"✓ Webhook signature verified")
   logger.info(f"✓ Subscription activated for user {user_id}")
   logger.info(f"✓ Expires: {expiry_date}")
   logger.info("=" * 80)
   ```

---

### 4. API Views (Endpoints)

**File:** `orki-backend/users/views.py`

#### `SubscriptionStatusView` (GET)
```
Endpoint: GET /api/v1/users/subscription/
Auth: IsSessionAuthenticated
Response: {
  "status": "active",
  "is_active": true,
  "plan_name": "orki_premium_monthly",
  "amount_php": 49.00,
  "currency": "PHP",
  "payment_method": "gcash",
  "expiry_date": "2026-06-14T10:30:00Z",
  "days_remaining": 31,
  ...
}
```

#### `CreateCheckoutView` (POST)
```
Endpoint: POST /api/v1/payments/checkout/
Auth: IsSessionAuthenticated
Request: { "payment_methods": ["gcash", "paymaya"] }
Response: {
  "checkout_url": "https://checkout.paymongo.com/p/cs_xxxxx",
  "reference_id": "cs_xxxxx",
  "amount": 49.00
}
```

#### `PayMongoWebhookView` (POST)
```
Endpoint: POST /api/v1/payments/webhook/
Auth: @csrf_exempt, @AllowAny (PayMongo doesn't have CSRF token)
Headers: X-Paymongo-Signature (HMAC-SHA256)
Response: {"status": "success"} (200 OK on success)
```

---

### 5. Access Control (Permission Classes)

**File:** `orki-backend/core/permissions.py`

**IsSubscriber Permission:**
```python
def has_permission(request, view):
    # Check user profile exists
    if not request.user_profile:
        return False
    
    # Check subscription is active
    subscription = request.user_profile.subscription
    return subscription.is_active  # Checks status + expiry
```

**Protected Endpoints:**
```python
# Exams
class MockExamCatalogView(APIView):
    permission_classes = [IsSessionAuthenticated, IsSubscriber]

class ExamAttemptStartView(APIView):
    permission_classes = [IsSessionAuthenticated, IsSubscriber]

# Flashcards (same pattern)
class FlashcardView(APIView):
    permission_classes = [IsSessionAuthenticated, IsSubscriber]
```

---

### 6. Serializers (Response Format)

**File:** `orki-backend/users/serializers.py`

**SubscriptionSerializer:**
```python
class SubscriptionSerializer(ModelSerializer):
    # Calculated field
    days_remaining = SerializerMethodField()
    
    def get_days_remaining(obj):
        delta = obj.expiry_date - now()
        return max(0, delta.days)
```

---

### 7. URL Routing

**File:** `orki-backend/users/urls.py`

```python
urlpatterns = [
    # Subscription status
    path('subscription/', SubscriptionStatusView.as_view()),
    
    # Checkout
    path('payments/checkout/', CreateCheckoutView.as_view()),
    
    # Webhook
    path('payments/webhook/', PayMongoWebhookView.as_view()),
]
```

---

## Complete Request/Response Examples

### Flow 1: Check if User Has Subscription

**Request:**
```bash
GET /api/v1/users/subscription/
Cookie: sessionid=abc123...
```

**Response (Not Subscribed):**
```json
{
  "status": "no_subscription",
  "is_active": false,
  "plan_name": null,
  "expiry_date": null,
  "days_remaining": null
}
```

**Response (Subscribed):**
```json
{
  "status": "active",
  "is_active": true,
  "plan_name": "orki_premium_monthly",
  "amount_php": 49.00,
  "payment_method": "gcash",
  "start_date": "2026-05-14T10:30:00Z",
  "expiry_date": "2026-06-14T10:30:00Z",
  "days_remaining": 31,
  "payment_confirmed_at": "2026-05-14T10:30:00Z"
}
```

---

### Flow 2: Create Checkout Session

**Request:**
```bash
POST /api/v1/payments/checkout/
Cookie: sessionid=abc123...
Content-Type: application/json

{
  "payment_methods": ["gcash", "paymaya"]
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.paymongo.com/p/cs_9z8y7x6w5v",
  "reference_id": "cs_9z8y7x6w5v",
  "amount": 49.00,
  "currency": "PHP",
  "status": "pending"
}
```

Frontend redirects to `checkout_url`:
```
User clicks link
  ↓
Directed to PayMongo checkout page
  ↓
Selects payment method (GCash/Maya/Card/QRPh)
  ↓
Completes payment
  ↓
PayMongo processes payment
  ↓
Webhook fires (checkout_session.payment.paid)
```

---

### Flow 3: Webhook Event Arrives

**PayMongo Sends:**
```bash
POST /api/v1/payments/webhook/
X-Paymongo-Signature: t=1526337619,v1=b2d3...
Content-Type: application/json

{
  "id": "evt_9z8y7x6w5v",
  "type": "checkout_session.payment.paid",
  "data": {
    "id": "payment_abc123",
    "attributes": {
      "status": "paid",
      "payment_method_type": "gcash",
      "created_at": "2026-05-14T10:30:00Z"
    },
    "relationships": {
      "checkout": {
        "data": {
          "id": "cs_9z8y7x6w5v",
          "attributes": {
            "metadata": {
              "user_id": "123",
              "user_email": "user@example.com",
              "product": "orki_subscription"
            }
          }
        }
      }
    }
  }
}
```

**Backend Processing:**
```
1. Extract signature: b2d3...
2. Calculate HMAC-SHA256(body, webhook_secret)
3. Compare with timing-safe function
4. Parse event → type = "checkout_session.payment.paid"
5. Extract: user_id=123, payment_id=payment_abc123
6. Check idempotency: evt_9z8y7x6w5v not in DB yet
7. Find user by ID and email
8. Get/create subscription
9. Call mark_as_active_via_webhook(
     event_id="evt_9z8y7x6w5v",
     payment_id="payment_abc123",
     payment_method="gcash"
   )
10. Set status="active", expiry_date="2026-06-14T10:30:00Z"
11. Log with separator
12. Return 200 OK
```

**Response:**
```json
{
  "status": "success",
  "message": "Subscription activated"
}
```

**Database After Webhook:**
```sql
UPDATE subscriptions SET
  status = 'active',
  payment_method = 'gcash',
  paymongo_payment_id = 'payment_abc123',
  paymongo_checkout_id = 'cs_9z8y7x6w5v',
  last_webhook_event_id = 'evt_9z8y7x6w5v',
  start_date = NOW(),
  expiry_date = NOW() + INTERVAL '30 days',
  payment_confirmed_at = NOW()
WHERE user_id = 123;
```

---

## Security Architecture

### 1. Webhook Signature Verification

**Algorithm:** HMAC-SHA256

```python
# PayMongo Process:
signature = hmac_new(webhook_secret, request_body, sha256).hex()

# Our Process:
received_sig = request.headers.get('X-Paymongo-Signature')
expected_sig = hmac_new(webhook_secret, request_body, sha256).hex()
assert_equal_timing_safe(received_sig, expected_sig)
```

**Why HMAC-SHA256?**
- Cryptographically secure
- Prevents tampering
- Can't be replayed (webhook has unique ID)
- Industry standard

### 2. Idempotency

**Problem:** PayMongo may retry webhook if we don't respond quickly

**Solution:** Store `last_webhook_event_id` in database

```python
# First webhook arrives (evt_123)
subscription.last_webhook_event_id = None
→ Process webhook, set subscription.last_webhook_event_id = "evt_123"

# PayMongo retries webhook (evt_123 again)
subscription.last_webhook_event_id = "evt_123"
→ See it's same event_id, return success without processing
→ User is NOT charged twice
```

### 3. Session Security

**Frontend → Backend:**
- HttpOnly cookies with session ID
- SameSite=Lax (prevent CSRF)
- HTTPS only (production)

**Backend → PayMongo:**
- Basic Auth: base64(SECRET_KEY:)
- HTTPS only
- TLS 1.2+ for all connections

### 4. Database Access Control

**Permission Checks:**
```python
# User can only see their own subscription
subscription = request.user_profile.subscription

# Frontend can never set subscription status
# Only backend webhook can set status="active"

# Exams/Flashcards check: subscription.is_active
# Backend enforces permission, not frontend
```

---

## Error Handling

### 1. Webhook Signature Invalid (401)

```
Cause: Invalid X-Paymongo-Signature header
Fix: 
  - Verify PAYMONGO_WEBHOOK_SECRET matches dashboard
  - Check secret starts with 'whsk_'
  - Restart Django after env var change
```

### 2. User Not Found (404)

```
Cause: Webhook metadata has invalid user_id
Fix:
  - User must exist before payment
  - Check user creation happens before checkout
```

### 3. Webhook Already Processed (Duplicate)

```
Cause: PayMongo sent webhook twice, idempotency caught it
Fix:
  - This is expected behavior
  - User only charged once
  - Logs show "Already processed"
```

### 4. Payment Not Confirmed (Pending)

```
Cause: Webhook arrived before payment.status = "paid"
Fix:
  - Rare edge case
  - PayMongo will resend when status changes
  - Subscription not activated until payment.status = "paid"
```

---

## Monitoring & Debugging

### Key Metrics to Track

1. **Checkout Creation Rate**
   - SELECT COUNT(*) FROM subscriptions WHERE start_date > DATE_SUB(NOW(), INTERVAL 1 DAY);

2. **Payment Success Rate**
   - SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND payment_confirmed_at > DATE_SUB(NOW(), INTERVAL 1 DAY);

3. **Webhook Delivery**
   - PayMongo Dashboard → Webhooks → Recent Deliveries

4. **Subscription Expiry**
   - SELECT COUNT(*) FROM subscriptions WHERE status = 'expired' AND expiry_date < NOW();

### Debugging Commands

```bash
# Django shell
python manage.py shell

# Check subscription
from users.models import Subscription, UserProfile
u = UserProfile.objects.get(user__id=123)
print(u.subscription.is_active)
print(u.subscription.expiry_date)
print(u.subscription.status)

# Check webhook event
print(u.subscription.last_webhook_event_id)

# Check payment
print(u.subscription.paymongo_payment_id)
```

---

## Production Deployment Checklist

- [ ] PayMongo webhook configured in dashboard
- [ ] PAYMONGO_WEBHOOK_SECRET in production .env
- [ ] Database migrated: `python manage.py migrate users`
- [ ] Django debug mode OFF (DEBUG = False)
- [ ] HTTPS enabled for all endpoints
- [ ] Session cookies SameSite=Lax
- [ ] CSRF tokens working
- [ ] All 4 payment methods tested
- [ ] Webhook test successful (200 status)
- [ ] Subscription status visible on frontend
- [ ] Exams/Flashcards locked without subscription
- [ ] Exams/Flashcards unlock after payment
- [ ] Monitor webhook delivery for 24 hours
- [ ] Set up error alerts
- [ ] Backup database before going live

---

**Last Updated:** 2026-05-14  
**Version:** 1.0 - Production Ready
