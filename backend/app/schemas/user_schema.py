from datetime import datetime
import re

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str):
        value = value.strip().lower()

        if not re.fullmatch(r"^[a-z0-9_]+$", value):
            raise ValueError(
                "Username mag alleen kleine letters, cijfers en underscores bevatten."
            )

        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr):
        return str(value).strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        if " " in value:
            raise ValueError("Wachtwoord mag geen spaties bevatten.")

        if not any(char.isdigit() for char in value):
            raise ValueError("Wachtwoord moet minstens 1 cijfer bevatten.")

        if not any(char.isalpha() for char in value):
            raise ValueError("Wachtwoord moet minstens 1 letter bevatten.")

        return value


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True