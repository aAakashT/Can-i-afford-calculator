from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Can I Afford This API"
    environment: str = "development"
    frontend_origin: str = "http://localhost:3000"
    database_url: str = "postgresql+psycopg://afford:afford@db:5432/afford"
    request_body_limit_bytes: int = 32_768

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
