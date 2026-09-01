#!/bin/bash
# Database setup script for DocuCraft
# Usage: ./scripts/db-setup.sh [dev|prod]

set -e

ENV=${1:-dev}

echo "🚀 Setting up database for $ENV environment..."

if [ "$ENV" = "prod" ]; then
  echo "📦 Production setup - using PostgreSQL"
  npx prisma migrate deploy
  npx prisma generate
else
  echo "🔧 Development setup - using SQLite"
  npx prisma db push
  npx prisma generate
fi

echo "✅ Database setup complete!"