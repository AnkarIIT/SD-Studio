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

### 4. Test Different Payment Methods

#### Test UPI Payment
1. Select "UPI Payment"
2. A QR code will be generated automatically
3. **On phone with UPI app installed:**
   - Open Google Pay / Paytm / PhonePe
   - Scan the QR code
   - Confirm payment
   - Copy transaction ID from app
   - Paste into form
4. **On desktop/without UPI app:**
   - Manually note the UPI ID: `layerbound@upi`
   - Enter any test reference (e.g., `TEST123UPI456`)
5. Click "Confirm Payment"

#### Test Bank Transfer
1. Select "Bank Transfer"
2. Click copy buttons to note down details:
   - Account: LayerBound Studio
   - Account No: 123456789012
   - IFSC: LBND0001234
3. Enter test UTR reference (e.g., `UTR123456789`)
4. Click "Confirm Payment"

#### Test Card Demo
1. Select "Card Demo"
2. Enter any test details:
   - Name: John Doe
   - Card: 4111111111111111 (test Visa)
   - Expiry: 12/25
   - CVV: 123
3. Click "Confirm Payment"
4. Data is NOT stored anywhere

#### Test COD
1. Select "Cash on Delivery"
2. Click "Confirm COD Order"
3. Order is immediately confirmed

---

## Production Implementation

### Step 1: Set Up Razorpay Account
```bash
# 1. Create account at https://dashboard.razorpay.com
# 2. Get API keys (Key ID and Key Secret)
# 3. Add to .env.local
```

### Step 2: Update Environment Variables
Create `.env.local`:
```
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
VITE_API_URL=https://your-backend.com
```

### Step 3: Create Backend Endpoints

#### Backend: Create Order Endpoint
```typescript
// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { amount, orderId, currency = 'INR', notes } = req.body;
  
  const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  try {
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: orderId,
      notes,
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### Backend: Verify Payment Endpoint
```typescript
// POST /api/verify-payment
app.post('/api/verify-payment', (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const crypto = require('crypto');

  const text = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  if (expectedSignature === signature) {
    // Payment is verified! Update order status
    updateOrderStatus(orderId, 'paid');
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Signature mismatch' });
  }
});
```

### Step 4: Update Frontend Payment Handler
```typescript
// In src/components/Payment.tsx

const handleRazorpayPayment = async () => {
  try {
    // Create order on backend
    const orderResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/api/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: order.total,
          orderId: order.id,
          notes: { items: items.length },
        }),
      }
    );

    const razorpayOrder = await orderResponse.json();

    // Open Razorpay checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: 'INR',
      name: 'LayerBound',
      description: `Order #${formatOrderId(order.id)}`,
      handler: async (response) => {
        // Verify payment on backend
        const verifyResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/verify-payment`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: razorpayOrder.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          }
        );

        if (verifyResponse.ok) {
          onComplete({
            ...order,
            status: 'paid',
            paymentMethod: 'razorpay',
            paymentId: response.razorpay_payment_id,
          });
        }
      },
      prefill: {
        email: address.email,
        contact: address.phone,
      },
      theme: {
        color: '#dc2626',
      },
    };

    const razorpayInstance = new (window as any).Razorpay(options);
    razorpayInstance.open();
  } catch (error) {
    toast.error('Failed to initialize payment');
  }
};
```

### Step 5: Add Email Notifications
```typescript
// Backend: Send order confirmation email
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post('/api/send-order-confirmation', async (req, res) => {
  const { email, orderId, items, total } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmed - ${orderId}`,
    html: `
      <h2>Order Confirmed!</h2>
      <p>Order ID: ${orderId}</p>
      <p>Total: ₹${total}</p>
      <p>Items: ${items.length}</p>
      <p>Expected delivery: 5-7 business days</p>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json({ success: true });
    }
  });
});
```

---

## Testing Payment Webhook

### Razorpay Webhook Configuration
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-api.com/webhooks/razorpay`
3. Select events: `payment.authorized`, `payment.failed`

### Webhook Handler
```typescript
app.post('/webhooks/razorpay', async (req, res) => {
  const crypto = require('crypto');
  const shasum = crypto.createHash('sha256');
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    const data = req.body.payload.payment.entity;

    if (event === 'payment.authorized') {
      // Update order as paid
      await updateOrderStatus(data.notes.layerbound_order_id, 'paid');
    } else if (event === 'payment.failed') {
      // Handle failed payment
      await updateOrderStatus(data.notes.layerbound_order_id, 'failed');
    }

    res.json({ success: true });
  } else {
    res.status(403).json({ error: 'Invalid signature' });
  }
});
```

---

## UPI Deep Linking

The system auto-generates UPI deep links in the format:
```
upi://pay?pa=layerbound@upi&pn=LayerBound%20Store&am=8849&tn=Order-123456
```

This works with all UPI apps:
- Google Pay
- Paytm
- PhonePe
- WhatsApp Pay
- BHIM
- And others...

When user scans the QR code or clicks the link, their UPI app opens pre-filled with:
- Payee: LayerBound Store
- UPI ID: layerbound@upi
- Amount: 8849
- Reference: Order number

---

## Error Handling

### Common Payment Errors
```typescript
const handlePaymentError = (error: string) => {
  const errorMap = {
    'signature_mismatch': 'Payment verification failed. Please try again.',
    'timeout': 'Payment request timed out. Please retry.',
    'network_error': 'Network error. Check your connection.',
    'invalid_reference': 'Invalid transaction reference format.',
  };

  toast.error(errorMap[error] || 'Payment failed. Please try again.');
};
```

### Retry Logic
```typescript
const retryPayment = async (maxAttempts = 3) => {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await processPayment();
      return true;
    } catch (error) {
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }
  
  throw new Error('Payment failed after multiple attempts');
};
```

---

## Security Best Practices

1. **Never expose API secrets in frontend code**
   - Use `.env.local` (Git-ignored)
   - Backend verifies payments, not frontend

2. **Always verify signatures**
   - Use Razorpay's HMAC-SHA256 verification
   - Don't trust client-side payment data

3. **Use HTTPS in production**
   - All payment communications must be encrypted
   - Enable strict HSTS headers

4. **Tokenize sensitive data**
   - Don't store card numbers
   - Use Razorpay's tokenization for recurring payments

5. **Rate limiting**
   - Limit payment attempt endpoints
   - Prevent brute force attacks

6. **Audit logging**
   - Log all payment attempts
   - Monitor for suspicious patterns

---

## Testing in Production-Like Environment

Use Razorpay's test mode:
```
Test Key ID: rzp_test_xxxxxxxxxxxx
Test Key Secret: test_secret_xxxxxxxxxxxx
```

Test with these card numbers:
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- Amex: 378282246310005

All test payments will succeed. To test failures, use `4000000000000002`.

---

## Performance Optimization

### Lazy Load Payment Library
```typescript
const loadRazorpayScript = async () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
};

// In payment component
useEffect(() => {
  loadRazorpayScript();
}, []);
```

### Debounce QR Code Generation
```typescript
import { debounce } from 'lodash';

const debouncedGenerateQr = debounce(generateQr, 500);

useEffect(() => {
  debouncedGenerateQr();
}, [order.total]);
```

---

## Support & Debugging

### Enable Debug Logging
```typescript
// In Payment.tsx
const DEBUG = import.meta.env.DEV;

const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Payment] ${message}`, data);
  }
};
```

### Check Build Issues
```bash
npm run build
# Check for any TypeScript errors
npm run type-check
```

### Test Payment Flow Locally
```bash
npm run dev
# Open DevTools → Console
# Should see QR code generation logs
# Verify no CORS errors for payment APIs
```

---

Last Updated: May 8, 2026
Status: Ready for Production Setup
