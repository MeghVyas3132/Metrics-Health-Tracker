from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class ServiceCreate(BaseModel):
    name: str
    url: HttpUrl
    interval_seconds: int = 60
    timeout_seconds: int = 10


class ServiceRead(ServiceCreate):
    id: int

    class Config:
        from_attributes = True


class CheckRead(BaseModel):
    id: int
    service_id: int
    timestamp: datetime
    status: str
    response_time_ms: Optional[float]
    error: Optional[str]

    class Config:
        from_attributes = True


# SRE-focused detailed metrics schema
class DetailedCheckRead(CheckRead):
    """Extended health check with SRE metrics (Apdex, percentiles, error budget)"""
    latency_p50_ms: Optional[float]
    latency_p95_ms: Optional[float]
    latency_p99_ms: Optional[float]
    request_rate_rpm: Optional[float]
    error_rate_percent: Optional[float]
    uptime_percent: Optional[float]
    throughput_rps: Optional[float]
    apdex_score: Optional[float]

    class Config:
        from_attributes = True


class ServiceMetricsSummary(BaseModel):
    """Aggregated metrics for a service"""
    service_id: int
    service_name: str
    current_status: str
    avg_response_time_ms: float
    p95_response_time_ms: float
    p99_response_time_ms: float
    error_rate_percent: float
    uptime_percent_24h: float
    request_rate_rpm: float
    throughput_rps: float
    apdex_score: float
    checks_count: int
    last_check_timestamp: datetime
