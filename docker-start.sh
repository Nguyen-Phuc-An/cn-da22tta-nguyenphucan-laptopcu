#!/bin/bash
# Build and run Docker containers

echo "🐳 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "✅ Services started:"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo "  - MySQL: localhost:3307"
echo ""
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
