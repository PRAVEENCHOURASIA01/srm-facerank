from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.photo import Photo
from app.models.user import User
from app.utils.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("")
def get_leaderboard(
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photos = (
        db.query(Photo)
        .filter(Photo.total_votes > 0)
        .order_by(Photo.elo_rating.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for rank, photo in enumerate(photos, start=offset + 1):
        result.append({
            "rank": rank,
            "id": photo.id,
            "image_url": photo.image_url,
            "elo_rating": photo.elo_rating,
            "wins": photo.wins,
            "losses": photo.losses,
            "total_votes": photo.total_votes,
            "uploader_username": photo.uploader.username if photo.uploader else "unknown",
        })
    return result