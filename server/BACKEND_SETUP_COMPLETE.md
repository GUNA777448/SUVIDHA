# SUVIDHA Backend Services - Setup Summary

## ✅ Completed Setup

### 1. Main Server (Port 5000)

- **Location**: `server/server.js`
- **Purpose**: Main entry point and API gateway coordinator
- **Features**:
  - Health check endpoints
  - Centralized error handling
  - CORS and security middleware
  - Service status overview

### 2. Auth Service (Port 3001) ⭐ **OTP-Based with PostgreSQL**

- **Location**: `server/services/auth-service/`
- **Database**: PostgreSQL with password `1234567890`
- **Authentication**: OTP-based with mobile number (10-digit phone)
- **Features**:
  - Request OTP for login/registration
  - OTP verification with expiry (10 minutes)
  - Maximum 3 OTP attempts
  - JWT access + refresh tokens
  - Role-based access control (user, admin, operator, superadmin)
  - User profile management

**Database Tables**:

- `users` - User information and profiles
- `otp_verifications` - OTP codes with expiry and attempt tracking

**API Endpoints**:

- `POST /api/v1/auth/request-otp` - Request OTP
- `POST /api/v1/auth/register` - Register with OTP
- `POST /api/v1/auth/login` - Login with OTP
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/verify-token` - Verify token

### 3. Electricity Service (Port 3002)

- **Location**: `server/services/electricity-service/`
- **Features**:
  - Bill generation and management
  - Electricity connection management
  - Consumer number-based queries
  - Meter reading tracking
  - Bill payment status updates

**Models**:

- ElectricityBill
- ElectricityConnection

### 4. Payment Service (Port 3003)

- **Location**: `server/services/payment-service/`
- **Features**:
  - Multi-gateway payment support (Razorpay, PayTM, PhonePe, etc.)
  - Payment initiation and verification
  - Transaction tracking
  - Refund processing
  - Automatic bill status updates

**Payment Methods**: UPI, Card, Net Banking, Wallet, Cash

### 5. Shared Common Utilities

- **Location**: `server/shared/common/utils/`
- **Components**:
  - `ApiError.js` - Standardized error handling
  - `ApiResponse.js` - Consistent API responses

---

## 🚀 How to Run

### Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** (v16+)
3. **npm** or **yarn**

### Setup Steps

#### 1. Install PostgreSQL and Create Database

```bash
# Create database
psql -U postgres
CREATE DATABASE suvidha_auth;
\q
```

#### 2. Install Dependencies

**Main Server**:

```bash
cd server
npm install
```

**Auth Service**:

```bash
cd server/services/auth-service
npm install
```

**Electricity Service**:

```bash
cd server/services/electricity-service
npm install
```

**Payment Service**:

```bash
cd server/services/payment-service
npm install
```

#### 3. Configure Environment Variables

**Auth Service** (`server/services/auth-service/.env`):

```env
PORT=3001
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=suvidha_auth
DB_USER=postgres
DB_PASSWORD=1234567890

# JWT
JWT_SECRET=your-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_EXPIRES_IN=15m

# OTP Configuration
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
```

**Other Services**: Copy `.env.example` to `.env` in each service directory

#### 4. Run Services

**Option A - Run All Services Together**:

```bash
cd server
npm run dev:all
```

**Option B - Run Services Individually**:

Terminal 1 - Main Server:

```bash
cd server
npm run dev
```

Terminal 2 - Auth Service:

```bash
cd server/services/auth-service
npm run dev
```

Terminal 3 - Electricity Service:

```bash
cd server/services/electricity-service
npm run dev
```

Terminal 4 - Payment Service:

```bash
cd server/services/payment-service
npm run dev
```

---

## 📱 Testing the OTP Authentication

### 1. Request OTP for Registration

```bash
curl -X POST http://localhost:3001/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "purpose": "registration"
  }'
```

**Note**: In development mode, the OTP will be printed to the console.

### 2. Register User with OTP

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "otp": "123456",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### 3. Login with OTP

```bash
# First, request OTP
curl -X POST http://localhost:3001/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "purpose": "login"
  }'

# Then, login with OTP
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "otp": "123456"
  }'
```

---

## 🔒 Security Features

1. **OTP Security**:
   - 6-digit random OTP
   - 10-minute expiry
   - Maximum 3 attempts
   - Automatic OTP invalidation after use

2. **JWT Tokens**:
   - Access token: 15 minutes expiry
   - Refresh token: 7 days expiry
   - Secure token storage in PostgreSQL

3. **Database Security**:
   - PostgreSQL with password protection
   - Input validation with Joi
   - SQL injection prevention (parameterized queries)

4. **API Security**:
   - Helmet.js for HTTP headers
   - CORS configuration
   - Rate limiting (recommended to add)

---

## 📊 Service Architecture

```
┌─────────────────────────────────────────────────────┐
│              Main Server (Port 5000)                │
│                  API Gateway                        │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬─────────────┐
        │               │               │             │
┌───────▼──────┐ ┌─────▼─────┐ ┌──────▼──────┐ ┌────▼──────┐
│  Auth        │ │Electricity│ │  Payment    │ │ Other     │
│  Service     │ │ Service   │ │  Service    │ │ Services  │
│  (3001)      │ │  (3002)   │ │  (3003)     │ │           │
│              │ │           │ │             │ │           │
│ PostgreSQL   │ │ MongoDB   │ │  MongoDB    │ │           │
│ (OTP Auth)   │ │           │ │             │ │           │
└──────────────┘ └───────────┘ └─────────────┘ └───────────┘
```

---

## 📝 Database Schema (Auth Service)

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  refresh_token TEXT,
  last_login TIMESTAMP,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Verifications Table

```sql
CREATE TABLE otp_verifications (
  id SERIAL PRIMARY KEY,
  phone_number VARCHAR(15) NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose VARCHAR(20) NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🛠️ Next Steps (To Be Implemented)

1. **Document Service** (Port 3004) - Receipt and document management
2. **Admin Service** (Port 3005) - Admin dashboard and monitoring
3. **Gas Service** (Port 3006) - Gas bill management
4. **Water Service** (Port 3007) - Water bill management
5. **Notification Service** (Port 3008) - SMS/Email notifications
6. **API Gateway** - Centralized routing with rate limiting
7. **SMS Integration** - Integrate with Twilio/AWS SNS for OTP delivery
8. **Payment Gateway Integration** - Real integration with Razorpay/PayTM

---

## 📦 Dependencies

### Main Server

- express, cors, helmet, morgan, dotenv

### Auth Service

- express, pg (PostgreSQL), jsonwebtoken, joi, cors, helmet, morgan

### Electricity Service

- express, mongoose, axios, cors, helmet, morgan

### Payment Service

- express, mongoose, axios, cors, helmet, morgan

---

## 🎯 Key Changes Made

1. ✅ Created basic server.js as main entry point
2. ✅ Migrated Auth Service from MongoDB to PostgreSQL
3. ✅ Implemented OTP-based authentication (replacing password-based)
4. ✅ Set PostgreSQL password to "1234567890"
5. ✅ Created OTP verification table with expiry and attempt limits
6. ✅ Updated all Auth API endpoints for OTP flow
7. ✅ Added shared utility classes (ApiError, ApiResponse)
8. ✅ Updated validation schemas for OTP authentication

---

## 📞 Support

For development OTP testing, check the console logs. In production, integrate with an SMS service provider.

**Database Password**: 1234567890
**Default OTP Expiry**: 10 minutes
**Max OTP Attempts**: 3
