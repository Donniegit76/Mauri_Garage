import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
DB_DIR = DATA_DIR / "db"
PHOTOS_DIR = DATA_DIR / "photos"

DB_DIR.mkdir(parents=True, exist_ok=True)
PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DB_DIR / 'mauri_garage.db'}"

APP_PASSWORD = os.getenv("APP_PASSWORD", "").strip()
APP_SECRET = os.getenv("APP_SECRET", "mauri-garage-dev-secret-change-me")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30  # 30 giorni

MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_PHOTO_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}
