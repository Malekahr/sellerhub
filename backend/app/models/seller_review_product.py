from datetime import date, datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class SellerReviewProduct(Base):
    __tablename__ = "seller_review_products"

    id = Column(Integer, primary_key=True, index=True)

    seller_review_id = Column(
        Integer,
        ForeignKey("seller_reviews.id"),
        nullable=False
    )

    product_name = Column(String(150), nullable=False)
    purchase_date = Column(Date, nullable=True)
    short_description = Column(Text, nullable=True)

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

    seller_review = relationship(
        "SellerReview",
        back_populates="products"
    )

    images = relationship(
        "SellerProductImage",
        back_populates="product",
        cascade="all, delete-orphan"
    )