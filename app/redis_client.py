from .config import settings
import time


# Import redis lazily and provide an in-memory fallback for test environments
try:
    import redis as _redis_lib
except Exception:
    _redis_lib = None

_r = None


class _InMemoryRedis:
    def __init__(self):
        self._data = {}

    def set(self, key, value, nx=False, ex=None):
        if nx and key in self._data:
            return False
        self._data[key] = (value, time.time() + ex if ex else None)
        return True

    def get(self, key):
        v = self._data.get(key)
        if not v:
            return None
        val, expiry = v
        if expiry and time.time() > expiry:
            del self._data[key]
            return None
        return val


def get_redis():
    global _r
    if _r is None:
        if _redis_lib:
            _r = _redis_lib.Redis(host=settings.REDIS_HOST, port=settings.REDIS_PORT, db=settings.REDIS_DB, decode_responses=True)
        else:
            # fallback for test environments where redis isn't installed
            import time

            _r = _InMemoryRedis()
    return _r
