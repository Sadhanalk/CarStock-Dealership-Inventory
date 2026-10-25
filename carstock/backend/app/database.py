"""SQLAlchemy engine, session factory and the FastAPI session dependency."""
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import get_settings


class Base(DeclarativeBase):
    """Declarative base class for all ORM models."""


def build_engine(database_url: str):
    """Create an engine; for SQLite files, make sure the parent directory exists."""
    url = make_url(database_url)
    connect_args = {}
    if url.get_backend_name() == "sqlite":
        connect_args["check_same_thread"] = False  # FastAPI serves requests from a thread pool
        if url.database and url.database != ":memory:":
            Path(url.database).parent.mkdir(parents=True, exist_ok=True)
    return create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)


engine = build_engine(get_settings().database_url)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_db() -> Generator[Session, None, None]:
    """Yield one database session per request and always close it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
