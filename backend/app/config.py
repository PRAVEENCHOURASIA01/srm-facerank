from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/srm_facerank"
    SECRET_KEY: str = "changeme-super-secret-key-at-least-32-chars-long!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()