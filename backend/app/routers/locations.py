from itertools import groupby
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from .. import auth
from ..database import get_db
from ..models import Item, NO_SCATOLA_LABEL, Sezione, normalizza_scatola
from ..schemas import ItemOut, ScaffaleGroup, ScaffaleSummary, ScatolaGroup

router = APIRouter(tags=["locations"], dependencies=[Depends(auth.require_auth)])

# Espressione SQL che riduce a NULL le scatole vuote (NULL o stringa vuota)
_SCATOLA_NORM = func.nullif(func.trim(func.coalesce(Item.scatola, "")), "")


def _ordina_scatole(valori) -> list[str]:
    """Ordina le scatole in modo naturale: 1, 2, 10 e poi le etichette testuali."""
    return sorted(valori, key=lambda v: (0, int(v), "") if v.isdigit() else (1, 0, v.lower()))


@router.get("/scaffali", response_model=list[ScaffaleSummary])
def list_scaffali(db: Session = Depends(get_db)):
    rows = (
        db.query(
            Item.scaffale,
            func.count(Item.id).label("numero_items"),
            # count(distinct ...) ignora i NULL: le scatole "vuote" non vengono contate
            func.count(func.distinct(_SCATOLA_NORM)).label("numero_scatole"),
            func.sum(case((_SCATOLA_NORM.is_(None), 1), else_=0)).label("numero_senza_scatola"),
        )
        .group_by(Item.scaffale)
        .order_by(Item.scaffale)
        .all()
    )
    return [
        ScaffaleSummary(
            scaffale=r.scaffale,
            numero_items=r.numero_items,
            numero_scatole=r.numero_scatole,
            numero_senza_scatola=r.numero_senza_scatola or 0,
        )
        for r in rows
    ]


@router.get("/scaffali/{scaffale}", response_model=ScaffaleGroup)
def get_scaffale(scaffale: str, db: Session = Depends(get_db)):
    items = db.query(Item).filter(Item.scaffale == scaffale).all()

    senza_scatola = [i for i in items if normalizza_scatola(i.scatola) is None]
    senza_scatola.sort(key=lambda i: (i.codice or "").lower())

    in_scatola = [i for i in items if normalizza_scatola(i.scatola) is not None]
    ordine = {s: n for n, s in enumerate(_ordina_scatole({normalizza_scatola(i.scatola) for i in in_scatola}))}
    in_scatola.sort(key=lambda i: (ordine[normalizza_scatola(i.scatola)], (i.codice or "").lower()))

    scatole = [
        ScatolaGroup(scatola=scatola, items=list(group))
        for scatola, group in groupby(in_scatola, key=lambda i: normalizza_scatola(i.scatola))
    ]
    return ScaffaleGroup(scaffale=scaffale, scatole=scatole, items_senza_scatola=senza_scatola)


@router.get("/scatole/{scaffale}/{scatola}", response_model=list[ItemOut])
def get_scatola(scaffale: str, scatola: str, db: Session = Depends(get_db)):
    query = db.query(Item).filter(Item.scaffale == scaffale)
    if scatola == NO_SCATOLA_LABEL:
        query = query.filter(_SCATOLA_NORM.is_(None))
    else:
        query = query.filter(_SCATOLA_NORM == scatola)
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


@router.get("/meta/scatole", response_model=list[str])
def list_scatole_meta(
    scaffale: Optional[str] = None,
    sezione: Optional[Sezione] = None,
    db: Session = Depends(get_db),
):
    """Elenco delle scatole realmente esistenti (i pezzi sciolti non sono una scatola)."""
    query = db.query(_SCATOLA_NORM).filter(_SCATOLA_NORM.isnot(None))
    if scaffale:
        query = query.filter(Item.scaffale == scaffale)
    if sezione:
        query = query.filter(Item.sezione == sezione)
    return _ordina_scatole({r[0] for r in query.distinct().all()})
