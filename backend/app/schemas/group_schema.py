from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class GroupCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    is_private: bool = False

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str):
        return value.strip()

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: Optional[str]):
        if value is None:
            return value

        return value.strip()

class AddGroupMemberByUsername(BaseModel):
    username: str = Field(min_length=3, max_length=50)

    @field_validator("username")
    @classmethod
    def clean_username(cls, value: str):
        return value.strip().lower()


class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    owner_id: int
    is_private: bool
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GroupMemberUserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class GroupMemberResponse(BaseModel):
    id: int
    group_id: int
    user_id: int
    role: str
    joined_at: datetime
    user: Optional[GroupMemberUserResponse] = None

    class Config:
        from_attributes = True