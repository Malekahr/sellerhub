from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    is_private = Column(Boolean, default=False, nullable=False)
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

    owner = relationship("User", back_populates="owned_groups")

    members = relationship(
        "GroupMember",
        back_populates="group",
        cascade="all, delete-orphan"
    )


class GroupMember(Base):
    __tablename__ = "group_members"

    __table_args__ = (
        UniqueConstraint("group_id", "user_id", name="unique_group_user"),
    )

    id = Column(Integer, primary_key=True, index=True)

    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    role = Column(String(20), default="member", nullable=False)

    joined_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    group = relationship("Group", back_populates="members")
    user = relationship("User", back_populates="group_memberships")