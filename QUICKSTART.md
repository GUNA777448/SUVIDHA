# 🚀 Quick Start Guide - SUVIDHA Kiosk

Get up and running with SUVIDHA in 5 minutes!

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker Desktop (for databases)
- Git

## Step 1: Clone & Setup

```bash
# Navigate to project directory
cd c:\Users\gurun\Documents\SUVIDHA

# Run setup script (Windows PowerShell)
.\scripts\setup.ps1

# OR manually install dependencies
npm install
cd client && npm install && cd ..
cd server/auth-service && npm install && cd ../..
```

## Step 2: Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify they're running
docker-compose ps
```

## Step 3: Run Database Migrations

```bash
# Run all migrations
npm run db:migrate

# Verify tables created
# Connect to PostgreSQL and check tables
```

## Step 4: Configure Environment Variables

Edit the `.env` files in each service:

```bash
server/auth-service/.env
server/electricity-service/.env
server/payment-service/.env
# ... etc
```

**Important**: Update these values:

- `JWT_SECRET` - Change to a strong secret
- `DB_PASSWORD` - Match your PostgreSQL password
- `REDIS_PASSWORD` - If using Redis auth

## Step 5: Start Development Servers

```bash
# Start all services at once
npm run dev

# OR start individually:
# Client
cd client && npm run dev

# Auth Service
cd server/auth-service && npm run dev

# Other services
cd server/electricity-service && npm run dev
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001/health
- **Electricity Service**: http://localhost:3002/health
- **Gas Service**: http://localhost:3003/health
- **Water Service**: http://localhost:3004/health
- **Municipal Service**: http://localhost:3005/health
- **Payment Service**: http://localhost:3006/health

## Default Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT**: Change these credentials immediately in production!

## Verify Installation

### 1. Check Service Health

```bash
# Auth Service
curl http://localhost:3001/health

# Expected response:
# {"status":"healthy","service":"auth-service","timestamp":"..."}
```

### 2. Test Login

```bash
# POST to login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Access Frontend

Open browser: http://localhost:3000

You should see the SUVIDHA login screen.

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart
docker-compose restart postgres
```

### Port Already in Use

If ports 3000-3011 are already in use, update the port numbers in:

- `docker-compose.yml`
- Service `.env` files
- `client/vite.config.js` proxy settings

### Dependencies Installation Failed

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/*/node_modules

# Reinstall
npm install
```

## Development Workflow

### 1. Create a New Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Work in your assigned modules (see [TEAM_ASSIGNMENTS.md](TEAM_ASSIGNMENTS.md))

### 3. Test Your Changes

```bash
# Run tests
npm test

# Check coverage
npm run test:coverage
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

Create PR on GitHub and request reviews.

## Useful Commands

```bash
# Development
npm run dev              # Start all services
npm run build            # Build all services
npm run test             # Run all tests
npm run lint             # Lint code
npm run format           # Format code

# Database
npm run db:migrate       # Run migrations
npm run db:seed          # Seed data
npm run db:reset         # Reset database

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
docker-compose ps        # List running services
```

## Next Steps

1. **Read Documentation**
   - [Developer Guide](docs/DEVELOPER_GUIDE.md)
   - [API Documentation](docs/api/)
   - [Architecture](docs/architecture/)

2. **Check Your Assignment**
   - See [TEAM_ASSIGNMENTS.md](TEAM_ASSIGNMENTS.md)
   - Review your assigned modules

3. **Join Communication Channels**
   - Slack: #suvidha-dev
   - Daily Standup: 10:00 AM

4. **Review Coding Standards**
   - [CONTRIBUTING.md](CONTRIBUTING.md)
   - Code style guidelines
   - Git workflow

## Need Help?

- **Technical Issues**: Open an issue on GitHub
- **Questions**: Ask in Slack #suvidha-help
- **Emergency**: Contact Team Lead

## Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

---

**Ready to build SUVIDHA? Let's go! 🚀**
