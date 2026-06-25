from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database import Base

from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    role = Column(String(20), default="user", nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)

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

    seller_reviews = relationship(
        "SellerReview",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    owned_groups = relationship(
        "Group",
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    group_memberships = relationship(
        "GroupMember",
        back_populates="user",
        cascade="all, delete-orphan"
    )