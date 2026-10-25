"""Application settings, loaded from environment variables (or a .env file at the repo root)."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    # Default: a persistent SQLite file inside backend/data, independent of the working directory.
    database_url: str = f"sqlite:///{BACKEND_DIR / 'data' / 'carstock.db'}"
    jwt_secret: str = "change-this-in-local-development"
    access_token_expire_minutes: int = 60
    # Comma-separated list of browser origins allowed to call the API.
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    # Create the demo admin/customer and sample vehicles on first start.
    seed_demo_data: bool = True

    model_config = SettingsConfigDict(env_file=REPO_ROOT / ".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
