from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy.orm import Session
from .database import get_db, engine
from .models import Base, Service, Check
from .schemas import ServiceCreate, ServiceRead, CheckRead
from .scheduler import start_scheduler, add_service_job, remove_service_job
from .config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="HealthTrack")


@app.on_event("startup")
def on_startup():
    # configure logging
    from .logging_config import configure_logging

    configure_logging()

    # start the scheduler and job loaders
    start_scheduler()


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


@app.delete("/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    s = db.query(Service).filter(Service.id == service_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="service not found")
    remove_service_job(service_id)
    db.delete(s)
    db.commit()
    return {"ok": True}
