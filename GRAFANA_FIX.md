# 🐛 Fixed: Grafana Integration & Per-Service Buttons

## What Changed

### ✅ Issue 1: "localhost refused to connect"
**Solution**: Made Grafana URL configurable via environment variables
- Remove hardcoded `http://localhost:3001`
- Use `NEXT_PUBLIC_GRAFANA_URL` environment variable
- Falls back to `http://localhost:3001` if not set
- Shows error message if iframe fails to load

### ✅ Issue 2: Single global Grafana button
**Solution**: Added per-service Grafana buttons
- Each service card now has a **Grafana chart icon** button
- Click to view that service's metrics in modal
- Shows service name in modal header
- Appears on hover (clean design)

---

## 📋 Setup Instructions

### Local Development

1. **Create `.env.local` in `frontend/` folder**:
```bash
cd frontend
cp .env.local.example .env.local
```

2. **Edit `.env.local`** (if Grafana is on a different machine):
```env
NEXT_PUBLIC_GRAFANA_URL=http://your-machine-ip:3001
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start frontend**:
```bash
npm run dev
```

### Production Deployment

**Railway/Render/Fly.io**:
1. Set environment variable in dashboard:
   ```
   NEXT_PUBLIC_GRAFANA_URL=https://grafana.yourdomain.com
   ```
2. Deploy normally
3. Grafana button will use production URL automatically

### Docker Compose

Update `docker-compose.yml`:
```yaml
frontend:
  environment:
    - NEXT_PUBLIC_GRAFANA_URL=http://grafana:3000
    - NEXT_PUBLIC_API_URL=http://backend:8000
```

---

## 🎯 How to Use

### View Service Metrics
1. **Hover** over a service card
2. Click the **📊 chart icon** (Grafana button)
3. Modal opens with that service's dashboard
4. Click close or outside to dismiss

### Error Handling
- If Grafana is unreachable, you'll see an alert
- Modal still displays, just with connection error
- Check that Grafana URL is correct in `.env.local`

---

## 🔧 Troubleshooting

### "Refused to connect" Error

**Check 1: Is Grafana running?**
```bash
# In another terminal, test the URL
curl http://localhost:3001/api/health
```

**Check 2: Is it a different machine?**
```bash
# Update .env.local with correct IP
NEXT_PUBLIC_GRAFANA_URL=http://192.168.1.100:3001
```

**Check 3: CORS issues?**
- If deployed and getting CORS error, make sure Grafana allows your frontend domain
- Add to Grafana config:
```ini
[security]
allow_embed_framing = true
```

### Button Not Showing

- Hover over service card (buttons appear on hover)
- Check that service has metrics (wait for first check)
- Chart icon is small - look near delete button

### Modal Blank/Not Loading

1. Check Grafana URL: Open `http://your-grafana-url/d/healthtrack-overview` in browser
2. Make sure dashboard exists in Grafana
3. Check browser console for errors
4. Try accessing full Grafana at `http://your-grafana-url`

---

## 🌍 Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_GRAFANA_URL` | `http://localhost:3001` | Grafana dashboard location |
| `NEXT_PUBLIC_API_URL` | (from .env.local) | Backend API endpoint |

---

## 📁 Files Modified

```
frontend/
├── src/app/page.tsx           ✅ UPDATED (per-service buttons, configurable Grafana URL)
└── .env.local.example         ✅ NEW (environment variables template)
```

---

## 🚀 Next Steps

1. **Copy environment template**:
   ```bash
   cp frontend/.env.local.example frontend/.env.local
   ```

2. **Update if needed** (for different Grafana location):
   ```bash
   # Edit frontend/.env.local
   NEXT_PUBLIC_GRAFANA_URL=http://your-ip:3001
   ```

3. **Start development**:
   ```bash
   cd frontend && npm run dev
   ```

4. **Test**: Hover over a service → Click chart icon → See dashboard

---

**Ready to use! Each service now has its own Grafana button. 🎉**
