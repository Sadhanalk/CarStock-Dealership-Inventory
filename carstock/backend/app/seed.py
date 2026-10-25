"""Demo data. Safe to run repeatedly: it only inserts what is missing."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from .auth import hash_password
from .models import User, Vehicle

# NB: ".local" and other reserved domains are rejected by the email validator, so use a normal domain.
DEMO_ADMIN = {"email": "admin@carstock.com", "full_name": "Avery Stone", "password": "AdminPass123!", "is_admin": True}
DEMO_CUSTOMER = {"email": "buyer@carstock.com", "full_name": "Jordan Reyes", "password": "BuyerPass123!", "is_admin": False}

DEMO_VEHICLES = [
    ("Lumen", "Arc GT", "Electric", 58900, 4),
    ("Lumen", "Arc Mini", "Electric", 31900, 1),
    ("Northstar", "Trailhawk X", "SUV", 47200, 7),
    ("Northstar", "Summit", "SUV", 61500, 3),
    ("Vela", "Corsa S", "Sport", 73900, 2),
    ("Vela", "Corsa R", "Sport", 98500, 1),
    ("Nori", "City E", "Compact", 28900, 0),
    ("Nori", "Pocket", "Compact", 19900, 9),
    ("Kestrel", "Haul 1500", "Truck", 44800, 5),
    ("Auren", "Meridian", "Sedan", 36400, 6),
]


def seed_database(db: Session) -> None:
    """Insert the demo accounts and vehicles if they do not exist yet."""
    for account in (DEMO_ADMIN, DEMO_CUSTOMER):
        if not db.scalar(select(User).where(User.email == account["email"])):
            db.add(
                User(
                    email=account["email"],
                    full_name=account["full_name"],
                    password_hash=hash_password(account["password"]),
                    is_admin=account["is_admin"],
                )
            )
    if not db.scalar(select(Vehicle).limit(1)):
        db.add_all(
            Vehicle(make=make, model=model, category=category, price=price, quantity=quantity)
            for make, model, category, price, quantity in DEMO_VEHICLES
        )
    db.commit()
