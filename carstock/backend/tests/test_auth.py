import pytest

REGISTER = {"email": "new@example.com", "full_name": "New Buyer", "password": "Password123"}


def test_register_returns_token_and_public_user_without_password(client):
    response = client.post("/api/auth/register", json=REGISTER)
    assert response.status_code == 201
    body = response.json()
    assert body["token_type"] == "bearer" and body["access_token"]
    assert body["user"] == {"id": body["user"]["id"], "email": "new@example.com", "full_name": "New Buyer", "is_admin": False}
    assert "password" not in response.text.lower()


def test_register_normalises_email_case_and_rejects_duplicates(client):
    client.post("/api/auth/register", json=REGISTER)
    duplicate = client.post("/api/auth/register", json={**REGISTER, "email": "NEW@Example.com"})
    assert duplicate.status_code == 409


def test_register_cannot_create_an_admin(client):
    response = client.post("/api/auth/register", json={**REGISTER, "is_admin": True})
    assert response.status_code == 201
    assert response.json()["user"]["is_admin"] is False


@pytest.mark.parametrize(
    "override",
    [
        {"email": "not-an-email"},
        {"password": "short1"},
        {"password": "onlyletters"},
        {"password": "12345678"},
        {"full_name": "A"},
        {"full_name": "   "},
    ],
)
def test_register_rejects_invalid_input(client, override):
    assert client.post("/api/auth/register", json={**REGISTER, **override}).status_code == 422


def test_login_succeeds_with_correct_credentials(client):
    client.post("/api/auth/register", json=REGISTER)
    response = client.post("/api/auth/login", json={"email": "NEW@example.com", "password": "Password123"})
    assert response.status_code == 200
    assert response.json()["user"]["email"] == "new@example.com"


def test_login_failures_use_one_generic_message(client):
    client.post("/api/auth/register", json=REGISTER)
    wrong_password = client.post("/api/auth/login", json={"email": REGISTER["email"], "password": "WrongPass999"})
    unknown_email = client.post("/api/auth/login", json={"email": "ghost@example.com", "password": "Password123"})
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()
