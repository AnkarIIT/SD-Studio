# Real Payment Integration Examples

## Quick Start - Testing the Payment System

### 1. Start Development Server
```bash
npm run dev
# Visit http://localhost:3000
```

### 2. Add Products to Cart
- Click on any product
- Adjust quantity
- Click "Add to Cart"

### 3. Go to Checkout
- Click cart icon (top right)
- Click "Proceed to Checkout"
- Fill shipping details
- Click "Continue to Payment"

### 4. Test Cashfree Integration
1. Click "Secure Payment"
2. The Cashfree modal will open.
3. Complete the test payment.

---

## Production Implementation

### Step 1: Set Up Cashfree Account
```bash
# 1. Create account at https://merchant.cashfree.com
# 2. Get API keys (App ID and Secret Key)
# 3. Add to .env.local
```

### Step 2: Update Environment Variables
Create `.env.local`:
```
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
FRONTEND_URL=http://localhost:3000
```

### Step 3: Backend Endpoints

The system uses `/api/payments/cashfree/order` and `/api/payments/cashfree/verify` in `server.ts`.

---

## Security Best Practices

1. **Never expose API secrets in frontend code**
   - Use `.env.local` (Git-ignored)
   - Backend verifies payments, not frontend

2. **Always verify status on backend**
   - Don't trust client-side payment success events alone.

---

Last Updated: May 8, 2026
Status: Ready for Production Setup
