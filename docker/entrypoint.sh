#!/bin/sh
set -e

echo "🚀 Starting E-Billing Application..."

# Run migrations
echo "📦 Running database migrations..."
php artisan migrate --force

# Cache configuration
echo "⚡ Caching configuration..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
php artisan storage:link 2>/dev/null || true

echo "✅ Application ready!"

# Execute the main command (php-fpm)
exec "$@"
