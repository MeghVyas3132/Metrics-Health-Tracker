# HealthTrack — lightweight health monitoring

This project is a learning-focused, production-oriented health tracker that periodically checks servers, APIs, and microservices; logs incidents; triggers alerts; stores metrics in Postgres; publishes events to Kafka; uses Redis for caching/locking; and exposes Prometheus metrics for Grafana.

Tech stack
- FastAPI
- PostgreSQL + SQLAlchemy
- Redis
- Kafka
- APScheduler
- Prometheus client (metrics) + Grafana

Quickstart (local, using Docker Compose)
1. Copy `.env.example` to `.env` and edit env vars.
2. Start services:
```bash
docker compose up --build
```
3. Open the API at http://localhost:8000/docs
4. Prometheus metrics exposed at http://localhost:8000/metrics

What I included
- Project scaffold (FastAPI app)
- Database layer and models for services/checks
- APScheduler background scheduler for periodic checks
- Health check worker that records latency/status and stores results
- Prometheus metrics collector
- Kafka producer wrapper (publishes check events)
- Basic alerting module (Slack webhook placeholder)
- Docker Compose for local dev (Postgres, Redis, Zookeeper, Kafka)

Next steps (suggested)
- Add Alembic migrations
- Add more robust alerting channels (PagerDuty, email)
- Add Grafana dashboard JSON and sample Prometheus scrape config
- Add tests and CI
