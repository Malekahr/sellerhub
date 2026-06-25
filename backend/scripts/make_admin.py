
import sys
from pathlib import Path

# Zorgt dat Python jouw backend-map gebruikt
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.database import SessionLocal

# Belangrijk: importeer alle modellen zodat SQLAlchemy relationships kent
from app.models.user import User
from app.models.seller_review import SellerReview
from app.models.seller_review_product import SellerReviewProduct
from app.models.seller_product_image import SellerProductImage
from app.models.group import Group, GroupMember


ADMIN_EMAIL = "malekaharar11@gmail.com"


def main():
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.email == ADMIN_EMAIL).first()

        if user is None:
            print(f"Geen user gevonden met email: {ADMIN_EMAIL}")
            return

        user.role = "admin"
        user.is_active = True

        db.commit()

        print(f"User '{user.username}' met email '{user.email}' is nu admin.")
    finally:
        db.close()


if __name__ == "__main__":
    main()