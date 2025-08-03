Write-Host "Starting Project AIDR Backend..." -ForegroundColor Cyan

Set-Location backend

# Create virtual environment if it doesn't exist
if (!(Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "Running database migrations..." -ForegroundColor Yellow
alembic upgrade head

Write-Host "Starting FastAPI server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

Write-Host "Backend started! API running at http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to start AI agents..." -ForegroundColor Yellow
Read-Host

Write-Host "Starting AI Agents..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m agents.social_media_agent"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m agents.damage_assessment_agent"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m agents.resource_planning_agent"

Write-Host ""
Write-Host "✅ All backend services started!" -ForegroundColor Green
Write-Host "📊 API: http://localhost:8000" -ForegroundColor White
Write-Host "📊 API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"