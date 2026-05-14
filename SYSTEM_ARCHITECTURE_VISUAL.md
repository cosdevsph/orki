# SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORKI SUBSCRIPTION SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                 │
│  (Next.js - React)                                                          │
│  ┌────────────────┐  ┌──────────────┐  ┌────────────┐  ┌────────────┐     │
│  │  Subscribe     │  │ Payment      │  │ Exams      │  │ Dashboard  │     │
│  │  Page          │  │ Method       │  │ Page       │  │ Page       │     │
│  │  (₱49)         │  │ Selector     │  │ (Paywall)  │  │ (Always    │     │
│  │                │  │ (GCash/Maya) │  │            │  │  free)     │     │
│  └────────────────┘  └──────────────┘  └────────────┘  └────────────┘     │
│         │                  │                   │                │           │
│         └──────────────────┴───────────────────┴────────────────┘           │
│                            │                                                │
│                    POST /api/v1/payments/checkout/                          │
│                    GET  /api/v1/users/subscription/                         │
│                            │                                                │
└────────────────────────────┼────────────────────────────────────────────────┘
                             │
                    HTTP + Session Cookies
                             │
┌────────────────────────────┼────────────────────────────────────────────────┐
│                 DJANGO BACKEND LAYER                                        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │  API VIEWS (users/views.py)                                      │      │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────────────┐  │      │
│  │  │ SubscriptionStatusView (GET)    │  │ CreateCheckoutView │  │      │
│  │  │ Returns: status, is_active,     │  │ (POST)             │  │      │
│  │  │ expiry_date, days_remaining     │  │ Creates PayMongo   │  │      │
│  │  │                                 │  │ checkout session   │  │      │
│  │  └────────────────┘                └──┴────────────────────┘  │      │
│  │                                                                │      │
│  │  ┌────────────────────────────────────────────────────────┐  │      │
│  │  │ PayMongoWebhookView (POST)                             │  │      │
│  │  │ - Receive webhook from PayMongo                        │  │      │
│  │  │ - Verify X-Paymongo-Signature (HMAC-SHA256)           │  │      │
│  │  │ - Check idempotency (last_webhook_event_id)           │  │      │
│  │  │ - Update subscription status → "active"               │  │      │
│  │  │ - Set expiry_date = now + 30 days                     │  │      │
│  │  └────────────────────────────────────────────────────────┘  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                            │                                                │
│  ┌──────────────────────────┼──────────────────────────────────────┐       │
│  │  SERVICES LAYER          │                                      │       │
│  │                           │                                      │       │
│  │  ┌─────────────────────┐  │  ┌──────────────────────────────┐   │       │
│  │  │ PayMongoService     │  │  │ WebhookHandler              │   │       │
│  │  │ (payment_service.py)│  │  │ (webhook_handler.py)        │   │       │
│  │  │                     │  │  │                              │   │       │
│  │  │ - create_checkout() │  │  │ - process_webhook()         │   │       │
│  │  │ - get_checkout()    │  │  │ - handle_payment_paid()     │   │       │
│  │  │ - verify_webhook_   │  │  │ - _normalize_payment_method │   │       │
│  │  │   signature()       │  │  │                              │   │       │
│  │  │ - parse_webhook_    │  │  └──────────────────────────────┘   │       │
│  │  │   event()           │  │                                      │       │
│  │  │ - _get_auth_headers │  │                                      │       │
│  │  │                     │  │                                      │       │
│  │  └─────────────────────┘  │                                      │       │
│  │                           │                                      │       │
│  └───────────────────────────┼──────────────────────────────────────┘       │
│                              │                                              │
│  ┌──────────────────────────┼──────────────────────────────────────┐       │
│  │  MODELS & PERMISSIONS     │                                      │       │
│  │                           │                                      │       │
│  │  ┌──────────────────┐  ┌──┼─────────────────────────────┐       │       │
│  │  │ Subscription     │  │  │ Permissions (core/)          │       │       │
│  │  │ (models.py)      │  │  │                              │       │       │
│  │  │                  │  │  │ - IsSubscriber              │       │       │
│  │  │ Fields:          │  │  │   (checks is_active)        │       │       │
│  │  │ - status         │  │  │                              │       │       │
│  │  │ - is_active @    │  │  │ - require_active_           │       │       │
│  │  │   property       │  │  │   subscription (decorator)  │       │       │
│  │  │ - payment_method │  │  │                              │       │       │
│  │  │ - paymongo_      │  │  └──────────────────────────────┘       │       │
│  │  │   payment_id     │  │                                         │       │
│  │  │ - paymongo_      │  │                                         │       │
│  │  │   checkout_id    │  │                                         │       │
│  │  │ - last_webhook_  │  │                                         │       │
│  │  │   event_id       │  │                                         │       │
│  │  │ - start_date     │  │                                         │       │
│  │  │ - expiry_date    │  │                                         │       │
│  │  │ - payment_       │  │                                         │       │
│  │  │   confirmed_at   │  │                                         │       │
│  │  │                  │  │                                         │       │
│  │  │ Methods:         │  │                                         │       │
│  │  │ - mark_as_active_│  │                                         │       │
│  │  │   via_webhook()  │  │                                         │       │
│  │  └──────────────────┘  │                                         │       │
│  │                        │                                         │       │
│  └────────────────────────┴─────────────────────────────────────────┘       │
│                                                                             │
└──────────────────────────────────────────────┬──────────────────────────────┘
                                               │
                                               │ HTTPS
                                               │
                          ┌────────────────────┴──────────────────┐
                          │                                       │
┌─────────────────────────────────────────┐  ┌──────────────────────────────┐
│       PAYMONGO PAYMENT GATEWAY           │  │  DJANGO DATABASE             │
│                                         │  │  (SQLite / PostgreSQL)       │
│  ┌──────────────────────────────────┐  │  │                              │
│  │ Checkout Session Created        │  │  │  subscriptions table:         │
│  │ - Amount: 4900 centavos (₱49)   │  │  │  ┌──────────────────────┐    │
│  │ - Methods: GCash, Maya, Card,   │  │  │  │ id  user  status     │    │
│  │   QRPh                          │  │  │  │ payment_method       │    │
│  │ - Metadata: user_id, email      │  │  │  │ paymongo_payment_id  │    │
│  │ - Redirect success/failed URLs  │  │  │  │ paymongo_checkout_id │    │
│  └──────────────────────────────────┘  │  │  │ last_webhook_event_id│   │
│                │                        │  │  │ start_date           │    │
│                │ User selects payment  │  │  │ expiry_date          │    │
│                │ method & completes    │  │  │ payment_confirmed_at │    │
│                ▼                        │  │  │ amount_php           │    │
│  ┌──────────────────────────────────┐  │  │  │ currency             │    │
│  │ Payment Processed                │  │  │  │ Indexes:             │    │
│  │ Status: PAID ✓                   │  │  │  │ - (user, status)     │    │
│  │                                  │  │  │  │ - paymongo_payment_id│    │
│  │ Webhook fires:                   │  │  │  │ - last_webhook_event │    │
│  │ checkout_session.payment.paid    │  │  │  │ - expiry_date        │    │
│  └──────────────────────────────────┘  │  │  └──────────────────────┘    │
│                │                        │  │                              │
│                │ POST with signature    │  └──────────────────────────────┘
│                ▼                        │
│  ┌──────────────────────────────────┐  │
│  │ Webhook Payload                  │  │
│  │ X-Paymongo-Signature header      │  │
│  │ with HMAC-SHA256 signature       │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
                     │
                     │ Webhook request with signature
                     │
                     ▼
┌─────────────────────────────────────────┐
│   WEBHOOK PROCESSING                    │
│                                         │
│  1. Verify signature (HMAC-SHA256) ✓   │
│  2. Parse event data                   │
│  3. Check event type:                  │
│     checkout_session.payment.paid      │
│  4. Extract:                           │
│     - payment_id                       │
│     - payment_method_type              │
│     - user_id (from metadata)          │
│     - user_email (from metadata)       │
│  5. Check idempotency:                 │
│     last_webhook_event_id == event_id? │
│     (If yes, return already processed)  │
│  6. Update subscription:                │
│     - status = "active"                │
│     - payment_method = payment_type    │
│     - start_date = NOW()               │
│     - expiry_date = NOW() + 30 days    │
│     - last_webhook_event_id = event_id │
│     - payment_confirmed_at = NOW()     │
│  7. Log success with separator         │
│  8. Return 200 OK                      │
│                                         │
└─────────────────────────────────────────┘
                     │
                     │ ✓ Success
                     │
                     ▼
┌─────────────────────────────────────────┐
│   FRONTEND ACCESSES PREMIUM CONTENT     │
│                                         │
│   1. GET /api/v1/users/subscription/   │
│      → is_active: true                 │
│      → status: "active"                │
│      → expiry_date: 2026-06-14         │
│      → days_remaining: 31              │
│                                         │
│   2. Frontend checks response           │
│      if (is_active) {                  │
│        show exams & flashcards         │
│      } else {                          │
│        show paywall                    │
│      }                                 │
│                                         │
│   3. User accesses exams/flashcards    │
│      Protected by IsSubscriber          │
│      permission class                  │
│                                         │
│   ✅ EXAMS & FLASHCARDS UNLOCKED       │
│                                         │
└─────────────────────────────────────────┘
```

## Data Flow Summary

```
SIGNUP FLOW:
User → Register Account → Firebase Auth → Django Session → Dashboard

SUBSCRIBE FLOW:
User → Subscribe Button
  → POST /api/v1/payments/checkout/
  → Create PayMongo Session
  → Redirect to Checkout
  → User selects payment method
  → Completes payment
  → PayMongo webhook fires
  → Backend processes webhook
  → Subscription created (status="active", expiry=now+30d)
  → Return to site
  → Exams/Flashcards unlock ✓

DAILY FLOW:
User → Open Exams/Flashcards
  → GET /api/v1/users/subscription/
  → is_active = true?
  → YES: Show content + "Expires in X days"
  → NO: Show paywall + "Subscribe Now - ₱49"

EXPIRY FLOW:
After 30 days:
  → expiry_date < NOW()
  → is_active property returns false
  → Exams/Flashcards lock
  → Paywall reappears
```

## Security Layers

```
┌─────────────────────────────────────────┐
│         NETWORK LAYER                   │
│                                         │
│  • HTTPS only (production)             │
│  • TLS 1.2+ for all connections        │
│  • Secure WebSocket (WSS)              │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│      AUTHENTICATION LAYER               │
│                                         │
│  • Firebase auth (frontend)            │
│  • Django session (backend)            │
│  • HttpOnly cookies                    │
│  • SameSite=Lax policy                 │
│  • CSRF token validation               │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│       WEBHOOK LAYER                     │
│                                         │
│  • X-Paymongo-Signature header         │
│  • HMAC-SHA256 verification            │
│  • Timing-safe comparison              │
│  • Event type validation               │
│  • Status == "paid" only               │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│      IDEMPOTENCY LAYER                  │
│                                         │
│  • last_webhook_event_id tracking      │
│  • Prevent duplicate processing        │
│  • Database-backed (not memory)        │
│  • Prevents double-charging            │
└─────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────┐
│     ACCESS CONTROL LAYER                │
│                                         │
│  • IsSubscriber permission class       │
│  • subscription.is_active check        │
│  • Backend enforced (not frontend)     │
│  • 403 Forbidden for unauthorized      │
│  • No frontend bypass possible         │
└─────────────────────────────────────────┘
```

## Status Transitions

```
┌──────────────────────────────────┐
│   NO_SUBSCRIPTION (Default)      │
│   - User just signed up          │
│   - No payment yet               │
│   - Exams locked                 │
└──────────────────────────────────┘
           │
           │ User clicks Subscribe
           │ and completes payment
           ▼
┌──────────────────────────────────┐
│   ACTIVE                         │
│   - Webhook confirmed payment    │
│   - expiry_date set (30 days)   │
│   - Exams unlocked ✓            │
│   - is_active = true            │
└──────────────────────────────────┘
           │
           │ Time passes...
           │ expiry_date < NOW()
           ▼
┌──────────────────────────────────┐
│   EXPIRED                        │
│   - Subscription past expiry     │
│   - is_active = false           │
│   - Exams locked                │
│   - Paywall reappears           │
└──────────────────────────────────┘

Alternative: CANCELLED (future)
```

## Environment Variables Map

```
Backend (.env):
├── PAYMONGO_SECRET_KEY              (sk_test_xxxxx)
├── PAYMONGO_WEBHOOK_SECRET          (whsk_xxxxx) ← From PayMongo Dashboard
├── FRONTEND_URL                     (http://localhost:3000)
├── DEBUG                            (True/False)
├── ALLOWED_HOSTS                    (localhost,127.0.0.1)
└── DATABASE_URL                     (sqlite/postgres)

Frontend (.env.local):
└── NEXT_PUBLIC_API_URL              (http://localhost:8000)
```

## Performance Optimizations

```
Database Indexes:
  ✓ (user_id, status)        - Fast lookup by status
  ✓ paymongo_payment_id       - Fast payment lookup
  ✓ last_webhook_event_id     - Fast idempotency check
  ✓ expiry_date               - Fast expiry queries

Query Optimization:
  ✓ Select specific fields
  ✓ Use indexes in WHERE clauses
  ✓ Cache subscription status (frontend)
  ✓ Avoid N+1 queries

API Response Times:
  ✓ GET /subscription/        < 200ms
  ✓ POST /checkout/           < 1s (PayMongo API)
  ✓ POST /webhook/            < 500ms
```

---

**Architecture Version:** 1.0  
**Last Updated:** 2026-05-14  
**Status:** Production Ready
