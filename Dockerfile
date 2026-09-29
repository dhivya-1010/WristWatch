# Unified Full-Stack Container for RAKSHAROVER
# Serves both Frontend UI & Backend API on a single port (ideal for Render/Railway/Fly.io free tiers)
FROM node:22-alpine

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000
ENV SERVE_FRONTEND=true

# Copy backend dependencies and install
COPY backend/package*.json ./backend/
WORKDIR /usr/src/app/backend
RUN npm ci --only=production

# Copy backend and frontend source files
WORKDIR /usr/src/app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

WORKDIR /usr/src/app/backend

EXPOSE 5000

CMD ["node", "src/server.js"]
