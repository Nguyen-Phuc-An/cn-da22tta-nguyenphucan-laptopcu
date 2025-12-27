# Build and run Docker containers on Windows

Write-Host "🐳 Building Docker images..." -ForegroundColor Cyan
docker-compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🚀 Starting services..." -ForegroundColor Green
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Access points:" -ForegroundColor Cyan
    Write-Host "  - Backend:  http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor Yellow
    Write-Host "  - MySQL:    localhost:3307 (user`=user, pass`=password123)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Useful commands:" -ForegroundColor Cyan
    Write-Host "  - View logs:     docker-compose logs -f" -ForegroundColor Gray
    Write-Host "  - View backend:  docker-compose logs -f backend" -ForegroundColor Gray
    Write-Host "  - View frontend: docker-compose logs -f frontend" -ForegroundColor Gray
    Write-Host "  - Stop services: docker-compose down" -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}
