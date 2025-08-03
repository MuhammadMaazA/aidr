@echo off
echo Starting Project AIDR Frontend...

cd frontend

if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo Starting development server...
npm run dev

echo.
echo ✅ Frontend started! 
echo 🌐 Dashboard: http://localhost:5173
echo.
pause