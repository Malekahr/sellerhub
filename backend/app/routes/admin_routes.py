from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.utils.file_utils import delete_uploaded_file
from app.database import get_db
from app.models.seller_review import SellerReview
from app.models.user import User
from app.schemas.user_schema import UserResponse
from app.security.auth_dependencies import get_current_admin_user
from app.models.seller_review_product import SellerReviewProduct
from app.models.seller_product_image import SellerProductImage


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
def admin_dashboard(
    current_admin: User = Depends(get_current_admin_user)
):
    return {
        "message": "Welcome to the admin dashboard.",
        "admin": {
            "id": current_admin.id,
            "username": current_admin.username,
            "email": current_admin.email,
            "role": current_admin.role
        }
    }


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()

    return users


@router.delete("/seller-reviews/{review_id}")
def delete_seller_review_as_admin(
    review_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    review = (
        db.query(SellerReview)
        .filter(
            SellerReview.id == review_id,
            SellerReview.is_deleted == False
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller review not found."
        )

    review.is_deleted = True

    db.commit()

    return {
        "message": "Seller review deleted successfully.",
        "review_id": review_id,
        "deleted_by_admin_id": current_admin.id
    }

@router.delete("/seller-review-products/{product_id}")
def delete_seller_review_product_as_admin(
    product_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    product = (
        db.query(SellerReviewProduct)
        .options(selectinload(SellerReviewProduct.images))
        .filter(SellerReviewProduct.id == product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    deleted_image_files = []

    for image in product.images:
        deleted_file = delete_uploaded_file(str(image.file_path))

        if deleted_file:
            deleted_image_files.append(deleted_file)

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully.",
        "product_id": product_id,
        "deleted_by_admin_id": current_admin.id,
        "deleted_image_files": deleted_image_files
    }

@router.delete("/seller-product-images/{image_id}")
def delete_seller_product_image_as_admin(
    image_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    image = (
        db.query(SellerProductImage)
        .filter(SellerProductImage.id == image_id)
        .first()
    )

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found."
        )

    deleted_file = delete_uploaded_file(str(image.file_path))

    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted successfully.",
        "image_id": image_id,
        "deleted_by_admin_id": current_admin.id,
        "deleted_file": deleted_file
    }