# HealthTrack: Enterprise-Grade SRE Monitoring Dashboard

<div align="center">

[![Stars](https://img.shields.io/github/stars/MeghVyas3132/Metrics-Health-Tracker?style=for-the-badge&color=blue)](https://github.com/MeghVyas3132/Metrics-Health-Tracker/stargazers)
[![Forks](https://img.shields.io/github/forks/MeghVyas3132/Metrics-Health-Tracker?style=for-the-badge&color=green)](https://github.com/MeghVyas3132/Metrics-Health-Tracker/network/members)
[![Issues](https://img.shields.io/github/issues/MeghVyas3132/Metrics-Health-Tracker?style=for-the-badge&color=orange)](https://github.com/MeghVyas3132/Metrics-Health-Tracker/issues)
[![Status](https://img.shields.io/badge/status-production_ready-brightgreen?style=for-the-badge)](https://github.com/MeghVyas3132/Metrics-Health-Tracker)
[![Docker Services](https://img.shields.io/badge/docker_services-9-blue?style=for-the-badge)](https://docker.com)

A complete, enterprise-grade health monitoring and SRE metrics dashboard for tracking services, APIs, and microservices with professional-grade SLO tracking, Prometheus integration, and Grafana visualization.

</div>

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [SRE Metrics](#sre-metrics)
- [API Endpoints](#api-endpoints)
- [Grafana Integration](#grafana-integration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

- ✅ **Real-time SRE Dashboard**: Color-coded health indicators with all key metrics visible on a single pane of glass
- ✅ **Production-Grade Metrics**: Tracks P95/P99 latencies, Apdex score, error rates, and uptime
- ✅ **Professional Visualization**: Pre-built Grafana dashboards for deep-diving into time-series data
- ✅ **Prometheus Integration**: Automatically exports and scrapes metrics for historical analysis and alerting
- ✅ **Smart Alerts**: Multi-signal alerting logic (status + Apdex + error rate) with Redis-backed deduplication
- ✅ **Kafka Event Streaming**: Publishes health check results to Kafka topics for real-time, event-driven integrations
- ✅ **Type-Safe Code**: Built with TypeScript frontend and Python 3.11 backend with Pydantic
- ✅ **Docker Ready**: Deploy the entire 9-service stack with a single command
- ✅ **Embedded Grafana**: View service dashboards directly from the main UI
- ✅ **Sophisticated Animations**: Modern, professional UI with smooth transitions

---

## What It Does

**HealthTrack** is an all-in-one monitoring solution that:

1. **Monitors Services**: Performs periodic, configurable HTTP health checks on any URL
2. **Calculates SRE Metrics**: Computes P95/P99 latencies, Apdex scores, error rates, uptime percentages
3. **Displays a Real-Time Dashboard**: Shows all metrics in a sleek, dark-themed UI that auto-refreshes
4. **Stores Time-Series Data**: Uses Prometheus for robust historical analysis
5. **Visualizes Trends**: Integrates with Grafana for beautiful pre-configured dashboards
6. **Triggers Smart Alerts**: Sends alerts via Slack webhooks with intelligent deduplication
7. **Streams Health Events**: Pushes check results to Kafka for consumption by other services

---

## Quick Start

### ⚡ With Docker (Recommended - 2 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/MeghVyas3132/Metrics-Health-Tracker.git
cd Metrics-Health-Tracker

# 2. Start all services
docker compose up --build -d

# 3. Access the dashboard
# Frontend:    http://localhost:3000
# Grafana:     http://localhost:3001 (admin/admin)
# API Docs:    http://localhost:8000/docs
# Prometheus:  http://localhost:9090
```

**Verify services are running:**
```bash
docker compose ps
```

---

## Local Development

### Prerequisites

- **Docker & Docker Compose** ([install](https://docs.docker.com/get-docker/))
- **Node.js 18+** and **npm**
- **Python 3.11+**
- **PostgreSQL 15** (or use Docker)

### 🔧 Setup Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Start FastAPI server
PYTHONPATH=. uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend running at**: http://localhost:8000
**API Documentation**: http://localhost:8000/docs

### 🎨 Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3001
EOF

# Start dev server
npm run dev
```

**Frontend running at**: http://localhost:3000

### 🐘 Setup Database (Option A: Docker)

```bash
docker run -d \
  --name healthtrack-db \
  -e POSTGRES_DB=healthtrack \
  -e POSTGRES_USER=healthtrack \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  postgres:15
```

### 🐘 Setup Database (Option B: Local PostgreSQL - macOS)

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb healthtrack
createuser healthtrack
psql healthtrack -c "ALTER USER healthtrack WITH PASSWORD 'password123';"

# In .env
DATABASE_URL=postgresql://healthtrack:password123@localhost:5432/healthtrack
```

### 📊 Setup Grafana & Prometheus (Docker Compose)

```bash
docker-compose -f docker-compose.local.yml up -d
```

Access:
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### 🧪 Test Local Setup

```bash
# Check backend metrics endpoint
curl http://localhost:8000/metrics

# Create a service via API
curl -X POST http://localhost:8000/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "url": "https://httpbin.org/status/200",
    "interval_seconds": 60,
    "timeout_seconds": 10
  }'

# View in frontend
# Open http://localhost:3000
```

---

## Production Deployment

### Recommended Platforms

| Platform | Cost | Setup Time | Best For |
|----------|------|-----------|----------|
| **Railway** | $5-20/mo | 10 min ⭐ | Teams, full-stack |
| **Render** | Free+ | 15 min ⭐ | Solo devs |
| **Fly.io** | $2-10/mo | 20 min | Performance |
| **DigitalOcean** | $7-12/mo | 30 min | Control |

### 🚀 Deploy to Railway (Recommended)

**Fastest option - 10 minutes**

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub Repo"
   - Select `MeghVyas3132/Metrics-Health-Tracker`

3. **Set Environment Variables**
   ```
   DATABASE_URL=<Railway auto-generates>
   ENVIRONMENT=production
   NEXT_PUBLIC_API_URL=https://backend-xxx.railway.app
   NEXT_PUBLIC_GRAFANA_URL=https://grafana-xxx.railway.app
   ```

4. **Deploy**
   - Railway auto-deploys on every `git push`
   - Get public URLs from Railway dashboard

### 🚀 Deploy to Render

**Free tier available - 15 minutes**

1. **Create backend service**
   - Go to [render.com](https://render.com)
   - "New" → "Web Service"
   - Connect GitHub repo
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

2. **Create frontend service**
   - "New" → "Web Service"
   - Build: `cd frontend && npm install && npm run build`
   - Start: `cd frontend && npm start`

3. **Create PostgreSQL database**
   - "New" → "PostgreSQL"
   - Render auto-connects to backend

4. **Set Environment Variables**
   ```
   Backend:   DATABASE_URL (auto-generated)
   Frontend:  NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GRAFANA_URL
   ```

### 🪶 Deploy to Fly.io

**Global edge deployment - 20 minutes**

```bash
# Install Fly CLI
brew install flyctl

# Authenticate
flyctl auth login

# Create app
flyctl launch
# Select: Create PostgreSQL (Yes), Deploy (Yes)

# Set environment variables
flyctl secrets set \
  ENVIRONMENT=production \
  NEXT_PUBLIC_API_URL=https://healthtrack.fly.dev \
  NEXT_PUBLIC_GRAFANA_URL=https://grafana.fly.dev

# Deploy
flyctl deploy

# View logs
flyctl logs -f
```

### 📋 Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Backend API responding (`GET /health`)
- [ ] Frontend loads without errors
- [ ] Grafana dashboard accessible
- [ ] Services can connect to database
- [ ] CORS properly configured
- [ ] SSL certificate installed
- [ ] Environment variables set correctly
- [ ] Monitoring alerts configured

---

## Architecture

HealthTrack is composed of 9 microservices orchestrated by Docker Compose.

```
┌────────────────────────────────────────┐
│  HealthTrack Dashboard (Next.js)       │
│  Softer UI + Embedded Grafana Modal    │
│  Port: 3000                            │
└────────────────┬─────────────────────┘
                 │ REST API Calls
                 ▼
┌────────────────────────────────────────┐
│  FastAPI Backend + SRE Metrics Engine  │
│  Port: 8000                            │
├──────┬──────────┬──────────┬──────────┤
│      │          │          │          │
▼      ▼          ▼          ▼          ▼
DB    Redis    Prometheus  Kafka    APScheduler
(SQL) (Cache)  (Metrics)  (Events) (Health Checks)
              ▲
              │
         Grafana
      (Visualization)
      Port: 3001
```

### Services (9 Total)

1. **PostgreSQL 15**: Persistent storage for services and checks
2. **Redis 7**: Caching and alert deduplication
3. **Zookeeper**: Kafka coordination
4. **Kafka**: Event streaming for health data
5. **FastAPI Backend**: Core logic, SRE metrics, API (Python 3.11)
6. **Next.js Frontend**: User-facing dashboard (TypeScript)
7. **Prometheus**: Time-series database for metrics
8. **Grafana**: Data visualization and dashboards
9. **Docker Network**: Communication layer

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Database**: PostgreSQL 15 + SQLAlchemy ORM
- **Validation**: Pydantic 2.4
- **Background Jobs**: APScheduler
- **Event Streaming**: Kafka
- **Caching**: Redis
- **Metrics Export**: Prometheus Client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Monitoring Stack**: Prometheus + Grafana
- **Message Broker**: Kafka + Zookeeper

---

## SRE Metrics

Each service tracks 8 professional-grade metrics with configurable thresholds.

| Metric | Description | ✅ Green | ⚠️ Yellow | 🔴 Red |
|--------|-------------|---------|-----------|--------|
| **Avg Latency** | Mean response time | ≤1000ms | 1-1.5s | >1.5s |
| **P95 Latency** | 95th percentile | ≤1500ms | 1.5-2.2s | >2.2s |
| **P99 Latency** | 99th percentile | ≤2000ms | 2-3s | >3s |
| **Apdex Score** | User satisfaction (0-1) | ≥0.8 | 0.6-0.8 | <0.6 |
| **Error Rate** | Failed check % | ≤2% | 2-5% | >5% |
| **Uptime (24h)** | Service availability | ≥95% | 90-95% | <90% |
| **Request Rate** | Checks per minute | Shows traffic | — | — |
| **Throughput** | Requests per second | Shows capacity | — | — |

---

## API Endpoints

### Services Management

- **`GET /services`** - List all monitored services
- **`POST /services`** - Create a new service
  ```json
  {
    "name": "My API",
    "url": "https://api.example.com/health",
    "interval_seconds": 60,
    "timeout_seconds": 10
  }
  ```
- **`DELETE /services/{id}`** - Remove a service
- **`GET /services/{id}/metrics-summary`** - Full metrics for a service
- **`GET /services/{id}/checks-detailed`** - Recent check history
- **`GET /metrics`** - Prometheus metrics format

### Example Response

```bash
GET /services/1/metrics-summary
```

```json
{
  "service_id": 1,
  "service_name": "GitHub API",
  "current_status": "ok",
  "avg_response_time_ms": 730.5,
  "p95_response_time_ms": 986.7,
  "p99_response_time_ms": 986.7,
  "error_rate_percent": 0.0,
  "uptime_percent_24h": 100.0,
  "request_rate_rpm": 0.13,
  "throughput_rps": 0.0022,
  "apdex_score": 1.0
}
```

---

## Grafana Integration

### ✨ Features

- **Per-Service Buttons**: Each service card has a Grafana chart icon
- **Embedded Dashboard**: View metrics without leaving the dashboard
- **Auto-Configuration**: Dashboards provision automatically
- **Environment-Based URLs**: Works locally and in production

### 🎯 Usage

1. **Hover** over a service card in the dashboard
2. Click the **📊 chart icon** (Grafana button)
3. Modal opens with that service's dashboard
4. Click close or outside to dismiss

### 🔧 Configuration

**Local Development** (`.env.local`)
```bash
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production** (Railway/Render/Fly.io)
```bash
NEXT_PUBLIC_GRAFANA_URL=https://grafana.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 📋 Setup Grafana Dashboard

1. **Access Grafana**: http://localhost:3001 (admin/admin)
2. **Create Dashboard** (or use auto-provisioned one)
3. **Add Variables** for filtering by service:
   - Settings → Variables → New
   - Name: `service`
   - Type: `Query`
   - Query: `label_values(up, instance)`
4. **Export as JSON**: Save to `grafana/dashboards/healthtrack-overview.json`

---

## Project Structure

```
Metrics-Health-Tracker/
├── app/                          # FastAPI Backend
│   ├── main.py                   # API routes and entry point
│   ├── models.py                 # SQLAlchemy ORM models
│   ├── schemas.py                # Pydantic schemas
│   ├── healthchecker.py          # SRE metrics calculation
│   ├── scheduler.py              # APScheduler background jobs
│   ├── alerts.py                 # Alert logic
│   ├── kafka_producer.py         # Kafka integration
│   ├── metrics.py                # Prometheus metrics
│   ├── database.py               # Database configuration
│   ├── redis_client.py           # Redis client
│   └── config.py                 # App configuration
│
├── frontend/                     # Next.js Frontend
│   ├── src/app/
│   │   ├── page.tsx              # Main dashboard (with animations)
│   │   ├── layout.tsx            # Root layout and global styles
│   │   └── globals.css           # Global styles
│   ├── src/components/
│   │   ├── DetailedMetricsCard.tsx
│   │   └── ...
│   ├── src/lib/
│   │   ├── api.ts                # API client
│   │   └── ...
│   ├── tailwind.config.js        # Tailwind CSS config (custom colors)
│   ├── tsconfig.json             # TypeScript config
│   ├── next.config.js            # Next.js config
│   └── package.json              # Dependencies
│
├── grafana-provisioning/         # Grafana dashboards
│   ├── dashboards/
│   │   ├── healthtrack-overview.json
│   │   └── dashboards.yml
│   └── datasources/
│       └── prometheus.yml
│
├── scripts/
│   └── seed.py                   # Database seeding
│
├── tests/
│   └── test_alerts.py            # Alert tests
│
├── docker-compose.yml            # Production stack
├── docker-compose.local.yml      # Local development stack
├── Dockerfile                    # Backend container
├── prometheus.yml                # Prometheus config
├── requirements.txt              # Python dependencies
└── README.md                     # This file
```

---

## Environment Variables

### Backend (`.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/healthtrack

# Server
ENVIRONMENT=development
BACKEND_PORT=8000

# Grafana
GRAFANA_HOST=http://grafana:3000
GRAFANA_PASSWORD=admin

# Prometheus
PROMETHEUS_PORT=9090

# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

# Redis
REDIS_URL=redis://redis:6379

# Security
SECRET_KEY=your-secret-key-here
```

### Frontend (`.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3001
```

---

## Common Tasks

### Restart Services (Local)

```bash
# Restart all containers
docker compose restart

# Restart specific service
docker compose restart backend
docker compose restart grafana

# View logs
docker compose logs -f backend
```

### Stop All Services

```bash
docker compose down

# Remove volumes (clear data)
docker compose down -v
```

### Check Service Status

```bash
# List running containers
docker compose ps

# Check specific service logs
docker compose logs grafana

# Real-time log stream
docker compose logs -f
```

### Database Operations

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# List tables
\dt

# Run migrations
alembic upgrade head

# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"

```bash
# Make sure Docker is running
open -a Docker  # macOS
```

### "Port already in use"

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
docker compose up -e FRONTEND_PORT=3002
```

### "Cannot reach Grafana"

```bash
# Check Grafana is running
curl http://localhost:3001/api/health

# On macOS/Docker Desktop, use host.docker.internal
NEXT_PUBLIC_GRAFANA_URL=http://host.docker.internal:3001
```

### "No data in Grafana"

1. Check Prometheus datasource in Grafana
2. Wait 30 seconds for metrics to be scraped
3. Verify backend exports metrics:
   ```bash
   curl http://localhost:8000/metrics
   ```
4. Check Prometheus scrape targets: http://localhost:9090/targets

### "Frontend can't reach backend"

1. Verify backend is running: `docker compose ps`
2. Check `NEXT_PUBLIC_API_URL` matches backend URL
3. Test API connectivity:
   ```bash
   curl http://localhost:8000/services
   ```

### "Database connection failed"

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check PostgreSQL is running
docker compose ps | grep postgres

# View database logs
docker compose logs postgres
```

### "Port 3001 already in use"

```bash
# Find process using the port
lsof -i :3001

# Kill it
kill -9 <PID>

# Or in docker-compose, use different port
docker compose -e GRAFANA_PORT=3002 up
```

---

## Useful URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend Dashboard | http://localhost:3000 | — |
| Backend API | http://localhost:8000 | — |
| API Documentation | http://localhost:8000/docs | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3001 | admin / admin |

---

## Frontend Features

### 🎨 UI Improvements

- **Softer Color Palette**: Emerald (healthy), Amber (warning), Rose (critical)
- **Sophisticated Animations**: Fade-in, slide-up, pulse effects
- **Professional Styling**: Gradient backgrounds, smooth transitions
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Eye-friendly dark mode by default

### ⚡ Performance

- **Auto-refresh**: Dashboard updates every 30 seconds
- **Optimized Rendering**: Memoized components
- **Lazy Loading**: Progressive component loading
- **Efficient API Calls**: Batched requests

---

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

### Testing

```bash
# Run backend tests
pytest tests/

# Run specific test
pytest tests/test_alerts.py::test_alert_deduplication
```

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## Support & Resources

- **Documentation**: See this README
- **Issues**: [GitHub Issues](https://github.com/MeghVyas3132/Metrics-Health-Tracker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MeghVyas3132/Metrics-Health-Tracker/discussions)

### External Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prometheus Docs](https://prometheus.io/docs)
- [Grafana Docs](https://grafana.com/docs)
- [Kafka Documentation](https://kafka.apache.org/documentation)

---

<div align="center">

**Ready to get started? Pick Docker or your favorite deployment platform and deploy in minutes! 🚀**

</div>
