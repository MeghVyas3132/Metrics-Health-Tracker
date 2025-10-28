from pydantic import BaseSettings


class Settings(BaseSettings):
    POSTGRES_USER: str = "health_user"
    POSTGRES_PASSWORD: str = "health_pass"
    POSTGRES_DB: str = "healthdb"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    # Alerting
    ALERT_SLACK_WEBHOOK: str = ""
    ALERT_DEDUPE_SECONDS: int = 300
    ALERT_RESPONSE_TIME_THRESHOLD_MS: int = 2000

    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"

    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    SCHEDULER_DEFAULT_INTERVAL: int = 60

    ALERT_SLACK_WEBHOOK: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
