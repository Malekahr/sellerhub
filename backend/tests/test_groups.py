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


def create_group(client, token: str, name: str = "Test Group", is_private: bool = False):
    return client.post(
        "/groups",
        headers={
            "Authorization": f"Bearer {token}"
        },
        json={
            "name": name,
            "description": "Groep voor automatische tests.",
            "is_private": is_private
        }
    )


def test_create_group_success(client):
    token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    response = create_group(client, token)

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Test Group"
    assert data["description"] == "Groep voor automatische tests."
    assert data["is_private"] is False


def test_group_owner_is_automatically_member(client):
    token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    create_response = create_group(client, token)
    group_id = create_response.json()["id"]

    members_response = client.get(
        f"/groups/{group_id}/members",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert members_response.status_code == 200

    members = members_response.json()

    assert len(members) == 1
    assert members[0]["role"] == "owner"


def test_user_can_join_public_group(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    member_token = register_and_login(
        client,
        username="memberuser",
        email="member@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    join_response = client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    assert join_response.status_code == 201

    members_response = client.get(
        f"/groups/{group_id}/members",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    members = members_response.json()

    assert len(members) == 2
    assert any(member["role"] == "member" for member in members)


def test_user_cannot_join_private_group(client):
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

    create_response = create_group(
        client,
        owner_token,
        name="Private Group",
        is_private=True
    )

    group_id = create_response.json()["id"]

    join_response = client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {other_token}"
        }
    )

    assert join_response.status_code == 403

def test_non_member_gets_404_when_viewing_group_members(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    outsider_token = register_and_login(
        client,
        username="outsideruser",
        email="outsider@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    response = client.get(
        f"/groups/{group_id}/members",
        headers={
            "Authorization": f"Bearer {outsider_token}"
        }
    )

    assert response.status_code == 404


def test_owner_can_add_user_by_username(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    register_and_login(
        client,
        username="targetuser",
        email="target@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    response = client.post(
        f"/groups/{group_id}/members/by-username",
        headers={
            "Authorization": f"Bearer {owner_token}"
        },
        json={
            "username": "targetuser"
        }
    )

    assert response.status_code == 201

    data = response.json()

    assert data["role"] == "member"


def test_normal_member_cannot_add_user_by_username(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    member_token = register_and_login(
        client,
        username="memberuser",
        email="member@example.com"
    )

    register_and_login(
        client,
        username="targetuser",
        email="target@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    response = client.post(
        f"/groups/{group_id}/members/by-username",
        headers={
            "Authorization": f"Bearer {member_token}"
        },
        json={
            "username": "targetuser"
        }
    )

    assert response.status_code == 403


def test_owner_can_remove_member(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    member_token = register_and_login(
        client,
        username="memberuser",
        email="member@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    join_response = client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    member_user_id = join_response.json()["user_id"]

    delete_response = client.delete(
        f"/groups/{group_id}/members/{member_user_id}",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    assert delete_response.status_code == 200

    members_response = client.get(
        f"/groups/{group_id}/members",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    members = members_response.json()

    assert len(members) == 1
    assert members[0]["role"] == "owner"


def test_normal_member_cannot_remove_member(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    member_token = register_and_login(
        client,
        username="memberuser",
        email="member@example.com"
    )

    second_member_token = register_and_login(
        client,
        username="secondmember",
        email="second@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    second_join_response = client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {second_member_token}"
        }
    )

    second_member_user_id = second_join_response.json()["user_id"]

    delete_response = client.delete(
        f"/groups/{group_id}/members/{second_member_user_id}",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    assert delete_response.status_code == 403


def test_member_can_leave_group(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    member_token = register_and_login(
        client,
        username="memberuser",
        email="member@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    client.post(
        f"/groups/{group_id}/join",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    leave_response = client.post(
        f"/groups/{group_id}/leave",
        headers={
            "Authorization": f"Bearer {member_token}"
        }
    )

    assert leave_response.status_code == 200

    members_response = client.get(
        f"/groups/{group_id}/members",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    members = members_response.json()

    assert len(members) == 1
    assert members[0]["role"] == "owner"


def test_owner_cannot_leave_group(client):
    owner_token = register_and_login(
        client,
        username="owneruser",
        email="owner@example.com"
    )

    create_response = create_group(client, owner_token)
    group_id = create_response.json()["id"]

    leave_response = client.post(
        f"/groups/{group_id}/leave",
        headers={
            "Authorization": f"Bearer {owner_token}"
        }
    )

    assert leave_response.status_code == 400