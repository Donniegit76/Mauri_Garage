import base64
import hashlib
import hmac
import json
import time

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from . import config

_bearer_scheme = HTTPBearer(auto_error=False)


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(payload_b64: str) -> str:
    signature = hmac.new(
        config.APP_SECRET.encode(), payload_b64.encode(), hashlib.sha256
    ).digest()
    return _b64encode(signature)


def create_token() -> str:
    payload = {"exp": int(time.time()) + config.TOKEN_TTL_SECONDS}
    payload_b64 = _b64encode(json.dumps(payload).encode())
    signature_b64 = _sign(payload_b64)
    return f"{payload_b64}.{signature_b64}"


def _verify_token(token: str) -> bool:
    try:
        payload_b64, signature_b64 = token.split(".", 1)
    except ValueError:
        return False

    expected_signature = _sign(payload_b64)
    if not hmac.compare_digest(expected_signature, signature_b64):
        return False

    try:
        payload = json.loads(_b64decode(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return False

    return payload.get("exp", 0) > time.time()


def is_auth_required() -> bool:
    return bool(config.APP_PASSWORD)


def verify_password(password: str) -> bool:
    return hmac.compare_digest(password, config.APP_PASSWORD)


def require_auth(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> None:
    if not is_auth_required():
        return

    if credentials is None or not _verify_token(credentials.credentials):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticazione richiesta",
            headers={"WWW-Authenticate": "Bearer"},
        )
