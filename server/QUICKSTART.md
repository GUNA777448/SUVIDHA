# 🚀 SUVIDHA Backend - Quick Start Guide

## ✅ What's Been Created

### 1. **Main Server** (server.js)

- Entry point for the entire backend
- Runs on port 5000
- Coordinates all microservices

### 2. **Auth Service** (Port 3001) - **OTP-Based with PostgreSQL**

- ✨ Uses PostgreSQL instead of MongoDB
- 🔐 OTP-based authentication (no passwords!)
- 📱 Mobile number login (10-digit Indian numbers)
- 🗄️ Database password: `1234567890`

### 3. **Electricity Service** (Port 3002)

- Electricity bill management
- Connection tracking

### 4. **Payment Service** (Port 3003)

- Multi-gateway payment support
- Transaction management

---

## 🎯 Quick Setup (5 Minutes)

### Step 1: Install PostgreSQL

```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

### Step 2: Create Database

```bash
# Open PostgreSQL command line (psql)
psql -U postgres

# Enter password when prompted, then:
CREATE DATABASE suvidha_auth;
\q
```

### Step 3: Install Node Dependencies

```bash
# Main server
cd server
npm install

# Auth service
cd services/auth-service
npm install
```

### Step 4: Configure Auth Service

```bash
cd services/auth-service

# Copy example env file
copy .env.example .env

# Edit .env file and ensure these settings:
# DB_PASSWORD=1234567890
# DB_NAME=suvidha_auth
# JWT_SECRET=your-secret-here
```

### Step 5: Run Auth Service

```bash
cd services/auth-service
npm run dev
```

The database tables will be created automatically on first run! ✨

---

## 📱 Test OTP Authentication

### 1. Request OTP (Using PowerShell)

```powershell
$body = @{
    phoneNumber = "9876543210"
    purpose = "registration"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/request-otp" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Check console logs** - You'll see the OTP printed (in development mode):

```
🔐 OTP Code: 123456
```

### 2. Register User with OTP

```powershell
$body = @{
    phoneNumber = "9876543210"
    otp = "123456"  # Use the OTP from console
    username = "john_doe"
    email = "john@example.com"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/register" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### 3. Login with OTP

```powershell
# First request OTP
$body = @{
    phoneNumber = "9876543210"
    purpose = "login"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/request-otp" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Then login (check console for OTP)
$body = @{
    phoneNumber = "9876543210"
    otp = "123456"  # Use the new OTP
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

---

## 🎓 Understanding the OTP Flow

### Registration Flow

```
1. User enters phone number → Request OTP (purpose: registration)
   ↓
2. System generates 6-digit OTP
   ↓
3. OTP saved to database (expires in 10 min)
   ↓
4. OTP sent to phone (in dev: printed to console)
   ↓
5. User enters OTP + details → Register
   ↓
6. System verifies OTP
   ↓
7. User account created
   ↓
8. JWT tokens returned
```

### Login Flow

```
1. User enters phone number → Request OTP (purpose: login)
   ↓
2. System checks if user exists
   ↓
3. OTP generated and sent
   ↓
4. User enters OTP → Login
   ↓
5. System verifies OTP
   ↓
6. JWT tokens returned
```

---

## 🗄️ Database Tables (Auto-Created)

### Users Table

Stores user information:

- id, username, email, phone_number
- role (user/admin/operator/superadmin)
- first_name, last_name, address details
- refresh_token, last_login
- created_at, updated_at

### OTP Verifications Table

Stores OTP codes:

- id, phone_number, otp_code
- purpose (login/registration/reset)
- expires_at (10 minutes from creation)
- attempts (max 3)
- is_verified

---

## 🔒 Security Features

1. **OTP Expiry**: 10 minutes
2. **Max Attempts**: 3 wrong attempts allowed
3. **Auto-Invalidation**: OTP deleted after successful use
4. **JWT Tokens**:
   - Access token: 15 minutes
   - Refresh token: 7 days
5. **Password Protected DB**: PostgreSQL password is `1234567890`

---

## 🛠️ Common Issues & Solutions

### Issue: "Connection refused" to PostgreSQL

**Solution**: Ensure PostgreSQL is running

```bash
# Check status
Get-Service postgresql*

# Start service
Start-Service postgresql-x64-14  # Or your version
```

### Issue: "Database does not exist"

**Solution**: Create the database

```bash
psql -U postgres
CREATE DATABASE suvidha_auth;
```

### Issue: "OTP not showing in console"

**Solution**: Ensure `NODE_ENV=development` in `.env`

### Issue: "Cannot connect to MongoDB" (Electricity/Payment services)

**Solution**: Install MongoDB or use MongoDB Atlas (cloud)

```bash
# Install MongoDB Community Server
# https://www.mongodb.com/try/download/community
```

---

## 📊 Service Status

| Service      | Port | Status     | Database   |
| ------------ | ---- | ---------- | ---------- |
| Main Server  | 5000 | ✅ Ready   | -          |
| Auth Service | 3001 | ✅ Ready   | PostgreSQL |
| Electricity  | 3002 | ✅ Ready   | MongoDB    |
| Payment      | 3003 | ✅ Ready   | MongoDB    |
| Document     | 3004 | 🚧 Pending | -          |
| Admin        | 3005 | 🚧 Pending | -          |
| Gas          | 3006 | 🚧 Pending | -          |
| Water        | 3007 | 🚧 Pending | -          |
| Notification | 3008 | 🚧 Pending | -          |

---

## 🎯 Next Steps

1. ✅ **Test Auth Service** - Use the PowerShell commands above
2. 📦 **Install MongoDB** - For Electricity & Payment services
3. 🚀 **Run Other Services** - Electricity and Payment
4. 🔧 **Implement Remaining Services** - Document, Admin, Gas, Water, Notification
5. 📱 **SMS Integration** - Connect real SMS provider (Twilio/AWS SNS)
6. 💳 **Payment Gateway** - Integrate Razorpay/PayTM

---

## 📚 Documentation Files

- `server/README.md` - Complete architecture overview
- `server/BACKEND_SETUP_COMPLETE.md` - Detailed setup guide
- `server/services/auth-service/README.md` - Auth service docs
- Each service has its own README

---

## 💡 Tips

1. **Development OTP**: Always check console logs for OTP codes
2. **Database**: Tables are created automatically on first run
3. **Testing**: Use Postman or PowerShell (examples provided)
4. **Tokens**: Save the JWT tokens for authenticated requests
5. **Phone Numbers**: Must be exactly 10 digits

---

## 🆘 Need Help?

Check the detailed documentation in:

- `BACKEND_SETUP_COMPLETE.md`
- `README.md`
- Service-specific README files

---

**Happy Coding! 🎉**

PostgreSQL Password: `1234567890`
OTP Expiry: 10 minutes
Max Attempts: 3
