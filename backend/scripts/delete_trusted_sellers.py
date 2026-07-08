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


def get_owner_id(db, owner_email: str | None, owner_id: int | None) -> int:
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

    raise ValueError("Choose an owner with --owner-email or --owner-id.")


def delete_trusted_sellers(
    file_path: Path,
    owner_email: str | None,
    owner_id: int | None,
    dry_run: bool,
):
    sellers = load_sellers(file_path)
    seller_names = {
        limit_text(clean_text(row.get("Naam")), 100).lower()
        for row in sellers
        if clean_text(row.get("Naam"))
    }

    db_generator = get_db()
    db = next(db_generator)

    try:
        resolved_owner_id = get_owner_id(
            db=db,
            owner_email=owner_email,
            owner_id=owner_id,
        )

        reviews_to_delete = (
            db.query(SellerReview)
            .filter(
                SellerReview.owner_id == resolved_owner_id,
                SellerReview.is_deleted == False,
                func.lower(SellerReview.seller_name).in_(seller_names),
            )
            .all()
        )

        for review in reviews_to_delete:
            review.is_deleted = True

        if dry_run:
            db.rollback()
        else:
            db.commit()

        print("Trusted sellers delete finished")
        print("--------------------------------")
        print(f"Owner ID: {resolved_owner_id}")
        print(f"File: {file_path}")
        print(f"Dry run: {dry_run}")
        print(f"Names in file: {len(seller_names)}")
        print(f"Reviews matched: {len(reviews_to_delete)}")
        print(f"Soft deleted: {0 if dry_run else len(reviews_to_delete)}")

    finally:
        try:
            next(db_generator)
        except StopIteration:
            pass


def parse_args():
    parser = argparse.ArgumentParser(
        description="Soft delete trusted sellers from SellerHub."
    )

    parser.add_argument(
        "--file",
        required=True,
        help="Path to trusted_sellers.json or trusted_sellers.zip",
    )

    parser.add_argument(
        "--owner-email",
        default=None,
        help="SellerHub account email that owns the imported reviews.",
    )

    parser.add_argument(
        "--owner-id",
        type=int,
        default=None,
        help="SellerHub user id that owns the imported reviews.",
    )

    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview delete without saving changes.",
    )

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    try:
        delete_trusted_sellers(
            file_path=Path(args.file),
            owner_email=args.owner_email,
            owner_id=args.owner_id,
            dry_run=args.dry_run,
        )
    except Exception as error:
        print(f"Delete failed: {error}", file=sys.stderr)
        sys.exit(1)