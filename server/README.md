# SUVIDHA Backend - Microservices Architecture

Complete backend structure for SUVIDHA Platform with 8 microservices.

## 📁 Complete Folder Structure

```
server/
├── server.js                          # Main server entry point (Port 5000)
├── package.json
├── .env.example
├── BACKEND_SETUP_COMPLETE.md          # Setup documentation
│
├── api-gateway/                       # API Gateway (To be implemented)
│   └── src/
│
├── shared/                            # Shared utilities across all services
│   └── common/
│       └── utils/
│           ├── ApiError.js           # ✅ Standardized error handling
│           └── ApiResponse.js        # ✅ Consistent API responses
│
└── services/
    │
    ├── auth-service/                  # ✅ Auth Service (Port 3001)
    │   ├── package.json              # PostgreSQL + OTP-based
    │   ├── .env.example              # DB_PASSWORD=1234567890
    │   ├── README.md
    │   └── src/
    │       ├── index.js
    │       ├── config/
    │       │   └── database.js       # PostgreSQL connection + tables
    │       ├── controllers/
    │       │   └── auth.controller.js
    │       ├── services/
    │       │   └── auth.service.js   # OTP generation & verification
    │       ├── routes/
    │       │   └── auth.routes.js    # OTP-based routes
    │       ├── models/               # (Not used - PostgreSQL)
    │       ├── middlewares/
    │       │   ├── auth.middleware.js
    │       │   ├── error.middleware.js
    │       │   └── validation.middleware.js
    │       └── validations/
    │           └── auth.validation.js # OTP validation schemas
    │
    ├── electricity-service/           # ✅ Electricity Service (Port 3002)
    │   ├── package.json
    │   ├── .env.example
    │   ├── README.md
    │   └── src/
    │       ├── index.js
    │       ├── config/
    │       │   └── database.js       # MongoDB connection
    │       ├── controllers/
    │       │   ├── bill.controller.js
    │       │   └── connection.controller.js
    │       ├── services/
    │       │   ├── bill.service.js
    │       │   └── connection.service.js
    │       ├── routes/
    │       │   ├── bill.routes.js
    │       │   └── connection.routes.js
    │       ├── models/
    │       │   ├── Bill.js
    │       │   └── Connection.js
    │       └── middlewares/
    │           ├── auth.middleware.js
    │           └── error.middleware.js
    │
    ├── payment-service/               # ✅ Payment Service (Port 3003)
    │   ├── package.json
    │   ├── .env.example
    │   ├── README.md
    │   └── src/
    │       ├── index.js
    │       ├── config/
    │       │   └── database.js       # MongoDB connection
    │       ├── controllers/
    │       │   └── payment.controller.js
    │       ├── services/
    │       │   └── payment.service.js # Multi-gateway support
    │       ├── routes/
    │       │   └── payment.routes.js
    │       ├── models/
    │       │   └── Payment.js
    │       └── middlewares/
    │           ├── auth.middleware.js
    │           └── error.middleware.js
    │
    ├── document-service/              # 📋 Document Service (Port 3004)
    │   └── src/                      # To be implemented
    │
    ├── admin-service/                 # 👨‍💼 Admin Service (Port 3005)
    │   └── src/                      # To be implemented
    │
    ├── gas-service/                   # 🔥 Gas Service (Port 3006)
    │   └── src/                      # To be implemented
    │
    ├── water-service/                 # 💧 Water Service (Port 3007)
    │   └── src/                      # To be implemented
    │
    └── notification-service/          # 📧 Notification Service (Port 3008)
        └── src/                      # To be implemented
```

## 🎯 Implemented Services (3/8)

### ✅ 1. Auth Service

- **Port**: 3001
- **Database**: PostgreSQL (password: 1234567890)
- **Auth Type**: OTP-based with mobile number
- **Status**: Fully implemented

### ✅ 2. Electricity Service

- **Port**: 3002
- **Database**: MongoDB
- **Features**: Bill & connection management
- **Status**: Fully implemented

### ✅ 3. Payment Service

- **Port**: 3003
- **Database**: MongoDB
- **Features**: Multi-gateway payment processing
- **Status**: Fully implemented

## 🚧 Pending Services (5/8)

### 📋 4. Document Service (Port 3004)

- Receipt generation
- Document upload & storage
- PDF generation
- File management

### 👨‍💼 5. Admin Service (Port 3005)

- Admin dashboard
- User management
- Analytics & reporting
- System monitoring

### 🔥 6. Gas Service (Port 3006)

- Gas bill management
- Connection tracking
- Similar to Electricity Service

### 💧 7. Water Service (Port 3007)

- Water bill management
- Connection tracking
- Similar to Electricity Service

### 📧 8. Notification Service (Port 3008)

- SMS notifications
- Email notifications
- Push notifications
- Notification templates

## 🔄 Service Communication

```
Client Request → Main Server (5000) → Specific Service
                                    ↓
                            Service validates with Auth Service (3001)
                                    ↓
                            Service processes request
                                    ↓
                            Updates Payment Service (if needed)
                                    ↓
                            Sends notification (via Notification Service)
                                    ↓
                            Returns response to client
```

## 🗄️ Database Architecture

### Auth Service

- **Type**: PostgreSQL
- **Tables**:
  - `users` - User accounts
  - `otp_verifications` - OTP codes

### Other Services

- **Type**: MongoDB
- **Collections**: Service-specific collections

## 🔐 Authentication Flow

1. User requests OTP → `POST /api/v1/auth/request-otp`
2. OTP sent to mobile (logged in dev mode)
3. User registers/logs in with OTP → `POST /api/v1/auth/register` or `/login`
4. Receives JWT access + refresh tokens
5. Uses access token for subsequent requests
6. Refreshes token when expired → `POST /api/v1/auth/refresh-token`

## 📊 Port Allocation

| Service      | Port | Database   | Status      |
| ------------ | ---- | ---------- | ----------- |
| Main Server  | 5000 | -          | ✅ Complete |
| Auth         | 3001 | PostgreSQL | ✅ Complete |
| Electricity  | 3002 | MongoDB    | ✅ Complete |
| Payment      | 3003 | MongoDB    | ✅ Complete |
| Document     | 3004 | MongoDB    | 🚧 Pending  |
| Admin        | 3005 | MongoDB    | 🚧 Pending  |
| Gas          | 3006 | MongoDB    | 🚧 Pending  |
| Water        | 3007 | MongoDB    | 🚧 Pending  |
| Notification | 3008 | MongoDB    | 🚧 Pending  |

## 🚀 Quick Start

```bash
# 1. Install dependencies for all services
cd server && npm install
cd services/auth-service && npm install
cd ../electricity-service && npm install
cd ../payment-service && npm install

# 2. Setup PostgreSQL database
psql -U postgres
CREATE DATABASE suvidha_auth;

# 3. Create .env files from .env.example

# 4. Run all services
npm run dev:all
```

## 📝 Environment Variables

Each service has its own `.env.example` file. Copy and configure:

```bash
cp .env.example .env
```

Key variables:

- `DB_PASSWORD=1234567890` (Auth Service PostgreSQL)
- `MONGODB_URI` (Other services)
- `JWT_SECRET` (All services)
- Service URLs for inter-service communication

## 🎨 API Response Format

All services use standardized responses:

**Success**:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error**:

```json
{
  "statusCode": 400,
  "message": "Error description"
}
```

## 🔗 Inter-Service Communication

Services communicate via HTTP REST APIs:

- Auth verification: All services → Auth Service
- Payment updates: Payment Service → Bill Services
- Notifications: All services → Notification Service

---

**Last Updated**: February 1, 2026
**Status**: 3/8 Core Services Implemented
**Next Priority**: Document Service, Admin Service
