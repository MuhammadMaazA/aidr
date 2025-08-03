@echo off
echo ========================================
echo 🚀 PROJECT AIDR STARTUP SCRIPT
echo ========================================
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed or not running!
    echo Please install Docker Desktop and make sure it's running.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

echo ✅ All requirements met!
echo.

echo 📋 Starting services in order:
echo 1. Database (PostgreSQL + PostGIS)
echo 2. Backend API (FastAPI)
echo 3. AI Agents 
echo 4. Frontend Dashboard (React)
echo.

REM Start database
echo 🗄️  Starting database...
docker-compose up -d
if errorlevel 1 (
    echo ❌ Failed to start database!
    pause
    exit /b 1
)

echo ⏳ Waiting for database to be ready...
timeout /t 15 >nul

REM Start backend in new window
echo 🔧 Starting backend services...
start "AIDR Backend" cmd /k start_backend.bat

echo ⏳ Waiting for backend to start...
timeout /t 10 >nul

REM Start frontend in new window  
echo 🌐 Starting frontend dashboard...
start "AIDR Frontend" cmd /k start_frontend.bat

echo.
echo ========================================
echo ✅ PROJECT AIDR STARTUP COMPLETE!
echo ========================================
echo.
echo 📊 API Documentation: http://localhost:8000/docs
echo 🌐 Dashboard: http://localhost:5173
echo 🗄️  Database: postgresql://aidr_user:aidr_password@localhost:5432/aidr_db
echo.
echo 📝 Next steps:
echo 1. Open http://localhost:5173 to see the dashboard
echo 2. Watch the AI agents working in real-time
echo 3. Check the API at http://localhost:8000/docs
echo.
echo Press any key to exit...
pause