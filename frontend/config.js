/**
 * RAKSHAROVER™ Tactical Telemetry - Frontend Environment Configuration
 * Auto-detects local backend vs remote production server.
 * Can be overridden via URL query parameter:
 *   ?api=https://your-backend.onrender.com
 *   ?ws=wss://your-backend.onrender.com/ws
 */

(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '0.0.0.0';

  // Configured or auto-detected API host
  const defaultApiHost = isLocal ? 'http://localhost:5000' : window.location.origin;
  const defaultWsHost = isLocal
    ? 'ws://localhost:5000/ws'
    : (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';

  const apiBase = urlParams.get('api') || defaultApiHost;
  let wsBase = urlParams.get('ws');

  if (!wsBase) {
    if (apiBase.startsWith('http://localhost') || apiBase.startsWith('http://127.0.0.1')) {
      wsBase = apiBase.replace('http', 'ws') + '/ws';
    } else if (apiBase.startsWith('https://')) {
      wsBase = apiBase.replace('https://', 'wss://') + '/ws';
    } else if (apiBase.startsWith('http://')) {
      wsBase = apiBase.replace('http://', 'ws://') + '/ws';
    } else {
      wsBase = defaultWsHost;
    }
  }

  window.__CONFIG__ = {
    API_URL: apiBase.replace(/\/$/, ''),
    WS_URL: wsBase,
    IS_LOCAL: isLocal,
    VERSION: '1.0.0',
    LORA_FREQ_MHZ: 868.1,
    ROVER_ID: 'RAKSHA-01'
  };

  console.log('[CONFIG] Tactical Telemetry Gateway initialized:');
  console.log('  → REST API  :', window.__CONFIG__.API_URL);
  console.log('  → WebSocket :', window.__CONFIG__.WS_URL);
})();
