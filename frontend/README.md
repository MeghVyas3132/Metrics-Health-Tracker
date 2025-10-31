# HealthTrack Frontend

Professional dark-themed Next.js dashboard for real-time service monitoring.

## Features

- ✨ Modern dark theme with professional color palette
- ⚡ Real-time service health monitoring
- 📊 Responsive grid layout
- 🎨 Smooth animations with Framer Motion
- 🎯 Startup-friendly MVP design
- 📱 Mobile responsive
- 🔄 Auto-refresh every 10 seconds

## Tech Stack

- **Next.js 14** — React framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **Framer Motion** — Smooth animations
- **Lucide React** — Modern icons
- **Axios** — HTTP client

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Configuration

Create a `.env.local` file (optional; defaults to `http://localhost:8000`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

### Production Build

```bash
npm run build
npm start
```

## Architecture

- **src/app** — Next.js app router (layout, page)
- **src/lib/api.ts** — API client with axios
- **tailwind.config.js** — Tailwind theming and animations

## Features

### Dashboard

- View all monitored services
- See the latest health check for each service
- Response time and status at a glance
- Real-time status indicators (✓ OK, ⚠ WARN, ✗ ERROR/DOWN)

### Service Management

- Add new services via simple form
- Delete services
- Set custom check intervals and timeouts
- Auto-refresh every 10 seconds

### Color Scheme

- **Background** — slate-950 (deep dark)
- **Primary** — blue-600 (accent)
- **Success** — green-400
- **Warning** — yellow-400
- **Error** — red-400
- **Text** — slate-100 (light)

### Animations

- Fade-in on page load
- Slide-up on service cards
- Smooth transitions on hover
- Subtle pulse animations

## Integration with Backend

The frontend connects to the FastAPI backend via the `NEXT_PUBLIC_API_URL` environment variable. Ensure the backend is running at `http://localhost:8000` (or configure the URL).

### API Endpoints Used

- `GET /services` — List all services
- `POST /services` — Create a service
- `DELETE /services/{id}` — Delete a service
- `GET /services/{id}/checks` — Get recent health checks

## Customization

Edit `tailwind.config.js` to customize colors, animations, and breakpoints.

## Future Enhancements

- Service detail page with full check history
- Charts and metrics visualization
- Alert settings UI
- Webhook integration UI
- Dark/Light theme toggle
- Real-time WebSocket updates
