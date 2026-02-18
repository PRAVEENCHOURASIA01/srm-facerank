import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.photo import Photo
from app.schemas import PhotoOut, PhotoPair
from app.utils.auth import get_current_user
from app.utils.cloudinary_helper import upload_image, delete_image

router = APIRouter(prefix="/photos", tags=["photos"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def photo_to_out(photo: Photo) -> PhotoOut:
    return PhotoOut(
        id=photo.id,
        image_url=photo.image_url,
        uploaded_by_user_id=photo.uploaded_by_user_id,
        elo_rating=photo.elo_rating,
        wins=photo.wins,
        losses=photo.losses,
        total_votes=photo.total_votes,
        created_at=photo.created_at,
        uploader_username=photo.uploader.username if photo.uploader else None,
    )


@router.post("/upload", response_model=PhotoOut, status_code=201)
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"Unsupported file type: {file.content_type}")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(400, "File too large. Max 10MB allowed.")

    unique_name = f"{current_user.id}_{uuid.uuid4().hex}"
    result = upload_image(file_bytes, unique_name)

    photo = Photo(
        cloudinary_public_id=result["public_id"],
        image_url=result["url"],
        uploaded_by_user_id=current_user.id,
    )
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo_to_out(photo)


@router.delete("/{photo_id}", status_code=204)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")

    # Only uploader can delete their own photo
    if photo.uploaded_by_user_id != current_user.id:
        raise HTTPException(403, "You can only delete your own photos")

    # Delete all votes referencing this photo first (FK constraint fix)
    from app.models.vote import Vote
    db.query(Vote).filter(
        (Vote.winner_photo_id == photo_id) | (Vote.loser_photo_id == photo_id)
    ).delete(synchronize_session=False)

    delete_image(photo.cloudinary_public_id)
    db.delete(photo)
    db.commit()


@router.get("/random-pair", response_model=PhotoPair)
def get_random_pair(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import func

    photos = (
        db.query(Photo)
        .order_by(func.random())
        .limit(2)
        .all()
    )

    if len(photos) < 2:
        raise HTTPException(404, "Not enough photos for a matchup. Upload at least 2 photos!")

    return PhotoPair(photo_a=photo_to_out(photos[0]), photo_b=photo_to_out(photos[1]))


@router.get("/my", response_model=list[PhotoOut])
def my_photos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    photos = db.query(Photo).filter(Photo.uploaded_by_user_id == current_user.id).all()
    return [photo_to_out(p) for p in photos]