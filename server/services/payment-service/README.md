# Payment Service

Payment processing microservice for the SUVIDHA platform.

## Features

- Multi-gateway payment integration (Razorpay, PayTM, PhonePe, etc.)
- Payment initiation and verification
- Transaction tracking
- Refund processing
- Payment history
- Bill status updates

## API Endpoints

- `POST /api/v1/payments/initiate` - Initiate payment
- `GET /api/v1/payments/verify/:transactionId` - Verify payment
- `GET /api/v1/payments` - Get all payments for user
- `GET /api/v1/payments/:paymentId` - Get payment details
- `PATCH /api/v1/payments/:paymentId/status` - Update payment status
- `POST /api/v1/payments/:paymentId/refund` - Initiate refund

## Running the Service

```bash
npm install
npm run dev
```
