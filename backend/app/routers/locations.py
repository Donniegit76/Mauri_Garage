from itertools import groupby
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import auth
from ..database import get_db
from ..models import Item, NO_SCATOLA_LABEL, Sezione
from ..schemas import ItemOut, ScaffaleGroup, ScaffaleSummary, ScatolaGroup

router = APIRouter(tags=["locations"], dependencies=[Depends(auth.require_auth)])


@router.get("/scaffali", response_model=list[ScaffaleSummary])
def list_scaffali(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Item.scaffale,
            func.count(Item.id).label("numero_items"),
            func.count(func.distinct(func.coalesce(Item.scatola, NO_SCATOLA_LABEL))).label(
                "numero_scatole"
            ),
        )
        .group_by(Item.scaffale)
        .order_by(Item.scaffale)
        .all()
    )
    return [
        ScaffaleSummary(scaffale=r.scaffale, numero_items=r.numero_items, numero_scatole=r.numero_scatole)
        for r in rows
    ]


@router.get("/scaffali/{scaffale}", response_model=ScaffaleGroup)
def get_scaffale(scaffale: str, db: Session = Depends(get_db)):
    items = (
        db.query(Item)
        .filter(Item.scaffale == scaffale)
        .order_by(Item.scatola, Item.codice)
        .all()
    )
    scatole = [
        ScatolaGroup(scatola=scatola, items=list(group))
        for scatola, group in groupby(items, key=lambda i: i.scatola or NO_SCATOLA_LABEL)
    ]
    return ScaffaleGroup(scaffale=scaffale, scatole=scatole)


@router.get("/scatole/{scaffale}/{scatola}", response_model=list[ItemOut])
def get_scatola(scaffale: str, scatola: str, db: Session = Depends(get_db)):
    query = db.query(Item).filter(Item.scaffale == scaffale)
    if scatola == NO_SCATOLA_LABEL:
        query = query.filter(Item.scatola.is_(None))
    else:
        query = query.filter(Item.scatola == scatola)
    return query.order_by(Item.codice).all()


@router.get("/meta/categorie", response_model=list[str])
def list_categorie(sezione: Optional[Sezione] = None, db: Session = Depends(get_db)):
    query = db.query(Item.categoria).filter(Item.categoria.isnot(None), Item.categoria != "")
    if sezione:
        query = query.filter(Item.sezione == sezione)
    rows = query.distinct().order_by(Item.categoria).all()
    return [r[0] for r in rows]


@router.get("/meta/scaffali", response_model=list[str])
def list_scaffali_meta(db: Session = Depends(get_db)):
    rows = db.query(Item.scaffale).distinct().order_by(Item.scaffale).all()
    return [r[0] for r in rows]
