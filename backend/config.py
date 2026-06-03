from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    kobo_api_token: str = ""
    kobo_asset_uid: str = ""
    kobo_sentiment_asset_uid: str = ""
    kobo_base_url: str = "https://kf.kobotoolbox.org"

    dla_csv_path: str = ""

    dashboard_username: str = "admin"
    dashboard_password: str = "changeme"

    jwt_secret_key: str = "insecure-dev-secret-replace-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    environment: str = "development"

    # Comma-separated browser origins (Vercel). Empty = allow all (dev-friendly).
    cors_allowed_origins: str = ""

    # ── Supabase ──────────────────────────────────────────────
    supabase_url: str = ""
    supabase_service_key: str = ""


settings = Settings()
