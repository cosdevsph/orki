# FRONTEND IMPLEMENTATION CHECKLIST

This checklist helps track frontend implementation of the Orki subscription system.

---

## Phase 1: Core Components (Required)

### Subscribe Button Component
- [ ] Create `src/components/SubscribeButton.tsx`
- [ ] Fetch `/api/v1/payments/checkout/`
- [ ] Handle loading state
- [ ] Handle errors (401, 500)
- [ ] Redirect to checkout_url
- [ ] Test button click flow

```typescript
// Template
import { useState } from 'react'

export function SubscribeButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/v1/payments/checkout/', {
        method: 'POST',
        credentials: 'include'
      })
      const data = await res.json()
      window.location.href = data.checkout_url
    } catch (err) {
      setError('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSubscribe} disabled={loading}>
      {loading ? 'Processing...' : 'Subscribe Now - ₱49'}
    </button>
  )
}
```

### Subscription Status Hook
- [ ] Create `src/hooks/useSubscription.ts`
- [ ] Fetch `/api/v1/users/subscription/` on mount
- [ ] Update when user logs in/out
- [ ] Cache subscription status
- [ ] Handle refetch on focus
- [ ] Test with multiple user sessions

```typescript
// Template
import { useEffect, useState } from 'react'

export function useSubscription() {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/users/subscription/', {
      credentials: 'include'
    })
      .then(r => r.json())
      .then(setSubscription)
      .finally(() => setLoading(false))
  }, [])

  return { subscription, loading, isActive: subscription?.is_active }
}
```

### Payment Method Selector
- [ ] Create `src/components/PaymentMethodSelector.tsx`
- [ ] Display all 4 methods (GCash, Maya, Card, QRPh)
- [ ] Allow user selection
- [ ] Pass selected method to checkout endpoint
- [ ] Show payment method icons/badges
- [ ] Test all 4 methods

```typescript
// Template
const PAYMENT_METHODS = [
  { value: 'gcash', label: 'GCash', icon: '🏪' },
  { value: 'paymaya', label: 'PayMaya', icon: '📱' },
  { value: 'card', label: 'Debit/Credit Card', icon: '💳' },
  { value: 'qrph', label: 'QR Ph', icon: '📲' }
]

export function PaymentMethodSelector() {
  const [selected, setSelected] = useState('')

  const handleCheckout = async () => {
    const res = await fetch('/api/v1/payments/checkout/', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({
        payment_methods: [selected]
      })
    })
    const data = await res.json()
    window.location.href = data.checkout_url
  }

  return (
    <div>
      {PAYMENT_METHODS.map(m => (
        <label key={m.value}>
          <input
            type="radio"
            value={m.value}
            onChange={e => setSelected(e.target.value)}
          />
          {m.icon} {m.label}
        </label>
      ))}
      <button onClick={handleCheckout}>Proceed to Payment</button>
    </div>
  )
}
```

### Paywall Component
- [ ] Create `src/components/Paywall.tsx`
- [ ] Show "Premium Feature" message
- [ ] Display ₱49 price
- [ ] Show subscribe button
- [ ] Show payment methods info
- [ ] Responsive design
- [ ] Test on mobile

```typescript
// Template
export function Paywall() {
  return (
    <div style={{ textAlign: 'center', padding: '40px' }}>
      <h2>🔒 Premium Feature</h2>
      <p>Unlock Exams & Flashcards</p>
      <p style={{ fontSize: '24px', margin: '20px 0' }}>₱49 for 30 days</p>
      <p style={{ color: '#666' }}>
        💳 Card • 📱 GCash • 🏪 PayMaya • 📲 QR Ph
      </p>
      <button onClick={() => window.location.href = '/subscribe'}>
        Subscribe Now
      </button>
    </div>
  )
}
```

---

## Phase 2: Page Integration (Required)

### Subscribe Page (`/subscribe`)
- [ ] Add SubscribeButton component
- [ ] Add PaymentMethodSelector
- [ ] Display ₱49 plan details
- [ ] Show payment methods
- [ ] Add success/error messages
- [ ] Test complete flow

### Exams Page (`/exams`)
- [ ] Import useSubscription hook
- [ ] Check subscription status on mount
- [ ] If not active: show Paywall instead of exams
- [ ] If active: show exams as normal
- [ ] Display "Active subscription • Expires in X days"
- [ ] Test locked and unlocked states

```typescript
// Example implementation
import { useSubscription } from '@/hooks/useSubscription'
import { Paywall } from '@/components/Paywall'

export function ExamsPage() {
  const { subscription, loading, isActive } = useSubscription()

  if (loading) return <div>Loading...</div>

  if (!isActive) {
    return <Paywall />
  }

  return (
    <div>
      <div style={{ padding: '12px', backgroundColor: '#e8f5e9' }}>
        ✓ Subscription active • Expires in {subscription.days_remaining} days
      </div>
      {/* Show exams */}
    </div>
  )
}
```

### Flashcards Page (`/flashcards`)
- [ ] Same pattern as Exams page
- [ ] Check subscription status
- [ ] Show Paywall if not active
- [ ] Show flashcards if active
- [ ] Display expiry info

### Dashboard Page (`/dashboard`)
- [ ] Show subscription status card
- [ ] Display current plan (₱49 - 30 days)
- [ ] Show expiry date
- [ ] Show days remaining
- [ ] Option to manage subscription
- [ ] Always accessible (no paywall)

---

## Phase 3: Error Handling (Required)

### Authentication Errors
- [ ] Handle 401 Unauthorized
  - [ ] Clear session
  - [ ] Redirect to login
  - [ ] Show "Session expired" message

### Payment Errors
- [ ] Handle checkout creation failure
  - [ ] Show error message
  - [ ] Allow retry
  - [ ] Log error for debugging

### Network Errors
- [ ] Handle fetch failures
  - [ ] Show "Connection error" message
  - [ ] Implement retry mechanism
  - [ ] Exponential backoff

### 403 Forbidden (Subscription Required)
- [ ] Handle when accessing protected endpoints
- [ ] Show paywall instead of error page
- [ ] Offer subscribe button

---

## Phase 4: User Experience (Recommended)

### Success Page (After Payment)
- [ ] Create `/subscribe/success` page
- [ ] Show "Payment successful!" message
- [ ] Automatically redirect to exams after 3 seconds
- [ ] Allow manual "Continue to Exams" button
- [ ] Show subscription details

### Expiry Warnings
- [ ] Show warning when < 7 days remaining
- [ ] Offer "Renew Subscription" button
- [ ] Show countdown timer on dashboard
- [ ] Show "Expires in X days" on exams page

### Payment Status Display
- [ ] Show subscription status in navbar/profile
- [ ] Display active/expired badges
- [ ] Show payment method used
- [ ] Show last payment date

### Loading States
- [ ] Show skeleton loader while checking subscription
- [ ] Show loading spinner during checkout creation
- [ ] Disable buttons while processing
- [ ] Show success/error feedback

---

## Phase 5: Responsive Design (Required)

### Mobile
- [ ] Subscribe page works on mobile
- [ ] Payment method buttons full width
- [ ] Paywall readable on small screens
- [ ] Buttons easily tappable (48px+ minimum)

### Tablet
- [ ] Layout adapts to landscape
- [ ] Text readable at all sizes
- [ ] Images scale properly

### Desktop
- [ ] Clean layout with spacing
- [ ] Professional appearance
- [ ] Payment methods displayed clearly

---

## Phase 6: Accessibility (Recommended)

- [ ] Subscribe button has proper aria-label
- [ ] Paywall headings have proper heading hierarchy
- [ ] Color not only way to indicate status
- [ ] Keyboard navigation works
- [ ] Error messages associated with form fields
- [ ] Loading states announced to screen readers

---

## Phase 7: Testing (Required)

### Unit Tests
- [ ] useSubscription hook renders
- [ ] SubscribeButton calls correct endpoint
- [ ] PaymentMethodSelector passes selected method
- [ ] Paywall displays when not active
- [ ] Premium content shows when active

### Integration Tests
- [ ] Complete subscribe flow works
- [ ] Redirect to checkout works
- [ ] Webhook updates subscription in real-time
- [ ] Locked content unlocks after payment
- [ ] Logout clears subscription cache

### E2E Tests (Cypress/Playwright)
- [ ] User signup → Subscribe → Payment → Access Exams
- [ ] User logout → Login → Still has subscription
- [ ] Multiple users have separate subscriptions
- [ ] Expiry date displays correctly
- [ ] Payment methods work

---

## Phase 8: Environment Configuration

- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `.env.example`
- [ ] Document all variables:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000
  NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_xxxxx (optional)
  ```
- [ ] Test with different environments (dev, test, prod)

---

## Phase 9: Analytics (Optional)

- [ ] Track "Subscribe button clicked"
- [ ] Track "Checkout page viewed"
- [ ] Track "Payment completed"
- [ ] Track "Exams accessed after subscription"
- [ ] Track subscription conversions
- [ ] Track payment method distribution

---

## Phase 10: Documentation (Required)

- [ ] Add JSDoc comments to all components
- [ ] Document API error responses
- [ ] Create component usage guide
- [ ] Document environment setup
- [ ] Add troubleshooting guide for developers

```typescript
/**
 * SubscribeButton - Initiates PayMongo payment flow
 * 
 * @returns Button component that creates checkout session
 * @throws {Error} If checkout creation fails
 * 
 * Usage:
 * <SubscribeButton />
 */
export function SubscribeButton() { ... }
```

---

## Testing Checklist

### Manual Testing
- [ ] Subscribe button works on all browsers
- [ ] Redirect to PayMongo checkout works
- [ ] Payment completes successfully
- [ ] Subscription status updates
- [ ] Exams unlock after payment
- [ ] Paywall shows when not subscribed
- [ ] Days remaining displays correctly
- [ ] Expiry info shows on dashboard
- [ ] Error messages display properly
- [ ] Loading states work

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Testing
- [ ] Mobile (375px width)
- [ ] Tablet (768px width)
- [ ] Desktop (1024px+ width)
- [ ] Ultra-wide (1920px+)

---

## Deployment

### Before Production
- [ ] All tests passing
- [ ] No console errors
- [ ] No network warnings
- [ ] Performance optimized
- [ ] Build size acceptable
- [ ] Environment variables set
- [ ] API endpoints verified

### Production Setup
- [ ] Update API_URL to production domain
- [ ] Update PayMongo public key (if using client-side)
- [ ] HTTPS enforced
- [ ] CORS headers correct
- [ ] Session cookies secure
- [ ] Environment variables in CI/CD

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 error on subscription check | User not authenticated, redirect to login |
| Blank paywall | subscription.isActive is false, correct |
| Subscribe button not working | Check /api/v1/payments/checkout/ endpoint exists |
| Session lost after redirect | Check session cookies secure, SameSite policy |
| Payment shows but locked still | Wait for webhook (may take 10-60 seconds) |
| Wrong payment methods show | Backend may limit methods, check endpoint response |

---

## Completion Criteria

✅ All Phase 1-3 components working  
✅ All pages properly protected/accessible  
✅ Error handling comprehensive  
✅ Mobile responsive  
✅ All tests passing  
✅ No console errors  
✅ Complete end-to-end payment flow works  
✅ Documentation complete  

---

**Last Updated:** 2026-05-14  
**Status:** Template Ready for Implementation  
**Estimated Time:** 2-3 days for single developer
