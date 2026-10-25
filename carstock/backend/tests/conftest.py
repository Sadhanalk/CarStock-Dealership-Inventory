"""Shared fixtures. Every test gets its own throw-away SQLite *file*, so tests never touch each other
or the real development database."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app.auth import hash_password
from app.database import Base, build_engine, get_db
from app.main import app
from app.models import User, Vehicle


@pytest.fixture
def session_factory(tmp_path):
    engine = build_engine(f"sqlite:///{tmp_path / 'test.db'}")
    Base.metadata.create_all(engine)
    yield sessionmaker(bind=engine, autocommit=False, autoflush=False)
    engine.dispose()


@pytest.fixture
def db(session_factory):
    with session_factory() as session:
        yield session


@pytest.fixture
def client(session_factory):
    def override_get_db():
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


def _login(client, email, password):
    return client.post("/api/auth/login", json={"email": email, "password": password}).json()["access_token"]


@pytest.fixture
def admin_headers(client, db):
    db.add(User(email="admin@example.com", full_name="Admin", password_hash=hash_password("AdminPass123!"), is_admin=True))
    db.commit()
    return {"Authorization": f"Bearer {_login(client, 'admin@example.com', 'AdminPass123!')}"}


@pytest.fixture
def user_headers(client):
    payload = {"email": "buyer@example.com", "full_name": "Test Buyer", "password": "Password123"}
    token = client.post("/api/auth/register", json=payload).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def make_vehicle(db):
    """Factory: insert a vehicle straight into the database and return it."""

    def _make(make="Lumen", model="Arc", category="Electric", price=50000, quantity=3):
        vehicle = Vehicle(make=make, model=model, category=category, price=price, quantity=quantity)
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle

    return _make
