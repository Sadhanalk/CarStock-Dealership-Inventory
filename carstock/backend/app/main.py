"""FastAPI application entry point."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .database import Base, SessionLocal, engine
from .errors import DomainError
from .routes_auth import router as auth_router
from .routes_vehicles import router as vehicles_router
from .seed import seed_database


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """On startup: create tables (persistent DB) and optionally seed demo data."""
    Base.metadata.create_all(bind=engine)
    if get_settings().seed_demo_data:
        with SessionLocal() as db:
            seed_database(db)
    yield


app = FastAPI(title="CarStock Inventory API", version="1.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth_router)
app.include_router(vehicles_router)


@app.exception_handler(DomainError)
async def handle_domain_error(_request: Request, exc: DomainError) -> JSONResponse:
    """Translate service-layer errors into the same `{"detail": ...}` shape FastAPI uses."""
    return JSONResponse(status_code=exc.status_code, content={"detail": str(exc)})


@app.get("/health")
def health():
    return {"status": "ok", "service": "carstock-api"}
