<div align="center">

# HealthTrack: Enterprise-Grade SRE Monitoring Dashboard

<p align="center">
  <a href="https://github.com/MeghVyas3132/Metrics-Health-Tracker/stargazers"><img src="https://img.shields.io/github/stars/MeghVyas3132/Metrics-Health-Tracker?style=for-the-badge&color=blue" alt="Stars"></a>
  <a href="https://github.com/MeghVyas3132/Metrics-Health-Tracker/network/members"><img src="https://img.shields.io/github/forks/MeghVyas3132/Metrics-Health-Tracker?style=for-the-badge&color=green" alt="Forks"></a>
  <a href="https://github.com/MeghVyas3132/Metrics-Health-Tracker/issues"><img src="https://img.shields.io/github/issues/MeghVyas3132/Metrics-Health-Tracker?style=for-the-badge&color=orange" alt="Issues"></a>
  <a href="#"><img src="https://img.shields.io/badge/status-production_ready-brightgreen?style=for-the-badge" alt="Status"></a>
  <a href="#"><img src="https://img.shields.io/badge/docker_services-9-blue?style=for-the-badge" alt="Docker Services"></a>
</p>

A complete, enterprise-grade health monitoring and SRE metrics dashboard for tracking services, APIs, and microservices with professional-grade SLO tracking, Prometheus integration, and Grafana visualization.

</div>

---

## Features at a Glance

-   **Real-time SRE Dashboard**: Color-coded health indicators with all key metrics visible on a single pane of glass.
-   **Production-Grade Metrics**: Tracks P95/P99 latencies, Apdex score, error rates, and uptime.
-   **Professional Visualization**: Pre-built Grafana dashboards for deep-diving into time-series data.
-   **Prometheus Integration**: Automatically exports and scrapes metrics for historical analysis and alerting.
-   **Smart Alerts**: Multi-signal alerting logic (status + Apdex + error rate) with Redis-backed deduplication.
-   **Kafka Event Streaming**: Publishes health check results to Kafka topics for real-time, event-driven integrations.
-   **Type-Safe Code**: Built with a TypeScript frontend and a Python 3.11 backend with Pydantic for robust, error-free development.
-   **Docker Ready**: Deploy the entire 9-service stack with a single `docker compose up` command.

---

## What It Does

**HealthTrack** is an all-in-one monitoring solution designed to provide immediate, actionable insights into your system's health.

1.  **Monitors Services**: Performs periodic, configurable HTTP health checks on any URL.
2.  **Calculates SRE Metrics**: Computes essential SRE metrics like P95/P99 latencies, Apdex scores, error rates, and uptime percentages.
3.  **Displays a Real-Time Dashboard**: Shows all metrics in a sleek, dark-themed UI that auto-refreshes.
4.  **Stores Time-Series Data**: Uses a Prometheus time-series database for robust historical analysis.
5.  **Visualizes Trends**: Integrates with Grafana, providing beautiful, pre-configured dashboards to analyze trends.
6.  **Triggers Smart Alerts**: Sends alerts via Slack webhooks, with intelligent deduplication to prevent alert fatigue.
7.  **Streams Health Events**: Pushes check results to Kafka for consumption by other services or analytics platforms.

---

## Quick Start

### With Docker (Recommended)

Get the entire stack running in minutes.

```bash
# 1. Clone the repository
git clone https://github.com/MeghVyas3132/Metrics-Health-Tracker.git
cd Metrics-Health-Tracker

# 2. Set up your environment
cp .env.example .env

# 3. Start the full stack
docker compose up --build -d

# 4. Access the services
#    - Frontend Dashboard: http://localhost:3000
#    - Grafana: http://localhost:3001
#    - API Docs (Swagger): http://localhost:8000/docs
#    - Prometheus: http://localhost:9090
```

### Local Development

Instructions for running the frontend and backend services separately.

**Backend (FastAPI):**
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. uvicorn app.main:app --reload
```

**Frontend (Next.js):**
```bash
cd frontend
npm install
npm run dev
```

---

## Architecture

HealthTrack is composed of 9 microservices, orchestrated by Docker Compose.

```
┌──────────────────────────────────┐
│  HealthTrack Dashboard (Next.js) │
│        (Port :3000)              │
└───────────┬──────────────────────┘
            │ (REST API Calls)
            ▼
┌──────────────────────────────────┐
│   FastAPI Backend + SRE Engine   │
│        (Port :8000)              │
├──────────┬──────────┬────────────┤
│          │          │            │
▼          ▼          ▼            ▼
PostgreSQL  Redis    Prometheus    Kafka
(Storage) (Alerting) (Metrics)    (Events)
           ▲          ▲
           │          │
       APScheduler   Grafana
    (Health Checks) (Visualization)
```

-   **Services (9 Total)**:
    1.  **PostgreSQL 15**: Persistent storage for services and checks.
    2.  **Redis 7**: Caching and alert deduplication.
    3.  **Zookeeper**: Kafka coordination.
    4.  **Kafka**: Event streaming for health data.
    5.  **FastAPI Backend**: Core application logic, SRE metric calculation, and API.
    6.  **Next.js Frontend**: The user-facing dashboard.
    7.  **Prometheus**: Time-series database for metrics.
    8.  **Grafana**: Data visualization and dashboards.
    9.  **Docker Network**: Provides the communication layer between services.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11
- **Database**: PostgreSQL 15 with SQLAlchemy (ORM)
- **Data Validation**: Pydantic 2.4
- **Background Jobs**: APScheduler
- **Messaging**: Kafka
- **Caching**: Redis
- **Metrics**: Prometheus Client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Monitoring**: Prometheus & Grafana
- **Base OS**: Linux/Alpine

---

## SRE Metrics Tracked

Each service tracks 8 professional-grade metrics, with configurable thresholds.

| Metric         | Description                 | Green   | Yellow    | Red    |
| :------------- | :-------------------------- | :------ | :-------- | :----- |
| **Avg Latency**  | Mean response time          | ≤1000ms | 1-1.5s    | >1.5s  |
| **P95 Latency**  | 95th percentile latency     | ≤1500ms | 1.5-2.2s  | >2.2s  |
| **P99 Latency**  | 99th percentile latency     | ≤2000ms | 2-3s      | >3s    |
| **Apdex Score**  | User satisfaction (0-1)     | ≥0.8    | 0.6-0.8   | <0.6   |
| **Error Rate**   | Percentage of failed checks | ≤2%     | 2-5%      | >5%    |
| **Uptime (24h)** | Service availability %      | ≥95%    | 90-95%    | <90%   |
| **Request Rate** | Checks per minute           | Shows traffic load | | |
| **Throughput**   | Requests per second         | Shows service capacity | | |

---

## API Endpoints

A RESTful API is available to manage services and retrieve metrics.

- `GET /services`: List all monitored services.
- `POST /services`: Create a new service to monitor.
- `DELETE /services/{id}`: Delete a service.
- `GET /services/{id}/metrics-summary`: Get a complete metrics summary for a service.
- `GET /services/{id}/checks-detailed`: Get recent raw health check data.
- `GET /metrics`: Expose metrics in Prometheus format.

**Example Response (`GET /services/{id}/metrics-summary`)**:
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

## Project Structure

```
.
├── app/                  # FastAPI Backend Source
│   ├── main.py           # API routes and entry point
│   ├── models.py         # SQLAlchemy ORM models
│   ├── schemas.py        # Pydantic data schemas
│   ├── healthchecker.py  # SRE metrics calculation engine
│   ├── scheduler.py      # Background job scheduler (APScheduler)
│   └── ...
│
├── frontend/             # Next.js Frontend Source
│   ├── src/app/
│   │   ├── page.tsx      # Main dashboard UI
│   │   └── layout.tsx    # Root layout and styling
│   └── ...
│
├── grafana-provisioning/ # Pre-built Grafana dashboards and datasources
│
├── docker-compose.yml    # Orchestrates all 9 services
├── prometheus.yml        # Prometheus scrape configuration
├── Dockerfile            # Docker image for the backend
└── README.md             # You are here!
```

---

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
