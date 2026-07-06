from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Seller-Site"
    app_env: str = "development"

    secret_key: str = Field(validation_alias="SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", validation_alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=30,
        validation_alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    database_url: str = Field(validation_alias="DATABASE_URL")

    supabase_url: str | None = Field(default=None, validation_alias="SUPABASE_URL")
    supabase_service_role_key: str | None = Field(
        default=None,
        validation_alias="SUPABASE_SERVICE_ROLE_KEY"
    )
    supabase_storage_bucket: str | None = Field(
        default=None,
        validation_alias="SUPABASE_STORAGE_BUCKET"
    )

    kakobuy_affiliate_code: str | None = Field(
        default=None,
        validation_alias="KAKOBUY_AFFILIATE_CODE"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()