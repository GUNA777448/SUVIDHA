# 🚀 SUVIDHA Backend - Single Command Launcher

## Overview

Run the entire SUVIDHA backend (API Gateway + all microservices) with a single command!

## Quick Start

```bash
# From the server root directory
node server.js
```

That's it! This will automatically start:

- ✅ API Gateway (Port 5000)
- ✅ Auth Service (Port 3001)
- ✅ Electricity Service (Port 3002)
- ✅ Payment Service (Port 3003)

## Prerequisites

### 1. Install Dependencies

Make sure all services have their dependencies installed:

```bash
# Root dependencies
npm install

# API Gateway
cd api-gateway
npm install

# Auth Service
cd services/auth-service
npm install

# Electricity Service
cd services/electricity-service
npm install

# Payment Service
cd services/payment-service
npm install
```

### 2. Database Setup

#### PostgreSQL (for Auth Service)

```bash
# Create database
createdb suvidha_auth

# Or using psql
psql -U postgres
CREATE DATABASE suvidha_auth;
```

Configure `.env` in `services/auth-service/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234567890
DB_NAME=suvidha_auth
```

#### MongoDB (for Other Services)

```bash
# Make sure MongoDB is running
mongod
```

Configure `.env` files:

**Electricity Service:**

```env
MONGODB_URI=mongodb://localhost:27017/suvidha_electricity
```

**Payment Service:**

```env
MONGODB_URI=mongodb://localhost:27017/suvidha_payment
```

## How It Works

The `server.js` file orchestrates all services:

1. **Starts API Gateway** (Port 5000)
2. **Starts Auth Service** (Port 3001)
3. **Starts Electricity Service** (Port 3002)
4. **Starts Payment Service** (Port 3003)

Each service runs as a child process with:

- ✅ Color-coded logging
- ✅ Automatic restart on failure
- ✅ Graceful shutdown (Ctrl+C)
- ✅ Service health monitoring

## Service Status

You'll see color-coded output for each service:

```
🌟 SUVIDHA Platform Backend
📅 [Current Date/Time]

╔═══════════════════════════════════════════════════════════╗
║          🚀 SUVIDHA PLATFORM - BACKEND LAUNCHER          ║
╚═══════════════════════════════════════════════════════════╝

📋 Starting 4 services...

⏳ Starting API Gateway...
✅ API Gateway is running on port 5000

⏳ Starting Auth Service...
✅ Auth Service is running on port 3001

⏳ Starting Electricity Service...
✅ Electricity Service is running on port 3002

⏳ Starting Payment Service...
✅ Payment Service is running on port 3003

╔═══════════════════════════════════════════════════════════╗
║          ✅ ALL SERVICES RUNNING SUCCESSFULLY!           ║
╚═══════════════════════════════════════════════════════════╝

📡 Service Endpoints:
   • API Gateway:         http://localhost:5000
   • Auth Service:        http://localhost:3001
   • Electricity Service: http://localhost:3002
   • Payment Service:     http://localhost:3003

🔗 Access via API Gateway:
   http://localhost:5000/api/v1/auth
   http://localhost:5000/api/v1/electricity
   http://localhost:5000/api/v1/payment

🏥 Health Checks:
   http://localhost:5000/health
   http://localhost:5000/health/services

💡 Press Ctrl+C to stop all services
```

## Testing

### Check Service Health

```powershell
# Gateway health
Invoke-WebRequest http://localhost:5000/health

# All services health
Invoke-WebRequest http://localhost:5000/health/services
```

### Test API Endpoints (via Gateway)

```powershell
# Request OTP
Invoke-WebRequest -Uri http://localhost:5000/api/v1/auth/request-otp `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"phoneNumber":"9876543210","purpose":"login"}'

# Get electricity connections (with token)
Invoke-WebRequest -Uri http://localhost:5000/api/v1/electricity/connections `
  -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

## Stopping Services

Press `Ctrl+C` in the terminal running `server.js`. This will:

1. Send shutdown signal to all services
2. Wait for graceful shutdown
3. Exit cleanly

## Troubleshooting

### Port Already in Use

If you see "EADDRINUSE" error:

```powershell
# Windows - Kill all node processes
Stop-Process -Name node -Force
```

### Database Connection Errors

**Auth Service:**

- ✅ PostgreSQL is running
- ✅ Database `suvidha_auth` exists
- ✅ Credentials in `.env` are correct

**Other Services:**

- ✅ MongoDB is running
- ✅ Connection URI in `.env` is correct

### Service Won't Start

Check the color-coded logs for specific errors:

- 🔴 Red = Error
- 🟡 Yellow = Warning
- 🟢 Green = Success
- 🔵 Blue = Info

## Architecture

```
┌─────────────────────────────────────────────┐
│         server.js (Orchestrator)            │
│                                             │
│  Spawns & Manages:                          │
│  ├─ API Gateway (Port 5000)                 │
│  ├─ Auth Service (Port 3001)                │
│  ├─ Electricity Service (Port 3002)         │
│  └─ Payment Service (Port 3003)             │
└─────────────────────────────────────────────┘
                     │
                     ▼
         All services accessible via
         http://localhost:5000
```

## Development Workflow

### Option 1: Run All Services (Recommended)

```bash
node server.js
```

### Option 2: Run Individual Services

```bash
# Terminal 1 - API Gateway
cd api-gateway
npm start

# Terminal 2 - Auth Service
cd services/auth-service
npm start

# Terminal 3 - Electricity Service
cd services/electricity-service
npm start

# Terminal 4 - Payment Service
cd services/payment-service
npm start
```

## Environment Variables

Each service needs its own `.env` file:

### API Gateway (api-gateway/.env)

```env
PORT=5000
NODE_ENV=development
AUTH_SERVICE_URL=http://localhost:3001
ELECTRICITY_SERVICE_URL=http://localhost:3002
PAYMENT_SERVICE_URL=http://localhost:3003
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Auth Service (services/auth-service/.env)

```env
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234567890
DB_NAME=suvidha_auth
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

### Electricity Service (services/electricity-service/.env)

```env
PORT=3002
MONGODB_URI=mongodb://localhost:27017/suvidha_electricity
```

### Payment Service (services/payment-service/.env)

```env
PORT=3003
MONGODB_URI=mongodb://localhost:27017/suvidha_payment
```

## Adding New Services

To add a new service to the launcher, edit `server.js`:

```javascript
const services = [
  // ... existing services
  {
    name: "New Service",
    path: "services/new-service",
    port: 3009,
    color: colors.yellow,
    script: "src/index.js",
  },
];
```

## Logs

Each service outputs logs with color coding:

- **Cyan** = API Gateway
- **Green** = Auth Service
- **Blue** = Electricity Service
- **Magenta** = Payment Service

Example:

```
[API Gateway] 🚀 API Gateway running on port 5000
[Auth Service] Auth Service running on port 3001
[Electricity Service] Electricity Service running on port 3002
```

## Production Deployment

For production, consider using a process manager:

### PM2

```bash
npm install -g pm2
pm2 start server.js --name suvidha-backend
pm2 save
pm2 startup
```

### Docker Compose (Future)

See `docker-compose.yml` for containerized deployment.

## Benefits

✅ **Single Command** - Start entire backend with one command
✅ **Color-Coded Logs** - Easy to identify which service is logging
✅ **Graceful Shutdown** - Ctrl+C stops all services cleanly
✅ **Health Monitoring** - Built-in health checks
✅ **Error Handling** - Automatic service restart on failure
✅ **Developer Friendly** - See all services in one terminal

## Support

For issues or questions:

1. Check the logs for specific error messages
2. Verify all prerequisites are met
3. Ensure databases are running
4. Check that all `.env` files are configured

---

**Happy Coding! 🚀**
