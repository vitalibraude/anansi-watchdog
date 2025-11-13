"""
Anansi Watchdog - Authentication Service
Helper functions for authentication and authorization
"""

from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from typing import Optional

from models.database import User
from db.session import get_db
from config.settings import settings


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception
    
    return user


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if token provided, otherwise return None
    Useful for endpoints that work both with and without authentication
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        return user
    except JWTError:
        return None


async def get_user_by_api_key(
    api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> User:
    """
    Authenticate user via API key
    Alternative to JWT for programmatic access
    """
    user = db.query(User).filter(
        User.api_key == api_key,
        User.is_active == True
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    return user


def require_tier(required_tier: str):
    """
    Dependency to require specific user tier
    Usage: user = Depends(require_tier("pro"))
    """
    tier_hierarchy = {
        "free": 0,
        "pro": 1,
        "team": 2,
        "enterprise": 3
    }
    
    async def tier_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:
        user_tier_level = tier_hierarchy.get(current_user.tier, 0)
        required_tier_level = tier_hierarchy.get(required_tier, 999)
        
        if user_tier_level < required_tier_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This feature requires {required_tier} tier or higher"
            )
        
        return current_user
    
    return tier_checker


def check_credits(cost: int):
    """
    Dependency to check if user has enough credits
    Usage: user = Depends(check_credits(10))
    """
    async def credits_checker(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
    ) -> User:
        if current_user.credits < cost:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail=f"Insufficient credits. Required: {cost}, Available: {current_user.credits}"
            )
        
        # Deduct credits
        current_user.credits -= cost
        db.commit()
        
        return current_user
    
    return credits_checker
