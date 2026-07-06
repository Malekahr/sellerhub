import pytest

from app.models.user import User
from app.routes import admin_routes, seller_routes


@pytest.fixture(autouse=True)
def mock_supabase_storage(monkeypatch):
    def fake_upload_file_to_supabase_storage(
        file_bytes: bytes,
        filename: str,
        content_type: str
    ) -> str:
        return (
            "https://example.supabase.co/storage/v1/object/public/"
            f"seller-hub-images/seller_images/{filename}"
        )

    def fake_delete_uploaded_file(file_path: str) -> str | None:
        return file_path

    monkeypatch.setattr(
        seller_routes,
        "upload_file_to_supabase_storage",
        fake_upload_file_to_supabase_storage
    )

    monkeypatch.setattr(
        seller_routes,
        "delete_uploaded_file",
        fake_delete_uploaded_file
    )

    monkeypatch.setattr(
        admin_routes,
        "delete_uploaded_file",
        fake_delete_uploaded_file
    )


def register_user(client, username: str, email: str):
    return client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "Password123"
        }
    )


def login_user(client, email: str) -> str:
    login_response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "Password123"
        }
    )

    return login_response.json()["access_token"]


def register_and_login(client, username: str, email: str) -> str:
    register_user(client, username, email)
    return login_user(client, email)


def register_and_login_admin(client, db_session, username: str, email: str) -> str:
    register_user(client, username, email)

    user = (
        db_session.query(User)
        .filter(User.email == email)
        .first()
    )

    user.role = "admin"
    db_session.commit()

    return login_user(client, email)


def create_test_review(client, token: str):
    return client.post(
        "/seller-reviews",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "seller_name": "ImageTestSeller",
            "seller_link": "https://example.com/seller",
            "product_type": "sneakers",
            "quality_rating": 4,
            "price_rating": 5,
            "description": "Review for image tests.",
            "products": [
                {
                    "product_name": "Nike Image Test",
                    "purchase_date": "2026-06-19",
                    "short_description": "Product for image test."
                }
            ]
        }
    )


def upload_test_image(client, token: str, product_id: int):
    return client.post(
        f"/seller-reviews/products/{product_id}/images",
        headers={
            "Authorization": f"Bearer {token}"
        },
        data={
            "image_label": "front"
        },
        files={
            "file": ("test.jpg", b"fake image content", "image/jpeg")
        }
    )


def test_upload_product_image_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    product_id = create_response.json()["products"][0]["id"]

    response = upload_test_image(client, token, product_id)

    assert response.status_code == 201

    data = response.json()

    assert data["file_type"] == "image/jpeg"
    assert data["file_size"] == len(b"fake image content")
    assert data["image_label"] == "front"
    assert data["file_path"].startswith(
        "https://example.supabase.co/storage/v1/object/public/"
    )
    assert data["file_path"].endswith(".jpg")


def test_upload_product_image_requires_owner(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    other_token = register_and_login(
        client,
        username="otheruser",
        email="other@example.com"
    )

    create_response = create_test_review(client, owner_token)
    product_id = create_response.json()["products"][0]["id"]

    response = upload_test_image(client, other_token, product_id)

    assert response.status_code == 404


def test_upload_product_image_rejects_invalid_file_type(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    product_id = create_response.json()["products"][0]["id"]

    response = client.post(
        f"/seller-reviews/products/{product_id}/images",
        headers={
            "Authorization": f"Bearer {token}"
        },
        data={
            "image_label": "not-image"
        },
        files={
            "file": ("test.txt", b"not an image", "text/plain")
        }
    )

    assert response.status_code == 400


def test_delete_own_product_image_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    review_id = create_response.json()["id"]
    product_id = create_response.json()["products"][0]["id"]

    upload_response = upload_test_image(client, token, product_id)
    image_id = upload_response.json()["id"]

    delete_response = client.delete(
        f"/seller-reviews/images/{image_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert delete_response.status_code == 200
    assert delete_response.json()["deleted_file"] is not None

    detail_response = client.get(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert detail_response.status_code == 200
    assert detail_response.json()["products"][0]["images"] == []


def test_other_user_cannot_delete_product_image(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    other_token = register_and_login(
        client,
        username="otheruser",
        email="other@example.com"
    )

    create_response = create_test_review(client, owner_token)
    product_id = create_response.json()["products"][0]["id"]

    upload_response = upload_test_image(client, owner_token, product_id)
    image_id = upload_response.json()["id"]

    delete_response = client.delete(
        f"/seller-reviews/images/{image_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        }
    )

    assert delete_response.status_code == 404


def test_admin_can_delete_product_image(client, db_session):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    admin_token = register_and_login_admin(
        client,
        db_session,
        username="adminuser",
        email="admin@example.com"
    )

    create_response = create_test_review(client, owner_token)
    review_id = create_response.json()["id"]
    product_id = create_response.json()["products"][0]["id"]

    upload_response = upload_test_image(client, owner_token, product_id)
    image_id = upload_response.json()["id"]

    delete_response = client.delete(
        f"/admin/seller-product-images/{image_id}",
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert delete_response.status_code == 200
    assert delete_response.json()["deleted_file"] is not None

    detail_response = client.get(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    assert detail_response.status_code == 200
    assert detail_response.json()["products"][0]["images"] == []


def test_admin_can_delete_product_with_images(client, db_session):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    admin_token = register_and_login_admin(
        client,
        db_session,
        username="adminuser",
        email="admin@example.com"
    )

    create_response = create_test_review(client, owner_token)
    review_id = create_response.json()["id"]
    product_id = create_response.json()["products"][0]["id"]

    upload_response = upload_test_image(client, owner_token, product_id)
    assert upload_response.status_code == 201

    delete_response = client.delete(
        f"/admin/seller-review-products/{product_id}",
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert delete_response.status_code == 200
    assert len(delete_response.json()["deleted_image_files"]) == 1

    detail_response = client.get(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    assert detail_response.status_code == 200
    assert detail_response.json()["products"] == []