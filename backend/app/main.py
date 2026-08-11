from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import config
from .database import Base, engine
from .routers import auth, export, items, locations, photos

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mauri_Garage API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/photos", StaticFiles(directory=str(config.PHOTOS_DIR)), name="photos")

app.include_router(auth.router, prefix="/api")
app.include_router(items.router, prefix="/api")
app.include_router(photos.router, prefix="/api")
app.include_router(locations.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
