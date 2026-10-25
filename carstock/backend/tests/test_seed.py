"""Regression tests for the demo data. The original seeded admin used an `.local` email that the
validator rejected, so nobody could log in as admin."""
from app.models import User, Vehicle
from app.seed import DEMO_ADMIN, DEMO_CUSTOMER, seed_database


def test_seeded_admin_can_log_in_and_is_admin(client, db):
    seed_database(db)
    response = client.post("/api/auth/login", json={"email": DEMO_ADMIN["email"], "password": DEMO_ADMIN["password"]})
    assert response.status_code == 200
    assert response.json()["user"]["is_admin"] is True


def test_seeded_customer_can_log_in_and_is_not_admin(client, db):
    seed_database(db)
    response = client.post("/api/auth/login", json={"email": DEMO_CUSTOMER["email"], "password": DEMO_CUSTOMER["password"]})
    assert response.status_code == 200
    assert response.json()["user"]["is_admin"] is False


def test_seeding_twice_does_not_duplicate_anything(db):
    seed_database(db)
    counts = (db.query(User).count(), db.query(Vehicle).count())
    seed_database(db)
    assert (db.query(User).count(), db.query(Vehicle).count()) == counts


def test_seed_includes_an_out_of_stock_vehicle_for_the_demo(db):
    seed_database(db)
    assert db.query(Vehicle).filter(Vehicle.quantity == 0).count() >= 1
