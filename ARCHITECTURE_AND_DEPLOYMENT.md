# 🏗️ SUVIDHA Architecture, Local Development & Zero-Cost Deployment

## 📁 Folder Structure & Interconnections

### Root Folders Overview

```
SUVIDHA/
├── client/              # Frontend React Application
├── server/              # Backend Microservices (11 services)
├── shared/              # Shared code between client and server
├── database/            # Database migrations and seeders
├── tests/               # Integration and E2E tests
├── infrastructure/      # Deployment configs (Nginx, K8s, Terraform)
├── docs/               # Documentation
└── scripts/            # Setup and utility scripts
```

---

## 🔗 How Folders are Interconnected

### 1. **Client ↔ Server Communication**

```
┌─────────────────┐
│  CLIENT (3000)  │  React App runs on port 3000
└────────┬────────┘
         │
         │ HTTP Requests
         ↓
┌─────────────────┐
│  NGINX (8000)   │  API Gateway routes requests
└────────┬────────┘
         │
         │ Routes to appropriate service
         ↓
┌─────────────────────────────────────────┐
│         BACKEND SERVICES                │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Auth     │ │Electric. │ │ Payment │ │
│  │ (3001)   │ │ (3002)   │ │ (3006)  │ │
│  └──────────┘ └──────────┘ └─────────┘ │
│       ... 8 more services ...          │
└─────────────────────────────────────────┘
         │
         │ Database Queries
         ↓
┌─────────────────┐
│  PostgreSQL     │  Shared database (5432)
│  (5432)         │
└─────────────────┘
         │
┌─────────────────┐
│  Redis (6379)   │  Session & Cache storage
└─────────────────┘
```

### 2. **Data Flow Example: User Login**

```
1. User enters credentials in CLIENT (React)
   ↓
2. CLIENT sends POST to /api/auth/login
   ↓
3. NGINX receives request on port 8000
   ↓
4. NGINX routes to AUTH-SERVICE (port 3001)
   ↓
5. AUTH-SERVICE:
   - Validates credentials with PostgreSQL
   - Creates session in Redis
   - Generates JWT token
   ↓
6. Returns JWT to CLIENT
   ↓
7. CLIENT stores JWT in localStorage
   ↓
8. For subsequent requests, CLIENT includes JWT in headers
   ↓
9. All SERVICES validate JWT before processing
```

### 3. **Shared Code Usage**

```
shared/
├── types/              # TypeScript interfaces used by both client & server
├── constants/          # API endpoints, status codes (both use same values)
├── utils/             # Validation, formatting functions
└── middlewares/       # Auth middleware (server-side)

Example:
- client/src/config/api.js imports from shared/constants/endpoints.js
- server/auth-service/src/middleware imports from shared/middlewares/auth.js
```

### 4. **Database Layer**

```
database/
├── migrations/        # SQL files to create/modify tables
│   ├── 001_create_users_and_auth.sql
│   ├── 002_create_service_tables.sql
│   └── 003_create_payment_and_audit.sql
└── seeders/          # Sample data for development

All 11 services connect to the SAME PostgreSQL database
- Each service has its own schema/tables
- Shared tables: users, sessions, audit_logs
```

---

## 🚀 Running Locally - Complete Guide

### Method 1: All Services at Once (Recommended)

```bash
# Step 1: Start databases
docker-compose up -d postgres redis

# Step 2: Run database migrations
npm run db:migrate

# Step 3: Start all services
npm run dev
```

**What happens:**

- PostgreSQL starts on port 5432
- Redis starts on port 6379
- All 11 backend services start (ports 3001-3011)
- Nginx gateway starts on port 8000
- React frontend starts on port 3000

**Access:**

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- Individual services: http://localhost:3001, 3002, etc.

### Method 2: Individual Services (For Development)

```bash
# Terminal 1: Database
docker-compose up -d postgres redis

# Terminal 2: Auth Service
cd server/auth-service
npm run dev

# Terminal 3: Frontend
cd client
npm run dev

# Terminal 4: Another service (e.g., Electricity)
cd server/electricity-service
npm run dev
```

### Method 3: Full Docker Setup

```bash
# Start everything in Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## 💰 Zero-Cost Deployment Options

### Option 1: Vercel + Railway (Recommended - Easiest)

#### **Frontend on Vercel** (Free Tier)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd client
vercel --prod
```

**Vercel Free Tier:**

- ✅ 100 GB bandwidth/month
- ✅ Custom domains
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Unlimited sites

**Configuration:**
Create `vercel.json` in client folder:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-railway-api.up.railway.app/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### **Backend on Railway** (Free Tier)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy each service
cd server/auth-service
railway init
railway up
```

**Railway Free Tier:**

- ✅ 500 hours/month (enough for 1-2 services)
- ✅ 1GB RAM per service
- ✅ Shared CPU
- ✅ PostgreSQL database included
- ✅ Redis included

**Limitation:** Free tier supports only 1-2 services. For 11 services, consider:

- Deploy critical services (auth, payment) on Railway
- Deploy others on different platforms

---

### Option 2: Render (All-in-One Free Solution)

**Render.com Free Tier:**

- ✅ Static sites (client)
- ✅ Web services (servers)
- ✅ PostgreSQL database (90-day limit)
- ✅ Redis (30-day limit)

#### Deploy Frontend:

```bash
# Connect GitHub repo to Render
# Create "Static Site"
# Build command: cd client && npm install && npm run build
# Publish directory: client/dist
```

#### Deploy Backend Services:

```bash
# Create "Web Service" for each backend service
# Build command: cd server/auth-service && npm install
# Start command: cd server/auth-service && npm start
# Environment variables: Add from .env.example
```

**Free Tier Limits:**

- ⚠️ Services spin down after 15 mins of inactivity
- ⚠️ Takes 30-60 seconds to wake up
- ✅ Good for demos/testing
- ❌ Not ideal for production

---

### Option 3: Netlify + Heroku

#### **Frontend on Netlify** (Free)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd client
netlify deploy --prod
```

**Netlify Free Tier:**

- ✅ 100 GB bandwidth
- ✅ 300 build minutes/month
- ✅ Custom domain + SSL
- ✅ CDN

**Configuration:**
Create `netlify.toml` in client folder:

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-heroku-api.herokuapp.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### **Backend on Heroku** (Free Tier Removed)

⚠️ **Note:** Heroku removed free tier in 2022. Alternatives:

- Use Railway instead
- Use Oracle Cloud (always free tier)

---

### Option 4: Oracle Cloud (Always Free - Best for Backend)

**Oracle Cloud Always Free Tier:**

- ✅ 2 AMD Compute VMs (1/8 OCPU, 1GB RAM each)
- ✅ 4 ARM Ampere A1 Compute instances (24GB total RAM)
- ✅ 200 GB block storage
- ✅ 2 Autonomous Databases (20GB each)
- ✅ Load balancer

**Perfect for SUVIDHA!**

#### Setup Steps:

1. **Create Oracle Cloud Account**
   - Sign up at https://cloud.oracle.com
   - Choose "Always Free" tier

2. **Deploy Using Docker**

   ```bash
   # SSH into Oracle VM
   ssh -i your-key.pem ubuntu@your-oracle-ip

   # Install Docker
   sudo apt update
   sudo apt install docker.io docker-compose -y

   # Clone your repo
   git clone https://github.com/GUNA777448/SUVIDHA-kiosk.git
   cd SUVIDHA-kiosk

   # Setup environment
   ./scripts/setup.sh

   # Start all services
   docker-compose up -d

   # Setup Nginx reverse proxy
   sudo apt install nginx -y
   # Configure nginx to proxy port 80 to your services
   ```

3. **Configure Database**

   ```bash
   # Use Oracle Autonomous Database (free)
   # Or use PostgreSQL in Docker (as configured)
   ```

4. **Configure Domain**
   - Get free domain from Freenom.com
   - Point to Oracle VM IP
   - Configure SSL with Let's Encrypt (free)

---

### Option 5: GitHub Pages + Serverless Functions

#### **Frontend on GitHub Pages** (Free)

```bash
# Build the app
cd client
npm run build

# Deploy to GitHub Pages
npm install -g gh-pages
gh-pages -d dist
```

**Configure in package.json:**

```json
{
  "homepage": "https://yourusername.github.io/SUVIDHA-kiosk",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

#### **Backend on Cloudflare Workers** (Free Tier)

- ✅ 100,000 requests/day
- ✅ Serverless functions
- ✅ Global CDN
- ✅ KV storage (1GB free)

Convert Express routes to Cloudflare Workers:

```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth")) {
      // Handle auth
    }

    return new Response("OK");
  },
};
```

---

## 🎯 Recommended Zero-Cost Stack for SUVIDHA

### For Development/Demo:

```
Frontend:  Vercel (free)
Backend:   Railway (1-2 critical services free)
Database:  Railway PostgreSQL (free)
Cache:     Railway Redis (free)
Other Services: Render.com (free but slow)
```

### For Production (Still Free):

```
Frontend:  Cloudflare Pages (free, fast)
Backend:   Oracle Cloud VM (always free, best performance)
Database:  Oracle Autonomous DB (20GB free)
Cache:     Redis on Oracle VM
CDN:       Cloudflare (free)
SSL:       Let's Encrypt (free)
Domain:    Freenom.com (free) or Namecheap ($1/year)
```

---

## 📊 Cost Comparison

| Platform              | Frontend | Backend (11 services)    | Database       | Best For          |
| --------------------- | -------- | ------------------------ | -------------- | ----------------- |
| **Vercel + Railway**  | Free     | Free (1-2 services only) | Free           | Small demos       |
| **Render**            | Free     | Free (slow startup)      | Free (90 days) | Testing           |
| **Oracle Cloud**      | $0       | Free (Full capacity)     | Free (20GB)    | **Production** ✅ |
| **Netlify + Railway** | Free     | Free (1-2 services)      | Free           | Medium apps       |
| **GitHub Pages + CF** | Free     | Free (100k req/day)      | Need separate  | Static sites      |

---

## 🔧 Detailed Local Development Workflow

### Day-to-Day Development

```bash
# Morning: Start your dev environment
docker-compose up -d postgres redis    # Start databases
cd client && npm run dev               # Terminal 1: Frontend
cd server/auth-service && npm run dev  # Terminal 2: Your service

# Make changes, test, commit
git add .
git commit -m "feat: your changes"
git push

# Evening: Stop services
docker-compose down
```

### Hot Reload (Auto-refresh on code changes)

- **Client**: Vite automatically reloads (HMR)
- **Server**: Nodemon watches files and restarts

```javascript
// server/auth-service/package.json
{
  "scripts": {
    "dev": "nodemon src/app.js"  // Auto-restart on changes
  }
}
```

### Testing Locally

```bash
# Unit tests
npm test                           # All tests
cd client && npm test              # Frontend tests
cd server/auth-service && npm test # Service tests

# Integration tests
npm run test:integration

# E2E tests (Playwright)
cd tests/e2e
npx playwright test
```

---

## 🚢 Deployment Process (Oracle Cloud Example)

### One-Time Setup

```bash
# 1. Create Oracle Cloud account
# 2. Create VM instance (Ubuntu 22.04)
# 3. Configure security rules (ports 80, 443, 22)

# 4. SSH into VM
ssh -i your-key.pem ubuntu@your-oracle-ip

# 5. Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# 6. Clone repository
git clone https://github.com/GUNA777448/SUVIDHA-kiosk.git
cd SUVIDHA-kiosk

# 7. Setup environment
cp server/auth-service/.env.example server/auth-service/.env
# Edit all .env files with production values

# 8. Build and start
docker-compose -f docker-compose.prod.yml up -d

# 9. Configure Nginx
sudo nano /etc/nginx/sites-available/suvidha

# 10. Setup SSL
sudo certbot --nginx -d your-domain.com
```

### Continuous Deployment (Auto-deploy on git push)

```bash
# Setup webhook on Oracle VM
# Create deploy script
nano ~/deploy.sh
```

```bash
#!/bin/bash
cd /home/ubuntu/SUVIDHA-kiosk
git pull origin main
docker-compose down
docker-compose up -d --build
```

**GitHub Action** (.github/workflows/deploy.yml):

```yaml
name: Deploy to Oracle Cloud

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.ORACLE_IP }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd SUVIDHA-kiosk
            git pull
            docker-compose up -d --build
```

---

## 📈 Performance Monitoring (Free Tools)

1. **UptimeRobot** - Monitor uptime (free for 50 monitors)
2. **Google Analytics** - Track user activity
3. **Sentry** - Error tracking (free tier)
4. **Grafana Cloud** - Metrics & logs (free tier)

---

## 💡 Pro Tips

### Reduce Costs Further:

1. **Use CloudFlare as CDN** (free):
   - Faster load times globally
   - DDoS protection
   - Free SSL

2. **Optimize Docker Images**:

   ```dockerfile
   # Use multi-stage builds
   FROM node:18-alpine AS builder
   # Build stage

   FROM node:18-alpine
   # Production stage with minimal dependencies
   ```

3. **Database Connection Pooling**:

   ```javascript
   // Reuse connections to save resources
   const pool = new Pool({
     max: 10, // Max connections
     idleTimeoutMillis: 30000,
   });
   ```

4. **Cache Static Assets**:
   - Use CDN for images, CSS, JS
   - Set proper cache headers

---

## 🎓 Summary

**Locally:**

- Client (3000) → Nginx (8000) → Services (3001-3011) → PostgreSQL (5432) + Redis (6379)
- All communicate via HTTP/REST APIs
- Shared code reduces duplication

**Zero-Cost Deployment:**

- **Best Option**: Oracle Cloud (always free, full-featured)
- **Easiest Option**: Vercel + Railway (limited but fast setup)
- **Backup Option**: Render.com (free but slower)

**Next Steps:**

1. Develop locally using `npm run dev`
2. Test with `npm test`
3. Deploy to Oracle Cloud for production
4. Use CloudFlare for CDN
5. Monitor with free tools

---

Need help with deployment? Check [DEPLOYMENT_GUIDE.md](./docs/deployment/) for detailed platform-specific instructions!
