const express = require('express');
const router = express.Router();
const telemetryStore = require('../telemetryStore');

const startTime = Date.now();

/**
 * GET /api/health
 * Returns server health, uptime, and system status
 */
router.get('/', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  const memory = process.memoryUsage();

  res.json({
    status: 'ONLINE',
    service: 'RAKSHAROVER Tactical Telemetry API',
    version: '1.0.0',
    uptimeSeconds,
    serverTime: new Date().toISOString(),
    metrics: {
      memoryRssMb: Math.round(memory.rss / (1024 * 1024) * 10) / 10,
      memoryHeapUsedMb: Math.round(memory.heapUsed / (1024 * 1024) * 10) / 10,
      threatLevel: telemetryStore.vitals.threatLevel,
      emergencyActive: telemetryStore.emergency.active,
      roverStatus: telemetryStore.rover.status
    }
  });
});

module.exports = router;
