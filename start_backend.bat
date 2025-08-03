@echo off
echo Starting Project AIDR Backend...

REM Start database
echo Starting PostgreSQL database...
docker-compose up -d

REM Wait for database to be ready
echo Waiting for database to be ready...
timeout /t 10

REM Setup backend environment
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Running database migrations...
alembic upgrade head

echo Starting FastAPI server...
start "AIDR API" uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

echo Backend started! API running at http://localhost:8000
echo.
echo Press any key to start AI agents...
pause

echo Starting AI Agents...
start "Social Media Agent" python -m agents.social_media_agent
start "Damage Assessment Agent" python -m agents.damage_assessment_agent  
start "Resource Planning Agent" python -m agents.resource_planning_agent

echo.
echo ✅ All backend services started!
echo 📊 API: http://localhost:8000
echo 📊 API Docs: http://localhost:8000/docs
echo.
pause