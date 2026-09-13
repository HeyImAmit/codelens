# =======================================================
# CodeLens Backend & Worker Production Dockerfile
# =======================================================

FROM node:20-alpine

# Install Docker CLI to enable sandbox execution inside worker
RUN apk add --no-cache docker-cli

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and scripts
COPY . .

EXPOSE 5000

# Default command starts the API server (override with 'npm run worker' for worker container)
CMD ["npm", "start"]
