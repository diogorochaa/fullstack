from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ecommerce_ia.container import AppContainer, get_container
from ecommerce_ia.infrastructure.auth.jwt_verifier import JwtVerifier

_bearer = HTTPBearer(auto_error=False)


def get_app_container() -> AppContainer:
    return get_container()


def get_jwt_verifier(
    container: AppContainer = Depends(get_app_container),
) -> JwtVerifier:
    return JwtVerifier(container.settings)


async def require_admin(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    verifier: JwtVerifier = Depends(get_jwt_verifier),
) -> dict:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação obrigatório",
        )

    return verifier.verify_admin(credentials.credentials)
