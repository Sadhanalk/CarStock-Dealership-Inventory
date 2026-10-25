from datetime import datetime, timedelta, timezone

from jose import jwt

from app.auth import ALGORITHM, create_access_token, decode_subject, hash_password, verify_password
from app.config import get_settings


def test_password_hash_is_salted_and_verifiable():
    first, second = hash_password("Secret123"), hash_password("Secret123")
    assert first != second  # different salts
    assert verify_password("Secret123", first)
    assert not verify_password("secret123", first)


def test_verify_password_rejects_malformed_hashes():
    assert not verify_password("x", "garbage")
    assert not verify_password("x", "bcrypt$1$abc$def")
    assert not verify_password("x", "pbkdf2_sha256$notanumber$abc$def")


def test_token_round_trip():
    assert decode_subject(create_access_token("42")) == "42"


def test_tampered_or_foreign_tokens_are_rejected():
    assert decode_subject("not.a.jwt") is None
    forged = jwt.encode({"sub": "1"}, "some-other-secret", algorithm=ALGORITHM)
    assert decode_subject(forged) is None


def test_expired_token_is_rejected():
    expired = jwt.encode(
        {"sub": "1", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}, get_settings().jwt_secret, algorithm=ALGORITHM
    )
    assert decode_subject(expired) is None


def test_token_without_subject_is_rejected():
    assert decode_subject(jwt.encode({"foo": "bar"}, get_settings().jwt_secret, algorithm=ALGORITHM)) is None


def test_protected_routes_require_a_valid_token(client):
    assert client.get("/api/vehicles").status_code == 401
    assert client.get("/api/vehicles", headers={"Authorization": "Bearer garbage"}).status_code == 401
    assert client.get("/api/vehicles/search").status_code == 401
    assert client.post("/api/vehicles/1/purchase").status_code == 401


def test_token_for_a_deleted_user_is_rejected(client):
    ghost_token = create_access_token("9999")
    assert client.get("/api/vehicles", headers={"Authorization": f"Bearer {ghost_token}"}).status_code == 401


def test_health_endpoint_is_public(client):
    assert client.get("/health").json()["status"] == "ok"
