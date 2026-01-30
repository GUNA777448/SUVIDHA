# Auth Service

Authentication and authorization service for SUVIDHA platform.

**Developer**: Developer G
**Contact**: dev-g@suvidha.gov.in

## Features

- User login/logout
- JWT token management
- Multi-factor authentication (OTP)
- Session management
- Role-based access control
- Password reset

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token

### OTP

- `POST /api/auth/otp/send` - Send OTP
- `POST /api/auth/otp/verify` - Verify OTP

### Password

- `POST /api/auth/password/reset` - Reset password
- `POST /api/auth/password/change` - Change password

## Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for required environment variables.

## Testing

```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

## Database Schema

### users

- id (UUID, PK)
- username (VARCHAR)
- password_hash (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- role (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### sessions

- id (UUID, PK)
- user_id (UUID, FK)
- token (TEXT)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)

### otp_records

- id (UUID, PK)
- user_id (UUID, FK)
- otp (VARCHAR)
- purpose (VARCHAR)
- expires_at (TIMESTAMP)
- verified (BOOLEAN)
- created_at (TIMESTAMP)

## Dependencies

- Authentication services required by all other services
- Redis for session storage
- PostgreSQL for user data
