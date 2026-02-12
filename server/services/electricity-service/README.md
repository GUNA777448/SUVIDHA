# Electricity Service

Electricity bill management microservice for the SUVIDHA platform.

## Features

- Electricity connection management
- Bill generation and tracking
- Bill payment status updates
- Consumer number-based queries
- Meter reading management

## API Endpoints

### Bills

- `GET /api/v1/electricity/bills` - Get all bills for user
- `GET /api/v1/electricity/bills/:billNumber` - Get bill by number
- `GET /api/v1/electricity/bills/consumer/:consumerNumber` - Get bills by consumer number
- `POST /api/v1/electricity/bills/generate` - Generate new bill
- `PATCH /api/v1/electricity/bills/:billId/status` - Update bill status

### Connections

- `GET /api/v1/electricity/connections` - Get all connections for user
- `GET /api/v1/electricity/connections/:connectionId` - Get connection details
- `POST /api/v1/electricity/connections` - Create new connection
- `PATCH /api/v1/electricity/connections/:connectionId` - Update connection

## Running the Service

```bash
npm install
npm run dev
```
