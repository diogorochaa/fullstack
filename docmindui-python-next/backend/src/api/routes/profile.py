from fastapi import APIRouter, Depends

from src.controllers.profile_controller import ProfileController
from src.core.dependencies import get_cep_service, get_current_user, get_profile_service
from src.database.models.user import User
from src.schemas.profile import CepLookupResponse, ProfileResponse, ProfileUpdateRequest
from src.services.profile.cep_service import CepLookupService
from src.services.profile.profile_service import UserProfileService

router = APIRouter(prefix="/profile", tags=["profile"])


def get_profile_controller(
    profile_service: UserProfileService = Depends(get_profile_service),
    cep_service: CepLookupService = Depends(get_cep_service),
) -> ProfileController:
    return ProfileController(profile_service, cep_service)


@router.get("/me", response_model=ProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    controller: ProfileController = Depends(get_profile_controller),
):
    return controller.get_me(current_user)


@router.put("/me", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    controller: ProfileController = Depends(get_profile_controller),
):
    return controller.update_me(current_user, payload)


@router.get("/cep/{cep}", response_model=CepLookupResponse)
def lookup_cep(
    cep: str,
    _: User = Depends(get_current_user),
    controller: ProfileController = Depends(get_profile_controller),
):
    return controller.lookup_cep(cep)
