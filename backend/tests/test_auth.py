def test_register_user_success(client):
    response = client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert data["role"] == "user"
    assert "hashed_password" not in data


def test_register_duplicate_email_fails(client):
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "Password123"
    }

    first_response = client.post("/auth/register", json=user_data)
    assert first_response.status_code == 201

    second_response = client.post(
        "/auth/register",
        json={
            "username": "seconduser",
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    assert second_response.status_code == 400


def test_login_success(client):
    client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_fails(client):
    client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401


def test_get_me_requires_login(client):
    response = client.get("/users/me")

    assert response.status_code == 401


def test_get_me_with_token_success(client):
    client.post(
        "/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123"
        }
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/users/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"