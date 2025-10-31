from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    url = Column(Text, nullable=False)
    interval_seconds = Column(Integer, nullable=False, default=60)
    timeout_seconds = Column(Integer, nullable=False, default=10)


class Check(Base):
    __tablename__ = "checks"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(32), nullable=False)
    response_time_ms = Column(Float, nullable=True)
    error = Column(Text, nullable=True)
    
    # SRE Metrics
    latency_p50_ms = Column(Float, nullable=True)        # Median response time
    latency_p95_ms = Column(Float, nullable=True)        # 95th percentile
    latency_p99_ms = Column(Float, nullable=True)        # 99th percentile
    request_rate_rpm = Column(Float, nullable=True)      # Requests per minute
    error_rate_percent = Column(Float, nullable=True)    # Error rate %
    uptime_percent = Column(Float, nullable=True)        # Uptime % (rolling 24h)
    throughput_rps = Column(Float, nullable=True)        # Requests per second
    apdex_score = Column(Float, nullable=True)           # Application Performance Index (0-1)
