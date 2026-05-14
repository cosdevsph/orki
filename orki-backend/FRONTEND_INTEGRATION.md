# ORKI SUBSCRIPTION SYSTEM - FRONTEND INTEGRATION GUIDE

## Overview

The frontend integrates with the Orki payment system through three main API endpoints:

1. **Get Subscription Status** - Check if user has active subscription
2. **Create Checkout Session** - Initialize payment with PayMongo
3. **Handle Payment Redirect** - Process payment callback

---

## API Endpoints

### 1. Get Subscription Status

**Endpoint:** `GET /api/v1/users/subscription/`

**Authentication:** ✓ Required (Firebase)

**Response:**
```json
{
  "status": "active",
  "is_active": true,
  "plan_name": "orki_premium_monthly",
  "amount_php": 49.00,
  "currency": "PHP",
  "payment_method": "gcash",
  "start_date": "2026-05-14T10:30:00Z",
  "expiry_date": "2026-06-14T10:30:00Z",
  "days_remaining": 31,
  "payment_confirmed_at": "2026-05-14T10:30:00Z"
}
```

**Status Values:**
- `active` - User has valid, non-expired subscription
- `no_subscription` - User never purchased subscription
- `expired` - Subscription has expired (past expiry_date)
- `cancelled` - User cancelled subscription

**Usage in React:**
```typescript
// Check if user can access exams
const response = await fetch('/api/v1/users/subscription/', {
  credentials: 'include', // Include cookies
});
const subscription = await response.json();

if (subscription.is_active) {
  // Show exams
} else {
  // Show paywall
}
```

---

### 2. Create Checkout Session

**Endpoint:** `POST /api/v1/payments/checkout/`

**Authentication:** ✓ Required (Firebase)

**Request Body (Optional):**
```json
{
  "payment_methods": ["gcash", "paymaya", "card", "qrph"]
}
```

**Supported Payment Methods:**
- `gcash` - GCash (Philippine mobile wallet)
- `paymaya` - PayMaya (Philippine mobile wallet)
- `card` - Credit/Debit Cards (Visa, Mastercard, etc.)
- `qrph` - QR Ph (Philippine instant payment system)

If `payment_methods` not provided, all methods are allowed.

**Response:**
```json
{
  "checkout_url": "https://checkout.paymongo.com/p/cs_xxxxx",
  "reference_id": "cs_xxxxx",
  "amount": 49.00,
  "currency": "PHP",
  "status": "pending"
}
```

**Error Responses:**
```json
// 401 - Not authenticated
{
  "detail": "Authentication required"
}

// 500 - Payment service error
{
  "error": "Failed to create checkout session",
  "message": "PayMongo API error details"
}
```

**Usage in React:**
```typescript
const response = await fetch('/api/v1/payments/checkout/', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    payment_methods: ['gcash', 'paymaya'] // Optional
  })
});

const checkout = await response.json();

// Redirect to PayMongo checkout
window.location.href = checkout.checkout_url;
```

---

## Frontend Flow

### Complete Payment Flow

```
User clicks "Subscribe"
    ↓
[Subscribe Page shows ₱49 plan]
    ↓
User selects payment method (optional)
    ↓
POST /api/v1/payments/checkout/
    ↓
Frontend receives checkout_url
    ↓
Redirect to PayMongo checkout page
    ↓
User completes payment (GCash/Card/etc)
    ↓
PayMongo webhook fires
    ↓
Backend processes webhook (signature verified)
    ↓
Backend updates subscription status → "active"
    ↓
Backend sets expiry_date = now + 30 days
    ↓
PayMongo redirects user to success page
    ↓
User returns to Orki
    ↓
GET /api/v1/users/subscription/ → is_active: true
    ↓
Exams & Flashcards unlock
```

---

## Implementation Examples

### Example 1: Simple Subscribe Button

```typescript
import { useState } from 'react';

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/payments/checkout/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout');
      }

      const { checkout_url } = await response.json();
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button 
        onClick={handleSubscribe} 
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Subscribe Now - ₱49'}
      </button>
    </div>
  );
}
```

### Example 2: Payment Method Selector

```typescript
import { useState } from 'react';

export function PaymentMethodSelector() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  const handleCheckout = async () => {
    const response = await fetch('/api/v1/payments/checkout/', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment_methods: selectedMethod ? [selectedMethod] : undefined
      }),
    });

    const { checkout_url } = await response.json();
    window.location.href = checkout_url;
  };

  return (
    <div>
      <h3>Select Payment Method</h3>
      
      <label>
        <input
          type="radio"
          name="payment"
          value="gcash"
          onChange={(e) => setSelectedMethod(e.target.value)}
        />
        GCash
      </label>

      <label>
        <input
          type="radio"
          name="payment"
          value="paymaya"
          onChange={(e) => setSelectedMethod(e.target.value)}
        />
        PayMaya
      </label>

      <label>
        <input
          type="radio"
          name="payment"
          value="card"
          onChange={(e) => setSelectedMethod(e.target.value)}
        />
        Credit/Debit Card
      </label>

      <label>
        <input
          type="radio"
          name="payment"
          value="qrph"
          onChange={(e) => setSelectedMethod(e.target.value)}
        />
        QR Ph
      </label>

      <button onClick={handleCheckout}>
        Proceed to Payment
      </button>
    </div>
  );
}
```

### Example 3: Protected Exam Page (with Paywall)

```typescript
import { useEffect, useState } from 'react';

interface Subscription {
  is_active: boolean;
  status: string;
  expiry_date?: string;
  days_remaining?: number;
}

export function ExamsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      const response = await fetch('/api/v1/users/subscription/', {
        credentials: 'include',
      });
      const data = await response.json();
      setSubscription(data);
      setLoading(false);
    };

    checkSubscription();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!subscription?.is_active) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>🔒 Premium Feature</h2>
        <p>Unlock Exams & Flashcards with a subscription</p>
        
        <button 
          onClick={() => window.location.href = '/subscribe'}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Subscribe Now - ₱49
        </button>

        {subscription?.status === 'expired' && (
          <p style={{ color: 'orange' }}>
            ⏰ Your subscription expired. Renew to continue.
          </p>
        )}
      </div>
    );
  }

  // User is subscribed - show exams
  return (
    <div>
      <div style={{ 
        backgroundColor: '#e8f5e9', 
        padding: '12px', 
        marginBottom: '20px',
        borderRadius: '4px'
      }}>
        ✓ Active subscription • Expires in {subscription.days_remaining} days
      </div>

      {/* Show exams here */}
      <h2>Available Exams</h2>
      {/* ... exams content ... */}
    </div>
  );
}
```

---

## Security & Best Practices

### ✓ DO:

1. **Always verify backend response**
   ```typescript
   if (response.ok && data.is_active) {
     // Safe to show premium content
   }
   ```

2. **Send credentials with every request**
   ```typescript
   fetch(url, {
     credentials: 'include' // Required for session cookies
   })
   ```

3. **Handle 401 Unauthorized**
   ```typescript
   if (response.status === 401) {
     // Redirect to login
     window.location.href = '/login';
   }
   ```

4. **Store subscription state locally**
   ```typescript
   const [isSubscribed, setIsSubscribed] = useState(false);
   // Update when subscription changes
   ```

### ✗ DON'T:

1. **Don't use localStorage to track subscription status**
   ❌ `localStorage.setItem('is_subscribed', 'true')`
   - Backend is source of truth, not frontend
   - User could manually edit localStorage

2. **Don't render premium content without backend check**
   ❌ `{showExams && <Exams />}`
   - Always fetch `/subscription/` endpoint first

3. **Don't hardcode payment methods**
   ❌ `const methods = ['gcash', 'paymaya']`
   - Backend should define available methods

4. **Don't trust payment confirmation without backend**
   ❌ `if (url.includes('success')) { unlock() }`
   - Only backend webhook confirms payment
   - Frontend redirect can be spoofed

---

## Error Handling

### Common Errors & Solutions

**401 Unauthorized**
- User not authenticated
- Session/Firebase token expired
- Solution: Redirect to login

**403 Forbidden**
- User doesn't have active subscription
- Subscription expired
- Solution: Show paywall

**500 Server Error**
- PayMongo API unavailable
- Database connection error
- Solution: Retry or show error message

**Network Error**
- User offline
- API unreachable
- Solution: Retry with exponential backoff

---

## API Testing Checklist

- [ ] Test subscription check on non-subscriber user
- [ ] Test subscription check on subscriber user
- [ ] Test creating checkout session
- [ ] Test payment method parameter
- [ ] Test error responses (401, 403, 500)
- [ ] Test after successful payment
- [ ] Test subscription expiry message
- [ ] Test payment redirect back to app
- [ ] Test all 4 payment methods

---

## Environment Variables

No frontend-specific environment variables needed.

Backend `.env` must have:
```env
PAYMONGO_SECRET_KEY=sk_test_xxxxx
PAYMONGO_WEBHOOK_SECRET=whsk_xxxxx
FRONTEND_URL=http://localhost:3000
```

---

## Debugging

### Check subscription in DevTools

```javascript
// In browser console
fetch('/api/v1/users/subscription/', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Simulate payment flow

1. Create checkout: `POST /api/v1/payments/checkout/`
2. Visit returned `checkout_url`
3. Use test card: `4242 4242 4242 4242`
4. Complete payment
5. Check subscription updated: `GET /api/v1/users/subscription/`

---

## Next Steps

1. Add SubscribeButton to subscribe page
2. Add payment method selector
3. Protect exam page with subscription check
4. Add success page after payment
5. Test complete flow end-to-end
6. Monitor PayMongo webhook deliveries

---

**Last Updated:** 2026-05-14  
**Version:** 1.0 - Production Ready
