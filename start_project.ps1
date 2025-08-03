Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 PROJECT AIDR STARTUP SCRIPT" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop and make sure it's running." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    node --version | Out-Null
    Write-Host "✅ Node.js is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Python is installed
try {
    python --version | Out-Null
    Write-Host "✅ Python is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed!" -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from https://python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📋 Starting services in order:" -ForegroundColor Yellow
Write-Host "1. Database (PostgreSQL + PostGIS)" -ForegroundColor White
Write-Host "2. Backend API (FastAPI)" -ForegroundColor White
Write-Host "3. AI Agents" -ForegroundColor White
Write-Host "4. Frontend Dashboard (React)" -ForegroundColor White
Write-Host ""

# Start database
Write-Host "🗄️ Starting database..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start backend in new window
Write-Host "🔧 Starting backend services..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start_backend.ps1"

Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start frontend in new window
Write-Host "🌐 Starting frontend dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", ".\start_frontend.ps1"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ PROJECT AIDR STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 API Documentation: http://localhost:8000/docs" -ForegroundColor White
Write-Host "🌐 Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "🗄️ Database: postgresql://aidr_user:aidr_password@localhost:5432/aidr_db" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173 to see the dashboard" -ForegroundColor White
Write-Host "2. Watch the AI agents working in real-time" -ForegroundColor White
Write-Host "3. Check the API at http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"