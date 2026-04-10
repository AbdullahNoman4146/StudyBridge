FROM php:8.2-cli

# Build arguments from Railway variables
ARG APP_NAME
ARG APP_ENV
ARG APP_KEY
ARG APP_DEBUG
ARG APP_URL
ARG FRONTEND_URL
ARG LOG_LEVEL
ARG DB_CONNECTION
ARG DB_HOST
ARG DB_PORT
ARG DB_DATABASE
ARG DB_USERNAME
ARG DB_PASSWORD
ARG JWT_SECRET
ARG PORT=8080

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions needed by Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy backend and frontend
COPY server/ /app
COPY client/ /app/client

# Set working directory
WORKDIR /app

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Create Laravel .env from Railway variables
RUN touch .env && \
    echo "APP_NAME=${APP_NAME}" >> .env && \
    echo "APP_ENV=${APP_ENV}" >> .env && \
    echo "APP_KEY=${APP_KEY}" >> .env && \
    echo "APP_DEBUG=${APP_DEBUG}" >> .env && \
    echo "APP_URL=${APP_URL}" >> .env && \
    echo "FRONTEND_URL=${FRONTEND_URL}" >> .env && \
    echo "LOG_LEVEL=${LOG_LEVEL}" >> .env && \
    echo "DB_CONNECTION=${DB_CONNECTION}" >> .env && \
    echo "DB_HOST=${DB_HOST}" >> .env && \
    echo "DB_PORT=${DB_PORT}" >> .env && \
    echo "DB_DATABASE=${DB_DATABASE}" >> .env && \
    echo "DB_USERNAME=${DB_USERNAME}" >> .env && \
    echo "DB_PASSWORD=${DB_PASSWORD}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env

# Build frontend
RUN cd client && npm ci && npm run build

# Copy built frontend into Laravel public folder
RUN cp -r /app/client/dist/* /app/public/

# Make Laravel writable folders
RUN mkdir -p storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 8080

CMD ["sh", "-lc", "php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]