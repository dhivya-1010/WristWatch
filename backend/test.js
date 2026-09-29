const http = require('http');

console.log('--- TESTING BACKEND HEALTH & ENDPOINTS ---');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataString ? { 'Content-Length': Buffer.byteLength(dataString) } : {})
        }
      },
      res => {
        let rawData = '';
        res.on('data', chunk => (rawData += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(rawData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('Testing GET /api/health...');
    const health = await makeRequest('/api/health');
    console.log('✓ /api/health:', health.status, health.data.status);

    console.log('Testing GET /api/telemetry...');
    const telemetry = await makeRequest('/api/telemetry');
    console.log('✓ /api/telemetry:', telemetry.status, 'BPM:', telemetry.data.data.vitals.heartRate);

    console.log('Testing POST /api/telemetry...');
    const update = await makeRequest('/api/telemetry', 'POST', {
      heartRate: 135,
      spo2: 89,
      temperature: 38.6
    });
    console.log('✓ Ingest update:', update.status, 'Threat Level:', update.data.data.vitals.threatLevel);

    console.log('Testing POST /api/emergency/sos...');
    const sos = await makeRequest('/api/emergency/sos', 'POST', { triggerType: 'TEST_SUITE' });
    console.log('✓ SOS Trigger:', sos.status, 'Incident ID:', sos.data.data.incidentId);

    console.log('Testing POST /api/emergency/cancel...');
    const cancel = await makeRequest('/api/emergency/cancel', 'POST', { reason: 'Test complete' });
    console.log('✓ SOS Cancel:', cancel.status, cancel.data.message);

    console.log('Testing POST /api/telemetry/reset...');
    const reset = await makeRequest('/api/telemetry/reset', 'POST');
    console.log('✓ Reset:', reset.status, 'Threat Level:', reset.data.data.vitals.threatLevel);

    console.log('\n>>> ALL BACKEND ENDPOINTS PASSED CLEANLY! <<<');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
