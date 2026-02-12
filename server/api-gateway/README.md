# API Gateway - SUVIDHA Platform

The API Gateway serves as the single entry point for all client requests to the SUVIDHA microservices platform. It handles routing, authentication, rate limiting, and service orchestration.

## 🚀 Features

- **Request Routing**: Routes requests to appropriate microservices
- **Authentication**: JWT token verification for protected routes
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Service Health Monitoring**: Check health status of all services
- **Request/Response Logging**: Comprehensive logging for debugging
- **Error Handling**: Centralized error handling and user-friendly messages
- **CORS Support**: Configured for cross-origin requests

## 📦 Installation

```bash
cd api-gateway
npm install
```

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
ELECTRICITY_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
DOCUMENT_SERVICE_URL=http://localhost:3004
ADMIN_SERVICE_URL=http://localhost:3005
GAS_SERVICE_URL=http://localhost:3006
WATER_SERVICE_URL=http://localhost:3007
NOTIFICATION_SERVICE_URL=http://localhost:3008

# JWT Secret (must match auth service)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

## 🏃 Running the Gateway

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The gateway will start on port 5000 (or the port specified in .env).

## 📡 API Routes

### Gateway Routes

| Endpoint                 | Method | Description                |
| ------------------------ | ------ | -------------------------- |
| `/`                      | GET    | Gateway welcome and info   |
| `/health`                | GET    | Gateway health check       |
| `/health/services`       | GET    | All services health status |
| `/health/services/:name` | GET    | Specific service health    |

### Proxied Service Routes

All requests are proxied to respective microservices:

| Route                    | Service              | Protected | Port |
| ------------------------ | -------------------- | --------- | ---- |
| `/api/v1/auth/*`         | Auth Service         | No        | 3001 |
| `/api/v1/electricity/*`  | Electricity Service  | Yes       | 3002 |
| `/api/v1/payment/*`      | Payment Service      | Yes       | 3003 |
| `/api/v1/document/*`     | Document Service     | Yes       | 3004 |
| `/api/v1/admin/*`        | Admin Service        | Yes       | 3005 |
| `/api/v1/gas/*`          | Gas Service          | Yes       | 3006 |
| `/api/v1/water/*`        | Water Service        | Yes       | 3007 |
| `/api/v1/notification/*` | Notification Service | Yes       | 3008 |

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The gateway automatically:

1. Verifies the token
2. Extracts user information
3. Forwards user data to backend services via headers:
   - `x-user-id`
   - `x-user-role`
   - `x-user-phone`

## 🚦 Rate Limiting

### General API Rate Limit

- **Window**: 15 minutes
- **Max Requests**: 100 per IP

### Auth Rate Limit (Strict)

- **Window**: 15 minutes
- **Max Requests**: 20 per IP

### OTP Rate Limit

- **Window**: 1 hour
- **Max Requests**: 5 per IP

## 📊 Health Check Examples

### Gateway Health

```bash
curl http://localhost:5000/health
```

Response:

```json
{
  "status": "healthy",
  "service": "api-gateway",
  "timestamp": "2026-02-01T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

### All Services Health

```bash
curl http://localhost:5000/health/services
```

### Specific Service Health

```bash
curl http://localhost:5000/health/services/auth
```

## 🔄 Request Flow

1. Client sends request to Gateway
2. Gateway applies rate limiting
3. For protected routes, Gateway verifies JWT token
4. Gateway forwards request to appropriate service
5. Service processes request
6. Gateway returns response to client

## 🛠️ Architecture

```
┌─────────┐
│ Client  │
└────┬────┘
     │
     ▼
┌────────────────┐
│  API Gateway   │
│  (Port 5000)   │
│                │
│ • Routing      │
│ • Auth Check   │
│ • Rate Limit   │
│ • Logging      │
└────┬───────────┘
     │
     ├──────┬──────┬──────┬──────┬──────┬──────┬──────┐
     ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
  Auth  Elec   Pay   Doc  Admin  Gas  Water  Notif
  3001  3002  3003  3004  3005  3006  3007  3008
```

## 🧪 Testing

### Test Gateway

```bash
curl http://localhost:5000/
```

### Test Authentication Flow

```bash
# 1. Request OTP (via gateway)
curl -X POST http://localhost:5000/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "purpose": "login"}'

# 2. Verify OTP (via gateway)
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "9876543210", "otp": "123456"}'

# 3. Use token for protected routes
curl http://localhost:5000/api/v1/electricity/connections \
  -H "Authorization: Bearer <your_token>"
```

## 📝 Logging

The gateway logs:

- All incoming requests (via Morgan)
- Proxy routing information
- Service errors and downtimes
- Authentication failures

## ⚠️ Error Handling

The gateway returns standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-02-01T10:00:00.000Z"
}
```

Common status codes:

- `401`: Unauthorized (missing/invalid token)
- `404`: Route not found
- `429`: Too many requests (rate limit exceeded)
- `503`: Service unavailable
- `500`: Internal server error

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: DDoS protection
- **JWT Verification**: Secure authentication
- **Input Validation**: Request sanitization

## 📈 Future Enhancements

- [ ] Load balancing across service instances
- [ ] Circuit breaker pattern for fault tolerance
- [ ] Request caching for frequently accessed data
- [ ] WebSocket support for real-time features
- [ ] API versioning strategy
- [ ] Advanced monitoring and metrics (Prometheus)
- [ ] Service discovery integration
- [ ] Request/Response transformation

## 🐛 Troubleshooting

### Service Unavailable (503)

- Check if the target microservice is running
- Verify service URLs in `.env` file
- Check network connectivity

### Unauthorized (401)

- Verify JWT token is valid and not expired
- Ensure JWT_SECRET matches auth service
- Check token format: `Bearer <token>`

### Rate Limit Exceeded (429)

- Wait for the rate limit window to reset
- Consider requesting increased limits for production

## 📚 Dependencies

- **express**: Web framework
- **http-proxy-middleware**: Request proxying
- **jsonwebtoken**: JWT verification
- **express-rate-limit**: Rate limiting
- **helmet**: Security headers
- **cors**: CORS support
- **morgan**: HTTP logging
- **dotenv**: Environment configuration

## 👥 Contributing

When adding new services:

1. Add service URL to `.env` file
2. Add service configuration in `src/config/proxy.js`
3. Add service to health check in `src/routes/health.routes.js`
4. Update this README

## 📄 License

ISC
