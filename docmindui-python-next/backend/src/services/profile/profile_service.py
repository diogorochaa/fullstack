import uuid

from sqlalchemy.orm import Session

from src.core.exceptions import ProfileFieldMissingError, ProfileNotFoundError
from src.database.models.profile import UserProfile
from src.database.models.user import User
from src.database.repositories.profile_repository import UserProfileRepository
from src.database.repositories.user_repository import UserRepository
from src.schemas.profile import ProfileUpdateRequest


class UserProfileService:
    def __init__(
        self,
        db: Session,
        profiles: UserProfileRepository,
        users: UserRepository,
    ) -> None:
        self._db = db
        self._profiles = profiles
        self._users = users

    def get_or_create_profile(self, user: User) -> UserProfile:
        profile = self._profiles.get_by_user_id(user.id)
        if profile:
            return profile
        profile = UserProfile(user_id=user.id, email=user.email)
        self._profiles.upsert(profile)
        self._db.commit()
        self._db.refresh(profile)
        return profile

    def get_profile(self, user_id: uuid.UUID) -> UserProfile:
        profile = self._profiles.get_by_user_id(user_id)
        if profile is None:
            raise ProfileNotFoundError("Perfil não encontrado.")
        return profile

    def update_profile(self, user: User, payload: ProfileUpdateRequest) -> UserProfile:
        profile = self.get_or_create_profile(user)
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(profile, key, value)
        self._db.commit()
        self._db.refresh(profile)
        return profile

    def get_email(self, user_id: uuid.UUID) -> str:
        profile = self._profiles.get_by_user_id(user_id)
        if profile and profile.email:
            return profile.email
        user = self._users.get_by_id(user_id)
        if user is None:
            raise ProfileNotFoundError("Usuário não encontrado.")
        return user.email

    def get_phone(self, user_id: uuid.UUID) -> str:
        profile = self.get_profile(user_id)
        if not profile.telefone:
            raise ProfileFieldMissingError("Telefone não cadastrado no perfil.")
        return profile.telefone

    def get_address(self, user_id: uuid.UUID) -> str:
        profile = self.get_profile(user_id)
        parts: list[str] = []
        if profile.rua:
            line = profile.rua
            if profile.numero:
                line = f"{line}, {profile.numero}"
            parts.append(line)
        if profile.bairro:
            parts.append(profile.bairro)
        city_state = ", ".join(p for p in [profile.cidade, profile.estado] if p)
        if city_state:
            parts.append(city_state)
        if profile.cep:
            parts.append(f"CEP {profile.cep}")
        if not parts:
            raise ProfileFieldMissingError("Endereço não cadastrado no perfil.")
        return " - ".join(parts[:2]) + (f" — {parts[2]}" if len(parts) > 2 else "")
