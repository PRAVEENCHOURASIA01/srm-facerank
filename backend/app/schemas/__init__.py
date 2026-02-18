from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional


# --- Auth Schemas ---
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    is_admin: bool
    is_banned: bool
    created_at: datetime


# --- Photo Schemas ---
class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image_url: str
    uploaded_by_user_id: int
    elo_rating: float
    wins: int
    losses: int
    total_votes: int
    created_at: datetime
    uploader_username: Optional[str] = None


class PhotoPair(BaseModel):
    photo_a: PhotoOut
    photo_b: PhotoOut


# --- Vote Schemas ---
class VoteCreate(BaseModel):
    winner_photo_id: int
    loser_photo_id: int


class VoteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    winner_photo_id: int
    loser_photo_id: int
    created_at: datetime


# --- Leaderboard ---
class LeaderboardEntry(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    rank: int
    id: int
    image_url: str
    elo_rating: float
    wins: int
    losses: int
    total_votes: int
    uploader_username: str