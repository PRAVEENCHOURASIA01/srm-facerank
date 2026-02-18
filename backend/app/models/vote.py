from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from app.database import Base


class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    voter_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    winner_photo_id = Column(Integer, ForeignKey("photos.id", ondelete="CASCADE"), nullable=False)
    loser_photo_id = Column(Integer, ForeignKey("photos.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())