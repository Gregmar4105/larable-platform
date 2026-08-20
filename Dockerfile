# Stage 1: Build frontend assets using Node
FROM node:22-alpine AS assets-builder
WORKDIR /app

COPY package*.json vite.config.ts tsconfig.json ./
RUN npm ci

COPY resources/ ./resources/
COPY public/ ./public/
COPY components.json ./components.json

RUN npm run build

# Stage 2: PHP Application Runtime
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
