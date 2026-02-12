# Auth Service

OTP-based authentication service for SUVIDHA platform.

## Features

- **Three login types**: Mobile Number (M), Aadhar (A), Consumer ID (C)
- **OTP-based authentication**: Fixed OTP `123456` for all logins
- **JWT tokens**: Access and refresh tokens
- **User management**: Automatic user creation on first login

## API Endpoints

### Request OTP

```
POST /api/v1/auth/request-otp
Body: {
  "identifier": "9876543210",
  "loginType": "M"  // M=Mobile, A=Aadhar, C=Consumer ID
}
```

### Verify OTP & Login

```
POST /api/v1/auth/verify-otp
Body: {
  "identifier": "9876543210",
  "loginType": "M",
  "otp": "123456"
}
```

### Refresh Token

```
POST /api/v1/auth/refresh-token
Body: {
  "refreshToken": "your-refresh-token"
}
```

### Logout

```
POST /api/v1/auth/logout
Headers: Authorization: Bearer <access-token>
```

### Get Profile

```
GET /api/v1/auth/profile
Headers: Authorization: Bearer <access-token>
```

## Login Types

- **M**: Mobile Number (10 digits)
- **A**: Aadhar Number (12 digits)
- **C**: Consumer ID (alphanumeric)

## Running

```bash
npm install
npm run dev
```
