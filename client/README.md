# SUVIDHA Kiosk - Frontend Client

React-based frontend application for the SUVIDHA government services kiosk.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── auth/          # Authentication (Developer G)
│   ├── electricity/   # Electricity services (Developer A)
│   ├── gas/           # Gas services (Developer B)
│   ├── water/         # Water services (Developer C)
│   ├── municipal/     # Municipal services (Developer D)
│   ├── payment/       # Payment integration (Developer E)
│   ├── admin/         # Admin dashboard (Developer F)
│   ├── security/      # Security features (Developer I)
│   ├── hardware/      # Hardware integration (Developer J)
│   └── offline/       # Offline support
│
├── shared/            # Shared components & utilities
│   ├── components/    # Reusable UI components
│   ├── layouts/       # Layout components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   └── accessibility/ # Accessibility components
│
├── config/            # Configuration
│   └── env/          # Environment-specific configs
│
├── routes/           # Routing configuration
├── __tests__/        # Test files
├── App.jsx           # Root component
└── main.jsx          # Entry point
```

## 🎨 Features

### Multi-Language Support

Currently supports:

- English (en)
- Hindi (hi)
- Tamil (ta)

Translation files located in `public/locales/`

### Offline Support

- LocalStorage for offline data
- Queue management for offline transactions
- Auto-sync when online

### Accessibility

- Screen reader support
- High contrast mode
- Voice commands
- Keyboard navigation

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📝 Development Guidelines

### Creating a New Feature

1. Create feature directory in `src/features/your-feature/`
2. Follow the structure:
   ```
   your-feature/
   ├── components/
   ├── hooks/
   ├── services/
   ├── index.js
   └── README.md
   ```

### Component Guidelines

- Use functional components with hooks
- Implement PropTypes for all components
- Follow naming conventions (PascalCase for components)
- Keep components small and focused

### Example Component

```jsx
import React from "react";
import PropTypes from "prop-types";

const MyComponent = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default MyComponent;
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## 🌐 API Integration

API calls are proxied through Vite dev server to `http://localhost:8000`

### Example API Call

```javascript
import axios from "axios";

const getData = async () => {
  try {
    const response = await axios.get("/api/service/endpoint");
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
```

## 📦 Build & Deployment

```bash
# Production build
npm run build

# Output will be in `dist/` directory
```

## 🤝 Contributing

See [TEAM_ASSIGNMENTS.md](../TEAM_ASSIGNMENTS.md) for developer assignments and responsibilities.

## 📞 Support

- Frontend Lead: Developer F
- Email: dev-f@suvidha.gov.in
- Slack: #suvidha-frontend
