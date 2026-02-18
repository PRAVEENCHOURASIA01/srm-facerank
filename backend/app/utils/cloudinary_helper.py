import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)


def upload_image(file_bytes: bytes, filename: str) -> dict:
    """Upload image to Cloudinary and return result dict with public_id and secure_url."""
    result = cloudinary.uploader.upload(
        file_bytes,
        folder="srm-facerank",
        public_id=filename,
        overwrite=True,
        resource_type="image",
        transformation=[
            {"width": 800, "height": 800, "crop": "limit"},
            {"quality": "auto"},
        ],
    )
    return {
        "public_id": result["public_id"],
        "url": result["secure_url"],
    }


def delete_image(public_id: str) -> None:
    """Delete image from Cloudinary."""
    cloudinary.uploader.destroy(public_id)