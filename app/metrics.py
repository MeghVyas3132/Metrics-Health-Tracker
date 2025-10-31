from prometheus_client import Counter, Histogram
from typing import Optional

CHECKS_TOTAL = Counter("health_checks_total", "Total health check attempts", ["service", "status"])
CHECK_RESPONSE_TIME = Histogram("health_check_response_time_seconds", "Response time for health checks (s)", ["service"])

def observe_check(service_name: str, status: str, response_time_s: Optional[float]):
    CHECKS_TOTAL.labels(service=service_name, status=status).inc()
    if response_time_s is not None:
        CHECK_RESPONSE_TIME.labels(service=service_name).observe(response_time_s)
