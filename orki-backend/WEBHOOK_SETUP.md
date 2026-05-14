# PAYMONGO WEBHOOK SETUP GUIDE

This document explains how to configure PayMongo webhooks for Orki
so payment confirmations automatically unlock premium access.

---

## SECTION 1: WEBHOOK URL SETUP IN PAYMONGO DASHBOARD

### Step 1: Log in to PayMongo Dashboard
- Go to: https://dashboard.paymongo.com/
- Sign in with your PayMongo account

### Step 2: Access Webhook Settings
- Navigate to: Settings > Developers > Webhooks
- Or URL: https://dashboard.paymongo.com/developers/webhooks

### Step 3: Create New Webhook
Click "Create a New Webhook" or "Add Webhook"

### Step 4: Enter Webhook Endpoint URL
In the "Endpoint URL" field, enter:
```
https://your-domain.com/api/v1/payments/webhook/
```

**For LOCAL TESTING:**
Use ngrok to expose your local server:

```bash
# Terminal 1: Run Django server
python manage.py runserver

# Terminal 2: Expose to internet
ngrok http 8000

# Copy ngrok URL and use:
https://xxxx-yy-zzz-www.ngrok.io/api/v1/payments/webhook/
```

### Step 5: Select Events to Listen For
Check ONLY this event:
- ☑ **checkout_session.payment.paid** ← SELECT THIS ONE

Leave all other events unchecked (we don't need them):
- checkout_session.payment.failed
- payment.created  
- payment.updated
- link.created
- source.chargeable
- subscription events

### Step 6: Get Webhook Secret
After creating webhook, PayMongo will display:
```
Webhook ID: wh_xxxxx
Webhook Secret: whsk_xxxxx
```

**Copy the Webhook Secret** (the one starting with 'whsk_')

### Step 7: Add Webhook Secret to .env
Update your `.env` file:
```env
PAYMONGO_WEBHOOK_SECRET=whsk_xxxxx
```

**Important Note:** The webhook secret is DIFFERENT from your API secret key:
- `PAYMONGO_SECRET_KEY` = `sk_test_xxxxx` (API key)
- `PAYMONGO_WEBHOOK_SECRET` = `whsk_xxxxx` (webhook secret)

### Step 8: Save/Create Webhook
Click "Create Webhook" or "Save"

---

## SECTION 2: VERIFY WEBHOOK IS WORKING

After setup, PayMongo will attempt to send test webhooks.

Check webhook delivery status:
1. Go to: Settings > Developers > Webhooks
2. Click on your webhook
3. View "Recent Deliveries"

**Status codes:**
- `200 OK`: Webhook processed successfully ✓
- `401`: Signature verification failed ✗
- `500`: Server error (PayMongo will retry) ⚠

If you see 200 responses, **webhook is working!**

---

## SECTION 3: TEST WEBHOOK FLOW (DEVELOPMENT)

To test in test mode without real payments:

### Option A: Use PayMongo Test Mode
1. Switch to TEST MODE (top left dropdown in dashboard)
2. Create test checkout session
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Complete payment
6. Webhook should fire automatically ✓

### Option B: Manual Webhook Testing
Use curl to send test webhook:

```bash
curl -X POST http://localhost:8000/api/v1/payments/webhook/ \
  -H "Content-Type: application/json" \
  -H "X-Paymongo-Signature: test_signature_here" \
  -d '{
    "type": "checkout_session.payment.paid",
    "id": "evt_test_123",
    "data": {
      "id": "payment_test_123",
      "attributes": {
        "status": "paid",
        "payment_method_type": "card"
      }
    }
  }'
```

---

## SECTION 4: MONITORING & DEBUGGING

### Django Logs
- Enable logging: `DEBUG = True` in `settings.py`
- All webhook events logged with detailed information
- Look for: `✓ Webhook signature verified`

### Database
Check subscription table:
```sql
SELECT id, user_id, status, expiry_date, payment_confirmed_at 
FROM subscriptions 
WHERE user_id = 1;
```

After successful webhook:
- `status` should be `active`
- `expiry_date` should be 30 days from now
- `payment_confirmed_at` should be recent

### PayMongo Dashboard
- Settings > Developers > Webhooks > Recent Deliveries
- View response status and timestamps

---

## SECTION 5: PRODUCTION CHECKLIST

Before going live:

- [ ] Test webhook signature verification works
- [ ] Test idempotency (same webhook twice doesn't double-charge)
- [ ] Confirm `PAYMONGO_WEBHOOK_SECRET` is set
- [ ] Confirm subscription status updates on `payment.paid`
- [ ] Test all 4 payment methods (GCash, Maya, Card, QRPh)
- [ ] Monitor webhook delivery status for 24 hours
- [ ] Have backup: manual subscription verification script
- [ ] Set up alerts for webhook failures
- [ ] Use HTTPS endpoints only (no HTTP)
- [ ] Verify secret key not committed to git

---

## SECTION 6: TROUBLESHOOTING

### Webhook not triggering?
- Check endpoint URL is correct
- Check webhook is enabled (toggle switch on/off)
- Check events are selected (`checkout_session.payment.paid`)
- Check server is accessible
  - For local testing: use ngrok
  - For production: confirm domain is accessible
- Check server logs for incoming requests

### Webhook shows 401 (Signature Invalid)?
- Verify `PAYMONGO_WEBHOOK_SECRET` matches PayMongo dashboard
- Check it starts with `whsk_`
- Don't confuse with `PAYMONGO_SECRET_KEY` (starts with `sk_`)
- Restart Django server after changing .env

### Webhook shows 500 (Server Error)?
- Check Django server is running: `python manage.py runserver`
- Check database is accessible
- Check user exists: `User.objects.get(id=X)`
- Review Django logs for specific error

### User not unlocked after payment?
- Check webhook delivery in PayMongo dashboard
- Check subscription table for user
- Verify `expiry_date` is set to future
- Verify `status` is `active` (not `no_subscription`)
- Check frontend is using `GET /api/v1/users/subscription/`

---

## SECTION 7: WEBHOOK PAYLOAD STRUCTURE

This is the structure PayMongo sends:

```json
{
  "id": "evt_xxxxx",
  "type": "checkout_session.payment.paid",
  "data": {
    "id": "payment_xxxxx",
    "attributes": {
      "status": "paid",
      "payment_method_type": "gcash",
      "created_at": "2026-05-14T10:30:00Z"
    },
    "relationships": {
      "checkout": {
        "data": {
          "id": "cs_xxxxx",
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
  },
  "created_at": "2026-05-14T10:30:00Z"
}
```

---

## SECTION 8: SECURITY NOTES

### DO:
✓ Verify webhook signature on EVERY request  
✓ Store webhook secret in environment variable  
✓ Check idempotency to prevent duplicate processing  
✓ Log all webhook events for audit trail  
✓ Use HTTPS endpoints only (production)  

### DON'T:
✗ Trust webhook without signature verification  
✗ Commit secrets to git  
✗ Process payment without backend confirmation  
✗ Use frontend to set subscription status  
✗ Skip idempotency checks  

---

## QUICK REFERENCE

### PayMongo Dashboard URLs
- Main: https://dashboard.paymongo.com/
- Settings: https://dashboard.paymongo.com/settings
- API Keys: https://dashboard.paymongo.com/developers/api-keys
- Webhooks: https://dashboard.paymongo.com/developers/webhooks

### Orki Webhook Endpoint
```
POST https://orki.example.com/api/v1/payments/webhook/
```

### Environment Variables
```env
PAYMONGO_SECRET_KEY=sk_test_xxxxx        # API key
PAYMONGO_WEBHOOK_SECRET=whsk_xxxxx       # Webhook secret
PAYMONGO_PUBLIC_KEY=pk_test_xxxxx        # Frontend key
FRONTEND_URL=http://localhost:3000       # For redirects
```

### Key Database Fields
- **status**: `active` | `no_subscription` | `expired` | `cancelled`
- **is_active**: calculated property (checks status + expiry_date)
- **expiry_date**: when subscription expires (30 days from payment)
- **payment_confirmed_at**: when webhook confirmed payment

---

**Last Updated:** 2026-05-14  
**Version:** 1.0 - Production Ready

