# 📧 Email & SMS Notification Setup Guide

## 🚀 Quick Start

### 1. Start Notification Server
```bash
npm run server
# Server starts on http://localhost:5001
```

The notification server runs separately from the main React app and handles:
- ✅ Email notifications (Gmail/SMTP)
- ✅ SMS notifications (Twilio)
- ✅ Payment success emails & SMS
- ✅ Delivery confirmation emails & SMS

---

## 📨 Email Setup (Gmail + Nodemailer)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Complete the verification process

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or your device)
3. Google will generate a 16-character password
4. **Copy this password** - you'll need it for `.env.local`

### Step 3: Add to `.env.local`
```bash
# Gmail Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  (the 16-char password from above, spaces included)
```

### Step 4: Test Email
```bash
# Once server is running, test:
curl -X POST http://localhost:5001/api/notifications/payment-success \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "customerName": "John Doe",
    "orderId": "12345",
    "amount": "₹8,849",
    "paymentMethod": "UPI"
  }'
```

### Email Providers (Alternative to Gmail)

#### Using Outlook/Hotmail
```
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Using SendGrid API
```
# Install: npm install @sendgrid/mail
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

---

## 📱 SMS Setup (Twilio)

### Step 1: Create Twilio Account
1. Sign up at https://www.twilio.com/console
2. Verify your phone number
3. Go to **Console Dashboard**

### Step 2: Get API Credentials
1. Copy your **Account SID** from dashboard
2. Copy your **Auth Token** (click to reveal)
3. Get a **Twilio Phone Number**:
   - Click "Get a number" in console
   - Choose country (India)
   - Confirm the number

### Step 3: Add to `.env.local`
```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx  (your Twilio number)
```

### Step 4: Test SMS
```bash
curl -X POST http://localhost:5001/api/notifications/payment-success \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@gmail.com",
    "phone": "9876543210",
    "customerName": "John Doe",
    "orderId": "12345",
    "amount": "₹8,849",
    "paymentMethod": "UPI"
  }'
```

### SMS Providers (Alternative to Twilio)

#### Using AWS SNS
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

#### Using Exotel (India-based)
```
EXOTEL_SID=exotel_sid_here
EXOTEL_TOKEN=exotel_token_here
EXOTEL_FROM=your_exotel_number
```

---

## 🔧 Complete `.env.local` Template

Create `.env.local` file in project root:

```bash
# ============================================
# FRONTEND
# ============================================
VITE_NOTIFICATION_API_URL=http://localhost:5001

# ============================================
# NOTIFICATION SERVER
# ============================================

# Server Port
NOTIFICATION_PORT=5001

# EMAIL CONFIGURATION (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# SMS CONFIGURATION (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# ============================================
# RAZORPAY (Optional - for real payments)
# ============================================
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxx

# ============================================
# FIREBASE (Optional - for order storage)
# ============================================
VITE_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_PROJECT_ID=layerbound-3d
```

### ⚠️ Important Security Notes
- **Never commit `.env.local`** - it's in `.gitignore`
- **Never share your credentials** - they're sensitive
- **Use environment variables** in production, not hardcoded values
- **Rotate tokens regularly** if compromised

---

## 🏃 Running the System

### Terminal 1: Notification Server
```bash
npm run server
# Listens on http://localhost:5001
```

### Terminal 2: React Development Server
```bash
npm run dev
# Listens on http://localhost:3000
```

Now when you complete a payment:
1. ✅ Email is sent automatically
2. ✅ SMS is sent automatically
3. ✅ User sees confirmation in UI
4. ✅ Toasts show status (success/failure)

---

## 📝 Email Templates

### Payment Success Email
- Order confirmation with order ID
- Amount paid and payment method
- What to expect next (preparation, shipping, delivery)
- Contact information
- Professional branding

### Delivery Confirmation Email
- Delivery confirmation with tracking details
- 30-day return window information
- Support contact information
- Option to rate experience

### SMS Messages

**Payment Success SMS**:
```
Hi John, your payment for Order #12345 (₹8,849) has been received! 
Your order will be prepared soon. Track: layerbound.in/order/12345
```

**Delivery Confirmation SMS**:
```
Your order #12345 has been delivered! Thank you for shopping with LayerBound. 
Track return options at layerbound.in/order/12345
```

---

## 🧪 Testing Without Real Credentials

### Mock Mode (No Email/SMS)
If you skip `.env.local` setup:
- ✅ App still works
- ✅ Orders still complete
- ✅ Notifications fail silently
- ⚠️ No actual emails or SMS sent

### Test Credentials

#### Gmail Test Account
```bash
EMAIL_USER=test@gmail.com
EMAIL_PASSWORD=test test test test
# Will fail (invalid), but shows error handling works
```

#### Twilio Test Mode
Twilio has free credits for testing:
- Create account
- Free $15 credit (enough for ~100 SMS tests)
- Use test numbers to send SMS without charges

---

## 🚀 Production Setup

### Recommended Architecture
```
Frontend (React)
    ↓
Notification Server (Node.js)
    ↓
Email Service (SendGrid/Gmail)
    ↓ 
SMS Service (Twilio/AWS SNS)
```

### Deployment Steps

1. **Deploy Notification Server**
   ```bash
   # Option 1: Heroku
   git push heroku main
   
   # Option 2: Railway
   railway up
   
   # Option 3: Render
   # Connect GitHub repo, auto-deploys
   ```

2. **Update Frontend API URL**
   ```bash
   # In production .env
   VITE_NOTIFICATION_API_URL=https://your-notification-server.com
   ```

3. **Set Production Credentials**
   ```bash
   # On server platform (Heroku/Railway/Render)
   TWILIO_ACCOUNT_SID=prod_sid
   TWILIO_AUTH_TOKEN=prod_token
   EMAIL_USER=production@gmail.com
   EMAIL_PASSWORD=prod_password
   ```

### Environment-Specific Configuration
```bash
# Development
VITE_NOTIFICATION_API_URL=http://localhost:5001

# Staging
VITE_NOTIFICATION_API_URL=https://staging-notification.herokuapp.com

# Production
VITE_NOTIFICATION_API_URL=https://notification.layerbound.com
```

---

## 🔍 Troubleshooting

### Email Not Sending
```bash
# Check Gmail credentials
❌ "Invalid login" → Verify EMAIL_PASSWORD is correct (16-char app password)
❌ "SMTP Error" → Check firewall/network blocks port 587
❌ "Connection refused" → Gmail SMTP server down (rare)

# Solution: Test with telnet
telnet smtp.gmail.com 587
```

### SMS Not Sending
```bash
❌ "Account SID not found" → Check TWILIO_ACCOUNT_SID format
❌ "Invalid phone" → Ensure phone format is correct (+91XXXXXXXXXX)
❌ "No credit" → Add credit to Twilio account

# Check Twilio logs at https://www.twilio.com/console/logs/sms
```

### Server Not Starting
```bash
❌ "Port 5001 in use" → Kill existing process or change NOTIFICATION_PORT
❌ "Module not found" → Run `npm install`
❌ "TypeScript error" → Check `server.ts` for syntax errors

# View logs
npm run server -- --verbose
```

### Frontend Can't Connect to Server
```bash
❌ CORS error → Ensure NOTIFICATION_API_URL matches server URL
❌ 404 error → Check endpoint paths match (/api/notifications/*)
❌ Connection refused → Ensure server is running on port 5001

# Test connection
curl http://localhost:5001/api/health
```

---

## 📊 API Endpoints

### Health Check
```bash
GET /api/health

Response:
{
  "status": "ok",
  "emailConfigured": true,
  "smsConfigured": true,
  "timestamp": "2026-05-08T10:30:00.000Z"
}
```

### Send Payment Success Notification
```bash
POST /api/notifications/payment-success

Request:
{
  "email": "customer@example.com",
  "phone": "9876543210",
  "customerName": "John Doe",
  "orderId": "12345",
  "amount": "₹8,849",
  "paymentMethod": "UPI",
  "orderDate": "2026-05-08"
}

Response:
{
  "success": true,
  "emailSent": true,
  "smsSent": true,
  "results": ["✅ Email sent", "✅ SMS sent"],
  "message": "Payment notification sent"
}
```

### Send Delivery Confirmation
```bash
POST /api/notifications/delivery-confirmation

Request:
{
  "email": "customer@example.com",
  "phone": "9876543210",
  "customerName": "John Doe",
  "orderId": "12345",
  "trackingNumber": "TRK123456789",
  "deliveryDate": "2026-05-15",
  "returnWindow": 30
}

Response:
{
  "success": true,
  "emailSent": true,
  "smsSent": true,
  "results": ["✅ Email sent", "✅ SMS sent"],
  "message": "Delivery notification sent"
}
```

---

## ✅ Verification Checklist

- [ ] `.env.local` created with credentials
- [ ] Gmail app password generated and saved
- [ ] Twilio account created with API credentials
- [ ] Notification server runs without errors
- [ ] Frontend can reach server at configured URL
- [ ] Test email sent successfully
- [ ] Test SMS sent successfully
- [ ] Payment flow triggers notifications
- [ ] Delivery confirmation API available
- [ ] Error handling works (graceful fallback if service down)

---

## 📚 Learn More

- [Nodemailer Documentation](https://nodemailer.com/)
- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Twilio Console](https://www.twilio.com/console)

---

**Last Updated**: May 8, 2026  
**Status**: Production Ready ✅
