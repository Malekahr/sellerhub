from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.user_schema import UserResponse
from app.security.auth_dependencies import get_current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user