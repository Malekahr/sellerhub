from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models.seller_product_image import SellerProductImage
from app.models.seller_review import SellerReview
from app.models.seller_review_product import SellerReviewProduct
from app.models.user import User
from app.schemas.seller_schema import (
    SellerProductImageResponse,
    SellerReviewCreate,
    SellerReviewProductCreate,
    SellerReviewProductResponse,
    SellerReviewProductUpdate,
    SellerReviewResponse,
    SellerReviewUpdate,
)
from app.security.auth_dependencies import get_current_user
from app.utils.file_utils import (
    delete_uploaded_file,
    upload_file_to_supabase_storage,
)
from app.utils.product_link_parser import parse_product_source_link
from app.utils.seller_permission_utils import (
    get_owned_seller_image_or_404,
    get_owned_seller_product_or_404,
    get_owned_seller_review_or_404,
)


router = APIRouter(
    prefix="/seller-reviews",
    tags=["Seller Reviews"]
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_IMAGE_SIZE = 5 * 1024 * 1024
MAX_IMAGES_PER_PRODUCT = 6


def apply_product_link_to_product(
    product: SellerReviewProduct,
    product_link: str | None
):
    if not product_link:
        product.source_platform = None
        product.source_product_id = None
        return

    platform, product_id = parse_product_source_link(product_link)

    product.source_platform = platform
    product.source_product_id = product_id


@router.post(
    "",
    response_model=SellerReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def create_seller_review(
    review_data: SellerReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_review = SellerReview(
        seller_name=review_data.seller_name,
        seller_link=str(review_data.seller_link),
        product_type=review_data.product_type,
        quality_rating=review_data.quality_rating,
        price_rating=review_data.price_rating,
        description=review_data.description,
        owner_id=current_user.id
    )

    for product_data in review_data.products:
        product = SellerReviewProduct(
            product_name=product_data.product_name,
            purchase_date=product_data.purchase_date,
            short_description=product_data.short_description
        )

        if product_data.product_link:
            apply_product_link_to_product(
                product=product,
                product_link=product_data.product_link
            )

        new_review.products.append(product)

    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return new_review


@router.get("", response_model=list[SellerReviewResponse])
def get_all_seller_reviews(
    search: str | None = Query(default=None, min_length=1, max_length=100),
    product_type: str | None = Query(default=None, min_length=2, max_length=100),
    min_quality_rating: int | None = Query(default=None, ge=1, le=5),
    min_price_rating: int | None = Query(default=None, ge=1, le=5),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = (
        db.query(SellerReview)
        .options(
            selectinload(SellerReview.products)
            .selectinload(SellerReviewProduct.images)
        )
        .filter(SellerReview.is_deleted == False)
    )

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                SellerReview.seller_name.ilike(search_value),
                SellerReview.product_type.ilike(search_value),
                SellerReview.description.ilike(search_value),
                SellerReview.products.any(
                    SellerReviewProduct.product_name.ilike(search_value)
                )
            )
        )

    if product_type:
        query = query.filter(
            SellerReview.product_type.ilike(product_type.strip())
        )

    if min_quality_rating is not None:
        query = query.filter(
            SellerReview.quality_rating >= min_quality_rating
        )

    if min_price_rating is not None:
        query = query.filter(
            SellerReview.price_rating >= min_price_rating
        )

    reviews = (
        query
        .order_by(SellerReview.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return reviews


@router.get("/my", response_model=list[SellerReviewResponse])
def get_my_seller_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reviews = (
        db.query(SellerReview)
        .options(
            selectinload(SellerReview.products)
            .selectinload(SellerReviewProduct.images)
        )
        .filter(
            SellerReview.owner_id == current_user.id,
            SellerReview.is_deleted == False
        )
        .order_by(SellerReview.created_at.desc())
        .all()
    )

    return reviews


@router.get("/{review_id}", response_model=SellerReviewResponse)
def get_seller_review_by_id(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = (
        db.query(SellerReview)
        .options(
            selectinload(SellerReview.products)
            .selectinload(SellerReviewProduct.images)
        )
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

    return review


@router.post(
    "/{review_id}/products",
    response_model=SellerReviewProductResponse,
    status_code=status.HTTP_201_CREATED
)
def add_product_to_seller_review(
    review_id: int,
    product_data: SellerReviewProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = (
        db.query(SellerReview)
        .options(selectinload(SellerReview.products))
        .filter(
            SellerReview.id == review_id,
            SellerReview.owner_id == current_user.id,
            SellerReview.is_deleted == False
        )
        .first()
    )

    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller review not found."
        )

    if len(review.products) >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 5 products per seller review allowed."
        )

    new_product = SellerReviewProduct(
        seller_review_id=review.id,
        product_name=product_data.product_name,
        purchase_date=product_data.purchase_date,
        short_description=product_data.short_description
    )

    if product_data.product_link:
        apply_product_link_to_product(
            product=new_product,
            product_link=product_data.product_link
        )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


@router.patch("/{review_id}", response_model=SellerReviewResponse)
def update_seller_review(
    review_id: int,
    review_data: SellerReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = get_owned_seller_review_or_404(
        db=db,
        review_id=review_id,
        user_id=current_user.id
    )

    update_data = review_data.model_dump(exclude_unset=True)

    if "seller_link" in update_data and update_data["seller_link"] is not None:
        update_data["seller_link"] = str(update_data["seller_link"])

    for field, value in update_data.items():
        setattr(review, field, value)

    db.commit()

    updated_review = (
        db.query(SellerReview)
        .options(
            selectinload(SellerReview.products)
            .selectinload(SellerReviewProduct.images)
        )
        .filter(SellerReview.id == review.id)
        .first()
    )

    return updated_review


@router.post(
    "/products/{product_id}/images",
    response_model=SellerProductImageResponse,
    status_code=status.HTTP_201_CREATED
)
async def upload_product_image(
    product_id: int,
    image_label: str | None = Form(default=None, max_length=100),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = (
        db.query(SellerReviewProduct)
        .join(SellerReview)
        .options(selectinload(SellerReviewProduct.images))
        .filter(
            SellerReviewProduct.id == product_id,
            SellerReview.owner_id == current_user.id,
            SellerReview.is_deleted == False
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )

    if len(product.images) >= MAX_IMAGES_PER_PRODUCT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 6 images per product allowed."
        )

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, PNG and WEBP images are allowed."
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image is too large. Maximum size is 5MB."
        )

    file_extension = ALLOWED_IMAGE_TYPES[file.content_type]
    safe_filename = f"{uuid4().hex}{file_extension}"

    public_image_url = upload_file_to_supabase_storage(
        file_bytes=file_bytes,
        filename=safe_filename,
        content_type=file.content_type
    )

    db_image = SellerProductImage(
        product_id=product.id,
        file_path=public_image_url,
        file_type=file.content_type,
        file_size=len(file_bytes),
        image_label=image_label.strip() if image_label else None
    )

    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return db_image


@router.patch(
    "/products/{product_id}",
    response_model=SellerReviewProductResponse
)
def update_seller_review_product(
    product_id: int,
    product_data: SellerReviewProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = get_owned_seller_product_or_404(
        db=db,
        product_id=product_id,
        user_id=current_user.id,
        load_images=True
    )

    update_data = product_data.model_dump(exclude_unset=True)

    product_link_was_sent = "product_link" in update_data
    product_link = update_data.pop("product_link", None)

    for field, value in update_data.items():
        setattr(product, field, value)

    if product_link_was_sent:
        apply_product_link_to_product(
            product=product,
            product_link=product_link
        )

    db.commit()
    db.refresh(product)

    return product


@router.delete("/products/{product_id}")
def delete_own_seller_review_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = get_owned_seller_product_or_404(
        db=db,
        product_id=product_id,
        user_id=current_user.id,
        load_images=True
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
        "deleted_by_user_id": current_user.id,
        "deleted_image_files": deleted_image_files
    }


@router.delete("/{review_id}")
def delete_own_seller_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = get_owned_seller_review_or_404(
        db=db,
        review_id=review_id,
        user_id=current_user.id
    )

    review.is_deleted = True

    db.commit()

    return {
        "message": "Seller review deleted successfully.",
        "review_id": review_id,
        "deleted_by_user_id": current_user.id
    }


@router.delete("/images/{image_id}")
def delete_own_seller_product_image(
    image_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image = get_owned_seller_image_or_404(
        db=db,
        image_id=image_id,
        user_id=current_user.id
    )

    deleted_file = delete_uploaded_file(str(image.file_path))

    db.delete(image)
    db.commit()

    return {
        "message": "Image deleted successfully.",
        "image_id": image_id,
        "deleted_by_user_id": current_user.id,
        "deleted_file": deleted_file
    }