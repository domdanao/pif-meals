#!/bin/bash

# Laravel Cloud Deployment Script
# This script ensures critical data exists after deployment

echo "🚀 Starting PIF Meals deployment setup..."

# Run migrations (in case there are pending ones)
echo "📊 Running database migrations..."
php artisan migrate --force

# Ensure time slots exist
echo "⏰ Ensuring time slots exist..."
php artisan app:ensure-time-slots

# Cache configuration for performance
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Clear any old caches that might interfere
php artisan cache:clear

echo "✅ Deployment setup complete!"
echo ""
echo "🔍 Verifying setup..."

# Show time slots for verification
echo "Time slots in database:"
php artisan tinker --execute="App\Models\TimeSlot::active()->get()->each(function(\$slot) { echo '- ' . \$slot->display_name . ' (' . \$slot->start_time->format('H:i') . ' - ' . \$slot->end_time->format('H:i') . ')' . PHP_EOL; });"

echo ""
echo "🎉 All systems ready! You can now test:"
echo "- Main page: https://your-app.laravel-cloud.com/"
echo "- Meal request: https://your-app.laravel-cloud.com/students/request-meal"
echo "- Debug API: https://your-app.laravel-cloud.com/debug/time-slots"
