from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class SellerReview(Base):
    __tablename__ = "seller_reviews"

    id = Column(Integer, primary_key=True, index=True)

    seller_name = Column(String(100), nullable=False, index=True)
    seller_link = Column(String(500), nullable=False)

    product_type = Column(String(100), nullable=False)
    seller_specialties = Column(String(300), nullable=True)

    quality_rating = Column(Integer, nullable=False)
    price_rating = Column(Integer, nullable=False)

    description = Column(Text, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    is_deleted = Column(Boolean, default=False, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    owner = relationship("User", back_populates="seller_reviews")
    products = relationship(
        "SellerReviewProduct",
        back_populates="seller_review",
        cascade="all, delete-orphan"
    )