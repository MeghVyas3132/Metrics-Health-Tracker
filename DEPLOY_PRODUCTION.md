# 🌍 Production Deployment Guide

Deploy **HealthTrack** to production. This guide focuses on the three best platforms for beginners.

**TL;DR:** Pick Railway or Render for fastest setup. Both take ~15 minutes.

---

## 📋 Platform Comparison

| Feature | Railway | Render | Fly.io | DigitalOcean |
|---------|---------|--------|--------|-------------|
| **Cost** | $5-20/mo | Free+ | $2-10/mo | $7-12/mo |
| **Setup Time** | 10 min ⭐ | 15 min ⭐ | 20 min | 30 min |
| **Database** | PostgreSQL ✅ | PostgreSQL ✅ | PostgreSQL ✅ | PostgreSQL ✅ |
| **Auto-deploy** | GitHub | GitHub | GitHub | Manual |
| **Scaling** | Auto | Auto | Manual | Manual |
| **Best For** | Teams | Solo devs | Performance | Control |

---

## 🚀 Option 1: Railway (Recommended for Beginners)

**Cost**: $5-20/month | **Time**: 10 minutes

### Step 1: Push Code to GitHub

```bash
cd /Users/vaibhavchauhan/Desktop/HealthTrack
git add .
git commit -m "Ready for production"
git push origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account
3. Click "New Project" → "Deploy from GitHub Repo"
4. Select `MeghVyas3132/Metrics-Health-Tracker`
5. Click "Deploy Now"

### Step 3: Add Services

Railway will auto-detect your project structure:

#### Backend Service (Python/FastAPI)
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment**:
  ```
  DATABASE_URL=<Railway will generate this>
  ENVIRONMENT=production
  ```

#### Frontend Service (Next.js)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm start`
- **Environment**:
  ```
  NEXT_PUBLIC_API_URL=https://<backend-railway-url>
  NEXT_PUBLIC_GRAFANA_URL=https://<grafana-url>
  ```

#### Grafana Service (Docker)
- **Dockerfile Location**: Use Railway's Docker template
- **Port**: 3000 (Railway maps to https://grafana-xxx.railway.app)
- **Environment**:
  ```
  GF_SECURITY_ADMIN_PASSWORD=<set-strong-password>
  ```

### Step 4: Set Environment Variables

In Railway dashboard, for each service:

**Backend:**
- `DATABASE_URL` - Auto-generated if you add PostgreSQL plugin
- `ENVIRONMENT=production`

**Frontend:**
- `NEXT_PUBLIC_API_URL=https://backend-xxx.railway.app` (your backend's public URL)
- `NEXT_PUBLIC_GRAFANA_URL=https://grafana-xxx.railway.app` (your Grafana's public URL)

**Grafana:**
- `GF_SECURITY_ADMIN_PASSWORD=YourStrongPassword123`

### Step 5: Add PostgreSQL

1. In Railway → New Service → PostgreSQL
2. Railway auto-connects to backend via `DATABASE_URL`
3. Done!

### Step 6: Deploy & Monitor

1. Railway auto-deploys on every `git push`
2. View logs: Railway Dashboard → Service → Logs
3. Get public URLs from Railway Dashboard

---

## 🎨 Option 2: Render (Free Tier Available)

**Cost**: Free tier available | **Time**: 15 minutes

### Step 1: Create Services on Render

Visit [render.com](https://render.com)

#### Backend Service
1. "New +" → "Web Service"
2. Connect GitHub repo
3. Configure:
   - **Name**: `healthtrack-backend`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`

#### Frontend Service
1. "New +" → "Web Service"
2. Connect GitHub repo
3. Configure:
   - **Name**: `healthtrack-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`

#### PostgreSQL
1. "New +" → "PostgreSQL"
2. Name: `healthtrack-db`
3. Render auto-connects to backend

#### Grafana
1. "New +" → "Docker"
2. Connect your repo with Dockerfile at `grafana/Dockerfile`

### Step 2: Set Environment Variables

For each service in Render dashboard:

**Backend** → Environment:
```
DATABASE_URL=<Render auto-generates from PostgreSQL>
ENVIRONMENT=production
```

**Frontend** → Environment:
```
NEXT_PUBLIC_API_URL=https://healthtrack-backend.onrender.com
NEXT_PUBLIC_GRAFANA_URL=https://healthtrack-grafana.onrender.com
```

**Grafana** → Environment:
```
GF_SECURITY_ADMIN_PASSWORD=YourStrongPassword123
```

### Step 3: Deploy

1. All services auto-deploy on `git push`
2. Render shows public URLs for each service
3. Copy frontend URL and share! 🎉

---

## 🪶 Option 3: Fly.io (Best Performance)

**Cost**: $2-10/month | **Time**: 20 minutes | **Benefit**: Global edge deployment

### Step 1: Install Fly CLI

```bash
# macOS
brew install flyctl

# Authenticate
flyctl auth login
```

### Step 2: Create App

```bash
# From project root
flyctl launch

# When prompted:
# App name? → healthtrack
# Region? → Choose nearest to you
# Create PostgreSQL? → Yes
# Dockerfile? → Use existing (or generate)

flyctl deploy
```

### Step 3: Set Secrets

```bash
# Set environment variables
flyctl secrets set \
  ENVIRONMENT=production \
  NEXT_PUBLIC_API_URL=https://healthtrack.fly.dev \
  NEXT_PUBLIC_GRAFANA_URL=https://grafana.fly.dev

# View app info
flyctl info

# Get URLs
flyctl urls
```

### Step 4: Deploy Grafana Separately

```bash
# Create another Fly app for Grafana
flyctl apps create healthtrack-grafana
flyctl deploy --app healthtrack-grafana

# Get Grafana URL for frontend config
flyctl urls --app healthtrack-grafana
```

---

## 🔑 Critical: Set `NEXT_PUBLIC_GRAFANA_URL`

This is the most important step! The frontend needs to know where Grafana is.

### For Railway
```
Frontend → Environment Variables
NEXT_PUBLIC_GRAFANA_URL=https://grafana-xxx.railway.app
```

### For Render
```
Frontend → Environment
NEXT_PUBLIC_GRAFANA_URL=https://healthtrack-grafana.onrender.com
```

### For Fly.io
```
flyctl secrets set NEXT_PUBLIC_GRAFANA_URL=https://grafana.fly.dev
```

---

## 📊 Access Your Deployed App

Once deployed:

1. **Frontend**: `https://your-app-url`
2. **Backend API**: `https://backend-url/docs` (Swagger docs)
3. **Grafana**: `https://grafana-url` (admin / your-password)
4. **Prometheus**: Usually not publicly exposed (optional)

---

## 🧪 Test Your Deployment

1. **Frontend loads**: ✅ Visit the frontend URL
2. **Can add a service**: Try creating a service via UI
3. **Grafana button works**: Hover over service, click Grafana icon
4. **Dashboard loads**: Should see embedded Grafana dashboard

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot reach backend" | Check `NEXT_PUBLIC_API_URL` matches backend URL |
| "Grafana not loading" | Check `NEXT_PUBLIC_GRAFANA_URL` and Grafana is running |
| "Database connection failed" | Verify `DATABASE_URL` is set correctly |
| "Metrics not showing" | Wait 30s for Prometheus to scrape, check backend `/metrics` endpoint |

---

## 🔐 Security Best Practices

1. **Strong passwords**: Use unique, strong passwords for Grafana/Database
2. **Environment variables**: Never commit sensitive data to GitHub
3. **HTTPS only**: All deployed URLs should be HTTPS (auto on Railway/Render/Fly.io)
4. **Firewall rules**: Restrict database access to your backend only
5. **Monitoring**: Set up alerts for service downtime

### Change Grafana Password

```bash
# In Grafana UI
Admin Profile → Change Password
```

---

## 📈 Monitor After Deployment

### Railway/Render
- Use built-in dashboard for logs
- Set up email alerts for errors

### Fly.io
```bash
flyctl logs
flyctl status
flyctl monitor
```

---

## 🚀 Next: Auto-Scaling & Custom Domain

### Add Custom Domain (All Platforms)

**Railway:**
- Dashboard → Settings → Domains → Add Domain
- Update DNS to Railway's CNAME

**Render:**
- Service → Settings → Custom Domain
- Update DNS to Render's CNAME

**Fly.io:**
```bash
flyctl certs add yourdomain.com
```

---

## 📚 Helpful Links

- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment)

---

## ⚡ Quick Reference

### Railway One-Liner
```bash
git push origin main  # Auto-deploys to Railway
```

### Render One-Liner
```bash
git push origin main  # Auto-deploys to Render
```

### Fly.io One-Liner
```bash
flyctl deploy  # Deploy current version
```

---

**Ready? Pick Railway or Render and deploy in 15 minutes! 🎉**
