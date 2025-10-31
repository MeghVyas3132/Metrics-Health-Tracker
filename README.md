# 🚀 HealthTrack - Production-Ready SRE Monitoring Dashboard

A **complete, enterprise-grade health monitoring and SRE metrics dashboard** for tracking services, APIs, and microservices with professional-grade SLO tracking, Prometheus integration, and Grafana visualization.

**[Status: Production Ready ✅ • 9 Docker Services • Full SRE Metrics Stack]**

---

## � Features at a Glance

- **Real-time SRE Dashboard** - Color-coded health indicators (🟢/🟡/🔴) with all metrics visible
- **Production-Grade Metrics** - P95/P99 latencies, Apdex score, error rates, uptime tracking
- **Professional Visualization** - Grafana dashboards with time-series graphs
- **Prometheus Integration** - Automatic metrics export and scraping
- **Smart Alerts** - Multi-signal alerting (status + Apdex + error rate)
- **Kafka Event Streaming** - Real-time event publishing
- **Type-Safe Code** - TypeScript frontend, Python 3.11 backend with Pydantic
- **Docker Ready** - One-command deployment with 9 microservices

---

## 🎯 What It Does

**HealthTrack** is a complete monitoring solution that:

1. **Monitors Services** - Performs periodic HTTP health checks on any URL
2. **Calculates SRE Metrics** - Computes P95/P99 latencies, Apdex scores, error rates, uptime %
3. **Displays Real-Time Dashboard** - Shows all metrics in a beautiful dark-themed UI
4. **Stores Time-Series Data** - Prometheus database for historical analysis
5. **Visualizes Trends** - Grafana dashboards for deep analysis
6. **Triggers Alerts** - Redis-backed deduplication with Slack webhooks
7. **Streams Events** - Kafka topics for real-time integrations

---

## 🚀 Quick Start

### With Docker (Recommended)

```bash
# 1. Clone repository
git clone https://github.com/MeghVyas3132/Metrics-Health-Tracker.git
cd healthtrack

# 2. Set up environment
cp .env.example .env

# 3. Start full stack
docker compose up --build -d

# 4. Open dashboards
# Frontend: http://localhost:3000
# Grafana: http://localhost:3001
# API Docs: http://localhost:8000/docs
# Prometheus: http://localhost:9090
```

### Local Development

**Backend:**
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## � Dashboard Preview

```
┌─────────────────────────────────────────────────────┐
│ HealthTrack                        [+ Add Service]  │
│ SRE Dashboard • Service Health Monitoring           │
│                                                     │
│ Services: 4    Healthy: 4    Issues: 0              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 🟢 GitHub API                     [Delete ❌]      │
│    https://api.github.com                           │
├─────────────────────────────────────────────────────┤
│ LATENCY:                                            │
│  [730ms]  [986ms]  [986ms]  [1.0]                  │
│   Avg      P95      P99     Apdex                  │
├─────────────────────────────────────────────────────┤
│ METRICS:                                            │
│  [0.0%]   [100%]   [0.13/m]  [0.002/s]            │
│   Error   Uptime   ReqRate   Throughput            │
├─────────────────────────────────────────────────────┤
│ 9 checks • Last: 11:46:26       [View Grafana →]  │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### Complete System

```
┌──────────────────────────────────┐
│  HealthTrack Dashboard (Next.js) │
│        :3000                     │
└───────────┬──────────────────────┘
            │ REST API
            ▼
┌──────────────────────────────────┐
│   FastAPI Backend + SRE Engine   │
│        :8000                     │
├──────────┬──────────┬────────────┤
│          │          │            │
▼          ▼          ▼            ▼
DB      Redis    Prometheus    Kafka
         
           ▲          ▲
           │          │
       APScheduler   Grafana
      (Health Checks) :3001
```

### Services (9 Total)

1. **PostgreSQL 15** - Persistent storage
2. **Redis 7** - Alert deduplication
3. **Zookeeper 7.4** - Kafka coordination
4. **Kafka 7.4** - Event streaming
5. **FastAPI Backend** - Core app + metrics
6. **Next.js Frontend** - Dashboard UI
7. **Prometheus** - Time-series database
8. **Grafana** - Visualization
9. **Docker Network** - Communication layer

---

## 📈 SRE Metrics

Each service tracks **8 professional metrics**:

| Metric | Description | Green | Yellow | Red |
|--------|-------------|-------|--------|-----|
| **Avg Latency** | Mean response time | ≤1000ms | 1-1.5s | >1.5s |
| **P95 Latency** | 95th percentile | ≤1500ms | 1.5-2.2s | >2.2s |
| **P99 Latency** | 99th percentile | ≤2000ms | 2-3s | >3s |
| **Apdex Score** | User satisfaction (0-1) | ≥0.8 | 0.6-0.8 | <0.6 |
| **Error Rate** | % of failed requests | ≤2% | 2-5% | >5% |
| **Uptime (24h)** | Availability % | ≥95% | 90-95% | <90% |
| **Request Rate** | Checks per minute | Shows traffic | Shows load | Shows spikes |
| **Throughput** | Requests per second | Shows capacity | Shows load | Shows spikes |

---

## 📡 API Endpoints

### Services

```bash
# List all services
GET /services

# Create service
POST /services
{
  "name": "GitHub API",
  "url": "https://api.github.com",
  "interval_seconds": 30,
  "timeout_seconds": 5
}

# Delete service
DELETE /services/{id}
```

### Metrics

```bash
# Get service metrics summary (used by dashboard)
GET /services/{id}/metrics-summary

# Get recent checks with metrics
GET /services/{id}/checks-detailed?limit=10

# Get Prometheus metrics
GET /metrics
```

### Example Response

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
  "apdex_score": 1.0,
  "checks_count": 9,
  "last_check_timestamp": "2025-10-31T11:46:26Z"
}
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR
- **TypeScript** - Type-safe components
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **FastAPI 0.104** - Modern async Python
- **PostgreSQL 15** - Data persistence
- **SQLAlchemy 1.4** - ORM
- **Pydantic 2.4** - Type validation
- **APScheduler 3.10** - Background jobs
- **Prometheus Client** - Metrics export
- **Kafka 7.4** - Event streaming
- **Redis 7** - Caching & deduplication

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Prometheus** - Time-series DB
- **Grafana** - Visualization
- **Linux/Alpine** - Base OS

---

## 📁 Project Structure

```
.
├── app/                          # FastAPI Backend
│   ├── main.py                   # Entry point & routes
│   ├── models.py                 # SQLAlchemy ORM
│   ├── schemas.py                # Pydantic models
│   ├── healthchecker.py          # SRE metrics calculation
│   ├── scheduler.py              # APScheduler setup
│   ├── metrics.py                # Prometheus registry
│   ├── alerts.py                 # Alert logic
│   ├── kafka_producer.py         # Event publishing
│   └── redis_client.py           # Cache layer
│
├── frontend/                     # Next.js Dashboard
│   ├── src/app/
│   │   ├── page.tsx              # Main dashboard
│   │   └── layout.tsx            # Root layout
│   ├── src/lib/api.ts            # API client
│   └── tailwind.config.js        # Styling
│
├── grafana-provisioning/         # Pre-built Dashboards
│   ├── datasources/              # Prometheus config
│   └── dashboards/               # Dashboard JSON
│
├── docker-compose.yml            # 9 services
├── prometheus.yml                # Scrape config
├── Dockerfile                    # Backend image
├── requirements.txt              # Python deps
└── README.md                     # This file
```

---

## 🎯 Use Cases

### On-Call Engineer
> "Which services are down? What's the severity?"
**→** Color-coded dashboard with health emojis (🟢/🟡/�)

### SRE Manager
> "Are we meeting our SLO targets?"
**→** Uptime %, error rate, Apdex visible per service

### Performance Engineer
> "Why is this service slow?"
**→** P95/P99 latencies show tail behavior instantly

### Capacity Planner
> "Which services are under load?"
**→** Request rate + throughput metrics
