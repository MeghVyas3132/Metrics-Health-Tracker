import requests
from .config import settings
from .redis_client import get_redis
from .logging_config import logger


def send_slack_alert(message: str, service_id: int):
    """Send an alert to Slack if not recently sent (dedupe using Redis).

    Uses ALERT_DEDUPE_SECONDS from config to avoid spamming.
    """
    webhook = settings.ALERT_SLACK_WEBHOOK
    if not webhook:
        logger.info("alert.skipped.no_webhook", message=message, service_id=service_id)
        return

    r = get_redis()
    key = f"alert_dedupe:{service_id}"
    # set if not exists with ttl
    if r.set(key, "1", nx=True, ex=settings.ALERT_DEDUPE_SECONDS):
        try:
            requests.post(webhook, json={"text": message}, timeout=5)
            logger.info("alert.sent", message=message, service_id=service_id)
        except Exception as e:
            logger.error("alert.failed", exc=str(e), service_id=service_id, message=message)
    else:
        logger.info("alert.suppressed", message=message, service_id=service_id)
