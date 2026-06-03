from fastapi import APIRouter, HTTPException, status, Form
from auth import create_access_token, verify_credentials
from models import TokenResponse

router = APIRouter()


@router.post("/token", response_model=TokenResponse)
async def login(username: str = Form(...), password: str = Form(...)):
    if not verify_credentials(username, password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token({"sub": username})
    return TokenResponse(access_token=token)
