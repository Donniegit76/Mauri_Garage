import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy.orm import Session

from .. import auth, config
from ..database import get_db
from ..models import Item, Photo
from ..schemas import PhotoOut

router = APIRouter(tags=["photos"], dependencies=[Depends(auth.require_auth)])

_EXTENSION_BY_CONTENT_TYPE = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
}


@router.post("/items/{item_id}/photos", response_model=PhotoOut, status_code=201)
async def upload_photo(item_id: int, file: UploadFile, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ricambio non trovato")

    if file.content_type not in config.ALLOWED_PHOTO_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Formato immagine non supportato")

    contents = await file.read()
    if len(contents) > config.MAX_PHOTO_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File troppo grande (max 10MB)")

    extension = _EXTENSION_BY_CONTENT_TYPE[file.content_type]
    filename = f"{uuid.uuid4().hex}{extension}"
    destination = Path(config.PHOTOS_DIR) / filename
    destination.write_bytes(contents)

    photo = Photo(item_id=item_id, filename=filename)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/photos/{photo_id}", status_code=204)
def delete_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Foto non trovata")

    file_path = Path(config.PHOTOS_DIR) / photo.filename
    file_path.unlink(missing_ok=True)

    db.delete(photo)
    db.commit()
    return None
