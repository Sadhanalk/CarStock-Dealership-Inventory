from fastapi import APIRouter, status

from .dependencies import AuthSvc
from .schemas import LoginRequest, TokenResponse, UserCreate, UserPublic

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_response(user, token: str) -> TokenResponse:
    return TokenResponse(access_token=token, user=UserPublic.model_validate(user))


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, service: AuthSvc):
    """Create a customer account and sign the user in."""
    return _token_response(*service.register(payload.email, payload.full_name, payload.password))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, service: AuthSvc):
    return _token_response(*service.login(payload.email, payload.password))
