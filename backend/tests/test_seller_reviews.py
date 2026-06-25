def register_and_login(client, username: str, email: str) -> str:
    client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "Password123"
        }
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "Password123"
        }
    )

    return login_response.json()["access_token"]


def create_test_review(client, token: str):
    response = client.post(
        "/seller-reviews",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "seller_name": "TestSeller",
            "seller_link": "https://example.com/seller",
            "product_type": "sneakers",
            "quality_rating": 4,
            "price_rating": 5,
            "description": "Goede seller voor test.",
            "products": [
                {
                    "product_name": "Nike Test Shoe",
                    "purchase_date": "2026-06-19",
                    "short_description": "Test product."
                }
            ]
        }
    )

    return response


def test_create_seller_review_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    response = create_test_review(client, token)

    assert response.status_code == 201

    data = response.json()

    assert data["seller_name"] == "TestSeller"
    assert data["product_type"] == "sneakers"
    assert data["quality_rating"] == 4
    assert len(data["products"]) == 1
    assert data["products"][0]["product_name"] == "Nike Test Shoe"


def test_create_seller_review_requires_login(client):
    response = client.post(
        "/seller-reviews",
        json={
            "seller_name": "TestSeller",
            "seller_link": "https://example.com/seller",
            "product_type": "sneakers",
            "quality_rating": 4,
            "price_rating": 5,
            "description": "Goede seller voor test.",
            "products": [
                {
                    "product_name": "Nike Test Shoe",
                    "purchase_date": "2026-06-19",
                    "short_description": "Test product."
                }
            ]
        }
    )

    assert response.status_code == 401


def test_get_all_seller_reviews_requires_login(client):
    response = client.get("/seller-reviews")

    assert response.status_code == 401


def test_get_all_seller_reviews_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_test_review(client, token)

    response = client.get(
        "/seller-reviews",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["seller_name"] == "TestSeller"


def test_update_own_seller_review_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    review_id = create_response.json()["id"]

    response = client.patch(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "seller_name": "UpdatedSeller",
            "quality_rating": 5
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["seller_name"] == "UpdatedSeller"
    assert data["quality_rating"] == 5


def test_other_user_cannot_update_review(client):
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
    review_id = create_response.json()["id"]

    response = client.patch(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        },
        json={
            "seller_name": "HackedSeller"
        }
    )

    assert response.status_code == 404


def test_delete_own_seller_review_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    review_id = create_response.json()["id"]

    delete_response = client.delete(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert delete_response.status_code == 200

    list_response = client.get(
        "/seller-reviews",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert list_response.status_code == 200
    assert list_response.json() == []


def test_other_user_cannot_delete_review(client):
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
    review_id = create_response.json()["id"]

    response = client.delete(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        }
    )

    assert response.status_code == 404