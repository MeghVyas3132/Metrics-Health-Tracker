from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy.orm import Session
from sqlalchemy import desc
from .database import get_db, engine
from .models import Base, Service, Check
from .schemas import ServiceCreate, ServiceRead, CheckRead, DetailedCheckRead, ServiceMetricsSummary
from .scheduler import start_scheduler, add_service_job, remove_service_job
from .config import settings
from datetime import datetime, timedelta

app = FastAPI(title="HealthTrack")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, use specific origins like ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # Try to create DB tables if not present (gracefully skip if DB unavailable)
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        from .logging_config import logger
        logger.warning("startup.db_init_failed", exc=str(e), msg="DB not available at startup; will try on first request")
    
    # configure logging
    from .logging_config import configure_logging

    configure_logging()

    # start the scheduler and job loaders
    try:
        start_scheduler()
    except Exception as e:
        from .logging_config import logger
        logger.warning("startup.scheduler_failed", exc=str(e), msg="Scheduler failed to start")


@app.get("/metrics")
def metrics():
    data = generate_latest()
    return PlainTextResponse(content=data, media_type=CONTENT_TYPE_LATEST)


@app.post("/services", response_model=ServiceRead)
def create_service(payload: ServiceCreate, db: Session = Depends(get_db)):
    s = Service(name=payload.name, url=str(payload.url), interval_seconds=payload.interval_seconds, timeout_seconds=payload.timeout_seconds)
    db.add(s)
    db.commit()
    db.refresh(s)
    # create a scheduler job for it
    add_service_job(s)
    return s


@app.get("/services", response_model=list[ServiceRead])
def list_services(db: Session = Depends(get_db)):
    return db.query(Service).all()


@app.get("/services/{service_id}/checks", response_model=list[CheckRead])
def list_checks(service_id: int, limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Check).filter(Check.service_id == service_id).order_by(Check.timestamp.desc()).limit(limit).all()


@app.get("/services/{service_id}/checks-detailed", response_model=list[DetailedCheckRead])
def list_checks_detailed(service_id: int, limit: int = 10, db: Session = Depends(get_db)):
    """Get detailed SRE metrics for recent checks"""
    return db.query(Check).filter(Check.service_id == service_id).order_by(Check.timestamp.desc()).limit(limit).all()


@app.get("/services/{service_id}/metrics-summary", response_model=ServiceMetricsSummary)
def get_service_metrics_summary(service_id: int, db: Session = Depends(get_db)):
    """Get aggregated SRE metrics for a service (last 24h)"""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="service not found")
    
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    checks = db.query(Check).filter(
        Check.service_id == service_id,
        Check.timestamp >= cutoff_time
    ).all()
    
    if not checks:
        raise HTTPException(status_code=404, detail="no check data available")
    
    # Use latest check for aggregated metrics
    latest_check = db.query(Check).filter(
        Check.service_id == service_id
    ).order_by(desc(Check.timestamp)).first()
    
    response_times = [c.response_time_ms for c in checks if c.response_time_ms is not None]
    avg_response = sum(response_times) / len(response_times) if response_times else 0.0
    
    successful = sum(1 for c in checks if c.status == "ok")
    total = len(checks)
    
    # Extract metric values with defaults
    p95 = float(latest_check.latency_p95_ms) if latest_check and latest_check.latency_p95_ms else 0.0
    p99 = float(latest_check.latency_p99_ms) if latest_check and latest_check.latency_p99_ms else 0.0
    error_rate = float(latest_check.error_rate_percent) if latest_check and latest_check.error_rate_percent else 0.0
    uptime = float(latest_check.uptime_percent) if latest_check and latest_check.uptime_percent else 0.0
    req_rate = float(latest_check.request_rate_rpm) if latest_check and latest_check.request_rate_rpm else 0.0
    tps = float(latest_check.throughput_rps) if latest_check and latest_check.throughput_rps else 0.0
    apdex = float(latest_check.apdex_score) if latest_check and latest_check.apdex_score else 0.0
    
    return ServiceMetricsSummary(
        service_id=service_id,
        service_name=service.name,
        current_status=latest_check.status if latest_check else "unknown",
        avg_response_time_ms=float(avg_response),
        p95_response_time_ms=p95,
        p99_response_time_ms=p99,
        error_rate_percent=error_rate,
        uptime_percent_24h=uptime,
        request_rate_rpm=req_rate,
        throughput_rps=tps,
        apdex_score=apdex,
        checks_count=total,
        last_check_timestamp=latest_check.timestamp if latest_check else datetime.utcnow(),
    )


@app.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    s = db.query(Service).filter(Service.id == service_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="service not found")
    remove_service_job(service_id)
    db.delete(s)
    db.commit()
    return {"ok": True}
