# 🚀 Deployment Guide

Deploy **HealthTrack** to production with these recommendations. Choose based on your needs and budget.

---

## **Recommended Platforms**

### 1. **Railway.app** ⭐ (Best for Beginners)
**Cost**: $5-20/month | **Setup Time**: 10 minutes | **Git**: Automatic deploys

#### Why Railway?
- ✅ Built-in PostgreSQL database
- ✅ One-click GitHub deploys
- ✅ Auto-scaling
- ✅ Free trial with $5 credit

#### Deploy Steps:
```bash
# 1. Push your code to GitHub
git push origin main

# 2. Go to railway.app → Create project → Import from GitHub
# Select your HealthTrack repo

# 3. Add PostgreSQL plugin (automatic)
# 4. Set environment variables (see .env example)
# 5. Deploy!
```

#### Environment Variables:
```
DATABASE_URL=postgresql://...
BACKEND_PORT=8000
GRAFANA_HOST=http://grafana:3000
```

---

### 2. **Render.com** ⭐⭐ (Best Value)
**Cost**: Free tier available | **Setup Time**: 15 minutes | **Git**: Native Git deploy

#### Why Render?
- ✅ Free tier with PostgreSQL
- ✅ Auto-deploys from GitHub (main branch)
- ✅ Custom domains
- ✅ No credit card for free tier

#### Deploy Steps:
```bash
# 1. Create account at render.com
# 2. Click "New" → "Web Service"
# 3. Connect GitHub repo
# 4. Configure:
#    - Build: pip install -r backend/requirements.txt
#    - Start: uvicorn app.main:app --host 0.0.0.0
# 5. Add PostgreSQL database
# 6. Set environment variables → Deploy
```

---

### 3. **Fly.io** ⭐⭐⭐ (Best Performance)
**Cost**: $1.94/month minimum | **Setup Time**: 20 minutes | **Global**: Edge deployment

#### Why Fly.io?
- ✅ Global edge deployment (faster worldwide)
- ✅ Docker native
- ✅ Volume storage for PostgreSQL
- ✅ Very cheap

#### Deploy Steps:
```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Authenticate
flyctl auth login

# 3. Create app
flyctl launch

# 4. When prompted:
#    ✓ Use generated Dockerfile
#    ✓ Create Postgres database
#    ✓ Set environment variables

# 5. Deploy!
flyctl deploy
```

#### fly.toml Example:
```toml
[env]
DATABASE_URL = "postgresql://..."
BACKEND_PORT = "8000"

[[services]]
internal_port = 8000
protocol = "tcp"
```

---

### 4. **DigitalOcean App Platform**
**Cost**: $7-12/month | **Setup Time**: 15 minutes | **Control**: More control

#### Why DigitalOcean?
- ✅ Managed databases
- ✅ Better control over resources
- ✅ Droplets or App Platform
- ✅ Good documentation

#### Deploy Steps:
```bash
# 1. Create account → Create App
# 2. Connect GitHub repository
# 3. Configure build/run commands
# 4. Add PostgreSQL database
# 5. Deploy!
```

---

## **Complete Architecture for Production**

### Docker Setup
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/healthtrack
      - ENVIRONMENT=production
    depends_on:
      - db
    restart: always

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=healthtrack
      - POSTGRES_USER=healthtrack
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    restart: always

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
    restart: always

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: always

volumes:
  db_data:
  grafana_data:
  prometheus_data:
```

### Dockerfile for Backend
`backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Dockerfile for Frontend
`frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

---

## **Environment Variables Template**

Create `.env.production`:
```
# Database
DATABASE_URL=postgresql://user:password@host:5432/healthtrack

# Backend
BACKEND_PORT=8000
ENVIRONMENT=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GRAFANA_URL=https://grafana.yourdomain.com

# Grafana
GRAFANA_PASSWORD=securepassword123
GRAFANA_ADMIN_USER=admin

# Prometheus
PROMETHEUS_PORT=9090

# Security
SECRET_KEY=your-secret-key-here
```

---

## **Quick Comparison Table**

| Platform | Cost | Setup | Scaling | Best For |
|----------|------|-------|---------|----------|
| Railway | $5-20 | ⭐ | Auto | Teams, full-stack |
| Render | Free+ | ⭐⭐ | Auto | Solo devs, learning |
| Fly.io | $2-10 | ⭐⭐ | Global | Performance-critical |
| DigitalOcean | $7-12 | ⭐⭐⭐ | Manual | Control & flexibility |
| AWS/GCP | $10-100+ | ⭐⭐⭐⭐ | Complex | Enterprise |

---

## **Step-by-Step: Railway Deployment**

### 1️⃣ Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Create Railway Project
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Create new project → Import GitHub repo

### 3️⃣ Configure Services
Railway will auto-detect:
- `backend/` → Python service
- `frontend/` → Node.js service
- Database → PostgreSQL

### 4️⃣ Set Environment Variables
In Railway dashboard → Variables:
```
DATABASE_URL (auto-generated)
BACKEND_PORT=8000
NEXT_PUBLIC_API_URL=https://yourapp.railway.app
```

### 5️⃣ Deploy
- Click "Deploy" button
- Watch logs in real-time
- Get public URLs automatically

### 6️⃣ Custom Domain (Optional)
- Go to Settings → Domain
- Add your domain
- Update DNS records

---

## **Step-by-Step: Fly.io Deployment**

### 1️⃣ Install Fly CLI
```bash
# macOS
brew install flyctl

# Linux/WSL
curl -L https://fly.io/install.sh | sh
```

### 2️⃣ Create App
```bash
flyctl launch

# Answers:
# App name? → healthtrack
# Region? → Choose nearest
# Postgres? → Yes
# Redis? → No
# Deploy? → Yes
```

### 3️⃣ Set Secrets
```bash
flyctl secrets set DATABASE_URL="postgresql://..."
flyctl secrets set BACKEND_PORT="8000"
```

### 4️⃣ Deploy
```bash
flyctl deploy

# View logs
flyctl logs

# Get public URL
flyctl info
```

---

## **Monitoring & Logs**

### Railway
```bash
# View logs in dashboard
# Or use CLI: railway logs
```

### Fly.io
```bash
# Stream live logs
flyctl logs -f

# SSH into machine
flyctl ssh console
```

### Render
```bash
# View logs in dashboard
# Automatic error notifications
```

---

## **Post-Deployment Checklist**

- [ ] Database migrations run successfully
- [ ] Backend API responding (GET `/health`)
- [ ] Frontend loads without errors
- [ ] Grafana dashboard accessible
- [ ] Services can connect to database
- [ ] CORS properly configured
- [ ] SSL certificate installed
- [ ] Environment variables set correctly
- [ ] Monitoring alerts configured
- [ ] Backup strategy planned

---

## **Troubleshooting**

### "Cannot connect to database"
```bash
# Check connection string
printenv DATABASE_URL

# Verify credentials
psql $DATABASE_URL
```

### "Frontend can't reach backend"
```bash
# Check CORS settings
# Verify NEXT_PUBLIC_API_URL is correct
# Check network policies
```

### "Grafana not loading"
```bash
# Verify container is running
# Check port mapping
# Verify environment variables
```

---

## **Support & Resources**

- **Railway Docs**: https://docs.railway.app
- **Fly.io Docs**: https://fly.io/docs
- **Render Docs**: https://render.com/docs
- **DigitalOcean Docs**: https://docs.digitalocean.com
- **HealthTrack GitHub Issues**: Create an issue for help

---

**Ready to go live? Start with Railway or Render for fastest setup! 🎉**
