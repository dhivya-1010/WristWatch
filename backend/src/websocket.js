const WebSocket = require('ws');
const telemetryStore = require('./telemetryStore');

/**
 * Tactical WebSocket Gateway
 * Provides bidirectional real-time telemetry streaming between wearable smartwatches,
 * ground rovers, and incident command centers.
 */
function setupWebSocketServer(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer, path: '/ws' });

  // Broadcast helper
  function broadcast(type, data) {
    const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(payload);
        } catch (err) {
          console.error('[WS] Broadcast send error:', err.message);
        }
      }
    });
  }

  // Hook into telemetryStore events
  telemetryStore.on('telemetry_update', data => {
    broadcast('TELEMETRY_UPDATE', data);
  });

  telemetryStore.on('emergency_triggered', emergency => {
    broadcast('EMERGENCY_TRIGGERED', emergency);
  });

  telemetryStore.on('emergency_cancelled', event => {
    broadcast('EMERGENCY_CANCELLED', event);
  });

  telemetryStore.on('rover_update', rover => {
    broadcast('ROVER_UPDATE', rover);
  });

  // Client connection handler
  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`[WS] Client connected from ${clientIp}. Total active clients: ${wss.clients.size}`);

    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    // Send complete initial snapshot
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      data: telemetryStore.getSummary(),
      timestamp: new Date().toISOString()
    }));

    // Handle messages from client
    ws.on('message', message => {
      try {
        const parsed = JSON.parse(message.toString());
        const { type, payload } = parsed;

        switch (type) {
          case 'TELEMETRY_INJECT':
          case 'TELEMETRY_UPDATE':
            if (payload) {
              telemetryStore.updateVitals(payload);
            }
            break;

          case 'SOS_TRIGGER':
            telemetryStore.triggerEmergency(payload || { triggerType: 'MANUAL_SOS' });
            break;

          case 'EMERGENCY_CANCEL':
            telemetryStore.cancelEmergency(payload ? payload.reason : undefined);
            break;

          case 'PING':
            ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
            break;

          default:
            console.log('[WS] Unknown message type:', type);
        }
      } catch (err) {
        console.error('[WS] Error parsing incoming client message:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] Client disconnected. Total active clients: ${wss.clients.size}`);
    });

    ws.on('error', err => {
      console.error('[WS] Client error:', err.message);
    });
  });

  // Keep-alive heartbeat interval (every 30 seconds)
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return { wss, broadcast };
}

module.exports = setupWebSocketServer;
