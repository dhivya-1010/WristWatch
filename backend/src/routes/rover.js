const express = require('express');
const router = express.Router();
const telemetryStore = require('../telemetryStore');

/**
 * GET /api/rover
 * Returns autonomous rover telemetry, link quality & spatial coordinates
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: telemetryStore.rover
  });
});

/**
 * POST /api/rover/dispatch
 * Manually commands RAKSHA-01 ground rover to deploy
 */
router.post('/dispatch', (req, res) => {
  telemetryStore.rover.status = 'DISPATCHED';
  telemetryStore.rover.lastAckTimestamp = new Date().toISOString();
  telemetryStore._startRoverSimulation();

  res.json({
    success: true,
    message: 'RAKSHA-01 dispatch command acknowledged',
    data: telemetryStore.rover
  });
});

/**
 * POST /api/rover/reset
 * Resets rover state back to standby tracking
 */
router.post('/reset', (req, res) => {
  telemetryStore.rover.status = 'STANDBY_TRACKING';
  telemetryStore.rover.distanceMeters = 185;
  telemetryStore.rover.etaSeconds = 225;
  telemetryStore._stopRoverSimulation();

  res.json({
    success: true,
    message: 'RAKSHA-01 reset to standby tracking mode',
    data: telemetryStore.rover
  });
});

/**
 * POST /api/rover/ping
 * Heartbeat/ping check to simulate LoRa RF telemetry round-trip
 */
router.post('/ping', (req, res) => {
  telemetryStore.rover.lastAckTimestamp = new Date().toISOString();

  res.json({
    success: true,
    data: {
      ack: true,
      rssi: telemetryStore.rover.rssi,
      snr: telemetryStore.rover.snr,
      timestamp: telemetryStore.rover.lastAckTimestamp
    }
  });
});

module.exports = router;
