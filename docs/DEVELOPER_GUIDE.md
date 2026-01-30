# SUVIDHA Developer Guide

## 📚 Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Working with Features](#working-with-features)
- [API Development](#api-development)
- [Database](#database)
- [Testing](#testing)
- [Debugging](#debugging)
- [Best Practices](#best-practices)

## 🚀 Getting Started

### Initial Setup

1. **Install Prerequisites**

   ```bash
   # Node.js 18+ and npm
   node --version  # Should be >= 18.0.0
   npm --version   # Should be >= 9.0.0

   # Docker and Docker Compose
   docker --version
   docker-compose --version

   # Git
   git --version
   ```

2. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd suvidha-kiosk
   npm run install:all
   npm run setup:env
   ```

3. **Start Development Environment**

   ```bash
   # Start all services with Docker
   docker-compose up -d

   # Start client development server
   cd client && npm run dev
   ```

### Environment Configuration

Each service requires environment variables. Copy `.env.example` to `.env`:

```bash
# For each service
cd services/auth-service
cp .env.example .env
# Edit .env with your configuration
```

## 🏗️ Development Environment

### Recommended IDE Setup

**VS Code Extensions:**

- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets
- Docker
- GitLens
- Thunder Client (API testing)

**Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Local Development Ports

| Service              | Port | URL                   |
| -------------------- | ---- | --------------------- |
| Client               | 3000 | http://localhost:3000 |
| Auth Service         | 3001 | http://localhost:3001 |
| Electricity Service  | 3002 | http://localhost:3002 |
| Gas Service          | 3003 | http://localhost:3003 |
| Water Service        | 3004 | http://localhost:3004 |
| Municipal Service    | 3005 | http://localhost:3005 |
| Payment Service      | 3006 | http://localhost:3006 |
| Notification Service | 3007 | http://localhost:3007 |
| Admin Service        | 3008 | http://localhost:3008 |
| Security Service     | 3009 | http://localhost:3009 |
| Integration Service  | 3010 | http://localhost:3010 |
| Monitoring Service   | 3011 | http://localhost:3011 |
| API Gateway          | 8000 | http://localhost:8000 |
| PostgreSQL           | 5432 | -                     |
| Redis                | 6379 | -                     |

## 📁 Project Structure

```
suvidha-kiosk/
├── client/                          # Frontend React application
│   ├── public/
│   │   ├── locales/                # Translations
│   │   └── assets/                 # Static assets
│   ├── src/
│   │   ├── features/               # Feature modules
│   │   ├── shared/                 # Shared components
│   │   ├── config/                 # Configuration
│   │   └── routes/                 # Routing
│   └── package.json
│
├── services/                        # Backend microservices
│   ├── auth-service/               # Authentication & Authorization
│   ├── electricity-service/        # Electricity bill & connections
│   ├── gas-service/                # Gas services
│   ├── water-service/              # Water services
│   ├── municipal-service/          # Municipal services
│   ├── payment-service/            # Payment processing
│   ├── notification-service/       # SMS, Email notifications
│   ├── admin-service/              # Admin dashboard
│   ├── security-service/           # Security & audit
│   ├── integration-service/        # External APIs & hardware
│   └── monitoring-service/         # Monitoring & analytics
│
├── shared/                         # Shared code
│   ├── types/                      # TypeScript types
│   ├── constants/                  # Constants
│   ├── utils/                      # Utility functions
│   └── middlewares/                # Shared middlewares
│
├── database/                       # Database files
│   ├── migrations/                 # DB migrations
│   └── seeders/                    # Seed data
│
├── docs/                           # Documentation
│   ├── api/                        # API docs
│   ├── architecture/               # Architecture docs
│   └── deployment/                 # Deployment guides
│
├── tests/                          # Integration & E2E tests
│   ├── e2e/
│   └── integration/
│
├── scripts/                        # Utility scripts
│   ├── setup-env.js
│   ├── db-migrate.js
│   └── start-all-services.sh
│
└── infrastructure/                 # Infrastructure configs
    ├── nginx/                      # API Gateway config
    ├── kubernetes/                 # K8s configs
    └── terraform/                  # IaC
```

## 🔧 Working with Features

### Creating a New Frontend Feature

1. **Create Feature Directory**

   ```bash
   cd client/src/features
   mkdir my-feature
   cd my-feature
   ```

2. **Create Component Structure**

   ```
   my-feature/
   ├── components/
   │   ├── MyComponent.jsx
   │   └── MyComponent.test.jsx
   ├── hooks/
   │   └── useMyFeature.js
   ├── services/
   │   └── myFeatureService.js
   ├── index.js
   └── README.md
   ```

3. **Example Component**

   ```jsx
   // MyComponent.jsx
   import React from "react";
   import PropTypes from "prop-types";
   import { useMyFeature } from "../hooks/useMyFeature";

   const MyComponent = ({ prop1 }) => {
     const { data, loading, error } = useMyFeature();

     if (loading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;

     return <div>{/* Component JSX */}</div>;
   };

   MyComponent.propTypes = {
     prop1: PropTypes.string.isRequired,
   };

   export default MyComponent;
   ```

### Creating a New Backend Service

1. **Service Structure**

   ```
   my-service/
   ├── src/
   │   ├── controllers/
   │   │   └── my.controller.js
   │   ├── services/
   │   │   └── my.service.js
   │   ├── routes/
   │   │   └── my.routes.js
   │   ├── models/
   │   │   └── my.model.js
   │   ├── middlewares/
   │   │   └── validation.js
   │   └── app.js
   ├── tests/
   │   ├── unit/
   │   └── integration/
   ├── Dockerfile
   ├── package.json
   └── .env.example
   ```

2. **Example Controller**

   ```javascript
   // controllers/my.controller.js
   const myService = require("../services/my.service");
   const { successResponse, errorResponse } = require("../utils/response");

   const getData = async (req, res) => {
     try {
       const data = await myService.getData(req.params.id);
       return successResponse(res, data, "Data retrieved successfully");
     } catch (error) {
       return errorResponse(res, error.message);
     }
   };

   module.exports = { getData };
   ```

3. **Example Service**

   ```javascript
   // services/my.service.js
   const MyModel = require("../models/my.model");
   const logger = require("../utils/logger");

   const getData = async (id) => {
     try {
       const data = await MyModel.findById(id);
       if (!data) {
         throw new Error("Data not found");
       }
       return data;
     } catch (error) {
       logger.error("Error in getData:", error);
       throw error;
     }
   };

   module.exports = { getData };
   ```

## 🗄️ Database

### Running Migrations

```bash
# Run all migrations
npm run db:migrate

# Rollback migration
npm run db:rollback

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

### Creating a Migration

```bash
cd database/migrations
```

Create a new file: `003_create_my_table.sql`

```sql
-- Up Migration
CREATE TABLE IF NOT EXISTS my_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Down Migration
-- DROP TABLE IF EXISTS my_table;
```

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests for specific service
cd services/auth-service && npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run specific test
npx playwright test tests/e2e/login.spec.js

# Debug mode
npx playwright test --debug
```

### Writing Tests

**Unit Test Example:**

```javascript
// my.service.test.js
const myService = require("../src/services/my.service");

describe("MyService", () => {
  describe("getData", () => {
    it("should return data when id exists", async () => {
      const result = await myService.getData(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it("should throw error when id does not exist", async () => {
      await expect(myService.getData(999)).rejects.toThrow("Data not found");
    });
  });
});
```

## 🐛 Debugging

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Auth Service",
      "program": "${workspaceFolder}/services/auth-service/src/app.js",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Frontend Debugging

Use React DevTools browser extension and console.log strategically.

### Docker Debugging

```bash
# View logs
docker-compose logs -f service-name

# Enter container
docker exec -it suvidha-auth sh

# Restart service
docker-compose restart service-name
```

## ✅ Best Practices

### Code Quality

1. **Always run linter before committing**

   ```bash
   npm run lint
   npm run format
   ```

2. **Write meaningful commit messages**

   ```bash
   git commit -m "feat(auth): add password reset functionality"
   ```

3. **Keep functions small and focused**
   - One function = one responsibility
   - Maximum 50 lines per function

4. **Use constants for magic values**

   ```javascript
   // Bad
   if (status === 1) {
   }

   // Good
   const STATUS_ACTIVE = 1;
   if (status === STATUS_ACTIVE) {
   }
   ```

### Performance

1. **Optimize database queries**
   - Use indexes
   - Avoid N+1 queries
   - Use pagination

2. **Implement caching**

   ```javascript
   const cached = await redis.get(key);
   if (cached) return JSON.parse(cached);

   const data = await fetchData();
   await redis.setex(key, 3600, JSON.stringify(data));
   ```

3. **Use async/await properly**

   ```javascript
   // Bad
   const data1 = await getData1();
   const data2 = await getData2();

   // Good (if independent)
   const [data1, data2] = await Promise.all([getData1(), getData2()]);
   ```

### Security

1. **Never commit secrets**
2. **Validate all inputs**
3. **Sanitize user data**
4. **Use prepared statements**
5. **Implement rate limiting**

### Documentation

1. **Document complex logic**
2. **Keep README updated**
3. **Add JSDoc comments**
   ```javascript
   /**
    * Calculate bill amount
    * @param {number} units - Units consumed
    * @param {string} category - Consumer category
    * @returns {number} Total amount
    */
   const calculateBill = (units, category) => {
     // Implementation
   };
   ```

## 🆘 Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: Create GitHub issue
- **Team Chat**: Slack #suvidha-dev
- **Code Review**: Tag team members in PR

## 📞 Contacts

- **Tech Lead**: techlead@suvidha.gov.in
- **DevOps**: devops@suvidha.gov.in
- **QA Team**: qa@suvidha.gov.in

---

Happy Coding! 🚀
