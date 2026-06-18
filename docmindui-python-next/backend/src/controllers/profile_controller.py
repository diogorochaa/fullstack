from src.database.models.user import User
from src.schemas.profile import CepLookupResponse, ProfileResponse, ProfileUpdateRequest
from src.services.profile.cep_service import CepLookupService
from src.services.profile.profile_service import UserProfileService


class ProfileController:
    def __init__(
        self,
        profile_service: UserProfileService,
        cep_service: CepLookupService,
    ) -> None:
        self._profiles = profile_service
        self._cep = cep_service

    def get_me(self, user: User) -> ProfileResponse:
        profile = self._profiles.get_or_create_profile(user)
        return ProfileResponse.model_validate(profile)

    def update_me(self, user: User, payload: ProfileUpdateRequest) -> ProfileResponse:
        profile = self._profiles.update_profile(user, payload)
        return ProfileResponse.model_validate(profile)

    def lookup_cep(self, cep: str) -> CepLookupResponse:
        return self._cep.lookup(cep)
