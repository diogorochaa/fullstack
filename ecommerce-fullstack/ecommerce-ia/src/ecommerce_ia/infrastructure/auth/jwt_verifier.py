import logging

import jwt
from fastapi import HTTPException, status

from ecommerce_ia.config.settings import Settings

logger = logging.getLogger(__name__)


class JwtVerifier:
    """Valida JWT emitido pela ecommerce-api (mesmo JWT_SECRET)."""

    def __init__(self, settings: Settings) -> None:
        self._secret = settings.jwt_secret

    def verify_admin(self, token: str) -> dict:
        if not self._secret:
            logger.warning("JWT_SECRET not configured — admin chat is open")
            return {"role": "ADMIN", "sub": "anonymous"}

        try:
            payload = jwt.decode(
                token,
                self._secret,
                algorithms=["HS256"],
            )
        except jwt.PyJWTError as error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado",
            ) from error

        if payload.get("type") == "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de refresh não pode ser usado aqui",
            )

        if payload.get("role") != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acesso restrito a administradores",
            )

        return payload
