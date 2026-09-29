# Production Node.js container for RAKSHAROVER Backend API & WebSocket Gateway
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first for optimal Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/

# Expose API and WebSocket port
EXPOSE 5000

# Run server
CMD ["node", "src/server.js"]
