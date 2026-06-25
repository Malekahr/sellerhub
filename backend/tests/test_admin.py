from app.models.user import User


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
            "seller_name": "AdminTestSeller",
            "seller_link": "https://example.com/seller",
            "product_type": "sneakers",
            "quality_rating": 4,
            "price_rating": 5,
            "description": "Review voor admin tests.",
            "products": [
                {
                    "product_name": "Nike Admin Test",
                    "purchase_date": "2026-06-19",
                    "short_description": "Product voor admin test."
                }
            ]
        }
    )


def test_normal_user_cannot_access_admin_dashboard(client):
    token = register_and_login(
        client,
        username="normaluser",
        email="normal@example.com"
    )

    response = client.get(
        "/admin/dashboard",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403


def test_admin_can_access_admin_dashboard(client, db_session):
    admin_token = register_and_login_admin(
        client,
        db_session,
        username="adminuser",
        email="admin@example.com"
    )

    response = client.get(
        "/admin/dashboard",
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["admin"]["username"] == "adminuser"
    assert data["admin"]["role"] == "admin"


def test_normal_user_cannot_get_all_users(client):
    token = register_and_login(
        client,
        username="normaluser",
        email="normal@example.com"
    )

    response = client.get(
        "/admin/users",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403


def test_admin_can_get_all_users(client, db_session):
    register_user(
        client,
        username="normaluser",
        email="normal@example.com"
    )

    admin_token = register_and_login_admin(
        client,
        db_session,
        username="adminuser",
        email="admin@example.com"
    )

    response = client.get(
        "/admin/users",
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 2
    assert any(user["email"] == "normal@example.com" for user in data)
    assert any(user["email"] == "admin@example.com" for user in data)


def test_normal_user_cannot_delete_seller_review_as_admin(client):
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
        f"/admin/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {other_token}"
        }
    )

    assert response.status_code == 403


def test_admin_can_delete_seller_review(client, db_session):
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

    delete_response = client.delete(
        f"/admin/seller-reviews/{review_id}",
        headers={
            "Authorization": f"Bearer {admin_token}"
        }
    )

    assert delete_response.status_code == 200

    list_response = client.get(
        "/seller-reviews",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    assert list_response.status_code == 200
    assert list_response.json() == []