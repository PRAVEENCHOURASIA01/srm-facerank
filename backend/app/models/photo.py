from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    cloudinary_public_id = Column(String(255), nullable=False)
    image_url = Column(String(512), nullable=False)
    uploaded_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    elo_rating = Column(Float, default=1000.0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    total_votes = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    uploader = relationship("User", backref="photos")