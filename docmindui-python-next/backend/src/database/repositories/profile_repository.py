import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.database.models.profile import UserProfile


class UserProfileRepository:
    def __init__(self, db: Session) -> None:
        self._db = db

    def get_by_user_id(self, user_id: uuid.UUID) -> UserProfile | None:
        stmt = select(UserProfile).where(UserProfile.user_id == user_id)
        return self._db.execute(stmt).scalar_one_or_none()

    def upsert(self, profile: UserProfile) -> UserProfile:
        existing = self.get_by_user_id(profile.user_id)
        if existing:
            for field in (
                "nome",
                "email",
                "telefone",
                "cep",
                "rua",
                "numero",
                "bairro",
                "cidade",
                "estado",
            ):
                setattr(existing, field, getattr(profile, field))
            return existing
        self._db.add(profile)
        return profile
