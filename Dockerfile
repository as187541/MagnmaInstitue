# ============================================================
# Dockerfile for Magnma Institute - Frontend (React + Vite)
# ============================================================
# Build context: repository root (monorepo)
# Usage:
#   docker build -t magnma-frontend .
#   docker run -p 80:80 magnma-frontend
# ============================================================

# --- Stage 1: Build the React app ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configuration
COPY package.json tsconfig.json ./

# Copy workspace package manifests (for npm install)
COPY packages/shared/package.json packages/shared/
COPY packages/frontend/package.json packages/frontend/

# Install all dependencies (respects workspaces)
RUN npm install

# Copy source code
COPY packages/shared/ packages/shared/
COPY packages/frontend/ packages/frontend/

# Build the frontend (outputs to packages/frontend/dist)
RUN npm run build -w packages/frontend

# --- Stage 2: Serve with Nginx ---
FROM nginx:stable-alpine

# Copy built static assets
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html

# Copy nginx config for SPA routing (React Router support)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]