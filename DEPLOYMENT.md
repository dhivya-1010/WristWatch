# 🚀 RAKSHAROVER™ Tactical Telemetry — Deployment Guide

Autonomous Search & Rescue Wearable Smartwatch UI and Real-Time Rover Telemetry Gateway.

---

## 🏗️ 1. Architecture Overview

The system has been completely decoupled into independent, production-grade **Frontend** and **Backend** tiers:

```
WristWatch/
├── backend/                  # REST API & WebSocket Telemetry Gateway (Node.js Express + ws)
│   ├── src/
│   │   ├── server.js         # HTTP Server, REST router & WebSocket mounting
│   │   ├── telemetryStore.js # Physiological threshold engine & rover movement simulation
│   │   ├── websocket.js      # Real-time bidirectional streaming gateway
│   │   └── routes/           # /api/health, /api/telemetry, /api/emergency, /api/rover
│   ├── Dockerfile            # Production Node 22 Alpine container
│   ├── Procfile              # Railway / Heroku process declaration
│   └── package.json          # Dependencies & start scripts
│
├── frontend/                 # Tactical Smartwatch UI Prototype (Pure HTML5/CSS3/JS)
│   ├── index.html            # 6 AMOLED screens + Telemetry Uplink HUD + Audio FX
│   ├── styles.css            # OLED dark mode, responsive styling, and animations
│   ├── app.js                # UI state machine & TacticalBackendSync client
│   ├── config.js             # Environment auto-detection & URL query parameter overrides
│   ├── Dockerfile            # High-performance Nginx Alpine container
│   ├── nginx.conf            # Gzip compression, asset caching & security headers
│   └── vercel.json           # 1-click Vercel deployment configuration
│
├── docker-compose.yml        # Multi-container orchestration (Frontend: 3000, Backend: 5000)
├── Dockerfile                # Unified all-in-one container (serves UI + API on 1 port)
├── render.yaml               # Render Infrastructure-as-Code Blueprint
├── package.json              # Workspace root dev & build script orchestrator
└── DEPLOYMENT.md             # This comprehensive guide
```

---

## 💻 2. Running Locally

### Option A: Run Separately (Recommended for Development)

Open two terminal windows:

**Terminal 1 — Backend (Port 5000):**
```bash
cd backend
npm install
npm start
```
*API available at `http://localhost:5000` | WebSocket at `ws://localhost:5000/ws`*

**Terminal 2 — Frontend (Port 3000):**
```bash
cd frontend
npx -y serve . -l 3000
```
*UI available at `http://localhost:3000`*

The frontend automatically detects `http://localhost:5000` and displays:  
`● API: ONLINE (PORT 5000)` with live round-trip ping latency!

---

### Option B: One-Command Root Runner

From the repository root:
```bash
# Start backend API:
npm start

# Run verification test suite:
npm test
```

---

### Option C: Run via Docker Compose

```bash
docker compose up --build
```

- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`

To stop:
```bash
docker compose down
```

---

## ☁️ 3. Deploying to the Cloud

You have two deployment strategies depending on your cloud hosting preference:

### Strategy 1: Separate Deployments (Vercel/Netlify + Render/Railway)

#### A. Deploy Frontend on Vercel (Free & Instant)
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository.
4. Set **Root Directory** to `frontend`.
5. Framework Preset: **Other**.
6. Click **Deploy**.
7. Once deployed, link it to your backend by opening:  
   `https://your-frontend.vercel.app?api=https://your-backend.onrender.com`

#### B. Deploy Backend on Render (Free Web Service)
1. Go to [Render](https://render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Environment Variables:
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `*` (or your Vercel frontend URL)
5. Click **Create Web Service**.

#### C. Deploy Backend on Railway (Alternative)
1. Go to [Railway](https://railway.app/) and create a new project from your GitHub repo.
2. Set the root directory to `/backend`.
3. Railway automatically detects `backend/Procfile` and assigns a public URL with HTTPS and WebSockets enabled!

---

### Strategy 2: Unified Single-Service Deployment (Zero Cost, 1 Service)

If you are using a cloud free tier (such as Render or Railway) that allows only one web service, you can deploy both frontend and backend together using the root `Dockerfile` or `SERVE_FRONTEND=true`:

#### Using Render (Single Service):
1. Create a **Web Service** on Render pointing to your repo.
2. Select **Docker** environment.
3. Render will use the root `Dockerfile`, which packages both `frontend` and `backend` and serves them seamlessly on port 5000!
4. Both the smartwatch UI and `/api` endpoints will be live on the single Render URL.

#### Using Railway / Heroku:
1. Deploy from root.
2. In Railway/Heroku Environment Variables, set:
   ```env
   SERVE_FRONTEND=true
   ```
3. The server serves the tactical smartwatch UI at `/` and the REST/WS API at `/api` and `/ws`.

---

## 📡 4. Backend REST API & WebSocket Reference

### REST Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api` | API discovery and endpoint sitemap |
| `GET` | `/api/health` | Service uptime, memory usage, and operational status |
| `GET` | `/api/telemetry` | Current physiological vitals, GPS, and threat evaluation |
| `POST` | `/api/telemetry` | Ingest sensor data from wearable MCU (ESP32-C3) or simulator |
| `GET` | `/api/telemetry/history` | Rolling vitals trend data points for analytical charts |
| `POST` | `/api/telemetry/reset` | Reset vitals to baseline safe state |
| `GET` | `/api/emergency/status` | Active emergency state and timeline |
| `POST` | `/api/emergency/sos` | Trigger tactical emergency SOS and auto-dispatch rover |
| `POST` | `/api/emergency/cancel` | Cancel or resolve active emergency incident |
| `GET` | `/api/emergency/incidents` | Incident history logs with timestamps |
| `GET` | `/api/rover` | Autonomous ground rover status, coordinates, battery & link |
| `POST` | `/api/rover/dispatch` | Command rover deployment |
| `POST` | `/api/rover/reset` | Reset rover to standby mode |
| `POST` | `/api/rover/ping` | Telemetry link round-trip verification |

### Sample Payload (`POST /api/telemetry`):
```json
{
  "heartRate": 138,
  "spo2": 89,
  "temperature": 38.6,
  "fallDetected": false,
  "motion": "NORMAL",
  "batteryLevel": 88
}
```

### WebSocket Events (`ws://<host>:<port>/ws`):
- `INITIAL_STATE`: Sent immediately upon connection with current system state.
- `TELEMETRY_UPDATE`: Broadcast whenever vitals change.
- `EMERGENCY_TRIGGERED`: Broadcast when SOS is activated.
- `EMERGENCY_CANCELLED`: Broadcast when incident is resolved.
- `ROVER_UPDATE`: Broadcast every 3 seconds as the rover approaches operator coordinates.
- `PING` / `PONG`: Heartbeat keepalive and latency measurement.

---

## 🛡️ 5. Standalone Offline Fallback

The frontend is designed to be **fault-tolerant**:
- If the backend is running, the UI connects automatically and streams live data.
- If the backend is offline or disconnected, the UI gracefully enters **Standalone Mode** (`API: STANDALONE`). All smartwatch screens, audio synthesizers, interactive controls, and animations remain 100% functional without throwing errors.
