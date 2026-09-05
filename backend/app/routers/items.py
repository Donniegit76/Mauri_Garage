from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import auth
from ..database import get_db
from ..models import NO_SCATOLA_LABEL, Item, Sezione, normalizza_scatola
from ..schemas import ItemCreate, ItemListOut, ItemOut, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"], dependencies=[Depends(auth.require_auth)])


def apply_filters(
    query,
    search: Optional[str],
    sezione: Optional[Sezione],
    categoria: Optional[str],
    scaffale: Optional[str],
    scatola: Optional[str],
):
    if search:
        like_pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Item.codice).like(like_pattern),
                func.lower(Item.descrizione).like(like_pattern),
            )
        )
    if sezione:
        query = query.filter(Item.sezione == sezione)
    if categoria:
        query = query.filter(Item.categoria == categoria)
    if scaffale:
        query = query.filter(Item.scaffale == scaffale)
    if scatola:
        # NULL e stringa vuota significano entrambi "sciolto sullo scaffale"
        scatola_norm = func.nullif(func.trim(func.coalesce(Item.scatola, "")), "")
        if scatola == NO_SCATOLA_LABEL:
            query = query.filter(scatola_norm.is_(None))
        else:
            query = query.filter(scatola_norm == scatola)
    return query


@router.get("", response_model=ItemListOut)
def list_items(
    search: Optional[str] = None,
    sezione: Optional[Sezione] = None,
    categoria: Optional[str] = None,
    scaffale: Optional[str] = None,
    scatola: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db),
):
    query = apply_filters(db.query(Item), search, sezione, categoria, scaffale, scatola)
    total = query.count()
    items = (
        query.order_by(Item.data_modifica.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return ItemListOut(total=total, page=page, page_size=page_size, items=items)


@router.post("", response_model=ItemOut, status_code=201)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["scatola"] = normalizza_scatola(data.get("scatola"))
    item = Item(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ricambio non trovato")
    return item


@router.put("/{item_id}", response_model=ItemOut)
def update_item(item_id: int, payload: ItemUpdate, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ricambio non trovato")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if field == "scatola":
            value = normalizza_scatola(value)
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ricambio non trovato")
    db.delete(item)
    db.commit()
    return None
