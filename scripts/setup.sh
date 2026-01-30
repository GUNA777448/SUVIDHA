#!/bin/bash

# SUVIDHA Project Setup Script
# This script helps set up the complete development environment

echo "🚀 SUVIDHA Kiosk - Development Environment Setup"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm >= 9.0.0"
    exit 1
fi

echo "✓ npm version: $(npm --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Docker is recommended for database services."
    echo "   You can install Docker from https://www.docker.com/"
else
    echo "✓ Docker version: $(docker --version)"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client && npm install && cd ..

# Install service dependencies
echo "Installing service dependencies..."
for service in services/*; do
    if [ -d "$service" ] && [ -f "$service/package.json" ]; then
        echo "  → Installing $(basename $service) dependencies..."
        cd "$service" && npm install && cd ../..
    fi
done

# Install shared dependencies
if [ -f "shared/package.json" ]; then
    echo "Installing shared module dependencies..."
    cd shared && npm install && cd ..
fi

echo ""
echo "🔧 Setting up environment files..."
echo ""

# Copy .env.example files
for service in services/*; do
    if [ -f "$service/.env.example" ]; then
        if [ ! -f "$service/.env" ]; then
            cp "$service/.env.example" "$service/.env"
            echo "  ✓ Created $service/.env"
        else
            echo "  ⚠️  $service/.env already exists, skipping"
        fi
    fi
done

echo ""
echo "🗄️  Database Setup"
echo ""
echo "To start PostgreSQL and Redis using Docker:"
echo "  docker-compose up -d postgres redis"
echo ""
echo "To run database migrations:"
echo "  npm run db:migrate"
echo ""

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Configure environment variables in services/*/.env files"
echo "2. Start database services: docker-compose up -d postgres redis"
echo "3. Run database migrations: npm run db:migrate"
echo "4. Start development servers: npm run dev"
echo ""
echo "🔗 Useful Commands:"
echo "  npm run dev           - Start all services"
echo "  npm run test          - Run all tests"
echo "  npm run lint          - Lint all code"
echo "  npm run build         - Build all services"
echo ""
echo "📚 Documentation:"
echo "  - Developer Guide: docs/DEVELOPER_GUIDE.md"
echo "  - Team Assignments: TEAM_ASSIGNMENTS.md"
echo "  - Contributing: CONTRIBUTING.md"
echo ""
echo "Happy coding! 🎉"
