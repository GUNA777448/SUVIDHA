# SUVIDHA - Government Services Kiosk Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Overview

SUVIDHA is a comprehensive government services kiosk platform that enables citizens to access various government services including electricity, gas, water, and municipal services through self-service kiosks.

## 🏗️ Architecture

This project follows a **microservices architecture** with:

- **Frontend**: React-based kiosk interface with multi-language support
- **Backend**: Node.js microservices for each domain
- **Database**: PostgreSQL with separate schemas per service
- **Authentication**: JWT-based with multi-factor authentication
- **Deployment**: Docker containerized services with orchestration

## 📁 Project Structure

```
suvidha-kiosk/
├── client/                 # React frontend application
├── services/              # Backend microservices
├── shared/                # Shared utilities and types
├── database/              # Database migrations and seeds
├── docs/                  # Documentation
├── tests/                 # Integration and E2E tests
├── scripts/               # Utility scripts
└── infrastructure/        # Deployment configurations
```

## 👥 Team Assignments

| Developer   | Responsibility       | Frontend                          | Backend                         |
| ----------- | -------------------- | --------------------------------- | ------------------------------- |
| Developer A | Electricity Services | `client/src/features/electricity` | `services/electricity-service`  |
| Developer B | Gas Services         | `client/src/features/gas`         | `services/gas-service`          |
| Developer C | Water Services       | `client/src/features/water`       | `services/water-service`        |
| Developer D | Municipal Services   | `client/src/features/municipal`   | `services/municipal-service`    |
| Developer E | Payment Integration  | `client/src/features/payment`     | `services/payment-service`      |
| Developer F | Admin Dashboard      | `client/src/features/admin`       | `services/admin-service`        |
| Developer G | Authentication       | `client/src/features/auth`        | `services/auth-service`         |
| Developer H | Notifications        | -                                 | `services/notification-service` |
| Developer I | Security & Audit     | `client/src/features/security`    | `services/security-service`     |
| Developer J | Hardware Integration | `client/src/features/hardware`    | `services/integration-service`  |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Docker & Docker Compose
- PostgreSQL 14+
- Git

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd suvidha-kiosk
   ```

2. **Install dependencies**

   ```bash
   npm run install:all
   ```

3. **Setup environment variables**

   ```bash
   npm run setup:env
   ```

4. **Start development environment**

   ```bash
   docker-compose up -d
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - API Gateway: http://localhost:8000

## 📚 Documentation

- [Architecture Guide](docs/architecture/system-design.md)
- [API Documentation](docs/api/README.md)
- [Developer Guide](docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](docs/deployment/deployment-guide.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🔧 Development

### Running Individual Services

```bash
# Frontend only
cd client && npm run dev

# Specific backend service
cd services/auth-service && npm run dev

# All services
npm run dev:all
```

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npm run type-check
```

## 🌐 Multi-Language Support

Currently supported languages:

- English (en)
- Hindi (hi)
- Tamil (ta)

Add new translations in `client/public/locales/`

## 🔒 Security

- JWT-based authentication
- Multi-factor authentication support
- Biometric integration
- Audit logging
- Data encryption at rest and in transit
- Role-based access control (RBAC)

## 📊 Monitoring

- Health checks: http://localhost:8000/health
- Metrics: http://localhost:8000/metrics
- Logs: Centralized logging via monitoring service

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and queries:

- Create an issue in the repository
- Email: support@suvidha-kiosk.gov.in
- Documentation: [docs/](docs/)

## 🙏 Acknowledgments

- Government of India Digital Services Initiative
- Open source community

---

**Built with ❤️ for Digital India**
