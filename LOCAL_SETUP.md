# 🚀 Local Development Setup

Get HealthTrack running locally with Grafana, Prometheus, and all services.

---

## Prerequisites

- **Docker & Docker Compose** installed ([install here](https://docs.docker.com/get-docker/))
- **Node.js 18+** and **npm** (for frontend)
- **Python 3.11+** (for backend)
- **PostgreSQL 15** (or use Docker)

---

## Quick Start (5 minutes)

### 1️⃣ Start All Services with Docker Compose

```bash
cd /Users/vaibhavchauhan/Desktop/HealthTrack

# Start Grafana + Prometheus
docker-compose -f docker-compose.local.yml up -d

# Verify containers are running
docker-compose -f docker-compose.local.yml ps
```

✅ **Now available:**
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### 2️⃣ Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Backend running**: http://localhost:8000

### 3️⃣ Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local for dev
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3001
EOF

# Start dev server
npm run dev
```

✅ **Frontend running**: http://localhost:3000

---

## 🎯 Configure Grafana Dashboard

### Login to Grafana
- URL: http://localhost:3001
- Username: `admin`
- Password: `admin`

### Create a Dashboard

1. **Create a new dashboard**
   - Click "+" → "Dashboard"
   - Add panel for each metric

2. **Add Panels (Examples)**

   **Panel 1: Health Status**
   ```
   Prometheus Query: up{job="healthtrack-backend"}
   Visualization: Stat
   ```

   **Panel 2: Response Time**
   ```
   Prometheus Query: rate(http_requests_total[5m])
   Visualization: Graph
   ```

   **Panel 3: Error Rate**
   ```
   Prometheus Query: rate(http_errors_total[5m])
   Visualization: Gauge
   ```

3. **Add Dashboard Variable (for per-service filtering)**
   - Go to Dashboard Settings (gear icon)
   - Variables → New variable
   - Name: `service`
   - Type: `Query`
   - Query: `label_values(up, instance)`
   - Save

4. **Save Dashboard as `healthtrack-overview`**
   - Top right → Save (Ctrl+S)
   - Name: `healthtrack-overview`
   - Folder: `General`
   - **Note the Dashboard UID** (you'll need this)

### Export Dashboard as JSON

Once created, export it:
1. Dashboard menu → Share → Export
2. Save as `grafana/dashboards/healthtrack-overview.json`
3. This will auto-provision when Grafana starts

---

## 📊 Frontend Integration

Once Grafana is running:

1. **Open HealthTrack frontend**: http://localhost:3000
2. **Add a service** (e.g., API Gateway)
3. **Hover over the service card** → Grafana button appears (📊 icon)
4. **Click it** → Modal opens with embedded Grafana dashboard

### Troubleshooting Grafana Modal

| Issue | Solution |
|-------|----------|
| "Grafana failed to load" | Ensure `localhost:3001` is reachable (Docker running) |
| Empty modal | Check NEXT_PUBLIC_GRAFANA_URL in `.env.local` |
| Dashboard not showing | Verify `healthtrack-overview` dashboard exists in Grafana |
| Variable not working | Dashboard must have a `service` template variable |

---

## 🐘 Database Setup

### Option A: Docker PostgreSQL

```bash
docker run -d \
  --name healthtrack-db \
  -e POSTGRES_DB=healthtrack \
  -e POSTGRES_USER=healthtrack \
  -e POSTGRES_PASSWORD=password123 \
  -p 5432:5432 \
  postgres:15

# In backend/.env
DATABASE_URL=postgresql://healthtrack:password123@localhost:5432/healthtrack
```

### Option B: Local PostgreSQL

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb healthtrack
createuser healthtrack
psql healthtrack -c "ALTER USER healthtrack WITH PASSWORD 'password123';"

# In backend/.env
DATABASE_URL=postgresql://healthtrack:password123@localhost:5432/healthtrack
```

### Option C: Cloud PostgreSQL

```bash
# Use free tier from Railway, Supabase, or Render
# Update DATABASE_URL in backend/.env with cloud connection string
```

---

## 🧪 Testing Local Setup

### 1. Check Backend Metrics

```bash
curl http://localhost:8000/metrics
```

Should return Prometheus metrics.

### 2. Create a Service via API

```bash
curl -X POST http://localhost:8000/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "url": "https://httpbin.org/status/200",
    "interval_seconds": 60,
    "timeout_seconds": 10
  }'
```

### 3. Check in Frontend

Visit http://localhost:3000 → You should see the service card

### 4. Check Prometheus

Visit http://localhost:9090 → Query for metrics

### 5. Check Grafana

Visit http://localhost:3001 → Create/view dashboards

---

## 📁 Project Structure

```
HealthTrack/
├── backend/              # FastAPI server
├── frontend/             # Next.js app
├── docker-compose.local.yml  # Local development stack
├── prometheus.yml        # Prometheus scrape config
├── grafana/
│   ├── provisioning/     # Auto-provisioned datasources
│   └── dashboards/       # Dashboard JSON files
└── README.md
```

---

## 🔧 Common Tasks

### Restart Services

```bash
# Restart all containers
docker-compose -f docker-compose.local.yml restart

# Restart just Grafana
docker-compose -f docker-compose.local.yml restart grafana

# View logs
docker-compose -f docker-compose.local.yml logs -f grafana
```

### Stop All Services

```bash
docker-compose -f docker-compose.local.yml down

# Keep data
docker-compose -f docker-compose.local.yml down -v  # Remove volumes
```

### Clean Start (Reset Everything)

```bash
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d
```

---

## 🚀 Environment Variables

Create `backend/.env`:
```
DATABASE_URL=postgresql://healthtrack:password123@localhost/healthtrack
ENVIRONMENT=development
BACKEND_PORT=8000
PROMETHEUS_PORT=9090
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GRAFANA_URL=http://localhost:3001
```

---

## 📚 Useful URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | N/A |
| Backend API | http://localhost:8000 | N/A |
| Backend Docs | http://localhost:8000/docs | N/A |
| Prometheus | http://localhost:9090 | N/A |
| Grafana | http://localhost:3001 | admin/admin |

---

## ⚠️ Troubleshooting

### "Cannot connect to Docker daemon"
```bash
# Make sure Docker is running
open -a Docker  # macOS
```

### "Port 3001 already in use"
```bash
# Find and kill process using port 3001
lsof -i :3001
kill -9 <PID>

# Or use different port
docker-compose -f docker-compose.local.yml -e GRAFANA_PORT=3002 up
```

### "Prometheus can't reach backend"
```bash
# On macOS/Docker Desktop, use host.docker.internal
# Already configured in prometheus.yml

# On Linux, update prometheus.yml to use localhost:8000
```

### Grafana shows "No data"
1. Check Prometheus datasource configuration
2. Wait 15-30 seconds for metrics to be scraped
3. Verify backend is exporting metrics at `/metrics`

---

## 🎓 Next Steps

1. ✅ Services running locally? Great!
2. 📊 Add more metrics to Grafana dashboard
3. 🧪 Create test services and monitor them
4. 🚀 Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Need help?** Check the [README.md](./README.md) for full project docs.
