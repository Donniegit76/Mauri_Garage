from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import auth
from ..database import get_db
from ..excel_export import build_items_excel
from ..models import Item, Sezione
from .items import apply_filters

router = APIRouter(prefix="/export", tags=["export"], dependencies=[Depends(auth.require_auth)])


@router.get("/excel")
def export_excel(
    search: Optional[str] = None,
    sezione: Optional[Sezione] = None,
    categoria: Optional[str] = None,
    scaffale: Optional[str] = None,
    scatola: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = apply_filters(db.query(Item), search, sezione, categoria, scaffale, scatola)
    items = query.order_by(Item.scaffale, Item.scatola, Item.codice).all()

    buffer = build_items_excel(items)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    filename = f"mauri_garage_export_{timestamp}.xlsx"

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
