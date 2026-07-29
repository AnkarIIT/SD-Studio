@echo off
echo ========================================
echo   3D by SD Studio — Development Server
echo ========================================
echo.
echo  Starting API server (port 5001) + Vite frontend (port 3000)
echo.
call npx concurrently -n api,web -c blue,green "npm run server" "npm run dev"
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo  Failed to start. Make sure you've run: npm install
  pause
)
