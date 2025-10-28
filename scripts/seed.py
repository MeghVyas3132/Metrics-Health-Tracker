"""Simple seed script to add example services to the database.

Run locally after DB is available (e.g., with docker-compose):

    cp .env.example .env
    # edit .env if needed
    docker compose up -d postgres
    python scripts/seed.py

"""
from app.database import SessionLocal, engine
from app.models import Base, Service


def seed():
    # ensure tables exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(Service).filter(Service.name == "example-api").first():
            s = Service(name="example-api", url="https://httpbin.org/status/200", interval_seconds=60, timeout_seconds=10)
            db.add(s)
            db.commit()
            print("Added example service: example-api")
        else:
            print("example-api already present")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
