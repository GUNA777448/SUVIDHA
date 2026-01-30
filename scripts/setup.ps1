# PowerShell Setup Script for SUVIDHA Project

Write-Host "🚀 SUVIDHA Kiosk - Development Environment Setup" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm >= 9.0.0" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker version: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker is not installed. Docker is recommended for database services." -ForegroundColor Yellow
    Write-Host "   You can install Docker from https://www.docker.com/" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install

# Install client dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Yellow
Set-Location client
npm install
Set-Location ..

# Install service dependencies
Write-Host "Installing service dependencies..." -ForegroundColor Yellow
Get-ChildItem -Path "services" -Directory | ForEach-Object {
    $packageJson = Join-Path $_.FullName "package.json"
    if (Test-Path $packageJson) {
        Write-Host "  → Installing $($_.Name) dependencies..." -ForegroundColor Gray
        Set-Location $_.FullName
        npm install
        Set-Location ../..
    }
}

# Install shared dependencies
$sharedPackage = "shared/package.json"
if (Test-Path $sharedPackage) {
    Write-Host "Installing shared module dependencies..." -ForegroundColor Yellow
    Set-Location shared
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "🔧 Setting up environment files..." -ForegroundColor Cyan
Write-Host ""

# Copy .env.example files
Get-ChildItem -Path "services" -Directory | ForEach-Object {
    $envExample = Join-Path $_.FullName ".env.example"
    $envFile = Join-Path $_.FullName ".env"
    
    if (Test-Path $envExample) {
        if (-not (Test-Path $envFile)) {
            Copy-Item $envExample $envFile
            Write-Host "  ✓ Created services/$($_.Name)/.env" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  services/$($_.Name)/.env already exists, skipping" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🗄️  Database Setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start PostgreSQL and Redis using Docker:"
Write-Host "  docker-compose up -d postgres redis" -ForegroundColor White
Write-Host ""
Write-Host "To run database migrations:"
Write-Host "  npm run db:migrate" -ForegroundColor White
Write-Host ""

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Configure environment variables in services/*/.env files"
Write-Host "2. Start database services: docker-compose up -d postgres redis"
Write-Host "3. Run database migrations: npm run db:migrate"
Write-Host "4. Start development servers: npm run dev"
Write-Host ""
Write-Host "🔗 Useful Commands:" -ForegroundColor Cyan
Write-Host "  npm run dev           - Start all services"
Write-Host "  npm run test          - Run all tests"
Write-Host "  npm run lint          - Lint all code"
Write-Host "  npm run build         - Build all services"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  - Developer Guide: docs/DEVELOPER_GUIDE.md"
Write-Host "  - Team Assignments: TEAM_ASSIGNMENTS.md"
Write-Host "  - Contributing: CONTRIBUTING.md"
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
