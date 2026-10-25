from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app import database, main
from app.database import build_engine
from app.seed import DEMO_ADMIN


def test_startup_creates_tables_and_seeds_demo_data(tmp_path, monkeypatch):
    """Booting the app (lifespan) against a fresh DB file must leave a usable, seeded database."""
    engine = build_engine(f"sqlite:///{tmp_path / 'boot.db'}")
    factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    monkeypatch.setattr(main, "engine", engine)
    monkeypatch.setattr(main, "SessionLocal", factory)
    monkeypatch.setattr(database, "SessionLocal", factory)

    with TestClient(main.app) as booted:
        login = booted.post("/api/auth/login", json={"email": DEMO_ADMIN["email"], "password": DEMO_ADMIN["password"]})
        assert login.status_code == 200
        token = login.json()["access_token"]
        vehicles = booted.get("/api/vehicles", headers={"Authorization": f"Bearer {token}"}).json()
        assert len(vehicles) >= 5
    engine.dispose()


def test_sqlite_parent_directory_is_created(tmp_path):
    nested = tmp_path / "does" / "not" / "exist" / "app.db"
    engine = build_engine(f"sqlite:///{nested}")
    engine.connect().close()
    assert nested.parent.is_dir()
    engine.dispose()
