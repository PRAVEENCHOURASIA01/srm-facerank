from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.photo import Photo
from app.utils.auth import require_admin
from app.utils.cloudinary_helper import delete_image

router = APIRouter(prefix="/admin", tags=["admin"])


@router.delete("/photo/{photo_id}", status_code=204)
def admin_delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(404, "Photo not found")

    delete_image(photo.cloudinary_public_id)
    db.delete(photo)
    db.commit()


@router.post("/ban-user/{user_id}", status_code=200)
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(400, "Cannot ban yourself")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.is_banned = True
    db.commit()
    return {"message": f"User {user.username} has been banned"}


@router.post("/unban-user/{user_id}", status_code=200)
def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    user.is_banned = False
    db.commit()
    return {"message": f"User {user.username} has been unbanned"}


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "is_admin": u.is_admin,
            "is_banned": u.is_banned,
            "created_at": u.created_at,
        }
        for u in users
    ]