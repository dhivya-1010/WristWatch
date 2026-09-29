const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const healthRouter = require('./routes/health');
const telemetryRouter = require('./routes/telemetry');
const emergencyRouter = require('./routes/emergency');
const roverRouter = require('./routes/rover');
const setupWebSocketServer = require('./websocket');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const SERVE_FRONTEND = process.env.SERVE_FRONTEND === 'true' || process.env.NODE_ENV === 'production';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    const timestamp = new Date().toISOString().substring(11, 19);
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/rover', roverRouter);

// Root API Welcome / Discovery endpoint
app.get('/api', (req, res) => {
  res.json({
    system: 'RAKSHAROVER Tactical Telemetry API Gateway',
    version: '1.0.0',
    status: 'OPERATIONAL',
    endpoints: {
      health: '/api/health',
      telemetry: '/api/telemetry',
      telemetryHistory: '/api/telemetry/history',
      emergencyStatus: '/api/emergency/status',
      emergencySos: 'POST /api/emergency/sos',
      emergencyCancel: 'POST /api/emergency/cancel',
      emergencyIncidents: '/api/emergency/incidents',
      rover: '/api/rover',
      roverDispatch: 'POST /api/rover/dispatch',
      roverPing: 'POST /api/rover/ping',
      websocket: 'ws://<host>:<port>/ws'
    }
  });
});

// Optional Static Frontend Serving (for Unified Single-Service Deployment)
const frontendPath = path.resolve(__dirname, '../../frontend');
if (SERVE_FRONTEND) {
  console.log(`[HTTP] Serving static frontend from: ${frontendPath}`);
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    // Only route non-API requests to index.html
    if (!req.url.startsWith('/api') && !req.url.startsWith('/ws')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  });
} else {
  // If static frontend is not served, root returns API status info
  app.get('/', (req, res) => {
    res.json({
      system: 'RAKSHAROVER Tactical Wearable Telemetry Gateway',
      version: '1.0.0',
      status: 'OPERATIONAL',
      hint: 'Frontend is running separately. Access API under /api or connect via /ws WebSocket.'
    });
  });
}

// Setup WebSocket Server
const { broadcast } = setupWebSocketServer(server);

// Start HTTP & WS Server
server.listen(PORT, '0.0.0.0', () => {
  console.log('================================================================');
  console.log('  RAKSHAROVER™ TACTICAL TELEMETRY GATEWAY & ROVER CONTROLLER    ');
  console.log('================================================================');
  console.log(`  🚀 REST API Server  : http://localhost:${PORT}`);
  console.log(`  ⚡ WebSocket Server : ws://localhost:${PORT}/ws`);
  console.log(`  🩺 Health Check     : http://localhost:${PORT}/api/health`);
  console.log(`  🌐 Frontend Serving : ${SERVE_FRONTEND ? 'ENABLED (' + frontendPath + ')' : 'SEPARATE (PORT 3000 / Static)'}`);
  console.log('================================================================');
});

// Graceful shutdown handling
function handleShutdown(signal) {
  console.log(`\n[SYSTEM] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[SYSTEM] HTTP and WebSocket servers closed. Exiting process.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = { app, server };
