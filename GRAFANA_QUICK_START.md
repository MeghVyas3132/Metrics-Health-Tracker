# 🚀 Quick Start: Grafana Locally (2 minutes)

Grafana won't load because it's not running. Here's how to start it:

---

## One-Liner (Copy & Paste)

```bash
docker-compose -f docker-compose.local.yml up -d
```

That's it! Grafana will be at **http://localhost:3001**

---

## What This Does

1. ✅ Starts **Grafana** (visualization)
2. ✅ Starts **Prometheus** (metrics collection)
3. ✅ Connects them automatically

---

## Access

| Service | URL | Username | Password |
|---------|-----|----------|----------|
| **Grafana** | http://localhost:3001 | admin | admin |
| **Prometheus** | http://localhost:9090 | — | — |

---

## Verify It's Running

```bash
# Check container status
docker ps | grep healthtrack
```

You should see:
```
healthtrack-grafana      3000->3001/tcp
healthtrack-prometheus  9090->9090/tcp
```

---

## Try Your App Now

1. Visit http://localhost:3000 (frontend)
2. Add a service (or use existing one)
3. Hover over service card → **📊 Grafana button** appears
4. Click it → Dashboard should load!

---

## Stop When Done

```bash
docker-compose -f docker-compose.local.yml down
```

---

## Full Setup Guide

For more details, see [LOCAL_SETUP.md](./LOCAL_SETUP.md)

---

**Questions?** Check the troubleshooting section in LOCAL_SETUP.md
