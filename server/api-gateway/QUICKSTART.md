# API Gateway - Quick Start Guide

## ✅ Implementation Complete

The API Gateway has been successfully implemented with the following features:

### 🎯 Core Features

- ✅ Request routing to all 8 microservices
- ✅ JWT authentication middleware
- ✅ Rate limiting (general, strict, and OTP-specific)
- ✅ Service health monitoring
- ✅ Comprehensive error handling
- ✅ Request/response logging
- ✅ CORS and security headers

### 📁 File Structure

```
api-gateway/
├── package.json              # Dependencies and scripts
├── .env                     # Environment configuration
├── .env.example             # Example environment file
├── .gitignore              # Git ignore rules
├── README.md               # Comprehensive documentation
└── src/
    ├── index.js            # Main application entry point
    ├── config/
    │   └── proxy.js        # Service proxy configuration
    ├── middlewares/
    │   ├── auth.js         # JWT authentication
    │   ├── errorHandler.js # Error handling
    │   └── rateLimiter.js  # Rate limiting configs
    └── routes/
        └── health.routes.js # Health check endpoints
```

## 🚀 Getting Started

### 1. Navigate to API Gateway

```bash
cd api-gateway
```

### 2. Install Dependencies (Already Done ✅)

```bash
npm install
```

### 3. Configure Environment

The `.env` file is already created with default values. Modify if needed:

```env
PORT=5000
AUTH_SERVICE_URL=http://localhost:3001
ELECTRICITY_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
# ... other services
```

### 4. Start the Gateway

**Development Mode (with auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The gateway will start on **http://localhost:5000**

## 🧪 Testing the Gateway

### Test 1: Gateway Health Check

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2026-02-01T...",
  "uptime": 123.45
}
```

### Test 2: Check All Services

```bash
curl http://localhost:5000/health/services
```

### Test 3: Gateway Welcome Page

```bash
curl http://localhost:5000/
```

### Test 4: Authentication Flow (Via Gateway)

**Step 1: Request OTP**

```bash
curl -X POST http://localhost:5000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "purpose": "login"
  }'
```

**Step 2: Verify OTP**

```bash
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "9876543210",
    "otp": "123456"
  }'
```

You'll receive a JWT token in the response.

**Step 3: Access Protected Routes**

```bash
curl http://localhost:5000/api/v1/electricity/connections \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔄 Service Routing

The gateway automatically routes requests to the appropriate services:

| Client Request                 | Proxied To                | Service              |
| ------------------------------ | ------------------------- | -------------------- |
| `GET /api/v1/auth/...`         | → `http://localhost:3001` | Auth Service         |
| `GET /api/v1/electricity/...`  | → `http://localhost:3002` | Electricity Service  |
| `GET /api/v1/payment/...`      | → `http://localhost:3003` | Payment Service      |
| `GET /api/v1/document/...`     | → `http://localhost:3004` | Document Service     |
| `GET /api/v1/admin/...`        | → `http://localhost:3005` | Admin Service        |
| `GET /api/v1/gas/...`          | → `http://localhost:3006` | Gas Service          |
| `GET /api/v1/water/...`        | → `http://localhost:3007` | Water Service        |
| `GET /api/v1/notification/...` | → `http://localhost:3008` | Notification Service |

## 🔐 Authentication

### Public Routes (No Token Required)

- All `/api/v1/auth/*` routes

### Protected Routes (Token Required)

- All other service routes require JWT token in header:
  ```
  Authorization: Bearer <your_jwt_token>
  ```

### How It Works

1. Client sends request with JWT token
2. Gateway extracts and verifies token
3. Gateway adds user info to request headers:
   - `x-user-id`: User's ID
   - `x-user-role`: User's role
   - `x-user-phone`: User's phone number
4. Backend service receives request with user context

## 🚦 Rate Limiting

### General API

- **15 minutes** window
- **100 requests** per IP

### Auth Routes (Strict)

- **15 minutes** window
- **20 requests** per IP

### OTP Requests

- **1 hour** window
- **5 requests** per IP

Rate limit info is returned in response headers:

- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time when limit resets

## 📊 Complete Testing Workflow

### Before Starting Gateway

1. Ensure PostgreSQL is running (for auth service)
2. Ensure MongoDB is running (for other services)
3. Start individual services you want to test:

   ```bash
   # Terminal 1
   cd services/auth-service
   npm run dev

   # Terminal 2
   cd services/electricity-service
   npm run dev

   # Terminal 3
   cd services/payment-service
   npm run dev
   ```

### Start Gateway

```bash
# Terminal 4
cd api-gateway
npm run dev
```

### Run Tests

```bash
# Terminal 5
# Test gateway health
curl http://localhost:5000/health

# Test service health
curl http://localhost:5000/health/services

# Test auth through gateway
curl -X POST http://localhost:5000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "purpose": "login"}'
```

## 🐛 Troubleshooting

### Gateway Won't Start

- **Check port 5000**: Another process might be using it
  ```bash
  # Windows
  netstat -ano | findstr :5000
  ```
- **Check .env file**: Ensure it exists and has correct values

### Service Unavailable (503)

- **Verify service is running**: Check if the target service is up
- **Check service URL**: Verify URLs in `.env` are correct
- **Check health**: `curl http://localhost:5000/health/services`

### Authentication Fails

- **Token format**: Must be `Bearer <token>`
- **Token expired**: Get a new token
- **JWT_SECRET mismatch**: Ensure gateway and auth service use same secret

### Rate Limit Exceeded

- **Wait**: Rate limit windows reset automatically
- **Different IP**: Test from different machine if needed
- **Adjust limits**: Modify `src/middlewares/rateLimiter.js`

## 📝 Monitoring & Logs

The gateway logs:

- ✅ All incoming requests (method, path, status)
- ✅ Proxy routing decisions
- ✅ Service health checks
- ✅ Authentication failures
- ✅ Rate limit violations
- ✅ Errors and exceptions

Example log output:

```
✓ Proxy configured: /api/v1/auth -> http://localhost:3001 (Public)
✓ Proxy configured: /api/v1/electricity -> http://localhost:3002 (Protected)
[Proxy] GET /api/v1/electricity/connections -> http://localhost:3002 | Status: 200
```

## 🎯 Next Steps

1. **Start all services** you want to test
2. **Start the gateway** with `npm run dev`
3. **Test endpoints** through the gateway (port 5000) instead of directly
4. **Monitor health** at `/health/services`
5. **Update frontend** to use gateway URL (`http://localhost:5000`)

## 📚 Additional Resources

- Full documentation: [README.md](README.md)
- Architecture diagram: [../ARCHITECTURE_VISUAL.md](../ARCHITECTURE_VISUAL.md)
- Auth service: [../services/auth-service/README.md](../services/auth-service/README.md)
- Electricity service: [../services/electricity-service/README.md](../services/electricity-service/README.md)
- Payment service: [../services/payment-service/README.md](../services/payment-service/README.md)

## ✨ Features Summary

| Feature         | Status | Description                           |
| --------------- | ------ | ------------------------------------- |
| Request Routing | ✅     | Routes to 8 microservices             |
| Authentication  | ✅     | JWT verification for protected routes |
| Rate Limiting   | ✅     | 3 different rate limit configs        |
| Health Checks   | ✅     | Gateway and all services              |
| Error Handling  | ✅     | Centralized error management          |
| Logging         | ✅     | Request/response logging              |
| Security        | ✅     | Helmet.js + CORS                      |
| Load Balancing  | 🚧     | Future enhancement                    |
| Caching         | 🚧     | Future enhancement                    |
| Metrics         | 🚧     | Future enhancement                    |

---

**🎉 The API Gateway is ready to use!**

All client applications should now communicate through:
**http://localhost:5000**

Instead of connecting to individual services directly.
