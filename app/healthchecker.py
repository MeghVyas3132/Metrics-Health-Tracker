import time
import requests
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import Check, Service
from .metrics import observe_check
from .kafka_producer import producer
from .alerts import send_slack_alert
from .config import settings
from .logging_config import logger
from .redis_client import get_redis
from datetime import datetime, timedelta
from typing import Optional


def calculate_sre_metrics(db: Session, service: Service, window_minutes: int = 60) -> dict:
    """Calculate SRE metrics (Apdex, percentiles, error rate, uptime) for a service."""
    # Get all checks from the last window
    cutoff_time = datetime.utcnow() - timedelta(minutes=window_minutes)
    recent_checks = db.query(Check).filter(
        Check.service_id == service.id,
        Check.timestamp >= cutoff_time
    ).all()
    
    if not recent_checks:
        return {
            "latency_p50_ms": None,
            "latency_p95_ms": None,
            "latency_p99_ms": None,
            "request_rate_rpm": None,
            "error_rate_percent": None,
            "uptime_percent": None,
            "throughput_rps": None,
            "apdex_score": None,
        }
    
    # Collect response times (only successful checks)
    response_times = sorted([
        c.response_time_ms for c in recent_checks
        if c.response_time_ms is not None and c.status == "ok"
    ])
    
    # Calculate percentiles
    def percentile(data, p):
        if not data:
            return None
        idx = int(len(data) * p / 100)
        return data[min(idx, len(data) - 1)]
    
    latency_p50_ms = percentile(response_times, 50)
    latency_p95_ms = percentile(response_times, 95)
    latency_p99_ms = percentile(response_times, 99)
    
    # Calculate error rate
    total_checks = len(recent_checks)
    failed_checks = sum(1 for c in recent_checks if c.status in ("down", "error", "warn"))
    error_rate_percent = (failed_checks / total_checks * 100) if total_checks > 0 else 0
    
    # Calculate uptime %
    successful_checks = total_checks - failed_checks
    uptime_percent = (successful_checks / total_checks * 100) if total_checks > 0 else 0
    
    # Calculate request rate (checks per minute)
    time_span_minutes = window_minutes
    request_rate_rpm = total_checks / time_span_minutes if time_span_minutes > 0 else 0
    throughput_rps = request_rate_rpm / 60
    
    # Calculate Apdex score (Application Performance Index)
    # Apdex = (Satisfied + Tolerating/2) / Total
    # Satisfied = response_time <= T (threshold, e.g., 1000ms)
    # Tolerating = T < response_time <= 4T
    apdex_threshold_ms = 1000  # 1 second SLA
    satisfied = sum(1 for rt in response_times if rt <= apdex_threshold_ms)
    tolerating = sum(1 for rt in response_times if apdex_threshold_ms < rt <= 4 * apdex_threshold_ms)
    apdex_score = (satisfied + tolerating / 2) / len(response_times) if response_times else 0
    apdex_score = min(apdex_score, 1.0)  # Cap at 1.0
    
    return {
        "latency_p50_ms": latency_p50_ms,
        "latency_p95_ms": latency_p95_ms,
        "latency_p99_ms": latency_p99_ms,
        "request_rate_rpm": request_rate_rpm,
        "error_rate_percent": error_rate_percent,
        "uptime_percent": uptime_percent,
        "throughput_rps": throughput_rps,
        "apdex_score": apdex_score,
    }


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

    # Calculate SRE metrics for this check's window
    sre_metrics = calculate_sre_metrics(db, service, window_minutes=60)

    # Create Check record with SRE metrics
    check = Check(
        service_id=service.id,
        status=status,
        response_time_ms=response_time_ms,
        error=error,
        latency_p50_ms=sre_metrics["latency_p50_ms"],
        latency_p95_ms=sre_metrics["latency_p95_ms"],
        latency_p99_ms=sre_metrics["latency_p99_ms"],
        request_rate_rpm=sre_metrics["request_rate_rpm"],
        error_rate_percent=sre_metrics["error_rate_percent"],
        uptime_percent=sre_metrics["uptime_percent"],
        throughput_rps=sre_metrics["throughput_rps"],
        apdex_score=sre_metrics["apdex_score"],
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
            "apdex_score": sre_metrics["apdex_score"],
            "error_rate_percent": sre_metrics["error_rate_percent"],
        })
    except Exception:
        logger.exception("healthcheck.kafka.publish_failed", service_id=service.id)

    # SRE alerting policy: down, error, high latency, or SLO breach
    try:
        should_alert = False
        reason = None
        if status in ("down", "error"):
            should_alert = True
            reason = f"status={status} error={error}"
        elif response_time_ms and response_time_ms > settings.ALERT_RESPONSE_TIME_THRESHOLD_MS:
            should_alert = True
            reason = f"high_latency={response_time_ms}ms (threshold={settings.ALERT_RESPONSE_TIME_THRESHOLD_MS}ms)"
        elif sre_metrics["error_rate_percent"] > 5.0:  # >5% error rate = alert
            should_alert = True
            reason = f"error_rate={sre_metrics['error_rate_percent']:.2f}% (threshold=5%)"
        elif sre_metrics["apdex_score"] and sre_metrics["apdex_score"] < 0.8:  # Apdex <0.8 = poor
            should_alert = True
            reason = f"poor_apdex={sre_metrics['apdex_score']:.2f} (threshold=0.8)"

        if should_alert:
            send_slack_alert(f"Service {service.name} alert: {reason}", service.id)
    except Exception:
        logger.exception("healthcheck.alerting_failed", service_id=service.id)

    return check
