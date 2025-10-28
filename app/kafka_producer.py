from kafka import KafkaProducer
import json
from .config import settings
from .logging_config import logger


class SimpleKafkaProducer:
    def __init__(self, bootstrap_servers=None):
        self.bootstrap_servers = bootstrap_servers or settings.KAFKA_BOOTSTRAP_SERVERS
        self._producer = None

    def connect(self):
        if self._producer is None:
            try:
                self._producer = KafkaProducer(
                    bootstrap_servers=self.bootstrap_servers.split(","),
                    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
                )
            except Exception as e:
                logger.error("kafka.connect.failed", exc=str(e))

    def publish(self, topic: str, message: dict):
        try:
            self.connect()
            if not self._producer:
                logger.warning("kafka.producer.not_ready", topic=topic)
                return
            self._producer.send(topic, message)
            self._producer.flush()
            logger.debug("kafka.published", topic=topic, message=message)
        except Exception as exc:
            # don't raise in production path - log and continue
            logger.error("kafka.publish.failed", exc=str(exc), topic=topic)


producer = SimpleKafkaProducer()
