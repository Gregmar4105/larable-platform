#!/bin/sh
set -e

# Default PORT to 10000 if not specified by Render
export PORT="${PORT:-10000}"

# Substitute PORT in Nginx configuration
if [ -f /etc/nginx/templates/default.conf.template ]; then
    envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Ensure storage and bootstrap directories exist with proper permissions
mkdir -p storage/framework/cache/data \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache \
         database

# Handle SQLite database file creation if using SQLite
if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then
    DB_FILE="${DB_DATABASE:-/var/www/html/database/database.sqlite}"
    if [ ! -f "$DB_FILE" ]; then
        touch "$DB_FILE"
    fi
    chown -R www-data:www-data "$DB_FILE"
fi

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Run Laravel optimizations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations if explicitly enabled
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "Running database migrations..."
    php artisan migrate --force
fi

# Start processes via supervisord
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf
