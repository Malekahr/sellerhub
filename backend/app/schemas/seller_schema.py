from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl, field_validator


class SellerReviewProductCreate(BaseModel):
    product_name: str = Field(min_length=2, max_length=150)
    purchase_date: Optional[date] = None
    short_description: Optional[str] = Field(default=None, max_length=1000)
    product_link: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("product_name")
    @classmethod
    def clean_product_name(cls, value: str):
        return value.strip()

    @field_validator("product_link")
    @classmethod
    def clean_product_link(cls, value: Optional[str]):
        if value is None:
            return value

        cleaned_value = value.strip()

        if not cleaned_value:
            return None

        return cleaned_value


class SellerReviewCreate(BaseModel):
    seller_name: str = Field(min_length=2, max_length=100)
    seller_link: HttpUrl
    product_type: str = Field(min_length=2, max_length=100)
    seller_specialties: Optional[str] = Field(default=None, max_length=300)

    quality_rating: int = Field(ge=1, le=5)
    price_rating: int = Field(ge=1, le=5)

    description: Optional[str] = Field(default=None, max_length=2000)

    products: list[SellerReviewProductCreate] = Field(
        default_factory=list,
        max_length=5
    )

    @field_validator("seller_name", "product_type")
    @classmethod
    def clean_text_fields(cls, value: str):
        return value.strip()

    @field_validator("seller_specialties", "description")
    @classmethod
    def clean_optional_text_fields(cls, value: Optional[str]):
        if value is None:
            return value

        cleaned_value = value.strip()

        if not cleaned_value:
            return None

        return cleaned_value


class SellerReviewUpdate(BaseModel):
    seller_name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    seller_link: Optional[HttpUrl] = None
    product_type: Optional[str] = Field(default=None, min_length=2, max_length=100)
    seller_specialties: Optional[str] = Field(default=None, max_length=300)

    quality_rating: Optional[int] = Field(default=None, ge=1, le=5)
    price_rating: Optional[int] = Field(default=None, ge=1, le=5)

    description: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("seller_name", "product_type")
    @classmethod
    def clean_optional_required_text_fields(cls, value: Optional[str]):
        if value is None:
            return value

        return value.strip()

    @field_validator("seller_specialties", "description")
    @classmethod
    def clean_optional_text_fields(cls, value: Optional[str]):
        if value is None:
            return value

        cleaned_value = value.strip()

        if not cleaned_value:
            return None

        return cleaned_value


class SellerReviewProductUpdate(BaseModel):
    product_name: Optional[str] = Field(default=None, min_length=2, max_length=150)
    purchase_date: Optional[date] = None
    short_description: Optional[str] = Field(default=None, max_length=1000)
    product_link: Optional[str] = Field(default=None, max_length=2000)

    @field_validator("product_name")
    @classmethod
    def clean_optional_product_name(cls, value: Optional[str]):
        if value is None:
            return value

        return value.strip()

    @field_validator("product_link")
    @classmethod
    def clean_optional_product_link(cls, value: Optional[str]):
        if value is None:
            return value

        cleaned_value = value.strip()

        if not cleaned_value:
            return None

        return cleaned_value


class SellerProductImageResponse(BaseModel):
    id: int
    file_path: str
    file_type: str
    file_size: int
    image_label: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AgentLinkResponse(BaseModel):
    agent: str
    label: str
    url: str


class SellerReviewProductResponse(BaseModel):
    id: int
    product_name: str
    purchase_date: Optional[date]
    short_description: Optional[str]
    source_platform: Optional[str]
    source_product_id: Optional[str]
    agent_links: list[AgentLinkResponse] = Field(default_factory=list)
    created_at: datetime

    images: list[SellerProductImageResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class SellerReviewResponse(BaseModel):
    id: int
    seller_name: str
    seller_link: str
    product_type: str
    seller_specialties: Optional[str]

    quality_rating: int
    price_rating: int

    description: Optional[str]

    owner_id: int
    is_deleted: bool

    created_at: datetime
    updated_at: datetime

    products: list[SellerReviewProductResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
