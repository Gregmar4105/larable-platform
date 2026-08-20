# Stage 1: Build frontend assets (requires PHP for @laravel/vite-plugin-wayfinder)
FROM php:8.4-fpm-alpine AS assets-builder

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

RUN apk add --no-cache nodejs npm git

# Install required PHP extensions for Artisan / Wayfinder to boot
RUN install-php-extensions pdo_sqlite pdo_mysql bcmath zip gd intl mbstring

WORKDIR /app

# Copy dependency definition files
COPY package*.json composer.json composer.lock ./

# Install Composer dependencies (required for artisan wayfinder:generate)
RUN composer install --no-dev --no-scripts --no-interaction

# Copy full application code
COPY . .

# Dump autoloader so Laravel artisan command boots cleanly
RUN composer dump-autoload --optimize

# Install NPM packages and build assets
RUN npm ci
RUN npm run build

# Stage 2: Production Application Runtime
FROM php:8.4-fpm-alpine AS app

# Install system dependencies & PHP extensions helper
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

RUN apk add --no-cache \
    nginx \
    supervisor \
    gettext \
    curl \
    bash

RUN install-php-extensions \
    pdo_mysql \
    pdo_pgsql \
    pdo_sqlite \
    bcmath \
    opcache \
    zip \
    gd \
    intl \
    mbstring

WORKDIR /var/www/html

# Copy application code
COPY . /var/www/html

# Copy built frontend assets from Stage 1
COPY --from=assets-builder /app/public/build /var/www/html/public/build

# Install production Composer dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Production OPcache configuration
RUN { \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=8'; \
    echo 'opcache.max_accelerated_files=10000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'opcache.enable_cli=1'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

# Copy Nginx, Supervisor, and Entrypoint scripts
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && \
    mkdir -p /var/log/supervisor /etc/nginx/conf.d

EXPOSE 10000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
