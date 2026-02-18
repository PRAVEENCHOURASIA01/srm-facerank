#!/bin/bash
set -e

echo "🚀 Starting SRM FaceRank backend..."

# Activate virtual environment if it exists
if [ -d "venv" ]; then
  source venv/bin/activate
fi

# Run migrations
echo "📦 Running database migrations..."
alembic upgrade head

# Start server
echo "✅ Starting Uvicorn on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000