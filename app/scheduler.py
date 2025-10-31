from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Service
from .healthchecker import check_service
from .config import settings
import atexit

scheduler = BackgroundScheduler()


def _job_for_service(service_id: int):
    def _job():
        db: Session = SessionLocal()
        try:
            service = db.query(Service).filter(Service.id == service_id).first()
            if service:
                check_service(db, service)
        finally:
            db.close()

    return _job


def start_scheduler():
    # load all services and create jobs
    db: Session = SessionLocal()
    try:
        services = db.query(Service).all()
        for s in services:
            scheduler.add_job(
                _job_for_service(s.id),
                trigger=IntervalTrigger(seconds=max(5, s.interval_seconds)),
                id=f"service_{s.id}",
                replace_existing=True,
            )
    except Exception as e:
        # If DB is not available, start scheduler without jobs
        # Jobs will be added when services are created via API
        print(f"Warning: Could not load services from DB: {e}")
    finally:
        db.close()

    scheduler.start()
    atexit.register(lambda: scheduler.shutdown(wait=False))


def add_service_job(service):
    scheduler.add_job(
        _job_for_service(service.id),
        trigger=IntervalTrigger(seconds=max(5, service.interval_seconds)),
        id=f"service_{service.id}",
        replace_existing=True,
    )


def remove_service_job(service_id: int):
    job_id = f"service_{service_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
