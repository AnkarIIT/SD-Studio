# 💾 Database Setup Guide - PostgreSQL + Prisma

## 🚀 Quick Start

### 1. Install PostgreSQL
**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Run installer and follow steps
# Default port: 5432
```

**Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE layerbound_db;

# Create user (optional)
CREATE USER layerbound_user WITH PASSWORD 'your_password';
ALTER ROLE layerbound_user WITH CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE layerbound_db TO layerbound_user;

# Verify connection
\l
```

### 3. Add to `.env.local`
```bash
# PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:password@localhost:5432/layerbound_db"
# Or with user:
# DATABASE_URL="postgresql://layerbound_user:your_password@localhost:5432/layerbound_db"
```

### 4. Initialize Database
```bash
# Install Prisma (already done via npm install)
npm install prisma

# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# View database
npx prisma studio
```

### 5. Start Server
```bash
# Terminal 1: Notification server
npm run server

# Terminal 2: React dev server (in another terminal)
npm run dev
```

---

## 📊 Database Schema

### PAYMENTS Table
```sql
CREATE TABLE "Payment" (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE NOT NULL,
  customerId TEXT NOT NULL,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  customerPhone TEXT,
  
  amount FLOAT NOT NULL,
  currency TEXT DEFAULT 'INR',
  paymentMethod TEXT NOT NULL,
  paymentStatus TEXT DEFAULT 'pending',
  paymentReference TEXT,
  
  itemCount INT NOT NULL,
  
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  completedAt TIMESTAMP,
  expiresAt TIMESTAMP
);
```

### DELIVERIES Table
```sql
CREATE TABLE "Delivery" (
  id TEXT PRIMARY KEY,
  orderId TEXT UNIQUE NOT NULL,
  paymentId TEXT UNIQUE NOT NULL,
  
  customerName TEXT NOT NULL,
  customerPhone TEXT,
  
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  
  status TEXT DEFAULT 'pending',
  trackingNumber TEXT,
  
  shippedAt TIMESTAMP,
  deliveredAt TIMESTAMP,
  estimatedDelivery TIMESTAMP,
  
  createdAt TIMESTAMP DEFAULT now(),
  updatedAt TIMESTAMP DEFAULT now(),
  expiresAt TIMESTAMP,
  
  FOREIGN KEY (paymentId) REFERENCES "Payment"(id)
);
```

---

## 🔄 Data Flow

```
Payment Checkout
    ↓
Create Payment Record in DB
    ↓
Send Email + SMS Notification
    ↓
Order Status: "paid"
    ↓
    (Admin/System marks as shipped)
    ↓
Create Delivery Record in DB
    ↓
Send Shipping Notification
    ↓
    (30 days pass...)
    ↓
Delivery Status: "delivered"
    ↓
Send Delivery Confirmation
    ↓
    (Automatic cleanup after 30 days)
    ↓
Records Deleted from DB
```

---

## 🧹 Automatic Cleanup

### What Gets Deleted?

**Payments deleted after 30 days if:**
- Status is "success"
- Status is "failed"
- Status is "refunded"

**Deliveries deleted after 30 days if:**
- Status is "delivered"

**Why 30 days?**
- Customers have 30-day return window
- Allows for dispute resolution
- GDPR/privacy compliance
- Keeps database lean

### Cleanup Schedule

```
Daily:   2:00 AM UTC
Weekly:  1:00 AM UTC (Sundays)
```

### Manual Cleanup
```bash
# Trigger cleanup manually
curl -X POST http://localhost:5001/api/database/cleanup/trigger
```

---

## 📱 API Endpoints

### Payment Endpoints

**Create Payment**
```bash
POST /api/database/payments
{
  "orderId": "12345",
  "customerId": "cust_123",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9876543210",
  "amount": 8849,
  "paymentMethod": "upi",
  "paymentReference": "ABC123DEF456",
  "itemCount": 2
}
```

**Get All Payments**
```bash
GET /api/database/payments?skip=0&take=10
```

**Get Payment by Order ID**
```bash
GET /api/database/payments/:orderId
```

**Update Payment Status**
```bash
PATCH /api/database/payments/:paymentId
{
  "status": "success",
  "reference": "ABC123DEF456"
}
```

**Get Payments by Status**
```bash
GET /api/database/payments/status/success
GET /api/database/payments/status/failed
GET /api/database/payments/status/pending
```

### Delivery Endpoints

**Create Delivery**
```bash
POST /api/database/deliveries
{
  "orderId": "12345",
  "paymentId": "pay_123",
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "street": "123 Main Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "estimatedDelivery": "2026-05-15T00:00:00Z"
}
```

**Get All Deliveries**
```bash
GET /api/database/deliveries?skip=0&take=10
```

**Get Delivery by Order ID**
```bash
GET /api/database/deliveries/:orderId
```

**Update Delivery Status**
```bash
PATCH /api/database/deliveries/:deliveryId
{
  "status": "shipped",
  "tracking": "TRK123456789"
}
```

**Get Deliveries by Status**
```bash
GET /api/database/deliveries/status/pending
GET /api/database/deliveries/status/shipped
GET /api/database/deliveries/status/delivered
```

### Statistics Endpoints

**Get All Stats**
```bash
GET /api/database/stats
# Returns payment and delivery statistics
```

**Get Cleanup Status**
```bash
GET /api/database/cleanup/status
```

---

## 🛠️ Prisma Commands

```bash
# View database in Prisma Studio (web UI)
npx prisma studio

# Create new migration
npx prisma migrate dev --name add_new_field

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Check database health
npx prisma validate

# View database schema
npx prisma db pull

# Push schema to database
npx prisma db push
```

---

## 📝 Complete `.env.local` Template

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/layerbound_db"

# ============================================
# EMAIL & SMS (from NOTIFICATION_SETUP.md)
# ============================================
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# ============================================
# FRONTEND
# ============================================
VITE_NOTIFICATION_API_URL=http://localhost:5001

# ============================================
# SERVER
# ============================================
NOTIFICATION_PORT=5001
```

---

## 🔍 Database Queries

### Common Queries

**Get today's payments:**
```sql
SELECT * FROM "Payment" 
WHERE DATE(createdAt) = TODAY() 
ORDER BY createdAt DESC;
```

**Get total revenue:**
```sql
SELECT SUM(amount) as total_revenue 
FROM "Payment" 
WHERE paymentStatus = 'success';
```

**Get pending deliveries:**
```sql
SELECT * FROM "Delivery" 
WHERE status IN ('pending', 'shipped') 
ORDER BY createdAt ASC;
```

**Get records to be deleted:**
```sql
SELECT * FROM "Payment" 
WHERE expiresAt <= NOW() 
AND paymentStatus IN ('success', 'failed', 'refunded');
```

---

## 🧪 Testing

### Test Payment Flow

```bash
# 1. Create payment
curl -X POST http://localhost:5001/api/database/payments \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "TEST123",
    "customerId": "cust_123",
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "customerPhone": "9876543210",
    "amount": 1000,
    "paymentMethod": "upi",
    "itemCount": 1
  }'

# 2. Get payment (from response, copy the ID)
curl http://localhost:5001/api/database/payments/TEST123

# 3. Update status
curl -X PATCH http://localhost:5001/api/database/payments/PAYMENT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "success",
    "reference": "ABC123"
  }'

# 4. Check stats
curl http://localhost:5001/api/database/stats
```

### Test Cleanup

```bash
# Get cleanup preview
curl http://localhost:5001/api/database/cleanup/preview

# Trigger manual cleanup
curl -X POST http://localhost:5001/api/database/cleanup/trigger
```

---

## 🔐 Security Considerations

### 1. Connection String
```bash
# ❌ Bad: Hardcoded in code
const url = "postgresql://user:password@localhost:5432/db";

# ✅ Good: Use environment variables
const url = process.env.DATABASE_URL;
```

### 2. Input Validation
```bash
# Prisma protects against SQL injection automatically
# But validate input types in your routes
```

### 3. Access Control
```bash
# In production, add authentication middleware
app.use('/api/database', authMiddleware);
app.use('/api/database/cleanup', adminMiddleware);
```

### 4. Backups
```bash
# Backup database regularly
pg_dump layerbound_db > backup.sql

# Restore from backup
psql layerbound_db < backup.sql
```

---

## 🚀 Production Deployment

### Option 1: Heroku Postgres
```bash
# Provision postgres
heroku addons:create heroku-postgresql:hobby-dev

# Push migrations
heroku run npx prisma migrate deploy

# Monitor
heroku logs --tail
```

### Option 2: Railway
```bash
# Connect PostgreSQL plugin
# Railway auto-generates DATABASE_URL

npm run build
railway up
```

### Option 3: AWS RDS
```bash
# Create RDS instance
# Get endpoint
# Add to .env

DATABASE_URL="postgresql://user:pass@rds-instance.us-east-1.rds.amazonaws.com:5432/layerbound_db"

npx prisma migrate deploy
```

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma + TypeScript](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/working-with-types)
- [Database Best Practices](https://www.postgresql.org/docs/current/sql-syntax.html)

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] `.env.local` has `DATABASE_URL`
- [ ] `npx prisma generate` ran successfully
- [ ] `npx prisma migrate dev` ran successfully
- [ ] `npx prisma studio` shows tables
- [ ] Server starts with "✅ Database Connected"
- [ ] Can create payments via API
- [ ] Can create deliveries via API
- [ ] Cleanup scheduler is running
- [ ] Backup strategy in place

---

**Last Updated**: May 8, 2026  
**Status**: Production Ready ✅
