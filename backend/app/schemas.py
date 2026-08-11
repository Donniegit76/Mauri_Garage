from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .models import Sezione


class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    data_caricamento: datetime


class ItemBase(BaseModel):
    sezione: Sezione = Sezione.ricambio
    codice: Optional[str] = None
    descrizione: str
    categoria: Optional[str] = None
    scaffale: str
    scatola: Optional[str] = None
    quantita: Optional[int] = None
    note: Optional[str] = None
    tipo_prodotto: Optional[str] = None
    scadenza: Optional[date] = None


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    sezione: Optional[Sezione] = None
    codice: Optional[str] = None
    descrizione: Optional[str] = None
    categoria: Optional[str] = None
    scaffale: Optional[str] = None
    scatola: Optional[str] = None
    quantita: Optional[int] = None
    note: Optional[str] = None
    tipo_prodotto: Optional[str] = None
    scadenza: Optional[date] = None


class ItemOut(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    data_inserimento: datetime
    data_modifica: datetime
    photos: list[PhotoOut] = []


class ItemListOut(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[ItemOut]


class ScatolaGroup(BaseModel):
    scatola: str
    items: list[ItemOut]


class ScaffaleGroup(BaseModel):
    scaffale: str
    scatole: list[ScatolaGroup]


class ScaffaleSummary(BaseModel):
    scaffale: str
    numero_items: int
    numero_scatole: int


class LoginRequest(BaseModel):
    password: str


class LoginResponse(BaseModel):
    token: str


class AuthStatus(BaseModel):
    auth_required: bool
