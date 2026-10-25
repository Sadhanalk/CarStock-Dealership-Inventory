from sqlalchemy.orm import Session

from ..auth import create_access_token, hash_password, verify_password
from ..errors import AuthenticationError, ConflictError
from ..models import User
from ..repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, db: Session, users: UserRepository) -> None:
        self.db = db
        self.users = users

    def register(self, email: str, full_name: str, password: str) -> tuple[User, str]:
        """Create a normal (non-admin) account. Admins are only created by the seed script."""
        if self.users.get_by_email(email):
            raise ConflictError("An account with that email already exists")
        user = self.users.add(User(email=email.lower(), full_name=full_name, password_hash=hash_password(password)))
        self.db.commit()
        return user, create_access_token(str(user.id))

    def login(self, email: str, password: str) -> tuple[User, str]:
        user = self.users.get_by_email(email)
        # Same message for "unknown email" and "wrong password": don't reveal which emails exist.
        if user is None or not verify_password(password, user.password_hash):
            raise AuthenticationError("Email or password is incorrect")
        return user, create_access_token(str(user.id))
