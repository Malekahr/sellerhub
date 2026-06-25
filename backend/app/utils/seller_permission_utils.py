from fastapi import HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.models.seller_product_image import SellerProductImage
from app.models.seller_review import SellerReview
from app.models.seller_review_product import SellerReviewProduct


def get_owned_seller_review_or_404(
    db: Session,
    review_id: int,
    user_id: int
) -> SellerReview:
    review = (
        db.query(SellerReview)
        .filter(
            SellerReview.id == review_id,
            SellerReview.owner_id == user_id,
            SellerReview.is_deleted == False
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller review not found."
        )

    return review


def get_owned_seller_product_or_404(
    db: Session,
    product_id: int,
    user_id: int,
    load_images: bool = False
) -> SellerReviewProduct:
    query = (
        db.query(SellerReviewProduct)
        .join(SellerReview)
        .filter(
            SellerReviewProduct.id == product_id,
            SellerReview.owner_id == user_id,
            SellerReview.is_deleted == False
        )
    )

    if load_images:
        query = query.options(
            selectinload(SellerReviewProduct.images)
        )

    product = query.first()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    return product


def get_owned_seller_image_or_404(
    db: Session,
    image_id: int,
    user_id: int
) -> SellerProductImage:
    image = (
        db.query(SellerProductImage)
        .join(SellerReviewProduct)
        .join(SellerReview)
        .filter(
            SellerProductImage.id == image_id,
            SellerReview.owner_id == user_id,
            SellerReview.is_deleted == False
        )
        .first()
    )

    if image is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found."
        )

    return image