const EventEmitter = require('events');

/**
 * Tactical Telemetry Store & Incident Management Engine
 * Manages live vitals, clinical threshold states, autonomous rover metrics,
 * and emergency incident dispatch timelines.
 */
class TelemetryStore extends EventEmitter {
  constructor() {
    super();

    // Current physiological telemetry
    this.vitals = {
      heartRate: 82,
      spo2: 97,
      temperature: 36.7,
      motion: 'NORMAL',
      fallDetected: false,
      batteryLevel: 88,
      threatLevel: 'SAFE', // 'SAFE' | 'WARNING' | 'CRITICAL'
      threatDetails: [],
      lastUpdated: new Date().toISOString()
    };

    // Tactical GNSS Coordinates
    this.gps = {
      latitude: 11.016844,
      longitude: 76.955832,
      altitude: 412,
      accuracy: 1.4,
      fixType: '3D FIX',
      satellites: 14,
      lastFixTime: new Date().toISOString()
    };

    // Autonomous Rover RAKSHA-01 State
    this.rover = {
      id: 'RAKSHA-01',
      model: 'UGV-TACTICAL-MK3',
      status: 'STANDBY_TRACKING', // 'STANDBY_TRACKING' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE'
      batteryLevel: 82,
      rssi: -64,
      snr: 9.8,
      frequencyMhz: 868.1,
      bearingDeg: 38,
      bearingCardinal: 'NNE',
      distanceMeters: 185,
      etaSeconds: 225, // 03:45 min
      lastAckTimestamp: new Date().toISOString()
    };

    // Active Emergency State
    this.emergency = {
      active: false,
      incidentId: null,
      triggerType: null, // 'MANUAL_SOS' | 'THRESHOLD_ESCALATION' | 'FALL_IMPACT'
      triggeredAt: null,
      resolvedAt: null,
      roverDispatched: false,
      dispatchEta: null,
      timeline: []
    };

    // History log of incidents (capped at 50)
    this.incidents = [];

    // Rolling telemetry history for charts (capped at 60 data points)
    this.vitalsHistory = [];
    this._recordHistoryPoint();

    // Rover simulation timer
    this._roverInterval = null;
  }

  /**
   * Evaluate clinical and tactical thresholds based on sensor inputs
   */
  evaluateThreatLevel(hr, spo2, temp, fall) {
    const details = [];
    let level = 'SAFE';

    // 1. Fall Impact Detection (LSM6DSOX)
    if (fall) {
      details.push('CRITICAL: 4.8G FALL IMPACT DETECTED');
      level = 'CRITICAL';
    }

    // 2. Heart Rate Assessment (MAX30102)
    if (hr > 120) {
      details.push(`CRITICAL TACHYCARDIA (${hr} BPM)`);
      level = 'CRITICAL';
    } else if (hr < 50) {
      details.push(`SEVERE BRADYCARDIA (${hr} BPM)`);
      level = 'CRITICAL';
    } else if (hr > 100) {
      details.push(`ELEVATED HEART RATE (${hr} BPM)`);
      if (level !== 'CRITICAL') level = 'WARNING';
    } else if (hr < 60) {
      details.push(`MILD BRADYCARDIA (${hr} BPM)`);
      if (level !== 'CRITICAL') level = 'WARNING';
    }

    // 3. SpO2 Oxygen Saturation (MAX30102)
    if (spo2 < 90) {
      details.push(`CRITICAL HYPOXIA (${spo2}%)`);
      level = 'CRITICAL';
    } else if (spo2 <= 94) {
      details.push(`MILD HYPOXIA (${spo2}%)`);
      if (level !== 'CRITICAL') level = 'WARNING';
    }

    // 4. Body Temperature (MLX90614)
    if (temp >= 40.0) {
      details.push(`HEAT STROKE ALERT (${temp.toFixed(1)}°C)`);
      level = 'CRITICAL';
    } else if (temp >= 38.5) {
      details.push(`HIGH HYPERTHERMIA (${temp.toFixed(1)}°C)`);
      level = 'CRITICAL';
    } else if (temp >= 37.3) {
      details.push(`ELEVATED TEMPERATURE (${temp.toFixed(1)}°C)`);
      if (level !== 'CRITICAL') level = 'WARNING';
    } else if (temp < 35.0) {
      details.push(`HYPOTHERMIA ALERT (${temp.toFixed(1)}°C)`);
      if (level !== 'CRITICAL') level = 'WARNING';
    }

    return { level, details };
  }

  /**
   * Update vitals from telemetry packet
   */
  updateVitals(data) {
    const hr = typeof data.heartRate === 'number' ? data.heartRate : this.vitals.heartRate;
    const spo2 = typeof data.spo2 === 'number' ? data.spo2 : this.vitals.spo2;
    const temp = typeof data.temperature === 'number' ? parseFloat(data.temperature) : this.vitals.temperature;
    const fall = typeof data.fallDetected === 'boolean' ? data.fallDetected : this.vitals.fallDetected;
    const motion = data.motion || (fall ? 'FALL IMPACT' : 'NORMAL');
    const battery = typeof data.batteryLevel === 'number' ? data.batteryLevel : this.vitals.batteryLevel;

    const { level, details } = this.evaluateThreatLevel(hr, spo2, temp, fall);

    this.vitals = {
      heartRate: hr,
      spo2: spo2,
      temperature: temp,
      motion: motion,
      fallDetected: fall,
      batteryLevel: battery,
      threatLevel: level,
      threatDetails: details,
      lastUpdated: new Date().toISOString()
    };

    if (data.gps) {
      this.gps = { ...this.gps, ...data.gps, lastFixTime: new Date().toISOString() };
    }

    this._recordHistoryPoint();
    this.emit('telemetry_update', { vitals: this.vitals, gps: this.gps });

    return { vitals: this.vitals, gps: this.gps };
  }

  /**
   * Trigger SOS Emergency Protocol
   */
  triggerEmergency({ triggerType = 'MANUAL_SOS', details = null } = {}) {
    const incidentId = `INC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    this.emergency = {
      active: true,
      incidentId: incidentId,
      triggerType: triggerType,
      triggeredAt: timestamp,
      resolvedAt: null,
      roverDispatched: true,
      dispatchEta: '03:45',
      timeline: [
        { time: timestamp, event: 'EMERGENCY_TRIGGERED', details: details || `Trigger type: ${triggerType}` },
        { time: timestamp, event: 'GNSS_FIX_LOCKED', details: `Coordinates: ${this.gps.latitude.toFixed(6)}, ${this.gps.longitude.toFixed(6)}` },
        { time: timestamp, event: 'LORA_UPLINK_BROADCAST', details: 'Packet dispatched via 868.1MHz RF Mesh' },
        { time: timestamp, event: 'ROVER_DISPATCHED', details: 'RAKSHA-01 Autonomous UGV deployed to operator coordinates' }
      ]
    };

    this.rover.status = 'DISPATCHED';
    this.rover.lastAckTimestamp = timestamp;
    this.rover.distanceMeters = 185;
    this.rover.etaSeconds = 225;

    // Start simulation of rover closing in
    this._startRoverSimulation();

    const incidentRecord = { ...this.emergency };
    this.incidents.unshift(incidentRecord);
    if (this.incidents.length > 50) this.incidents.pop();

    this.emit('emergency_triggered', this.emergency);
    return this.emergency;
  }

  /**
   * Cancel or resolve active emergency
   */
  cancelEmergency(reason = 'Operator Manual Cancel') {
    if (!this.emergency.active) return { message: 'No active emergency' };

    const timestamp = new Date().toISOString();
    this.emergency.active = false;
    this.emergency.resolvedAt = timestamp;
    this.emergency.timeline.push({
      time: timestamp,
      event: 'EMERGENCY_RESOLVED',
      details: reason
    });

    this.rover.status = 'STANDBY_TRACKING';
    this._stopRoverSimulation();

    // Update active incident in history
    const existing = this.incidents.find(i => i.incidentId === this.emergency.incidentId);
    if (existing) {
      existing.active = false;
      existing.resolvedAt = timestamp;
      existing.timeline = [...this.emergency.timeline];
    }

    this.emit('emergency_cancelled', { incidentId: this.emergency.incidentId, reason, timestamp });
    return this.emergency;
  }

  /**
   * Simulate rover movement towards target coordinates
   */
  _startRoverSimulation() {
    this._stopRoverSimulation();
    this._roverInterval = setInterval(() => {
      if (!this.emergency.active) {
        this._stopRoverSimulation();
        return;
      }

      if (this.rover.distanceMeters > 5) {
        this.rover.distanceMeters = Math.max(0, this.rover.distanceMeters - 8);
        this.rover.etaSeconds = Math.max(0, Math.round(this.rover.distanceMeters * 1.2));
        const mins = Math.floor(this.rover.etaSeconds / 60);
        const secs = this.rover.etaSeconds % 60;
        this.emergency.dispatchEta = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (this.rover.distanceMeters <= 20 && this.rover.status !== 'ON_SCENE') {
          this.rover.status = 'ON_SCENE';
          this.emergency.timeline.push({
            time: new Date().toISOString(),
            event: 'ROVER_ON_SCENE',
            details: 'RAKSHA-01 arrived at operator coordinates (Distance < 20m)'
          });
        }
      }

      this.emit('rover_update', this.rover);
    }, 3000);
  }

  _stopRoverSimulation() {
    if (this._roverInterval) {
      clearInterval(this._roverInterval);
      this._roverInterval = null;
    }
  }

  /**
   * Record rolling vitals history
   */
  _recordHistoryPoint() {
    const point = {
      timestamp: new Date().toISOString(),
      heartRate: this.vitals.heartRate,
      spo2: this.vitals.spo2,
      temperature: this.vitals.temperature,
      threatLevel: this.vitals.threatLevel
    };

    this.vitalsHistory.push(point);
    if (this.vitalsHistory.length > 60) {
      this.vitalsHistory.shift();
    }
  }

  /**
   * Return full system state snapshot
   */
  getSummary() {
    return {
      vitals: this.vitals,
      gps: this.gps,
      rover: this.rover,
      emergency: this.emergency,
      incidentsCount: this.incidents.length,
      historyLength: this.vitalsHistory.length,
      serverTime: new Date().toISOString()
    };
  }
}

// Export singleton instance
module.exports = new TelemetryStore();
