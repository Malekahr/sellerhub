from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.utils.affiliate_link_builder import build_agent_links


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

    source_platform = Column(String(50), nullable=True)
    source_product_id = Column(String(100), nullable=True)

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

    @property
    def agent_links(self):
        return build_agent_links(
            platform=self.source_platform,
            product_id=self.source_product_id
        )