from sqlalchemy.orm import Session

from ..errors import NotFoundError
from ..models import Vehicle
from ..repositories.vehicle_repository import VehicleFilters, VehicleRepository
from ..schemas import VehicleCreate, VehicleUpdate


class VehicleService:
    """Vehicle catalogue operations (create, read, update, delete)."""

    def __init__(self, db: Session, vehicles: VehicleRepository) -> None:
        self.db = db
        self.vehicles = vehicles

    def search(self, filters: VehicleFilters) -> list[Vehicle]:
        return self.vehicles.find(filters)

    def create(self, data: VehicleCreate) -> Vehicle:
        vehicle = self.vehicles.add(Vehicle(**data.model_dump()))
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def update(self, vehicle_id: int, data: VehicleUpdate) -> Vehicle:
        vehicle = self._get_or_404(vehicle_id)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(vehicle, field, value)
        self.db.commit()
        self.db.refresh(vehicle)
        return vehicle

    def delete(self, vehicle_id: int) -> None:
        self.vehicles.delete(self._get_or_404(vehicle_id))
        self.db.commit()

    def _get_or_404(self, vehicle_id: int) -> Vehicle:
        vehicle = self.vehicles.get(vehicle_id)
        if vehicle is None:
            raise NotFoundError("Vehicle not found")
        return vehicle
