from dataclasses import dataclass

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..models import Vehicle


@dataclass(frozen=True)
class VehicleFilters:
    """Every field is optional; supplied filters are combined with AND."""

    q: str | None = None  # free text matched against make OR model
    make: str | None = None
    model: str | None = None
    category: str | None = None
    min_price: float | None = None
    max_price: float | None = None


def _contains(column, text: str):
    """Case-insensitive "contains" match that treats %, _ and \\ in user input literally."""
    escaped = text.strip().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return column.ilike(f"%{escaped}%", escape="\\")


class VehicleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, vehicle: Vehicle) -> Vehicle:
        self.db.add(vehicle)
        self.db.flush()
        return vehicle

    def get(self, vehicle_id: int) -> Vehicle | None:
        return self.db.get(Vehicle, vehicle_id)

    def delete(self, vehicle: Vehicle) -> None:
        self.db.delete(vehicle)

    def find(self, filters: VehicleFilters) -> list[Vehicle]:
        """Single query builder behind both GET /vehicles and GET /vehicles/search."""
        clauses = []
        if filters.q:
            clauses.append(_contains(Vehicle.make, filters.q) | _contains(Vehicle.model, filters.q))
        if filters.make:
            clauses.append(_contains(Vehicle.make, filters.make))
        if filters.model:
            clauses.append(_contains(Vehicle.model, filters.model))
        if filters.category:
            clauses.append(_contains(Vehicle.category, filters.category))
        if filters.min_price is not None:
            clauses.append(Vehicle.price >= filters.min_price)
        if filters.max_price is not None:
            clauses.append(Vehicle.price <= filters.max_price)

        query = select(Vehicle).where(*clauses).order_by(Vehicle.created_at.desc(), Vehicle.id.desc())
        return list(self.db.scalars(query))

    def decrement_stock(self, vehicle_id: int, amount: int) -> bool:
        """Atomically remove `amount` units. Returns False if there was not enough stock.

        The `quantity >= amount` guard is part of the UPDATE itself, so two simultaneous
        purchases (or a purchase based on stale data) can never push stock below zero.
        """
        result = self.db.execute(
            update(Vehicle)
            .where(Vehicle.id == vehicle_id, Vehicle.quantity >= amount)
            .values(quantity=Vehicle.quantity - amount)
        )
        return result.rowcount == 1

    def increment_stock(self, vehicle_id: int, amount: int) -> None:
        """Atomically add units (done in SQL so concurrent restocks are never lost)."""
        self.db.execute(update(Vehicle).where(Vehicle.id == vehicle_id).values(quantity=Vehicle.quantity + amount))
