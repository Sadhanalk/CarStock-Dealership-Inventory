"""FastAPI dependencies: current user, admin guard, query-filter parsing and service wiring."""
from typing import Annotated

from fastapi import Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .auth import decode_subject
from .database import get_db
from .models import User
from .repositories.user_repository import UserRepository
from .repositories.vehicle_repository import VehicleFilters, VehicleRepository
from .services.auth_service import AuthService
from .services.inventory_service import InventoryService
from .services.vehicle_service import VehicleService

bearer = HTTPBearer(auto_error=False)
DbSession = Annotated[Session, Depends(get_db)]


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    db: DbSession,
) -> User:
    """Resolve the bearer token to a user or answer 401."""
    if not credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Authentication required")
    subject = decode_subject(credentials.credentials)
    user = UserRepository(db).get_by_id(int(subject)) if subject and subject.isdigit() else None
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")
    return user


def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    """Allow only admins; everyone else gets 403."""
    if not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin access required")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(require_admin)]


def get_vehicle_filters(
    q: str | None = None,
    make: str | None = None,
    model: str | None = None,
    category: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
) -> VehicleFilters:
    """Parse and validate search query parameters (shared by list and search endpoints)."""
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "min_price cannot exceed max_price")
    return VehicleFilters(q=q, make=make, model=model, category=category, min_price=min_price, max_price=max_price)


Filters = Annotated[VehicleFilters, Depends(get_vehicle_filters)]


def get_auth_service(db: DbSession) -> AuthService:
    return AuthService(db, UserRepository(db))


def get_vehicle_service(db: DbSession) -> VehicleService:
    return VehicleService(db, VehicleRepository(db))


def get_inventory_service(db: DbSession) -> InventoryService:
    return InventoryService(db, VehicleRepository(db))


AuthSvc = Annotated[AuthService, Depends(get_auth_service)]
VehicleSvc = Annotated[VehicleService, Depends(get_vehicle_service)]
InventorySvc = Annotated[InventoryService, Depends(get_inventory_service)]
