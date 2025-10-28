import time
import requests
from sqlalchemy.orm import Session
from .models import Check, Service
from .metrics import observe_check
from .kafka_producer import producer
from .alerts import send_slack_alert
from .config import settings
from .logging_config import logger
from .redis_client import get_redis


def check_service(db: Session, service: Service) -> Check:
    """Perform a synchronous health check for a service and persist a Check record."""
    start = time.time()
    status = "ok"
    response_time_ms = None
    error = None
    try:
        resp = requests.get(service.url, timeout=service.timeout_seconds)
        response_time_ms = (time.time() - start) * 1000.0
        if resp.status_code >= 500:
            status = "error"
        elif resp.status_code >= 400:
            status = "warn"
    except Exception as exc:
        status = "down"
        error = str(exc)
        response_time_ms = None

    # create Check record
    check = Check(
        service_id=service.id,
        status=status,
        response_time_ms=response_time_ms,
        error=error,
    )
    db.add(check)
    db.commit()
    db.refresh(check)

    # publish metrics
    observe_check(service.name, status, (response_time_ms or 0) / 1000.0 if response_time_ms else None)

    # publish event to kafka
    try:
        producer.publish("health_checks", {
            "service_id": service.id,
            "service_name": service.name,
            "status": status,
            "response_time_ms": response_time_ms,
        })
    except Exception:
        logger.exception("healthcheck.kafka.publish_failed", service_id=service.id)

    # simple alerting policy: down or server error or very high latency
    try:
        should_alert = False
        reason = None
        if status in ("down", "error"):
            should_alert = True
            reason = f"status={status} error={error}"
        elif response_time_ms and response_time_ms > settings.ALERT_RESPONSE_TIME_THRESHOLD_MS:
            should_alert = True
            reason = f"high_latency={response_time_ms}ms"

        if should_alert:
            # use Redis to dedupe inside send_slack_alert
            send_slack_alert(f"Service {service.name} alert: {reason}", service.id)
    except Exception:
        logger.exception("healthcheck.alerting_failed", service_id=service.id)

    return check
