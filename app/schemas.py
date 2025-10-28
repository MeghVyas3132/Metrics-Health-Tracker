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
        orm_mode = True


class CheckRead(BaseModel):
    id: int
    service_id: int
    timestamp: datetime
    status: str
    response_time_ms: Optional[float]
    error: Optional[str]

    class Config:
        orm_mode = True
