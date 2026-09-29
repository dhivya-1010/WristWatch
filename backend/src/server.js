const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
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

// Robust Static Frontend Serving & Graceful Fallback
// Candidate paths to search for index.html:
const candidatePaths = [
  path.resolve(__dirname, '../public'),
  path.resolve(__dirname, '../../frontend'),
  path.resolve(__dirname, '../frontend'),
  path.resolve(process.cwd(), 'public'),
  path.resolve(process.cwd(), 'frontend')
];

let validFrontendPath = null;
for (const cand of candidatePaths) {
  if (fs.existsSync(path.join(cand, 'index.html'))) {
    validFrontendPath = cand;
    break;
  }
}

// Only serve frontend if index.html actually exists AND SERVE_FRONTEND is not explicitly false
const shouldServeFrontend = process.env.SERVE_FRONTEND !== 'false' && validFrontendPath !== null;

if (shouldServeFrontend) {
  console.log(`[HTTP] Serving static frontend from: ${validFrontendPath}`);
  app.use(express.static(validFrontendPath));

  app.get('*', (req, res) => {
    // Only route non-API requests to index.html
    if (!req.url.startsWith('/api') && !req.url.startsWith('/ws')) {
      res.sendFile(path.join(validFrontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint not found' });
    }
  });
} else {
  console.log('[HTTP] Operating in Pure API Gateway mode (Frontend served separately or not bundled)');

  const apiStatusHandler = (req, res) => {
    res.status(200).json({
      system: 'RAKSHAROVER™ Tactical Wearable Telemetry Gateway',
      version: '1.0.0',
      status: 'OPERATIONAL',
      mode: 'STANDALONE_API_GATEWAY',
      serverTime: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        telemetry: '/api/telemetry',
        telemetryHistory: '/api/telemetry/history',
        emergency: '/api/emergency/status',
        emergencySos: 'POST /api/emergency/sos',
        emergencyCancel: 'POST /api/emergency/cancel',
        rover: '/api/rover',
        websocket: '/ws'
      },
      message: 'Backend REST API & WebSocket server is running. Connect your frontend via WebSocket or REST.'
    });
  };

  app.get('/', apiStatusHandler);
  app.head('/', (req, res) => res.status(200).end());
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
  console.log(`  🌐 Frontend Serving : ${shouldServeFrontend ? 'ENABLED (' + validFrontendPath + ')' : 'PURE API GATEWAY'}`);
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
