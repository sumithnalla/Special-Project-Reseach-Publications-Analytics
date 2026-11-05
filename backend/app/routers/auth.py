from datetime import UTC, datetime

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, verify_password
from app.db.mongodb import get_database
from app.schemas import LoginRequest
from app.services.audit import log_action
from app.services.data import public_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
def login(payload: LoginRequest, request: Request):
    database = get_database(request.app)
    user = database.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    if user["status"] != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This account is inactive")
    database.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.now(UTC)}})
    log_action(database, user["_id"], "LOGIN", "user", user["_id"])
    return {"access_token": create_access_token(str(user["_id"]), user["role"]), "token_type": "bearer", "user": public_user(user)}


@router.get("/me")
def me(user: Annotated[dict, Depends(get_current_user)]):
    return {"user": public_user(user)}
