from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.exceptions import EmailAlreadyInUseError, InvalidCredentialsError
from src.core.security import create_access_token, hash_password, verify_password
from src.database.models.user import User
from src.database.repositories.user_repository import UserRepository


class AuthService:
    def __init__(self, db: Session, users: UserRepository) -> None:
        self._db = db
        self._users = users

    def register(self, email: str, password: str) -> User:
        user = self._users.add_pending(email, hash_password(password))
        try:
            self._db.commit()
            self._db.refresh(user)
        except IntegrityError:
            self._db.rollback()
            raise EmailAlreadyInUseError("Este e-mail já está cadastrado.") from None
        return user

    def login(self, email: str, password: str) -> str:
        user = self._users.get_by_email(email)
        if user is None or not verify_password(password, user.hashed_password):
            raise InvalidCredentialsError("E-mail ou senha inválidos.")
        return create_access_token(subject=str(user.id))
