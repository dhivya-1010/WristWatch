const express = require('express');
const router = express.Router();
const telemetryStore = require('../telemetryStore');

/**
 * GET /api/emergency/status
 * Returns active emergency state
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: telemetryStore.emergency
  });
});

/**
 * POST /api/emergency/sos
 * Triggers tactical emergency protocol, broadcasts alert, and dispatches RAKSHA-01
 * Body: { triggerType: 'MANUAL_SOS' | 'THRESHOLD_ESCALATION' | 'FALL_IMPACT', details }
 */
router.post('/sos', (req, res) => {
  const { triggerType = 'MANUAL_SOS', details } = req.body || {};
  const emergency = telemetryStore.triggerEmergency({ triggerType, details });

  res.status(201).json({
    success: true,
    message: 'TACTICAL SOS ACTIVATED: Emergency incident registered, LoRa uplink triggered, Rover dispatched',
    data: emergency
  });
});

/**
 * POST /api/emergency/cancel
 * Cancels or resolves active emergency incident
 * Body: { reason }
 */
router.post('/cancel', (req, res) => {
  const { reason = 'Operator Manual Deactivation' } = req.body || {};
  const result = telemetryStore.cancelEmergency(reason);

  res.json({
    success: true,
    message: 'Emergency state cancelled',
    data: result
  });
});

/**
 * GET /api/emergency/incidents
 * Returns incident history log
 */
router.get('/incidents', (req, res) => {
  res.json({
    success: true,
    count: telemetryStore.incidents.length,
    data: telemetryStore.incidents
  });
});

module.exports = router;
