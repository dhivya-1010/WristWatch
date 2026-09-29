/**
 * RAKSHAROVER TACTICAL SMARTWATCH CONTROLLER & TELEMETRY ENGINE
 * - Dynamic Threshold Detection (Safe, Warning, Critical)
 * - Automatic Alert Escalation & In-Watch Emergency Dispatch
 * - Card State Shifting (Electric Blue -> Amber -> Emergency Red)
 * - Real-time ECG/PPG Waveform Frequency Modulation (sync with BPM)
 * - Interactive Watch Face Touch/Click Hotspots
 * - Web Audio API Tactical Sound Synthesis
 * - 3-Second SOS Push-and-Hold with Radial SVG Progress
 * - Hardware Sensor Presets & LSM6DSOX Fall Impact Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  // Screen definitions
  const SCREEN_NAMES = [
    '01 HOME • VITAL STATUS',
    '02 HEALTH • MONITORING TELEMETRY',
    '03 LOCATION • TACTICAL GNSS',
    '04 SOS • EMERGENCY TRIGGER',
    '05 ROVER LINK • LONG-RANGE TELEMETRY',
    '06 EMERGENCY • CRITICAL INCIDENT'
  ];

  // Current State
  let currentInteractiveScreen = 0;
  let isRuggedCasing = true;
  let isAudioEnabled = true;
  let audioCtx = null;
  let sosHoldTimer = null;
  let sosHoldStartTime = null;
  const SOS_HOLD_DURATION_MS = 3000;
  const RING_CIRCUMFERENCE = 326.7; // 2 * PI * 52

  // Sensor state
  let currentHr = 82;
  let currentSpo2 = 97;
  let currentTemp = 36.7;
  let currentMotion = 'NORMAL';
  let isFallDetected = false;
  let currentThreatLevel = 'SAFE'; // 'SAFE' | 'WARNING' | 'CRITICAL'
  let alertCountdownTimer = null;
  let alertCountdownSeconds = 5;

  // DOM Elements
  const viewModeAllBtn = document.getElementById('viewModeAll');
  const viewModeInteractiveBtn = document.getElementById('viewModeInteractive');
  const screensShowcase = document.getElementById('screensShowcase');
  const interactiveSimulator = document.getElementById('interactiveSimulator');
  const toggleChassisBtn = document.getElementById('toggleChassisBtn');
  const chassisBtnLabel = document.getElementById('chassisBtnLabel');
  const toggleHardwareDrawer = document.getElementById('toggleHardwareDrawer');
  const hardwareDrawer = document.getElementById('hardwareDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const triggerEmergencyDemo = document.getElementById('triggerEmergencyDemo');
  const toggleAudioBtn = document.getElementById('toggleAudioBtn');
  const audioIcon = document.getElementById('audioIcon');
  const audioLabel = document.getElementById('audioLabel');

  // Simulator controls
  const prevScreenBtn = document.getElementById('prevScreenBtn');
  const nextScreenBtn = document.getElementById('nextScreenBtn');
  const activeScreenName = document.getElementById('activeScreenName');
  const interactiveViewport = document.getElementById('interactiveViewport');
  const interactiveWatchCasing = document.getElementById('interactiveWatchCasing');
  const simScreenBtns = document.querySelectorAll('.sim-screen-btn');
  const simHrSlider = document.getElementById('simHrSlider');
  const simHrVal = document.getElementById('simHrVal');
  const simSpo2Slider = document.getElementById('simSpo2Slider');
  const simSpo2Val = document.getElementById('simSpo2Val');
  const simTempVal = document.getElementById('simTempVal');
  const simTempDisplay = document.getElementById('simTempDisplay');
  const hrZoneBadge = document.getElementById('hrZoneBadge');
  const spo2ZoneBadge = document.getElementById('spo2ZoneBadge');
  const tempZoneBadge = document.getElementById('tempZoneBadge');
  const quickSosTriggerBtn = document.getElementById('quickSosTriggerBtn');
  const quickResetBtn = document.getElementById('quickResetBtn');
  const quickReturnAllBtn = document.getElementById('quickReturnAllBtn');
  const simCrownDial = document.getElementById('simCrownDial');
  const hardwareSosBtn = document.getElementById('hardwareSosBtn');

  // Preset Buttons
  const presetSafeBtn = document.getElementById('presetSafeBtn');
  const presetWarningBtn = document.getElementById('presetWarningBtn');
  const presetHypoxiaBtn = document.getElementById('presetHypoxiaBtn');
  const presetHeatstrokeBtn = document.getElementById('presetHeatstrokeBtn');
  const triggerFallBtn = document.getElementById('triggerFallBtn');

  // Watch Alert Overlay
  const watchAlertOverlay = document.getElementById('watchAlertOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayBody = document.getElementById('overlayBody');
  const overlayCountdownVal = document.getElementById('overlayCountdownVal');
  const overlayDismissBtn = document.getElementById('overlayDismissBtn');
  const overlayEscalateBtn = document.getElementById('overlayEscalateBtn');

  // Protocol State DOM Elements
  const protoSystemStatus = document.getElementById('protoSystemStatus');
  const protoRiskLevel = document.getElementById('protoRiskLevel');
  const protoRoverState = document.getElementById('protoRoverState');
  const protoFallState = document.getElementById('protoFallState');

  // Source screens HTML templates
  const screenSources = [
    document.getElementById('screenHome'),
    document.getElementById('screenHealth'),
    document.getElementById('screenLocation'),
    document.getElementById('screenSos'),
    document.getElementById('screenRover'),
    document.getElementById('screenEmergency')
  ];

  /* --------------------------------------------------------------------------
     1. HIGH-FIDELITY WEB AUDIO API TACTICAL SYNTHESIZER
     -------------------------------------------------------------------------- */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Auto-unlock audio context on very first user gesture
  function unlockAudioOnInteraction() {
    getAudioContext();
  }
  ['click', 'touchstart', 'mousedown', 'keydown'].forEach(evt => {
    document.addEventListener(evt, unlockAudioOnInteraction, { once: true, passive: true });
  });

  // Sound 1: Tactical UI Beep / Tick (mechanical click for buttons, dial, tabs)
  function playTacticalBeep(freq = 1100, durationMs = 35) {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(120, freq * 0.4), now + (durationMs / 1000));

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (durationMs / 1000));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + (durationMs / 1000));
    } catch {}
  }

  const playTacticalTick = (freq = 1200, durationMs = 30) => {
    playTacticalBeep(freq, durationMs);
  };

  // Sound 2: Potentiometer Slider Micro-Tick (ratcheted tactical feel)
  let lastSliderTickTime = 0;
  function playSliderTick() {
    if (!isAudioEnabled) return;
    const nowMs = Date.now();
    if (nowMs - lastSliderTickTime < 45) return; // throttle
    lastSliderTickTime = nowMs;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1750, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.016);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } catch {}
  }

  // Sound 3: Medical Pulse Oximeter Tone (Frequency dynamically scaled to SpO2)
  function playPulseOximeterBeep(spo2 = currentSpo2) {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Authentic clinical pulse ox frequency curve (97% = ~850Hz, 86% = ~666Hz, 75% = ~483Hz)
      const pitch = 450 + ((Math.min(100, Math.max(70, spo2)) - 70) / 30) * 450;

      // Primary cardiac pulse tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(pitch, now);

      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.065);

      // Subtle second harmonic for rich medical equipment tone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(pitch * 1.5, now + 0.01);

      gain2.gain.setValueAtTime(0.02, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.01);
      osc2.stop(now + 0.06);
    } catch {}
  }

  // Sound 4: Warning Advisory Tone (Dual-Tone Chime: 640Hz + 880Hz)
  function playWarningAlert() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Tone 1: 640Hz
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(640, now);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      // Tone 2: 880Hz
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.13);
      gain2.gain.setValueAtTime(0.1, now + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.13);
      osc2.stop(now + 0.32);
    } catch {}
  }

  // Sound 5: Critical Emergency Alarm (Multi-Frequency Urgency Warble)
  function playCriticalAlarm() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      for (let i = 0; i < 3; i++) {
        const startT = now + i * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(980, startT);
        osc.frequency.linearRampToValueAtTime(520, startT + 0.14);

        gain.gain.setValueAtTime(0.12, startT);
        gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startT);
        osc.stop(startT + 0.15);
      }
    } catch {}
  }

  // Sound 6: LoRa RF Telemetry Packet Chirp (Satellite/Mesh Radio Sound)
  function playTelemetryChirp() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.linearRampToValueAtTime(2600, now + 0.07);
      osc.frequency.linearRampToValueAtTime(1950, now + 0.14);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  // Sound 7: Fall Impact & Structural Crash (Filtered Noise Burst + 65Hz Sub-Bass Boom)
  function playFallImpact() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Noise generator for physical crash
      const bufferSize = ctx.sampleRate * 0.28;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);

      // Sub-bass heavy thump (85Hz -> 28Hz)
      const boom = ctx.createOscillator();
      const boomGain = ctx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(85, now);
      boom.frequency.exponentialRampToValueAtTime(28, now + 0.45);

      boomGain.gain.setValueAtTime(0.25, now);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      boom.connect(boomGain);
      boomGain.connect(ctx.destination);
      boom.start(now);
      boom.stop(now + 0.45);

      // Trigger siren warble
      setTimeout(() => playCriticalAlarm(), 320);
    } catch {}
  }

  // Sound 8: Ramping SOS Power-Up Synthesizer (220Hz -> 1320Hz over 3s)
  let activeSosOsc = null;
  let activeSosGain = null;

  function startSosChargeAudio() {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      activeSosOsc = ctx.createOscillator();
      activeSosGain = ctx.createGain();

      activeSosOsc.type = 'sawtooth';
      activeSosOsc.frequency.setValueAtTime(220, now);
      activeSosOsc.frequency.exponentialRampToValueAtTime(1320, now + 3.0);

      activeSosGain.gain.setValueAtTime(0.07, now);
      activeSosGain.gain.linearRampToValueAtTime(0.22, now + 3.0);

      activeSosOsc.connect(activeSosGain);
      activeSosGain.connect(ctx.destination);

      activeSosOsc.start(now);
    } catch {}
  }

  function stopSosChargeAudio(completed) {
    if (!isAudioEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (activeSosOsc) {
        try {
          activeSosOsc.stop(now + 0.05);
        } catch {}
        activeSosOsc = null;
        activeSosGain = null;
      }

      if (completed) {
        // Confirmation burst chord
        const burstOsc = ctx.createOscillator();
        const burstGain = ctx.createGain();
        burstOsc.type = 'square';
        burstOsc.frequency.setValueAtTime(1320, now);
        burstOsc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

        burstGain.gain.setValueAtTime(0.2, now);
        burstGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        burstOsc.connect(burstGain);
        burstGain.connect(ctx.destination);
        burstOsc.start(now);
        burstOsc.stop(now + 0.35);

        setTimeout(() => playCriticalAlarm(), 260);
      } else {
        // Descending cancellation tone
        const cancelOsc = ctx.createOscillator();
        const cancelGain = ctx.createGain();
        cancelOsc.type = 'sine';
        cancelOsc.frequency.setValueAtTime(680, now);
        cancelOsc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

        cancelGain.gain.setValueAtTime(0.08, now);
        cancelGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        cancelOsc.connect(cancelGain);
        cancelGain.connect(ctx.destination);
        cancelOsc.start(now);
        cancelOsc.stop(now + 0.16);
      }
    } catch {}
  }

  // Sound 9: Continuous Heartbeat Monitoring Audio Loop
  let heartbeatAudioInterval = null;
  const liveHeartbeatAudioToggle = document.getElementById('liveHeartbeatAudioToggle');
  const heartbeatBpmIndicator = document.getElementById('heartbeatBpmIndicator');

  function updateHeartbeatLoop() {
    if (heartbeatAudioInterval) {
      clearInterval(heartbeatAudioInterval);
      heartbeatAudioInterval = null;
    }

    if (heartbeatBpmIndicator) {
      heartbeatBpmIndicator.textContent = `${currentHr} BPM`;
    }

    if (liveHeartbeatAudioToggle && liveHeartbeatAudioToggle.checked && isAudioEnabled) {
      const intervalMs = Math.round((60 / currentHr) * 1000);
      // Play initial beep
      playPulseOximeterBeep(currentSpo2);

      heartbeatAudioInterval = setInterval(() => {
        if (liveHeartbeatAudioToggle.checked && isAudioEnabled) {
          playPulseOximeterBeep(currentSpo2);
        } else {
          clearInterval(heartbeatAudioInterval);
          heartbeatAudioInterval = null;
        }
      }, intervalMs);
    }
  }

  if (liveHeartbeatAudioToggle) {
    liveHeartbeatAudioToggle.addEventListener('change', () => {
      getAudioContext();
      updateHeartbeatLoop();
      playTacticalBeep(900, 30);
    });
  }

  // Audio Toggle Toolbar Button
  if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', () => {
      isAudioEnabled = !isAudioEnabled;
      if (isAudioEnabled) {
        toggleAudioBtn.classList.add('audio-active');
        audioIcon.textContent = '🔊';
        audioLabel.textContent = 'Sound: ON';
        getAudioContext();
        playTacticalBeep(1200, 40);
        updateHeartbeatLoop();
      } else {
        toggleAudioBtn.classList.remove('audio-active');
        audioIcon.textContent = '🔇';
        audioLabel.textContent = 'Sound: OFF';
        if (heartbeatAudioInterval) {
          clearInterval(heartbeatAudioInterval);
          heartbeatAudioInterval = null;
        }
      }
    });
  }

  // Attach Soundboard Button Event Listeners
  const sfxBeepBtn = document.getElementById('sfxBeepBtn');
  const sfxPulseBtn = document.getElementById('sfxPulseBtn');
  const sfxWarningBtn = document.getElementById('sfxWarningBtn');
  const sfxAlarmBtn = document.getElementById('sfxAlarmBtn');
  const sfxTelemetryBtn = document.getElementById('sfxTelemetryBtn');
  const sfxFallBtn = document.getElementById('sfxFallBtn');
  const sfxSosChargeBtn = document.getElementById('sfxSosChargeBtn');

  if (sfxBeepBtn) sfxBeepBtn.addEventListener('click', () => playTacticalBeep(1200, 35));
  if (sfxPulseBtn) sfxPulseBtn.addEventListener('click', () => playPulseOximeterBeep(currentSpo2));
  if (sfxWarningBtn) sfxWarningBtn.addEventListener('click', () => playWarningAlert());
  if (sfxAlarmBtn) sfxAlarmBtn.addEventListener('click', () => playCriticalAlarm());
  if (sfxTelemetryBtn) sfxTelemetryBtn.addEventListener('click', () => playTelemetryChirp());
  if (sfxFallBtn) sfxFallBtn.addEventListener('click', () => playFallImpact());
  if (sfxSosChargeBtn) {
    sfxSosChargeBtn.addEventListener('click', () => {
      startSosChargeAudio();
      setTimeout(() => stopSosChargeAudio(true), 3000);
    });
  }

  /* --------------------------------------------------------------------------
     2. REAL-TIME CLOCK
     -------------------------------------------------------------------------- */
  function updateLiveClocks() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const fullTime = `${hours}:${minutes}:${seconds}`;

    document.querySelectorAll('.live-clock').forEach(el => {
      el.textContent = fullTime;
    });

    document.querySelectorAll('.live-time-large').forEach(el => {
      el.textContent = `${hours}:${minutes}`;
    });

    document.querySelectorAll('.live-seconds').forEach(el => {
      el.textContent = `:${seconds}`;
    });
  }
  setInterval(updateLiveClocks, 1000);
  updateLiveClocks();

  /* --------------------------------------------------------------------------
     3. DYNAMIC PPG/ECG WAVEFORM ANIMATION (FREQUENCY SYNCED WITH BPM)
     -------------------------------------------------------------------------- */
  let ecgPhase = 0;
  function animateECGWave() {
    const ecgPaths = document.querySelectorAll('.live-ecg-path');
    
    // Frequency scaled to Heart Rate (normal 82 = speed 0.08)
    const bpmSpeedScale = Math.max(0.04, (currentHr / 82) * 0.08);
    ecgPhase += bpmSpeedScale;

    ecgPaths.forEach(path => {
      // Dynamic amplitude: spikes higher in tachycardia
      const isHighBpm = currentHr > 120;
      const waveAmplitude = isHighBpm 
        ? 1.35 + Math.sin(ecgPhase * 2) * 0.35 
        : 1 + Math.sin(ecgPhase) * 0.15;

      const p1 = Math.round(10 * waveAmplitude);
      const p2 = Math.round(22 * waveAmplitude);
      const p3 = Math.round(4 * waveAmplitude);
      const p4 = Math.round(28 * waveAmplitude);

      const d = `M0 16 L20 16 L25 ${p1} L30 ${p2} L35 ${p3} L40 ${p4} L45 16 L70 16 L75 ${p1} L80 ${p2} L85 ${p3} L90 ${p4} L95 16 L120 16 L125 ${p1} L130 ${p2} L135 ${p3} L140 16`;
      path.setAttribute('d', d);

      // Color synced with threat level
      if (currentHr > 120 || currentHr < 50) {
        path.setAttribute('stroke', '#EF4444');
      } else if (currentHr > 100 || currentHr < 60) {
        path.setAttribute('stroke', '#F59E0B');
      } else {
        path.setAttribute('stroke', '#EF4444');
      }
    });

    requestAnimationFrame(animateECGWave);
  }
  requestAnimationFrame(animateECGWave);

  /* --------------------------------------------------------------------------
     4. VIEW MODE SWITCHING (GRID VS SIMULATOR)
     -------------------------------------------------------------------------- */
  function setViewMode(mode) {
    if (mode === 'all') {
      viewModeAllBtn.classList.add('active');
      viewModeAllBtn.setAttribute('aria-selected', 'true');
      viewModeInteractiveBtn.classList.remove('active');
      viewModeInteractiveBtn.setAttribute('aria-selected', 'false');

      screensShowcase.classList.add('active');
      interactiveSimulator.classList.remove('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      viewModeInteractiveBtn.classList.add('active');
      viewModeInteractiveBtn.setAttribute('aria-selected', 'true');
      viewModeAllBtn.classList.remove('active');
      viewModeAllBtn.setAttribute('aria-selected', 'false');

      interactiveSimulator.classList.add('active');
      screensShowcase.classList.remove('active');
      renderInteractiveScreen(currentInteractiveScreen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewModeAllBtn.addEventListener('click', () => setViewMode('all'));
  viewModeInteractiveBtn.addEventListener('click', () => setViewMode('interactive'));
  if (quickReturnAllBtn) {
    quickReturnAllBtn.addEventListener('click', () => setViewMode('all'));
  }

  /* --------------------------------------------------------------------------
     5. CASING BEZEL TOGGLE
     -------------------------------------------------------------------------- */
  function toggleBezel() {
    isRuggedCasing = !isRuggedCasing;
    const casings = document.querySelectorAll('.smartwatch-casing');
    casings.forEach(c => {
      if (isRuggedCasing) {
        c.classList.remove('minimal-casing');
      } else {
        c.classList.add('minimal-casing');
      }
    });

    chassisBtnLabel.textContent = isRuggedCasing ? 'Bezel: Rugged' : 'Bezel: Minimal Screen';
    playTacticalTick();
  }
  toggleChassisBtn.addEventListener('click', toggleBezel);

  /* --------------------------------------------------------------------------
     6. HARDWARE DRAWER TOGGLE
     -------------------------------------------------------------------------- */
  toggleHardwareDrawer.addEventListener('click', () => {
    hardwareDrawer.classList.toggle('collapsed');
    playTacticalTick();
  });

  closeDrawerBtn.addEventListener('click', () => {
    hardwareDrawer.classList.add('collapsed');
  });

  /* --------------------------------------------------------------------------
     7. THRESHOLD EVALUATION & DYNAMIC CLASSIFICATION
     -------------------------------------------------------------------------- */
  function evaluateThresholds(hr, spo2, temp, fall) {
    let hrState = 'safe'; // 'safe' | 'warning' | 'critical'
    let hrTag = 'NORMAL';
    let hrRhythm = 'Sinus Regular';

    if (hr < 50) {
      hrState = 'critical';
      hrTag = 'SEVERE BRADYCARDIA';
      hrRhythm = 'Sinus Bradycardia';
    } else if (hr < 60) {
      hrState = 'warning';
      hrTag = 'MILD BRADYCARDIA';
      hrRhythm = 'Low Resting';
    } else if (hr <= 100) {
      hrState = 'safe';
      hrTag = 'NORMAL';
      hrRhythm = 'Sinus Regular';
    } else if (hr <= 120) {
      hrState = 'warning';
      hrTag = 'ELEVATED / TACHYCARDIA';
      hrRhythm = 'Sinus Tachycardia';
    } else {
      hrState = 'critical';
      hrTag = 'CRITICAL TACHYCARDIA';
      hrRhythm = 'Severe Tachycardia';
    }

    let spo2State = 'safe';
    let spo2Tag = 'OPTIMAL';
    if (spo2 >= 95) {
      spo2State = 'safe';
      spo2Tag = 'OPTIMAL';
    } else if (spo2 >= 90) {
      spo2State = 'warning';
      spo2Tag = 'MILD HYPOXIA';
    } else {
      spo2State = 'critical';
      spo2Tag = 'CRITICAL HYPOXIA';
    }

    let tempState = 'safe';
    let tempTag = 'NORMOTHERMIC';
    if (temp < 35.0) {
      tempState = 'critical';
      tempTag = 'HYPOTHERMIA ALERT';
    } else if (temp < 36.1) {
      tempState = 'warning';
      tempTag = 'LOW TEMP DRIFT';
    } else if (temp <= 37.2) {
      tempState = 'safe';
      tempTag = 'NORMOTHERMIC';
    } else if (temp <= 38.4) {
      tempState = 'warning';
      tempTag = 'ELEVATED TEMP';
    } else if (temp <= 39.5) {
      tempState = 'critical';
      tempTag = 'HYPERTHERMIA ALERT';
    } else {
      tempState = 'critical';
      tempTag = 'HEAT STROKE ALERT';
    }

    // Motion / Fall
    let motionState = fall ? 'critical' : 'safe';
    let motionTag = fall ? 'FALL DETECTED (4.8G)' : 'NORMAL';

    // Overall Threat Level
    let overallThreat = 'SAFE';
    const criticalReasons = [];
    const warningReasons = [];

    if (hrState === 'critical') criticalReasons.push(`Heart Rate: ${hr} BPM (${hrTag})`);
    if (spo2State === 'critical') criticalReasons.push(`SpO₂: ${spo2}% (${spo2Tag})`);
    if (tempState === 'critical') criticalReasons.push(`Temp: ${temp}°C (${tempTag})`);
    if (fall) criticalReasons.push('LSM6DSOX: High-G Fall Impact (4.8G)');

    if (hrState === 'warning') warningReasons.push(`HR: ${hr} BPM`);
    if (spo2State === 'warning') warningReasons.push(`SpO₂: ${spo2}%`);
    if (tempState === 'warning') warningReasons.push(`Temp: ${temp}°C`);

    if (criticalReasons.length > 0) {
      overallThreat = 'CRITICAL';
    } else if (warningReasons.length > 0) {
      overallThreat = 'WARNING';
    } else {
      overallThreat = 'SAFE';
    }

    return {
      hrState, hrTag, hrRhythm,
      spo2State, spo2Tag,
      tempState, tempTag,
      motionState, motionTag,
      overallThreat,
      criticalReasons,
      warningReasons
    };
  }

  /* --------------------------------------------------------------------------
     8. APPLY THRESHOLD STATES TO UI
     -------------------------------------------------------------------------- */
  function applyThresholds(results) {
    const prevThreat = currentThreatLevel;
    currentThreatLevel = results.overallThreat;

    // Audio cue upon crossing threat boundary
    if (prevThreat !== currentThreatLevel) {
      if (currentThreatLevel === 'CRITICAL') {
        playCriticalAlarm();
      } else if (currentThreatLevel === 'WARNING') {
        playWarningAlert();
      }
    }

    // 1. Sliders Zone Badges
    if (hrZoneBadge) {
      hrZoneBadge.textContent = results.hrTag;
      hrZoneBadge.style.color = results.hrState === 'critical' ? '#EF4444' : (results.hrState === 'warning' ? '#F59E0B' : '#10B981');
    }
    if (spo2ZoneBadge) {
      spo2ZoneBadge.textContent = results.spo2Tag;
      spo2ZoneBadge.style.color = results.spo2State === 'critical' ? '#EF4444' : (results.spo2State === 'warning' ? '#F59E0B' : '#10B981');
    }
    if (tempZoneBadge) {
      tempZoneBadge.textContent = results.tempTag;
      tempZoneBadge.style.color = results.tempState === 'critical' ? '#EF4444' : (results.tempState === 'warning' ? '#F59E0B' : '#10B981');
    }

    // 2. Watch Casing Alert Glow
    if (interactiveWatchCasing) {
      if (currentThreatLevel === 'CRITICAL') {
        interactiveWatchCasing.classList.add('casing-emergency');
        interactiveWatchCasing.querySelector('.case-body').classList.add('alert-border-pulse');
      } else {
        interactiveWatchCasing.classList.remove('casing-emergency');
        interactiveWatchCasing.querySelector('.case-body').classList.remove('alert-border-pulse');
      }
    }

    // 3. Update Text and Bar Fills on Active Viewport and All Screens
    document.querySelectorAll('.val-hr').forEach(el => el.textContent = currentHr);
    document.querySelectorAll('.val-spo2').forEach(el => el.textContent = currentSpo2);
    document.querySelectorAll('.val-temp').forEach(el => el.textContent = currentTemp);

    // Dynamic bar fills
    document.querySelectorAll('.hr-fill').forEach(el => {
      const pct = Math.min(Math.max((currentHr / 175) * 100, 20), 100);
      el.style.width = `${pct}%`;
      el.style.background = results.hrState === 'critical' ? '#EF4444' : (results.hrState === 'warning' ? '#F59E0B' : '#EF4444');
    });

    document.querySelectorAll('.ox-fill').forEach(el => {
      el.style.width = `${currentSpo2}%`;
      el.style.background = results.spo2State === 'critical' ? '#EF4444' : (results.spo2State === 'warning' ? '#F59E0B' : '#00D2FF');
    });

    // 4. Update Dynamic Card Classes in Interactive Viewport & Template
    updateCardsForScope(document, results);

    // 5. Update Status Pills (Screen 01)
    document.querySelectorAll('.status-pill').forEach(pill => {
      pill.className = 'status-pill';
      if (results.overallThreat === 'SAFE') {
        pill.classList.add('status-pill-safe');
        pill.innerHTML = '<span class="pulsing-beacon green-beacon"></span><span class="status-label">SAFE</span>';
      } else if (results.overallThreat === 'WARNING') {
        pill.classList.add('status-pill-warning');
        pill.innerHTML = '<span class="pulsing-beacon amber-beacon"></span><span class="status-label">▲ WARNING: ELEVATED</span>';
      } else {
        pill.classList.add('status-pill-critical');
        pill.innerHTML = '<span class="pulsing-beacon red-beacon"></span><span class="status-label">🚨 CRITICAL ALERT</span>';
      }
    });

    // 6. Update Health Screen (Screen 02) Tags & Rhythms
    document.querySelectorAll('.vital-tag-status').forEach(tag => {
      if (tag.closest('.vital-mini-card')) {
        const header = tag.closest('.vital-mini-card').querySelector('.vital-label')?.textContent;
        if (header && header.includes('TEMP')) {
          tag.textContent = results.tempTag;
        }
      }
    });

    document.querySelectorAll('.range-indicator').forEach(ind => {
      const card = ind.closest('.health-card');
      if (card && card.querySelector('.param-name')?.textContent.includes('Heart')) {
        ind.textContent = `Rhythm: ${results.hrRhythm}`;
      }
    });

    document.querySelectorAll('.safe-badge').forEach(badge => {
      const card = badge.closest('.health-card');
      if (card && card.querySelector('.param-name')?.textContent.includes('Heart')) {
        badge.textContent = results.hrTag;
        badge.className = `status-badge-inline ${results.hrState === 'critical' ? 'critical-badge' : (results.hrState === 'warning' ? 'warning-badge' : 'safe-badge')}`;
      } else if (card && card.querySelector('.param-name')?.textContent.includes('SpO')) {
        badge.textContent = results.spo2Tag;
        badge.className = `status-badge-inline ${results.spo2State === 'critical' ? 'critical-badge' : (results.spo2State === 'warning' ? 'warning-badge' : 'safe-badge')}`;
      }
    });

    // 7. Update Motion status
    document.querySelectorAll('.motion-tag-safe').forEach(tag => {
      tag.textContent = results.motionTag;
      tag.style.color = results.motionState === 'critical' ? '#EF4444' : '#10B981';
      if (results.motionState === 'critical') {
        tag.classList.add('pulse-indicator');
      } else {
        tag.classList.remove('pulse-indicator');
      }
    });

    // 8. Update Emergency Screen (Screen 06) Readouts with Live Values
    document.querySelectorAll('.em-vital-hr .em-vital-val').forEach(el => el.textContent = currentHr);
    document.querySelectorAll('.em-vital-hr .em-tag-alert').forEach(el => el.textContent = results.hrTag);
    document.querySelectorAll('.em-vital-spo2 .em-vital-val').forEach(el => el.textContent = `${currentSpo2}%`);
    document.querySelectorAll('.em-vital-spo2 .em-tag-alert').forEach(el => el.textContent = results.spo2Tag);
    document.querySelectorAll('.em-vital-temp .em-vital-val').forEach(el => el.textContent = `${currentTemp}°`);
    document.querySelectorAll('.em-vital-temp .em-tag-alert').forEach(el => el.textContent = results.tempTag);

    // 9. Update Telemetry Protocol Panel on Right
    if (protoSystemStatus) {
      if (results.overallThreat === 'SAFE') {
        protoSystemStatus.textContent = '● SAFE (STABLE)';
        protoSystemStatus.className = 'proto-val text-safe';
      } else if (results.overallThreat === 'WARNING') {
        protoSystemStatus.textContent = '▲ WARNING: THRESHOLD DRIFT';
        protoSystemStatus.className = 'proto-val';
        protoSystemStatus.style.color = '#F59E0B';
      } else {
        protoSystemStatus.textContent = '🚨 EMERGENCY DISPATCH ACTIVE';
        protoSystemStatus.className = 'proto-val';
        protoSystemStatus.style.color = '#EF4444';
      }
    }

    if (protoRiskLevel) {
      let riskScore = 4;
      if (results.overallThreat === 'WARNING') riskScore = 48;
      if (results.overallThreat === 'CRITICAL') riskScore = 96;
      protoRiskLevel.textContent = `${results.overallThreat} (${riskScore}%)`;
      protoRiskLevel.style.color = results.overallThreat === 'CRITICAL' ? '#EF4444' : (results.overallThreat === 'WARNING' ? '#F59E0B' : '#10B981');
    }

    if (protoRoverState) {
      if (results.overallThreat === 'CRITICAL') {
        protoRoverState.textContent = 'RAKSHA-01 (DISPATCHED • ETA 03:45)';
        protoRoverState.style.color = '#EF4444';
      } else {
        protoRoverState.textContent = 'RAKSHA-01 (ONLINE • STANDBY)';
        protoRoverState.style.color = '#10B981';
      }
    }

    if (protoFallState) {
      if (results.motionState === 'critical') {
        protoFallState.textContent = '🚨 FALL DETECTED (4.8G)';
        protoFallState.style.color = '#EF4444';
      } else {
        protoFallState.textContent = 'ARMED • NORMAL';
        protoFallState.style.color = '#10B981';
      }
    }

    // 10. Handle In-Watch Threshold Breach Alert Overlay & Auto-Dispatch
    handleWatchAlertOverlay(results);
  }

  function updateCardsForScope(scope, results) {
    // HR Card
    scope.querySelectorAll('.vital-mini-card').forEach(card => {
      const label = card.querySelector('.vital-label')?.textContent;
      if (label && label.includes('HEART')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.hrState}`);
      } else if (label && label.includes('SpO')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.spo2State}`);
      } else if (label && label.includes('TEMP')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.tempState}`);
        const tag = card.querySelector('.vital-tag-status');
        if (tag) tag.textContent = results.tempTag;
      }
    });

    // Health screen cards
    scope.querySelectorAll('.health-card').forEach(card => {
      const name = card.querySelector('.param-name')?.textContent;
      if (name && name.includes('Heart')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.hrState}`);
      } else if (name && name.includes('SpO')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.spo2State}`);
      }
    });

    // Temp subcard
    scope.querySelectorAll('.health-subcard').forEach(card => {
      const name = card.querySelector('.subcard-name')?.textContent;
      if (name && name.includes('Temp')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.tempState}`);
        const unit = card.querySelector('.subcard-sensor');
        if (unit) unit.textContent = results.tempTag;
      } else if (name && name.includes('Motion')) {
        card.classList.remove('state-safe', 'state-warning', 'state-critical');
        card.classList.add(`state-${results.motionState}`);
      }
    });
  }

  /* --------------------------------------------------------------------------
     9. IN-WATCH EMERGENCY ALERT OVERLAY & ESCALATION TIMER
     -------------------------------------------------------------------------- */
  function handleWatchAlertOverlay(results) {
    if (!watchAlertOverlay) return;

    if (results.overallThreat === 'CRITICAL' && currentInteractiveScreen !== 5) {
      // Show overlay on watch
      watchAlertOverlay.style.display = 'flex';
      overlayTitle.textContent = isFallDetected ? 'FALL & IMPACT DETECTED' : 'CRITICAL THRESHOLD BREACH';
      overlayBody.textContent = results.criticalReasons.join(' • ');

      // Start 5-second countdown to auto-dispatch rover
      if (!alertCountdownTimer) {
        alertCountdownSeconds = 5;
        overlayCountdownVal.textContent = `0${alertCountdownSeconds}s`;

        alertCountdownTimer = setInterval(() => {
          alertCountdownSeconds--;
          overlayCountdownVal.textContent = `0${alertCountdownSeconds}s`;

          if (alertCountdownSeconds > 0) {
            playTacticalBeep(920, 50);
          }

          if (alertCountdownSeconds <= 0) {
            clearInterval(alertCountdownTimer);
            alertCountdownTimer = null;
            watchAlertOverlay.style.display = 'none';
            // Escalate to Screen 06 EMERGENCY!
            renderInteractiveScreen(5);
            playCriticalAlarm();
          }
        }, 1000);
      }
    } else {
      // Clear overlay if values normalized or already on emergency screen
      if (alertCountdownTimer) {
        clearInterval(alertCountdownTimer);
        alertCountdownTimer = null;
      }
      watchAlertOverlay.style.display = 'none';
    }
  }

  if (overlayDismissBtn) {
    overlayDismissBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (alertCountdownTimer) {
        clearInterval(alertCountdownTimer);
        alertCountdownTimer = null;
      }
      watchAlertOverlay.style.display = 'none';
      playTacticalTick();
    });
  }

  if (overlayEscalateBtn) {
    overlayEscalateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (alertCountdownTimer) {
        clearInterval(alertCountdownTimer);
        alertCountdownTimer = null;
      }
      watchAlertOverlay.style.display = 'none';
      renderInteractiveScreen(5);
      playCriticalAlarm();
    });
  }

  /* --------------------------------------------------------------------------
     10. SENSOR TELEMETRY SLIDER INJECTION
     -------------------------------------------------------------------------- */
  function updateAllSensors() {
    const res = evaluateThresholds(currentHr, currentSpo2, currentTemp, isFallDetected);
    applyThresholds(res);
  }

  simHrSlider.addEventListener('input', (e) => {
    currentHr = parseInt(e.target.value, 10);
    simHrVal.textContent = `${currentHr} BPM`;
    playSliderTick();
    updateAllSensors();
    updateHeartbeatLoop();
  });

  simSpo2Slider.addEventListener('input', (e) => {
    currentSpo2 = parseInt(e.target.value, 10);
    simSpo2Val.textContent = `${currentSpo2}%`;
    playSliderTick();
    updateAllSensors();
    updateHeartbeatLoop();
  });

  simTempVal.addEventListener('input', (e) => {
    currentTemp = parseFloat((e.target.value / 10).toFixed(1));
    simTempDisplay.textContent = `${currentTemp}°C`;
    playSliderTick();
    updateAllSensors();
  });

  /* --------------------------------------------------------------------------
     11. THRESHOLD PRESETS & FALL DETECTOR
     -------------------------------------------------------------------------- */
  function applyPreset(hr, spo2, temp, fall = false) {
    currentHr = hr;
    currentSpo2 = spo2;
    currentTemp = temp;
    isFallDetected = fall;

    simHrSlider.value = hr;
    simHrVal.textContent = `${hr} BPM`;

    simSpo2Slider.value = spo2;
    simSpo2Val.textContent = `${spo2}%`;

    simTempVal.value = Math.round(temp * 10);
    simTempDisplay.textContent = `${temp}°C`;

    updateAllSensors();
    updateHeartbeatLoop();
    playTacticalTick();
  }

  if (presetSafeBtn) {
    presetSafeBtn.addEventListener('click', () => applyPreset(82, 97, 36.7, false));
  }

  if (presetWarningBtn) {
    presetWarningBtn.addEventListener('click', () => applyPreset(118, 92, 37.6, false));
  }

  if (presetHypoxiaBtn) {
    presetHypoxiaBtn.addEventListener('click', () => applyPreset(145, 86, 38.2, false));
  }

  if (presetHeatstrokeBtn) {
    presetHeatstrokeBtn.addEventListener('click', () => applyPreset(170, 96, 41.0, false));
  }

  if (triggerFallBtn) {
    triggerFallBtn.addEventListener('click', () => {
      playFallImpact();
      applyPreset(150, 91, 37.8, true);
    });
  }

  /* --------------------------------------------------------------------------
     12. INTERACTIVE SIMULATOR RENDERING & WATCH CARD CLICK HOTSPOTS
     -------------------------------------------------------------------------- */
  function renderInteractiveScreen(index) {
    currentInteractiveScreen = index;
    activeScreenName.textContent = SCREEN_NAMES[index];

    // Update screen selector buttons
    simScreenBtns.forEach(btn => {
      const target = parseInt(btn.dataset.targetScreen, 10);
      if (target === index) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Clone screen content into simulator viewport
    if (screenSources[index]) {
      interactiveViewport.innerHTML = screenSources[index].innerHTML;
      interactiveViewport.className = `screen-viewport interactive-viewport ${screenSources[index].className.replace('screen-viewport', '')}`;

      // Re-apply threshold styling to the newly rendered screen
      const res = evaluateThresholds(currentHr, currentSpo2, currentTemp, isFallDetected);
      updateCardsForScope(interactiveViewport, res);

      // Attach interactive events inside watch
      attachScreenEvents(interactiveViewport);
      attachWatchCardHotspots(interactiveViewport);
    }
  }

  function attachWatchCardHotspots(scope) {
    // On Screen 01: tapping cards navigates contextually
    if (currentInteractiveScreen === 0) {
      scope.querySelectorAll('.vital-mini-card').forEach(card => {
        card.addEventListener('click', () => {
          const label = card.querySelector('.vital-label')?.textContent;
          if (label && (label.includes('HEART') || label.includes('SpO') || label.includes('TEMP'))) {
            renderInteractiveScreen(1); // Jump to Screen 02 HEALTH
            playTacticalTick();
          } else if (label && label.includes('GNSS')) {
            renderInteractiveScreen(2); // Jump to Screen 03 LOCATION
            playTacticalTick();
          }
        });
      });

      const statusPill = scope.querySelector('.status-pill');
      if (statusPill) {
        statusPill.addEventListener('click', () => {
          if (currentThreatLevel === 'CRITICAL') {
            renderInteractiveScreen(5); // Jump to Screen 06 EMERGENCY
          } else {
            renderInteractiveScreen(3); // Jump to Screen 04 SOS
          }
          playTacticalTick();
        });
      }

      const bottomStrip = scope.querySelector('.home-bottom-strip');
      if (bottomStrip) {
        bottomStrip.addEventListener('click', () => {
          renderInteractiveScreen(4); // Jump to Screen 05 ROVER LINK
          playTacticalTick();
        });
      }
    }

    // On Screen 02: tapping disclaimer or header goes back to home
    if (currentInteractiveScreen === 1) {
      const disclaimer = scope.querySelector('.medical-disclaimer-card');
      if (disclaimer) {
        disclaimer.style.cursor = 'pointer';
        disclaimer.addEventListener('click', () => {
          renderInteractiveScreen(0);
          playTacticalTick();
        });
      }
    }
  }

  function nextScreen() {
    const next = (currentInteractiveScreen + 1) % 6;
    renderInteractiveScreen(next);
    playTacticalTick();
  }

  function prevScreen() {
    const prev = (currentInteractiveScreen - 1 + 6) % 6;
    renderInteractiveScreen(prev);
    playTacticalTick();
  }

  prevScreenBtn.addEventListener('click', prevScreen);
  nextScreenBtn.addEventListener('click', nextScreen);

  // Crown dial rotates to switch screens
  simCrownDial.addEventListener('click', () => {
    nextScreen();
  });

  // Hardware SOS button on watch chassis triggers Screen 04 or Screen 06
  hardwareSosBtn.addEventListener('click', () => {
    if (currentInteractiveScreen !== 3 && currentInteractiveScreen !== 5) {
      renderInteractiveScreen(3); // Jump to SOS screen
    } else {
      triggerEmergencyState();
    }
    playCriticalAlarm();
  });

  simScreenBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.dataset.targetScreen, 10);
      renderInteractiveScreen(target);
      playTacticalTick();
    });
  });

  /* --------------------------------------------------------------------------
     13. SOS BUTTON 3-SECOND HOLD INTERACTION
     -------------------------------------------------------------------------- */
  function startSosCountdown(btnEl, ringEl, onComplete) {
    if (sosHoldTimer) return;

    sosHoldStartTime = Date.now();
    btnEl.classList.add('holding');
    playWarningAlert();

    function updateRing() {
      const elapsed = Date.now() - sosHoldStartTime;
      const progress = Math.min(elapsed / SOS_HOLD_DURATION_MS, 1);
      const offset = RING_CIRCUMFERENCE * (1 - progress);

      if (ringEl) {
        ringEl.style.strokeDashoffset = offset;
      }

      if (progress < 1) {
        sosHoldTimer = requestAnimationFrame(updateRing);
      } else {
        cancelAnimationFrame(sosHoldTimer);
        sosHoldTimer = null;
        btnEl.classList.remove('holding');
        if (ringEl) ringEl.style.strokeDashoffset = 0;
        onComplete();
      }
    }

    sosHoldTimer = requestAnimationFrame(updateRing);
  }

  function cancelSosCountdown(btnEl, ringEl) {
    if (sosHoldTimer) {
      cancelAnimationFrame(sosHoldTimer);
      sosHoldTimer = null;
    }
    sosHoldStartTime = null;
    if (btnEl) btnEl.classList.remove('holding');
    if (ringEl) ringEl.style.strokeDashoffset = RING_CIRCUMFERENCE;
  }

  function attachScreenEvents(scope) {
    const sosBtn = scope.querySelector('#sosMainTrigger');
    const ringEl = scope.querySelector('.sos-countdown-ring');
    const cancelBtn = scope.querySelector('#cancelSosBtn');

    if (sosBtn && ringEl) {
      ringEl.style.strokeDasharray = RING_CIRCUMFERENCE;
      ringEl.style.strokeDashoffset = RING_CIRCUMFERENCE;

      // Mouse Events
      sosBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startSosCountdown(sosBtn, ringEl, () => {
          triggerEmergencyState();
        });
      });

      sosBtn.addEventListener('mouseup', () => {
        cancelSosCountdown(sosBtn, ringEl);
      });

      sosBtn.addEventListener('mouseleave', () => {
        cancelSosCountdown(sosBtn, ringEl);
      });

      // Touch Events
      sosBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startSosCountdown(sosBtn, ringEl, () => {
          triggerEmergencyState();
        });
      }, { passive: false });

      sosBtn.addEventListener('touchend', () => {
        cancelSosCountdown(sosBtn, ringEl);
      });

      sosBtn.addEventListener('touchcancel', () => {
        cancelSosCountdown(sosBtn, ringEl);
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        cancelSosCountdown(sosBtn, ringEl);
        renderInteractiveScreen(0); // Return to home
        playTacticalTick();
      });
    }
  }

  // Attach to showcase screens as well
  attachScreenEvents(document);

  /* --------------------------------------------------------------------------
     14. EMERGENCY STATE TRANSITION
     -------------------------------------------------------------------------- */
  function triggerEmergencyState() {
    renderInteractiveScreen(5); // Show screen 06 EMERGENCY
    playCriticalAlarm();
  }

  triggerEmergencyDemo.addEventListener('click', () => {
    triggerEmergencyState();
  });

  if (quickSosTriggerBtn) {
    quickSosTriggerBtn.addEventListener('click', () => {
      triggerEmergencyState();
    });
  }

  if (quickResetBtn) {
    quickResetBtn.addEventListener('click', () => {
      applyPreset(82, 97, 36.7, false);
      renderInteractiveScreen(0);
      playTacticalTick();
    });
  }

  /* --------------------------------------------------------------------------
     15. KEYBOARD NAVIGATION SHORTCUTS
     -------------------------------------------------------------------------- */
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '6') {
      const idx = parseInt(e.key, 10) - 1;
      setViewMode('interactive');
      renderInteractiveScreen(idx);
      playTacticalTick();
    } else if (e.key === 'ArrowRight') {
      if (interactiveSimulator.classList.contains('active')) nextScreen();
    } else if (e.key === 'ArrowLeft') {
      if (interactiveSimulator.classList.contains('active')) prevScreen();
    } else if (e.key === 'Escape') {
      if (watchAlertOverlay.style.display !== 'none') {
        watchAlertOverlay.style.display = 'none';
      } else {
        setViewMode('interactive');
      }
    }
  });

  // Initial render of simulator screen & threshold evaluation
  renderInteractiveScreen(0);
  updateAllSensors();

  /* --------------------------------------------------------------------------
     16. URL PARAMETER DEEP-LINKING SUPPORT
     -------------------------------------------------------------------------- */
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('drawer') === 'open') {
    hardwareDrawer.classList.remove('collapsed');
  }
  if (urlParams.get('bezel') === 'minimal') {
    toggleBezel();
  }
  if (urlParams.get('preset') === 'warning') {
    applyPreset(118, 92, 37.6, false);
  } else if (urlParams.get('preset') === 'heatstroke') {
    applyPreset(170, 96, 41.0, false);
  } else if (urlParams.get('preset') === 'hypoxia') {
    applyPreset(145, 86, 38.2, false);
  } else if (urlParams.get('preset') === 'fall') {
    applyPreset(150, 91, 37.8, true);
  }

  if (urlParams.get('view') === 'all') {
    setViewMode('all');
  } else {
    setViewMode('interactive');
    const screenParam = parseInt(urlParams.get('screen'), 10);
    if (!isNaN(screenParam) && screenParam >= 0 && screenParam <= 5) {
      renderInteractiveScreen(screenParam);
    }
  }

  /* --------------------------------------------------------------------------
     17. TACTICAL BACKEND REST & WEBSOCKET TELEMETRY GATEWAY
     -------------------------------------------------------------------------- */
  const serverStatusBadge = document.getElementById('serverStatusBadge');
  const serverStatusText = document.getElementById('serverStatusText');
  const backendStatusTag = document.getElementById('backendStatusTag');
  const apiEndpointDisplay = document.getElementById('apiEndpointDisplay');
  const wsStatusDisplay = document.getElementById('wsStatusDisplay');
  const pingLatencyDisplay = document.getElementById('pingLatencyDisplay');
  const syncPushVitalsBtn = document.getElementById('syncPushVitalsBtn');
  const syncTriggerSosBtn = document.getElementById('syncTriggerSosBtn');

  const config = window.__CONFIG__ || {
    API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : window.location.origin,
    WS_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'ws://localhost:5000/ws' : ((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws')
  };

  if (apiEndpointDisplay) {
    apiEndpointDisplay.textContent = config.API_URL;
    apiEndpointDisplay.title = config.API_URL;
  }

  let wsSocket = null;
  let wsReconnectTimer = null;
  let isBackendOnline = false;
  let lastPingStart = 0;

  function updateServerStatusUI(online, label, extraClass = '') {
    isBackendOnline = online;
    if (serverStatusBadge) {
      serverStatusBadge.className = `server-status-pill ${online ? 'online' : 'offline'} ${extraClass}`.trim();
    }
    if (serverStatusText) {
      serverStatusText.textContent = label;
    }
    if (backendStatusTag) {
      backendStatusTag.textContent = online ? 'ONLINE' : 'STANDALONE';
      backendStatusTag.style.background = online ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)';
      backendStatusTag.style.color = online ? '#10B981' : '#F59E0B';
      backendStatusTag.style.borderColor = online ? '#10B981' : '#F59E0B';
    }
    if (wsStatusDisplay) {
      wsStatusDisplay.textContent = online ? 'CONNECTED' : 'DISCONNECTED';
      wsStatusDisplay.style.color = online ? '#10B981' : 'var(--text-secondary)';
    }
  }

  function connectWebSocket() {
    if (!config.WS_URL) return;

    try {
      if (wsSocket) {
        wsSocket.close();
      }

      wsSocket = new WebSocket(config.WS_URL);

      wsSocket.onopen = () => {
        console.log('[TELEMETRY] WebSocket connected to:', config.WS_URL);
        updateServerStatusUI(true, 'API: ONLINE (PORT 5000)');
        measurePingLatency();
      };

      wsSocket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          handleIncomingBackendMessage(msg);
        } catch (e) {
          console.warn('[TELEMETRY] Message parsing error:', e);
        }
      };

      wsSocket.onclose = () => {
        updateServerStatusUI(false, 'API: STANDALONE');
        scheduleWsReconnect();
      };

      wsSocket.onerror = () => {
        // Handled via onclose
      };
    } catch (e) {
      updateServerStatusUI(false, 'API: STANDALONE');
      scheduleWsReconnect();
    }
  }

  function scheduleWsReconnect() {
    if (wsReconnectTimer) clearTimeout(wsReconnectTimer);
    wsReconnectTimer = setTimeout(() => {
      connectWebSocket();
    }, 4000);
  }

  function measurePingLatency() {
    if (wsSocket && wsSocket.readyState === WebSocket.OPEN) {
      lastPingStart = performance.now();
      wsSocket.send(JSON.stringify({ type: 'PING' }));
    }
  }

  setInterval(measurePingLatency, 8000);

  function handleIncomingBackendMessage(msg) {
    if (msg.type === 'PONG') {
      const latency = Math.round(performance.now() - lastPingStart);
      if (pingLatencyDisplay) {
        pingLatencyDisplay.textContent = `${latency} ms`;
        pingLatencyDisplay.style.color = latency < 120 ? '#10B981' : latency < 350 ? '#F59E0B' : '#EF4444';
      }
    } else if (msg.type === 'INITIAL_STATE') {
      console.log('[TELEMETRY] Initial state synchronized from server');
    } else if (msg.type === 'EMERGENCY_TRIGGERED') {
      renderInteractiveScreen(5);
      playCriticalAlarm();
      if (serverStatusBadge) {
        serverStatusBadge.classList.add('emergency');
      }
    } else if (msg.type === 'EMERGENCY_CANCELLED') {
      if (serverStatusBadge) {
        serverStatusBadge.classList.remove('emergency');
      }
    }
  }

  function sendTelemetryToBackend() {
    const payload = {
      heartRate: currentHr,
      spo2: currentSpo2,
      temperature: currentTemp,
      fallDetected: isFallDetected,
      motion: currentMotion,
      batteryLevel: 88
    };

    if (wsSocket && wsSocket.readyState === WebSocket.OPEN) {
      wsSocket.send(JSON.stringify({ type: 'TELEMETRY_UPDATE', payload }));
    }

    if (config.API_URL) {
      fetch(`${config.API_URL}/api/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => { /* Graceful offline fallback */ });
    }
  }

  function sendSosToBackend(triggerType = 'MANUAL_SOS') {
    if (wsSocket && wsSocket.readyState === WebSocket.OPEN) {
      wsSocket.send(JSON.stringify({ type: 'SOS_TRIGGER', payload: { triggerType } }));
    }

    if (config.API_URL) {
      fetch(`${config.API_URL}/api/emergency/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType })
      }).catch(() => { /* Graceful offline fallback */ });
    }
  }

  if (syncPushVitalsBtn) {
    syncPushVitalsBtn.addEventListener('click', () => {
      sendTelemetryToBackend();
      playTacticalTick();
      const origText = syncPushVitalsBtn.innerHTML;
      syncPushVitalsBtn.innerHTML = '<span>✓</span> <span>Dispatched to Central Station!</span>';
      setTimeout(() => { syncPushVitalsBtn.innerHTML = origText; }, 1400);
    });
  }

  if (syncTriggerSosBtn) {
    syncTriggerSosBtn.addEventListener('click', () => {
      triggerEmergencyState();
      sendSosToBackend('PANIC_SIMULATOR_BUTTON');
    });
  }

  if (serverStatusBadge) {
    serverStatusBadge.addEventListener('click', () => {
      connectWebSocket();
      playTacticalTick();
    });
  }

  // Hook into emergency state
  const prevTriggerEmergencyState = triggerEmergencyState;
  triggerEmergencyState = function() {
    prevTriggerEmergencyState();
    sendSosToBackend('WATCH_UI_EMERGENCY');
  };

  // Hook into telemetry updates
  let telemetryDebounceTimer = null;
  const prevUpdateAllSensors = updateAllSensors;
  updateAllSensors = function() {
    prevUpdateAllSensors();
    if (telemetryDebounceTimer) clearTimeout(telemetryDebounceTimer);
    telemetryDebounceTimer = setTimeout(() => {
      sendTelemetryToBackend();
    }, 400);
  };

  // Connect to backend WebSocket
  connectWebSocket();
});

