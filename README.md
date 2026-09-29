# RAKSHAROVER™ Tactical Wearable UI/UX Prototype
### Autonomous Search & Rescue Wearable Telemetry Ecosystem
**Target Environment:** Disaster & Extreme Emergency Operations  
**Hardware Platform:** ESP32-C3 RISC-V Wearable Controller + LoRa 868/915 MHz Mesh  
**Form Factor:** 1.78" AMOLED Tactical Smartwatch / Wristband (368 × 448 px, 326 PPI)

---

## 1. Executive Summary

**RAKSHAROVER** is an autonomous search-and-rescue (SAR) ecosystem engineered for personnel operating in hazardous disaster environments: structural collapses, earthquake zones, industrial chemical hazards, flood terrains, and wilderness search missions.

The **RAKSHAROVER Wristband** functions as a zero-latency, high-reliability tactical telemetry bridge between human rescue operators, the autonomous **RAKSHA-01** Ground Rover, and the incident command station.

The user interface is purposefully designed as a **compact wearable interface**, not a consumer mobile application. Every screen adheres to strict military and emergency medical readability guidelines: high-contrast dark surfaces, glanceable typography, large numerical readouts, tactile status indicators, and zero non-functional decoration.

---

## 2. Core Color Tokens & System Palette

The color architecture is built around immediate situational awareness under low-visibility, smoke, or direct sunlight:

| Token Name | Hex Code | Visual Swatch | Semantic Purpose |
|:---|:---|:---|:---|
| **Deep Dark Base** | `#070B14` | ![#070B14](https://via.placeholder.com/15/070B14/000000?text=+) | Primary OLED power-efficient background; avoids light leakage in dark field ops |
| **Electric Blue** | `#00D2FF` | ![#00D2FF](https://via.placeholder.com/15/00D2FF/000000?text=+) | Primary tactical accent; navigation, active focus, telemetry indicators, radio frequency |
| **Safe Green** | `#10B981` | ![#10B981](https://via.placeholder.com/15/10B981/000000?text=+) | SAFE status, CONNECTED state, regular rhythm, active GNSS 3D fix, optimal vitals |
| **Warning Amber** | `#F59E0B` | ![#F59E0B](https://via.placeholder.com/15/F59E0B/000000?text=+) | Telemetry warnings, body temperature drift, monitoring-only medical disclaimer |
| **Emergency Red** | `#EF4444` | ![#EF4444](https://via.placeholder.com/15/EF4444/000000?text=+) | SOS trigger, critical incident alerts, tachycardia/hypoxia distress, rover dispatch |

---

## 3. Typography Architecture

- **Primary UI & Headings:** `Inter` (SemiBold / Bold / ExtraBold) — ultra-clean legibility at micro-scales.
- **Telemetry & Tabular Numbers:** `JetBrains Mono` (Bold 700 / 800) — fixed-width tabular alignment prevents visual jitter during real-time data streaming.
- **System Branding:** `Space Grotesk` (Bold 800) — authoritative defence/aerospace personality.

---

## 4. The 6 Smartwatch Screens (Overview & UX Specifications)

### 01. HOME / VITAL STATUS
- **Purpose:** Primary operating face providing instant situational assessment in under 1 second.
- **Key Elements:**
  - System Header: `RAKSHA` brand mark + green live status dot + 24h digital tactical clock (`14:38:05`) + GNSS lock icon + battery level pill (`88%`).
  - System Status Badge: `● STATUS: SAFE` with subtle green glow.
  - Hero Time Readout: Large high-contrast tabular clock (`14:38:05 UTC+05:30`).
  - 2×2 Vitals Quick-Glance Cards:
    - **Heart Rate:** `82 BPM` with dynamic range bar
    - **SpO₂:** `97%` with oxygen droplet glyph and saturation bar
    - **Body Temp:** `36.7°C` (Status: `NORMOTHERMIC`)
    - **GNSS:** `ACTIVE` (`3D FIX • 14 SAT`)
  - Bottom Status Strip: `ROVER: RAKSHA-01 LINKED | BATTERY: 88%`.
  - Consistent 6-dot navigation indicator (Dot 1 active in electric blue).

### 02. HEALTH MONITORING
- **Purpose:** Continuous physiological telemetry streaming from onboard sensors with real-time waveform tracking.
- **Key Elements:**
  - **❤️ Heart Rate (MAX30102):** `82 BPM`, `Sinus Regular`, `NORMAL` badge + real-time animated PPG/ECG waveform sparkline.
  - **🫁 SpO₂ Saturation (MAX30102):** `97%`, target range `95 - 100%`, `OPTIMAL` status + area trend curve.
  - **🌡 Body Temp (MLX90614):** `36.7°C` contactless infrared measurement.
  - **🏃 Motion Status (LSM6DSOX):** `NORMAL` (Edge ML gait stability, 0 falls detected).
  - **Mandatory Medical Disclaimer:** `⚠️ MONITORING DATA ONLY • NOT A MEDICAL DIAGNOSIS` prominently displayed in high-contrast tactical amber.
  - Dot 2 active.

### 03. LOCATION
- **Purpose:** Tactical coordinates, satellite geometry, and spatial proximity relative to the autonomous companion rover.
- **Key Elements:**
  - Header: `GPS: ACTIVE (3D FIX)` + Precision accuracy pill: `±1.4 m`.
  - **Tactical Vector Radar Display:**
    - Concentric range rings (50m, 100m, 200m) with crosshairs and cardinal markers (North/East).
    - User blip with pulsing blue radar ping and real-time azimuth heading line.
    - Rover **RAKSHA-01** companion position target blip (`Bearing 038° NNE • Dist 185m`).
  - **Precision Coordinates Readout:**
    - `LAT: 11.016844° N`
    - `LON: 76.955832° E`
    - `ALT: 412m MSL` • `ACC: ±1.4 m` • `u-blox MAX-M10S`
  - Connection & Battery Footer: `MESH: CONNECTED • BAT: 88%`.
  - Dot 3 active.

### 04. SOS / EMERGENCY ACTIVATION
- **Purpose:** High-clarity fail-safe manual panic trigger engineered to prevent accidental activations while ensuring instantaneous deployment under stress.
- **Key Elements:**
  - Top Alert Bar: `EMERGENCY PROTOCOL`.
  - Instruction Callout: `⚠️ PRESS & HOLD 3 SEC TO ACTIVATE`.
  - **Tactile 3-Second Radial Countdown Button:**
    - Heavy red circular push actuator with embossed `SOS` typography.
    - Circular SVG countdown ring that smoothly fills over 3000 milliseconds upon press/hold.
  - **Visual Telemetry Routing Diagram:**
    `[ ⌚ WRISTBAND ] ──( ⚡ LoRa RF )──> [ 📡 EMERGENCY SIGNAL ] ──> [ 🤖 ROVER / CONTROL ]`
  - **Accidental Trigger Cancellation:** `✕ CANCEL ACTIVATION` button with secondary safety safeguard.
  - Dot 4 active.

### 05. ROVER CONNECTION
- **Purpose:** Bidirectional wireless telemetry status between wristband and autonomous rescue rover.
- **Key Elements:**
  - Status Banner: `● CONNECTED` in vibrant green + 4-bar RSSI signal meter (`RSSI -64 dBm`).
  - **Interactive RF Wave Visualization:** Animated LoRa radio wave pulses propagating between `[⌚ WRISTBAND]` and `[🤖 RAKSHA-01]` over `868 MHz LoRa`.
  - **Telemetry Specifications:**
    - Rover ID: `RAKSHA-01`
    - Communication: `LONG-RANGE TELEMETRY` (LoRa P2P Mesh)
    - Rover Battery: `82%` with internal LiFePO4 battery gauge
    - Link Metrics: `-64 dBm • SNR +9.8 dB`
  - Spatial Vector: `↗ BEARING 038° NNE • 185m AWAY` + `STANDBY TRACKING`.
  - Dot 5 active.

### 06. EMERGENCY MODE
- **Purpose:** Distinct, unmissable high-alert critical state triggered by manual SOS or automatic fall/vital anomaly.
- **Key Elements:**
  - **High-Alert Emergency Casing:** Pulsing red bezel perimeter glow (`#EF4444`).
  - Top Alert Banner: `🚨 EMERGENCY DETECTED` with trigger attribution (`SOS BUTTON INTERRUPT (ESP32-C3)`).
  - **Distressed Vitals Readout:**
    - Heart Rate: `138 BPM` (`TACHYCARDIA` alert)
    - SpO₂: `89%` (`HYPOXIC` alert)
    - Body Temp: `37.9°C` (`ELEVATED` alert)
  - **Automated Incident Response Stream:**
    - `✔ LOCATION SHARED: 11.016844, 76.955832`
    - `✔ RAKSHAROVER DEPLOYMENT REQUESTED`
    - Live transmission broadcast beacon indicator to RAKSHA-01.
  - **Rover Acknowledgement Box:**
    - `✔ ACK RECEIVED FROM RAKSHA-01`
    - `AUTONOMOUS ROVER DISPATCHED • ETA: 03:45 MIN`
  - Dot 6 active in bright emergency red.

---

## 5. Dynamic Threshold Response & Automated Escalation Engine

The interactive smartwatch continuously evaluates streaming physiological data against clinical and rescue field thresholds:

```
+-----------------------------------------------------------------------------------------+
|                               PHYSIOLOGICAL THRESHOLD MATRIX                             |
+-------------------+--------------------+------------------------+-----------------------+
| PARAMETER         | SAFE ZONE (GREEN)  | WARNING ZONE (AMBER)   | CRITICAL ZONE (RED)   |
+-------------------+--------------------+------------------------+-----------------------+
| Heart Rate (BPM)  | 60 - 100 BPM       | 101 - 120 BPM (Mild)   | > 120 BPM (Tachy)     |
| (MAX30102)        | Sinus Regular      | 50 - 59 BPM (Brady)    | < 50 BPM (Severe)     |
+-------------------+--------------------+------------------------+-----------------------+
| SpO₂ Saturation   | 95% - 100%         | 90% - 94%              | < 90% (e.g. 86%)      |
| (MAX30102)        | Optimal oxygen     | Mild Hypoxia           | Critical Hypoxia      |
+-------------------+--------------------+------------------------+-----------------------+
| Body Temp (°C)    | 36.1°C - 37.2°C    | 37.3°C - 38.4°C (Fever)| > 38.5°C (Hyperthermy)|
| (MLX90614)        | Normothermic       | 35.0°C - 36.0°C (Cold) | > 40.0°C (Heatstroke) |
+-------------------+--------------------+------------------------+-----------------------+
| Motion & Impact   | Normal gait /      | Heavy vibrations       | Freefall + 4.8G Impact|
| (LSM6DSOX IMU)    | Zero falls         | (Pre-fall anomaly)     | FALL DETECTED         |
+-----------------------------------------------------------------------------------------+
```

### Visual & System Reactions when Crossing Thresholds:
1. **Warning Level (Amber `#F59E0B`):**
   - The breached metric card shifts from subtle electric blue to glowing amber (`state-warning`).
   - The watch status pill flips from `● SAFE` to `▲ WARNING: ELEVATED`.
   - The real-time ECG waveform in Screen 02 accelerates and shifts color.
   - Dual-frequency audio tone (580Hz + 880Hz) plays via Web Audio API.
   - The Telemetry Protocol State panel shifts from `SAFE` to `WARNING: THRESHOLD DRIFT (48% Risk)`.

2. **Critical Emergency Level (Red `#EF4444`):**
   - The watch chassis starts pulsating with an intense emergency perimeter glow (`alert-border-pulse`).
   - Breached cards turn high-alert red with bold warning tags (`CRITICAL TACHYCARDIA`, `HEAT STROKE ALERT`, `CRITICAL HYPOXIA`).
   - An **In-Watch Threshold Breach Alert Overlay** appears on the smartwatch display with an automated 5-second countdown to auto-dispatch the autonomous rover:
     ```
     🚨 CRITICAL THRESHOLD BREACH
     Heart Rate: 170 BPM (CRITICAL TACHYCARDIA) • Temp: 41.0°C (HEAT STROKE ALERT)
     DISPATCHING RAKSHA-01 IN: 05s
     [ CANCEL ]    [ DISPATCH NOW ]
     ```
   - Clicking `CANCEL` suppresses auto-escalation; letting the timer expire or clicking `DISPATCH NOW` immediately transfers into **Screen 06 EMERGENCY MODE** with live distressed vitals and rover dispatch confirmation.
   - Synthesized urgent alarm warble (880Hz / 440Hz alert tone).
   - Telemetry Protocol State updates: `🚨 EMERGENCY DISPATCH ACTIVE (96% Risk)` and `Rover: RAKSHA-01 (DISPATCHED • ETA 03:45)`.

---

## 6. Hardware Data-to-UI Mapping Architecture

```
+-------------------------------------------------------------------------------+
|                        RAKSHAROVER HARDWARE PIPELINE                          |
+-------------------------------------------------------------------------------+
| SENSOR / IC       | INTERFACE | HARDWARE ROLE          | UI MAPPING           |
+-------------------+-----------+------------------------+----------------------+
| MAX30102          | I2C Bus   | Dual Red/IR Optical    | Screen 01, 02, 06:   |
| (Maxim Int.)      | (0x57)    | Pulse Oximetry (PPG)   | Heart Rate + SpO₂    |
+-------------------+-----------+------------------------+----------------------+
| MLX90614          | I2C Bus   | Non-Contact Medical    | Screen 01, 02, 06:   |
| (Melexis)         | (0x5A)    | Infrared Thermopile    | Body Temp (°C)       |
+-------------------+-----------+------------------------+----------------------+
| LSM6DSOX          | SPI Bus   | 6-DoF Accelerometer    | Screen 02:           |
| (STMicro)         |           | + Gyro + ML Core       | Motion & Fall State  |
+-------------------+-----------+------------------------+----------------------+
| u-blox MAX-M10S   | UART Bus  | Multi-Constellation    | Screen 01, 03, 06:   |
| (u-blox)          | (9600bd)  | GNSS (GPS/Galileo/BD)  | Lat/Lon + Radar Map  |
+-------------------+-----------+------------------------+----------------------+
| ESP32-C3 RISC-V   | Core MCU  | 32-bit System SoC +    | Screen 04, 05, 06:   |
| + SX1262 LoRa     | SPI/GPIO  | 868MHz Mesh Telemetry  | Rover Comms & Link   |
+-------------------+-----------+------------------------+----------------------+
| Tactical Switch   | GPIO INTR | IP68 Sealed Pushbutton | Screen 04 & 06:      |
| (Hardware Debounce| (Pull-Up) | Manual Panic Trigger   | 3-Second SOS Hold    |
+-------------------------------------------------------------------------------+
```

---

## 6. Separated Architecture & Deployment

The codebase is structured into fully decoupled **Frontend** and **Backend** tiers with Docker, cloud PaaS, and static host support:

```
WristWatch/
├── backend/            # Express REST API + Real-Time WebSocket Telemetry Gateway
│   ├── src/            # Server, routes, telemetryStore & websocket handlers
│   ├── Dockerfile      # Production Node 22 Alpine container
│   └── package.json    # Backend dependencies (express, ws, cors, dotenv)
├── frontend/           # Tactical Wearable Smartwatch UI Prototype
│   ├── index.html      # 6 AMOLED screens + Telemetry Uplink HUD + Audio FX
│   ├── app.js          # Interactive state machine & TacticalBackendSync client
│   ├── config.js       # Auto-detects local backend vs remote URL
│   ├── Dockerfile      # Nginx Alpine container with Gzip & caching
│   ├── nginx.conf      # SPA reverse proxy configuration
│   └── vercel.json     # 1-click Vercel deployment
├── docker-compose.yml  # Multi-container orchestration (Frontend: 3000, Backend: 5000)
├── Dockerfile          # Single-container unified deployment for Render/Railway
├── render.yaml         # Render Infrastructure-as-Code Blueprint
├── DEPLOYMENT.md       # Comprehensive cloud & container deployment manual
└── package.json        # Root script runner (npm start, npm run dev, npm test)
```

### Quick Start:

#### 1. Run Backend (Port 5000):
```bash
cd backend
npm install
npm start
```

#### 2. Run Frontend (Port 3000):
```bash
cd frontend
npx -y serve . -l 3000
```
Open **`http://localhost:3000`** in any browser. The watch automatically links to the backend via WebSocket and displays `● API: ONLINE (PORT 5000)`!

#### 3. Run with Docker Compose:
```bash
docker compose up --build
```

For full deployment instructions (Vercel, Netlify, Render, Railway, Fly.io, single-container deployment), see **[DEPLOYMENT.md](file:///c:/Users/kanak/Downloads/WristWatch/DEPLOYMENT.md)**.

---

### Interactive Presentation Features:
1. **6-Screen Grid View (Default):**
   - All 6 smartwatch screens arranged side-by-side with labels `01 HOME`, `02 HEALTH`, `03 LOCATION`, `04 SOS`, `05 ROVER LINK`, `06 EMERGENCY`.
2. **Bezel Toggle ("Bezel: Rugged" / "Bezel: Minimal Screen"):**
   - Click the toolbar button to switch between the heavy-duty CNC titanium disaster chassis and the clean edge-to-edge AMOLED display.
3. **Hardware Mapping Drawer:**
   - Click `Hardware Mapping` to inspect the IC sensors, bus protocols, and sampling characteristics.
4. **Live Interactive Unit (Simulator Mode):**
   - Switch to `Live Interactive Unit` to interact with a centralized operational smartwatch.
   - **Hold-to-Activate SOS:** Click and hold the red SOS button on Screen 04 for 3 full seconds. The radial SVG progress ring smoothly fills, vibrates visually, and transitions to Screen 06 EMERGENCY!
   - **Crown Dial:** Click or rotate the physical digital crown to advance between screens.
   - **Sensor Injection Sliders:** Adjust Heart Rate (50-170 BPM), SpO₂ (75-100%), and Temperature (34.0-41.0°C) to see real-time updates across screens.
   - **Live Backend Uplink:** Real-time bi-directional telemetry broadcast over WebSockets and REST.
5. **Keyboard Shortcuts:**
   - `1` through `6`: Instantly switch to any screen
   - `←` / `→`: Navigate previous/next screen
   - `Esc`: Return to 6-screen side-by-side grid

---
*RAKSHAROVER Autonomous Rescue System • Engineering & Wearable UI/UX Specification*

