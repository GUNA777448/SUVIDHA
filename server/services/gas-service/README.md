# Gas Service

LPG gas connection and cylinder booking management microservice for the SUVIDHA platform.

## Features

### 🔌 Gas Connection Management

- New gas connection applications
- Connection status tracking
- Connection transfer requests
- Consumer profile management
- Safety inspection tracking

### 💰 Billing System

- Gas bill generation and management
- Bill inquiry by consumer number
- Payment status tracking
- Subsidized billing support
- Bill history and analytics

### 🛢️ LPG Cylinder Booking

- Online cylinder booking system
- Real-time delivery tracking
- Multiple cylinder types (5kg, 14.2kg, 19kg, 47.5kg)
- Subsidized and non-subsidized options
- Delivery scheduling and management

### 📞 Customer Support

- Complaint registration and tracking
- Multi-category complaint handling
- Auto-escalation for priority issues
- Satisfaction rating system
- Resolution timeline tracking

## API Endpoints

### Gas Connections

| Method | Endpoint                                           | Description                       |
| ------ | -------------------------------------------------- | --------------------------------- |
| GET    | `/api/v1/gas/connections`                          | Get all connections for user      |
| GET    | `/api/v1/gas/connections/:id`                      | Get connection by ID              |
| GET    | `/api/v1/gas/connections/consumer/:consumerNumber` | Get connection by consumer number |
| POST   | `/api/v1/gas/connections`                          | Create new connection             |
| PATCH  | `/api/v1/gas/connections/:id`                      | Update connection                 |
| POST   | `/api/v1/gas/connections/:id/transfer`             | Request connection transfer       |
| DELETE | `/api/v1/gas/connections/:id`                      | Deactivate connection             |

### Gas Bills

| Method | Endpoint                                                     | Description                  |
| ------ | ------------------------------------------------------------ | ---------------------------- |
| GET    | `/api/v1/gas/bills`                                          | Get all bills for user       |
| GET    | `/api/v1/gas/bills/:id`                                      | Get bill by ID               |
| GET    | `/api/v1/gas/bills/consumer/:consumerNumber`                 | Get bills by consumer number |
| GET    | `/api/v1/gas/bills/consumer/:consumerNumber/payment-history` | Get payment history          |
| GET    | `/api/v1/gas/bills/connection/:connectionId/pending`         | Get pending bills            |
| POST   | `/api/v1/gas/bills/generate`                                 | Generate new bill (Admin)    |
| PATCH  | `/api/v1/gas/bills/:id/status`                               | Update bill payment status   |

### Cylinder Bookings

| Method | Endpoint                                    | Description                 |
| ------ | ------------------------------------------- | --------------------------- |
| GET    | `/api/v1/gas/bookings`                      | Get all bookings for user   |
| GET    | `/api/v1/gas/bookings/:id`                  | Get booking by ID           |
| GET    | `/api/v1/gas/bookings/track/:bookingNumber` | Track booking (Public)      |
| POST   | `/api/v1/gas/bookings`                      | Create new cylinder booking |
| PATCH  | `/api/v1/gas/bookings/:id/status`           | Update booking status       |
| POST   | `/api/v1/gas/bookings/:id/cancel`           | Cancel cylinder booking     |
| POST   | `/api/v1/gas/bookings/:id/rate`             | Rate delivery service       |

### Complaints

| Method | Endpoint                              | Description                      |
| ------ | ------------------------------------- | -------------------------------- |
| GET    | `/api/v1/gas/complaints`              | Get all complaints for user      |
| GET    | `/api/v1/gas/complaints/stats`        | Get complaint statistics (Admin) |
| GET    | `/api/v1/gas/complaints/:id`          | Get complaint by ID              |
| POST   | `/api/v1/gas/complaints`              | Create new complaint             |
| PATCH  | `/api/v1/gas/complaints/:id`          | Update complaint (Staff)         |
| POST   | `/api/v1/gas/complaints/:id/comment`  | Add comment to complaint         |
| POST   | `/api/v1/gas/complaints/:id/escalate` | Escalate complaint               |
| POST   | `/api/v1/gas/complaints/:id/rate`     | Rate complaint resolution        |

## Data Models

### Gas Connection

- User and connection details
- Gas agency information
- Consumer number generation
- Safety inspection tracking
- Status management (Active, Inactive, Suspended, etc.)

### Gas Bill

- Connection-based billing
- Multiple bill types (Monthly, Cylinder, Pipeline, etc.)
- Subsidy calculation
- Payment tracking
- Due date management

### Cylinder Booking

- Multi-capacity cylinder support
- Pricing calculation with subsidies
- Delivery tracking and management
- OTP-based delivery verification
- Customer rating system

### Complaint

- Multi-category complaint handling
- Priority-based processing
- Auto-escalation rules
- Timeline tracking
- Resolution management

## Business Rules

### Subsidized Cylinders

- Maximum 1 subsidized cylinder per month
- Maximum 12 subsidized cylinders per year
- 30% subsidy on base price
- Aadhaar linking required

### Booking Limits

- Maximum 12 cylinders per booking
- No pending bookings allowed while placing new order
- Urgent delivery available with premium charges

### Complaint Escalation

- High priority complaints auto-escalate after 24 hours
- Critical safety issues get immediate high priority
- Customer satisfaction tracking post-resolution

## Installation & Setup

1. **Clone and navigate to service directory**

   ```bash
   cd server/services/gas-service
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the service**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

5. **Health check**
   ```bash
   curl http://localhost:3003/health
   ```

## Environment Variables

Key environment variables to configure:

- `PORT`: Service port (default: 3003)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT token secret
- `AUTH_SERVICE_URL`: Authentication service URL
- `PAYMENT_SERVICE_URL`: Payment service URL

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **joi**: Input validation
- **jsonwebtoken**: JWT handling
- **axios**: HTTP client for service communication
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **morgan**: HTTP logging

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Development Notes

### Service Integration

- Integrates with auth-service for authentication
- Connects to payment-service for bill payments
- Uses notification-service for alerts (optional)

### Security Features

- JWT-based authentication
- Input validation with Joi
- Rate limiting protection
- Secure headers with Helmet

### Database Design

- Efficient indexing for quick queries
- Optimized for consumer number lookups
- Timeline tracking for audit trails
- Soft delete support

## Production Deployment

1. **Docker deployment**

   ```bash
   docker build -t suvidha-gas-service .
   docker run -p 3003:3003 --env-file .env suvidha-gas-service
   ```

2. **Kubernetes deployment**

   ```bash
   kubectl apply -f k8s/gas-service.yaml
   ```

3. **Health monitoring**
   - Health endpoint: `/health`
   - Service metrics: Monitor MongoDB connections, response times
   - Error logging: Centralized logging setup recommended

## API Documentation

Start the service and visit the health endpoint for service status. Full API documentation can be generated using tools like Swagger/OpenAPI.

## Support & Maintenance

- Monitor complaint response times
- Track cylinder delivery performance
- Regular database maintenance for optimal performance
- Update pricing configurations as per government regulations
