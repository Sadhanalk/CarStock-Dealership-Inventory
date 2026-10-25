from sqlalchemy.orm import Session

from ..errors import InsufficientStockError, NotFoundError
from ..models import Vehicle
from ..repositories.vehicle_repository import VehicleRepository


class InventoryService:
    """Stock-changing operations: purchase (any user) and restock (admin)."""

    def __init__(self, db: Session, vehicles: VehicleRepository) -> None:
        self.db = db
        self.vehicles = vehicles

    def purchase(self, vehicle_id: int, quantity: int = 1) -> Vehicle:
        if self.vehicles.get(vehicle_id) is None:
            raise NotFoundError("Vehicle not found")
        if not self.vehicles.decrement_stock(vehicle_id, quantity):
            self.db.rollback()
            raise InsufficientStockError("Vehicle is out of stock" if quantity == 1 else "Not enough units in stock")
        self.db.commit()
        return self._reload(vehicle_id)

    def restock(self, vehicle_id: int, quantity: int) -> Vehicle:
        if self.vehicles.get(vehicle_id) is None:
            raise NotFoundError("Vehicle not found")
        self.vehicles.increment_stock(vehicle_id, quantity)
        self.db.commit()
        return self._reload(vehicle_id)

    def _reload(self, vehicle_id: int) -> Vehicle:
        # commit() expired the cached row, so this returns the fresh quantity.
        vehicle = self.vehicles.get(vehicle_id)
        assert vehicle is not None
        return vehicle
