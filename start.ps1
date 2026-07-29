Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  3D by SD Studio — Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Starting API server (port 5001) + Vite frontend (port 3000)" -ForegroundColor Yellow
Write-Host ""

npx concurrently -n api,web -c blue,green "npm run server" "npm run dev"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n Failed to start. Make sure you've run: npm install" -ForegroundColor Red
    Read-Host "Press Enter to exit"
}
