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
            "description": "Goede seller voor product tests.",
            "products": [
                {
                    "product_name": "Nike Test Shoe",
                    "purchase_date": "2026-06-19",
                    "short_description": "Eerste test product."
                }
            ]
        }
    )

    return response


def test_add_product_to_own_review_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    review_id = create_response.json()["id"]

    response = client.post(
        f"/seller-reviews/{review_id}/products",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "product_name": "Adidas Test Shoe",
            "purchase_date": "2026-06-20",
            "short_description": "Tweede test product."
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["product_name"] == "Adidas Test Shoe"
    assert data["short_description"] == "Tweede test product."


def test_other_user_cannot_add_product_to_review(client):
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

    response = client.post(
        f"/seller-reviews/{review_id}/products",
        headers={
            "Authorization": f"Bearer {other_token}"
        },
        json={
            "product_name": "Hacked Product",
            "purchase_date": "2026-06-20",
            "short_description": "Mag niet toegevoegd worden."
        }
    )

    assert response.status_code == 404


def test_update_own_product_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)
    product_id = create_response.json()["products"][0]["id"]

    response = client.patch(
        f"/seller-reviews/products/{product_id}",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "product_name": "Updated Product Name",
            "short_description": "Aangepaste beschrijving."
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["product_name"] == "Updated Product Name"
    assert data["short_description"] == "Aangepaste beschrijving."


def test_other_user_cannot_update_product(client):
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

    response = client.patch(
        f"/seller-reviews/products/{product_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        },
        json={
            "product_name": "Hacked Product"
        }
    )

    assert response.status_code == 404


def test_delete_own_product_success(client):
    token = register_and_login(
        client,
        username="testuser",
        email="test@example.com"
    )

    create_response = create_test_review(client, token)

    review_id = create_response.json()["id"]
    product_id = create_response.json()["products"][0]["id"]

    delete_response = client.delete(
        f"/seller-reviews/products/{product_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert delete_response.status_code == 200

    detail_response = client.get(
        f"/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert detail_response.status_code == 200
    assert detail_response.json()["products"] == []


def test_other_user_cannot_delete_product(client):
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

    response = client.delete(
        f"/seller-reviews/products/{product_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        }
    )

    assert response.status_code == 404