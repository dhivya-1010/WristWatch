const express = require('express');
const router = express.Router();
const telemetryStore = require('../telemetryStore');

/**
 * GET /api/telemetry
 * Returns current physiological & tactical telemetry
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      vitals: telemetryStore.vitals,
      gps: telemetryStore.gps,
      rover: telemetryStore.rover,
      threatLevel: telemetryStore.vitals.threatLevel,
      threatDetails: telemetryStore.vitals.threatDetails
    }
  });
});

/**
 * POST /api/telemetry
 * Ingests live telemetry readings from ESP32-C3 wearable or simulator
 * Body: { heartRate, spo2, temperature, fallDetected, motion, batteryLevel, gps }
 */
router.post('/', (req, res) => {
  const result = telemetryStore.updateVitals(req.body);

  res.json({
    success: true,
    message: 'Telemetry packet ingested successfully',
    data: result
  });
});

/**
 * GET /api/telemetry/history
 * Returns rolling vitals trend data for sparklines & telemetry analysis
 */
router.get('/history', (req, res) => {
  res.json({
    success: true,
    data: telemetryStore.vitalsHistory
  });
});

/**
 * POST /api/telemetry/reset
 * Resets vitals to baseline standard safe metrics
 */
router.post('/reset', (req, res) => {
  const result = telemetryStore.updateVitals({
    heartRate: 82,
    spo2: 97,
    temperature: 36.7,
    fallDetected: false,
    motion: 'NORMAL',
    batteryLevel: 88
  });

  res.json({
    success: true,
    message: 'Vitals reset to baseline safe state',
    data: result
  });
});

module.exports = router;
