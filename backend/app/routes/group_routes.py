from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.group import Group, GroupMember
from app.models.user import User
from app.schemas.group_schema import (
    AddGroupMemberByUsername,
    GroupCreate,
    GroupMemberResponse,
    GroupResponse,
)
from app.security.auth_dependencies import get_current_user


router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


MAX_GROUPS_PER_USER = 10


@router.post(
    "",
    response_model=GroupResponse,
    status_code=status.HTTP_201_CREATED
)
def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    owned_group_count = (
        db.query(Group)
        .filter(
            Group.owner_id == current_user.id,
            Group.is_deleted == False
        )
        .count()
    )

    if owned_group_count >= MAX_GROUPS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum number of groups reached."
        )

    new_group = Group(
        name=group_data.name,
        description=group_data.description,
        is_private=group_data.is_private,
        owner_id=current_user.id
    )

    owner_membership = GroupMember(
        user_id=current_user.id,
        role="owner"
    )

    new_group.members.append(owner_membership)

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return new_group


@router.get("", response_model=list[GroupResponse])
def get_public_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    groups = (
        db.query(Group)
        .filter(
            Group.is_deleted == False,
            Group.is_private == False
        )
        .order_by(Group.created_at.desc())
        .all()
    )

    return groups


@router.get("/my", response_model=list[GroupResponse])
def get_my_groups(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    groups = (
        db.query(Group)
        .join(GroupMember)
        .filter(
            GroupMember.user_id == current_user.id,
            Group.is_deleted == False
        )
        .order_by(Group.created_at.desc())
        .all()
    )

    return groups


@router.post(
    "/{group_id}/join",
    response_model=GroupMemberResponse,
    status_code=status.HTTP_201_CREATED
)
def join_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    group = (
        db.query(Group)
        .filter(
            Group.id == group_id,
            Group.is_deleted == False
        )
        .first()
    )

    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found."
        )

    if group.is_private:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This group is private."
        )

    existing_membership = (
        db.query(GroupMember)
        .filter(
            GroupMember.group_id == group.id,
            GroupMember.user_id == current_user.id
        )
        .first()
    )

    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are already a member of this group."
        )

    new_membership = GroupMember(
        group_id=group.id,
        user_id=current_user.id,
        role="member"
    )

    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)

    return new_membership


@router.get("/{group_id}/members", response_model=list[GroupMemberResponse])
def get_group_members(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership = (
        db.query(GroupMember)
        .join(Group)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            Group.is_deleted == False
        )
        .first()
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found."
        )

    members = (
        db.query(GroupMember)
        .options(selectinload(GroupMember.user))
        .filter(GroupMember.group_id == group_id)
        .order_by(GroupMember.joined_at.asc())
        .all()
    )

    return members

@router.delete("/{group_id}/members/{user_id}")
def remove_group_member(
    group_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    owner_membership = (
        db.query(GroupMember)
        .join(Group)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.role == "owner",
            Group.is_deleted == False
        )
        .first()
    )

    if owner_membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the group owner can remove members."
        )

    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group owner cannot remove themselves."
        )

    member_to_remove = (
        db.query(GroupMember)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_id
        )
        .first()
    )

    if member_to_remove is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group member not found."
        )

    if member_to_remove.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the group owner."
        )

    db.delete(member_to_remove)
    db.commit()

    return {
        "message": "Group member removed successfully.",
        "group_id": group_id,
        "removed_user_id": user_id,
        "removed_by_owner_id": current_user.id
    }

@router.post("/{group_id}/leave")
def leave_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    membership = (
        db.query(GroupMember)
        .join(Group)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            Group.is_deleted == False
        )
        .first()
    )

    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found or you are not a member."
        )

    if membership.role == "owner":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group owner cannot leave the group."
        )

    db.delete(membership)
    db.commit()

    return {
        "message": "You left the group successfully.",
        "group_id": group_id,
        "user_id": current_user.id
    }


@router.post(
    "/{group_id}/members/by-username",
    response_model=GroupMemberResponse,
    status_code=status.HTTP_201_CREATED
)
def add_group_member_by_username(
    group_id: int,
    member_data: AddGroupMemberByUsername,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    owner_membership = (
        db.query(GroupMember)
        .join(Group)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == current_user.id,
            GroupMember.role == "owner",
            Group.is_deleted == False
        )
        .first()
    )

    if owner_membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the group owner can add members."
        )

    user_to_add = (
        db.query(User)
        .filter(
            User.username == member_data.username,
            User.is_active == True
        )
        .first()
    )

    if user_to_add is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    existing_membership = (
        db.query(GroupMember)
        .filter(
            GroupMember.group_id == group_id,
            GroupMember.user_id == user_to_add.id
        )
        .first()
    )

    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this group."
        )

    new_membership = GroupMember(
        group_id=group_id,
        user_id=user_to_add.id,
        role="member"
    )

    db.add(new_membership)
    db.commit()
    db.refresh(new_membership)

    return new_membership