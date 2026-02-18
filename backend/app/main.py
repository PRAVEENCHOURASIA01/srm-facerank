from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.routes import auth, photos, vote, leaderboard, admin

# Rate limiter setup
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="SRM FaceRank API",
    description="Campus swipe voting game — FaceMash for SRM",
    version="1.0.0",
)

# Rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(photos.router)
app.include_router(vote.router)
app.include_router(leaderboard.router)
app.include_router(admin.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "SRM FaceRank"}