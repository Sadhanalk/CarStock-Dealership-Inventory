"""Password hashing (PBKDF2, standard library) and JWT helpers."""
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from .config import get_settings

ALGORITHM = "HS256"
_HASH_NAME = "sha256"
_ITERATIONS = 210_000


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode()


def hash_password(password: str) -> str:
    """Return a salted PBKDF2 hash in the form `scheme$iterations$salt$hash`."""
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac(_HASH_NAME, password.encode(), salt, _ITERATIONS)
    return f"pbkdf2_sha256${_ITERATIONS}${_b64(salt)}${_b64(derived)}"


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Constant-time check of a password against a stored hash; malformed hashes never match."""
    try:
        scheme, iterations, encoded_salt, encoded_hash = password_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(encoded_salt.encode())
        expected = base64.urlsafe_b64decode(encoded_hash.encode())
        actual = hashlib.pbkdf2_hmac(_HASH_NAME, plain_password.encode(), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def create_access_token(subject: str) -> str:
    """Sign a JWT whose `sub` claim is the user id and which expires per settings."""
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": subject, "exp": expires}, settings.jwt_secret, algorithm=ALGORITHM)


def decode_subject(token: str) -> str | None:
    """Return the token's subject, or None if it is invalid, tampered with or expired."""
    try:
        payload = jwt.decode(token, get_settings().jwt_secret, algorithms=[ALGORITHM])
    except JWTError:
        return None
    subject = payload.get("sub")
    return str(subject) if subject is not None else None
