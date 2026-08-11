from fastapi import APIRouter, HTTPException, status

from .. import auth
from ..schemas import AuthStatus, LoginRequest, LoginResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/status", response_model=AuthStatus)
def get_status():
    return AuthStatus(auth_required=auth.is_auth_required())


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    if not auth.is_auth_required():
        return LoginResponse(token=auth.create_token())

    if not auth.verify_password(payload.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Password errata"
        )

    return LoginResponse(token=auth.create_token())
