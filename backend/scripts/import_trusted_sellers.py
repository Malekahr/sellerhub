import argparse
import importlib
import json
import pkgutil
import sys
import zipfile
from pathlib import Path
from typing import Any

BACKEND_ROOT = Path(__file__).resolve().parents[1]

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import func

from app.database import get_db


def import_all_models():
    import app.models

    for module_info in pkgutil.iter_modules(app.models.__path__):
        importlib.import_module(f"app.models.{module_info.name}")


import_all_models()

from app.models.seller_review import SellerReview
from app.models.user import User


LINK_PRIORITY = [
    "Link_WEIDIAN",
    "Link_WEDIAN",
    "Link_TAOBAO",
    "Link_1688",
    "Link_YUPOO",
    "Link_WEBSITE",
    "Link_Linktree",
    "Link_whatsapp",
    "Link_DISCORD",
]

PRODUCT_TYPE_MAP = {
    "apparel": "Clothing",
    "apparel / bags": "Clothing",
    "apparel / extras": "Clothing",
    "apparel / sneakers": "Clothing",
    "bags": "Bags",
    "bags / heels": "Bags",
    "extras": "Accessories",
    "heels": "Shoes",
    "power": "Electronics",
    "sneakers": "Shoes",
    "sneakers / bags": "Shoes",
    "sneakers / heels": "Shoes",
}


def clean_text(value: Any, fallback: str = "") -> str:
    if value is None:
        return fallback

    cleaned_value = str(value).strip()

    if not cleaned_value:
        return fallback

    return cleaned_value


def limit_text(value: str, max_length: int) -> str:
    value = clean_text(value)

    if len(value) <= max_length:
        return value

    return value[: max_length - 3].rstrip() + "..."


def score_to_rating(value: Any) -> int:
    try:
        score = int(float(str(value).strip()))
    except (TypeError, ValueError):
        return 3

    if score >= 90:
        return 5

    if score >= 70:
        return 4

    if score >= 50:
        return 3

    if score >= 30:
        return 2

    return 1


def map_product_type(raw_type: Any) -> str:
    cleaned_type = clean_text(raw_type, "Other")
    return PRODUCT_TYPE_MAP.get(cleaned_type.lower(), "Other")


def choose_seller_link(row: dict[str, Any]) -> str | None:
    for link_key in LINK_PRIORITY:
        link_value = clean_text(row.get(link_key))

        if link_value.startswith("http://") or link_value.startswith("https://"):
            return link_value

    return None


def build_seller_specialties(row: dict[str, Any]) -> str | None:
    best_known = clean_text(row.get("Best_Known"))

    if not best_known:
        return None

    return limit_text(best_known, 300)


def build_description(row: dict[str, Any]) -> str:
    note = clean_text(row.get("Note"))
    stannie_letter = clean_text(row.get("Stannie_Letter"))
    stannie_score = clean_text(row.get("Stannie_Score"))
    quality = clean_text(row.get("QUALITY"))
    price = clean_text(row.get("PRICE"))
    original_type = clean_text(row.get("Type"))

    parts = []

    if note:
        parts.append(note)

    meta_lines = []

    if stannie_letter or stannie_score:
        score_text = "Trusted seller score:"

        if stannie_letter and stannie_score:
            score_text += f" {stannie_letter} / {stannie_score}"
        elif stannie_letter:
            score_text += f" {stannie_letter}"
        elif stannie_score:
            score_text += f" {stannie_score}"

        meta_lines.append(score_text)

    if quality:
        meta_lines.append(f"Source quality: {quality}/100")

    if price:
        meta_lines.append(f"Source price: {price}/100")

    if original_type:
        meta_lines.append(f"Original category: {original_type}")

    if meta_lines:
        parts.append("\n".join(meta_lines))

    description = "\n\n".join(parts)

    return limit_text(description, 2000)


def load_sellers(file_path: Path) -> list[dict[str, Any]]:
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    if file_path.suffix.lower() == ".zip":
        with zipfile.ZipFile(file_path) as zip_file:
            json_names = [
                name
                for name in zip_file.namelist()
                if name.lower().endswith(".json")
            ]

            if not json_names:
                raise ValueError("No JSON file found inside the zip.")

            with zip_file.open(json_names[0]) as json_file:
                sellers = json.load(json_file)
    else:
        with file_path.open("r", encoding="utf-8") as json_file:
            sellers = json.load(json_file)

    if not isinstance(sellers, list):
        raise ValueError("Trusted sellers file must contain a JSON list.")

    return sellers


def get_owner_id(
    db,
    owner_id: int | None,
    owner_email: str | None,
    owner_username: str | None,
) -> int:
    if owner_id is not None:
        user = db.query(User).filter(User.id == owner_id).first()

        if user is None:
            raise ValueError(f"No user found with id {owner_id}.")

        return owner_id

    if owner_email:
        email_column = getattr(User, "email", None)

        if email_column is None:
            raise ValueError("User model has no email column. Use --owner-id instead.")

        user = (
            db.query(User)
            .filter(func.lower(email_column) == owner_email.strip().lower())
            .first()
        )

        if user is None:
            raise ValueError(f"No user found with email {owner_email}.")

        return user.id

    if owner_username:
        username_column = getattr(User, "username", None)

        if username_column is None:
            raise ValueError("User model has no username column. Use --owner-id instead.")

        user = (
            db.query(User)
            .filter(func.lower(username_column) == owner_username.strip().lower())
            .first()
        )

        if user is None:
            raise ValueError(f"No user found with username {owner_username}.")

        return user.id

    raise ValueError("Choose an owner with --owner-email, --owner-username or --owner-id.")


def seller_exists(db, owner_id: int, seller_name: str) -> SellerReview | None:
    return (
        db.query(SellerReview)
        .filter(
            SellerReview.owner_id == owner_id,
            func.lower(SellerReview.seller_name) == seller_name.lower(),
            SellerReview.is_deleted == False,
        )
        .first()
    )


def import_sellers(
    file_path: Path,
    owner_id: int | None,
    owner_email: str | None,
    owner_username: str | None,
    dry_run: bool,
    update_existing: bool,
):
    sellers = load_sellers(file_path)

    db_generator = get_db()
    db = next(db_generator)

    try:
        resolved_owner_id = get_owner_id(
            db=db,
            owner_id=owner_id,
            owner_email=owner_email,
            owner_username=owner_username,
        )

        created_count = 0
        updated_count = 0
        skipped_count = 0
        invalid_count = 0

        for row in sellers:
            seller_name = limit_text(clean_text(row.get("Naam")), 100)
            seller_link = choose_seller_link(row)

            if not seller_name or not seller_link:
                invalid_count += 1
                continue

            product_type = map_product_type(row.get("Type"))
            seller_specialties = build_seller_specialties(row)
            quality_rating = score_to_rating(row.get("QUALITY"))
            price_rating = score_to_rating(row.get("PRICE"))
            description = build_description(row)

            existing_review = seller_exists(
                db=db,
                owner_id=resolved_owner_id,
                seller_name=seller_name,
            )

            if existing_review is not None:
                if not update_existing:
                    skipped_count += 1
                    continue

                existing_review.seller_link = seller_link
                existing_review.product_type = product_type
                existing_review.seller_specialties = seller_specialties
                existing_review.quality_rating = quality_rating
                existing_review.price_rating = price_rating
                existing_review.description = description

                updated_count += 1
                continue

            new_review = SellerReview(
                seller_name=seller_name,
                seller_link=seller_link,
                product_type=product_type,
                seller_specialties=seller_specialties,
                quality_rating=quality_rating,
                price_rating=price_rating,
                description=description,
                owner_id=resolved_owner_id,
            )

            db.add(new_review)
            created_count += 1

        if dry_run:
            db.rollback()
        else:
            db.commit()

        print("Trusted sellers import finished")
        print("--------------------------------")
        print(f"Owner ID: {resolved_owner_id}")
        print(f"File: {file_path}")
        print(f"Dry run: {dry_run}")
        print(f"Created: {created_count}")
        print(f"Updated: {updated_count}")
        print(f"Skipped existing: {skipped_count}")
        print(f"Invalid/skipped rows: {invalid_count}")
        print(f"Total rows in file: {len(sellers)}")

    finally:
        try:
            next(db_generator)
        except StopIteration:
            pass


def parse_args():
    parser = argparse.ArgumentParser(
        description="Import trusted sellers into SellerHub."
    )

    parser.add_argument(
        "--file",
        required=True,
        help="Path to trusted_sellers.json or trusted_sellers.zip",
    )

    parser.add_argument(
        "--owner-id",
        type=int,
        default=None,
        help="SellerHub user id that will own the imported reviews.",
    )

    parser.add_argument(
        "--owner-email",
        default=None,
        help="SellerHub account email that will own the imported reviews.",
    )

    parser.add_argument(
        "--owner-username",
        default=None,
        help="SellerHub username that will own the imported reviews.",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview import without saving changes.",
    )

    parser.add_argument(
        "--update-existing",
        action="store_true",
        help="Update sellers with the same name instead of skipping them.",
    )

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    try:
        import_sellers(
            file_path=Path(args.file),
            owner_id=args.owner_id,
            owner_email=args.owner_email,
            owner_username=args.owner_username,
            dry_run=args.dry_run,
            update_existing=args.update_existing,
        )
    except Exception as error:
        print(f"Import failed: {error}", file=sys.stderr)
        sys.exit(1)