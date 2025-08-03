Write-Host "Starting Project AIDR Frontend..." -ForegroundColor Cyan

Set-Location frontend

if (!(Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting development server..." -ForegroundColor Yellow
npm run dev

Write-Host ""
Write-Host "✅ Frontend started!" -ForegroundColor Green
Write-Host "🌐 Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"