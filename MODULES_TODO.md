# SUVIDHA - Modules To Be Completed

**Last Updated**: February 10, 2026

---

## Module Completion Tracker

| #   | Module               | Status         | Priority | Port |
| --- | -------------------- | -------------- | -------- | ---- |
| 1   | Authenti cation      | DONE           | Critical | 3001 |
| 2   | Payment Integration  | 🔴 Not Started | High     | 3006 |
| 3   | Electricity Services | 🔴 Not Started | Medium   | 3002 |
| 4   | Gas Services         | ✅ COMPLETED   | Medium   | 3003 |
| 5   | Water Services       | 🔴 Not Started | Medium   | 3004 |
| 6   | Municipal Services   | 🔴 Not Started | Medium   | 3005 |
| 7   | Admin Dashboard      | 🔴 Not Started | Medium   | 3007 |
| 8   | Notification Service | 🔴 Not Started | Low      | 3008 |
| 9   | Security & Audit     | 🔴 Not Started | Low      | 3009 |
| 10  | Hardware Integration | 🔴 Not Started | Low      | 3010 |
| 11  | Document Service     | 🔴 Not Started | Low      | -    |

---

## 1. Authentication Module (auth-service)

> **Priority**: Critical — All other services depend on this module.

**Backend**: `server/services/auth-service/`  
**Frontend**: `client/src/features/auth/`

### Tasks

- [ ] User registration (citizen signup with Aadhaar/mobile)
- [ ] Login with JWT token generation
- [ ] OTP-based authentication (SMS/Email)
- [ ] Multi-factor authentication (MFA)
- [ ] Token refresh mechanism
- [ ] Password reset flow
- [ ] Session management
- [ ] Role-based access control (Citizen, Admin, Operator)
- [ ] Auth middleware for protecting routes
- [ ] Aadhaar verification integration
- [ ] Login/Register frontend pages
- [ ] Auth context and hooks (React)
- [ ] Protected route implementation
- [ ] Unit tests (80%+ coverage)
- [ ] API documentation

---

## 2. Payment Integration Module (payment-service)

> **Priority**: High — Required for all billable services.

**Backend**: `server/services/payment-service/`  
**Frontend**: `client/src/features/payment/`

### Tasks

- [ ] Razorpay / Paytm sandbox setup
- [ ] Payment initiation flow
- [ ] Payment callback/webhook handling
- [ ] Transaction status tracking
- [ ] Receipt generation
- [ ] Refund processing
- [ ] Payment history
- [ ] Payment UI components
- [ ] Unit tests
- [ ] API documentation

---

## 3. Electricity Services Module (electricity-service)

**Backend**: `server/services/electricity-service/`  
**Frontend**: `client/src/features/electricity/`

### Tasks

- [ ] Bill inquiry by consumer number
- [ ] Bill payment integration
- [ ] New connection application
- [ ] Connection status tracking
- [ ] Usage history & analytics
- [ ] Complaint registration
- [ ] Frontend pages (inquiry, payment, application)
- [ ] Integration with auth service
- [ ] Unit tests
- [ ] API documentation

---

## 4. Gas Services Module (gas-service)

**Backend**: `server/services/gas-service/`  
**Frontend**: `client/src/features/gas/`

### Tasks

- [x] Gas bill inquiry
- [x] Bill payment
- [x] New connection request
- [x] Connection transfer
- [x] LPG cylinder booking system
- [x] Delivery tracking
- [x] Complaint registration
- [x] Backend API development
- [x] Database models and schemas
- [x] Input validation
- [x] Authentication integration
- [ ] Frontend pages
- [ ] Frontend integration
- [ ] Unit tests
- [ ] API documentation

---

## 5. Water Services Module (water-service)

**Backend**: `server/services/water-service/`  
**Frontend**: `client/src/features/water/`

### Tasks

- [ ] Water bill inquiry
- [ ] Bill payment
- [ ] New connection application
- [ ] Meter reading submission
- [ ] Complaint registration
- [ ] Frontend pages
- [ ] Integration with auth service
- [ ] Unit tests
- [ ] API documentation

---

## 6. Municipal Services Module

**Backend**: `server/services/municipal-service/` _(to be created)_  
**Frontend**: `client/src/features/municipal/`

### Tasks

- [ ] Property tax payment
- [ ] Birth/Death certificate application
- [ ] Trade license application
- [ ] Building permit application
- [ ] Complaint/grievance registration
- [ ] Application status tracking
- [ ] Frontend pages
- [ ] Integration with auth service
- [ ] Unit tests
- [ ] API documentation

---

## 7. Admin Dashboard Module (admin-service)

**Backend**: `server/services/admin-service/`  
**Frontend**: `client/src/features/admin/`

### Tasks

- [ ] Admin login & authorization
- [ ] User management (view, block, edit)
- [ ] Transaction monitoring dashboard
- [ ] Service analytics & reports
- [ ] System health monitoring
- [ ] Kiosk management
- [ ] Frontend dashboard pages
- [ ] Unit tests
- [ ] API documentation

---

## 8. Notification Service Module (notification-service)

**Backend**: `server/services/notification-service/`

### Tasks

- [ ] SMS gateway integration
- [ ] Email service setup (SMTP/SendGrid)
- [ ] Notification templates
- [ ] Delivery tracking & retry logic
- [ ] Notification preferences
- [ ] Unit tests
- [ ] API documentation

---

## 9. Security & Audit Module

**Backend**: `server/services/security-service/` _(to be created)_  
**Frontend**: `client/src/features/security/`

### Tasks

- [ ] Audit logging (all user actions)
- [ ] Security event monitoring
- [ ] Data encryption services
- [ ] Compliance checks
- [ ] Suspicious activity detection
- [ ] Security scanning setup
- [ ] Unit tests
- [ ] API documentation

---

## 10. Hardware Integration Module

**Frontend**: `client/src/features/hardware/`

### Tasks

- [ ] Thermal printer integration (receipt printing)
- [ ] Payment terminal (POS device) integration
- [ ] Biometric scanner integration
- [ ] Aadhaar biometric authentication
- [ ] Barcode/QR scanner support
- [ ] Kiosk health monitoring
- [ ] Unit tests
- [ ] API documentation

---

## 11. Document Service Module (document-service)

**Backend**: `server/services/document-service/`

### Tasks

- [ ] Document upload & storage
- [ ] Document verification
- [ ] PDF generation (certificates, receipts)
- [ ] Document retrieval & download
- [ ] Template management
- [ ] Unit tests
- [ ] API documentation

---

## Completion Order (Recommended)

```
1. Authentication  ──►  2. Payment  ──►  3-6. Service Modules (parallel)
                                              │
                                              ├── Electricity
                                              ├── Gas
                                              ├── Water
                                              └── Municipal
                                                    │
                                              7. Admin Dashboard
                                              8. Notifications
                                              9. Security & Audit
                                             10. Hardware Integration
                                             11. Document Service
```

> **Note**: Authentication must be completed first as all other services depend on it for user verification and route protection.
