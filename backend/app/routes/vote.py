from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.photo import Photo
from app.models.vote import Vote
from app.schemas import VoteCreate, VoteOut
from app.utils.auth import get_current_user
from app.utils.elo import calculate_elo

router = APIRouter(prefix="/vote", tags=["vote"])


@router.post("", response_model=VoteOut, status_code=201)
def cast_vote(
    payload: VoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.winner_photo_id == payload.loser_photo_id:
        raise HTTPException(400, "Winner and loser must be different photos")

    winner = db.query(Photo).filter(Photo.id == payload.winner_photo_id).first()
    loser = db.query(Photo).filter(Photo.id == payload.loser_photo_id).first()

    if not winner or not loser:
        raise HTTPException(404, "One or both photos not found")

    # Update ELO ratings
    new_winner_elo, new_loser_elo = calculate_elo(winner.elo_rating, loser.elo_rating)

    winner.elo_rating = new_winner_elo
    winner.wins += 1
    winner.total_votes += 1

    loser.elo_rating = new_loser_elo
    loser.losses += 1
    loser.total_votes += 1

    vote = Vote(
        voter_user_id=current_user.id,
        winner_photo_id=payload.winner_photo_id,
        loser_photo_id=payload.loser_photo_id,
    )
    db.add(vote)
    db.commit()
    db.refresh(vote)
    return vote