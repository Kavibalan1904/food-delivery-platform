# ===== Stage 1: Build React Production Assets =====
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies (cached if package files don't change)
COPY package*.json ./
RUN npm install

# Build static bundle with Vite
COPY . .
RUN npm run build

# ===== Stage 2: Serve with Lightweight Nginx Alpine (~25MB) =====
FROM nginx:alpine

# Copy compiled static assets from Stage 1 into Nginx HTML folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom reverse proxy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
