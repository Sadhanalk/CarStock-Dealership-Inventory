"""Vehicle and inventory endpoints. Handlers stay thin: validate, call a service, return."""
from fastapi import APIRouter, status

from .dependencies import AdminUser, CurrentUser, Filters, InventorySvc, VehicleSvc
from .schemas import PurchaseRequest, RestockRequest, VehicleCreate, VehiclePublic, VehicleUpdate

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("", response_model=list[VehiclePublic])
def list_vehicles(_user: CurrentUser, filters: Filters, service: VehicleSvc):
    """All vehicles (newest first); the same optional filters as /search are accepted."""
    return service.search(filters)


# NOTE: declared before "/{vehicle_id}" routes so "search" is never parsed as an id.
@router.get("/search", response_model=list[VehiclePublic])
def search_vehicles(_user: CurrentUser, filters: Filters, service: VehicleSvc):
    """Search by q (make or model), make, model, category and a min/max price range."""
    return service.search(filters)


@router.post("", response_model=VehiclePublic, status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, _admin: AdminUser, service: VehicleSvc):
    return service.create(payload)


@router.put("/{vehicle_id}", response_model=VehiclePublic)
def update_vehicle(vehicle_id: int, payload: VehicleUpdate, _admin: AdminUser, service: VehicleSvc):
    return service.update(vehicle_id, payload)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(vehicle_id: int, _admin: AdminUser, service: VehicleSvc):
    service.delete(vehicle_id)


@router.post("/{vehicle_id}/purchase", response_model=VehiclePublic)
def purchase_vehicle(vehicle_id: int, _user: CurrentUser, service: InventorySvc, payload: PurchaseRequest | None = None):
    """Buy one unit (or `quantity` units); 409 when there is not enough stock."""
    return service.purchase(vehicle_id, payload.quantity if payload else 1)


@router.post("/{vehicle_id}/restock", response_model=VehiclePublic)
def restock_vehicle(vehicle_id: int, payload: RestockRequest, _admin: AdminUser, service: InventorySvc):
    return service.restock(vehicle_id, payload.quantity)
