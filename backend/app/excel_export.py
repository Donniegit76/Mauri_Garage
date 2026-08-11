from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Font

from .models import Item

_COLUMNS = [
    ("Sezione", lambda i: i.sezione.value),
    ("Codice", lambda i: i.codice or ""),
    ("Descrizione", lambda i: i.descrizione),
    ("Categoria", lambda i: i.categoria or ""),
    ("Scaffale", lambda i: i.scaffale),
    ("Scatola", lambda i: i.scatola or ""),
    ("Quantita", lambda i: i.quantita if i.quantita is not None else ""),
    ("Tipo prodotto", lambda i: i.tipo_prodotto or ""),
    ("Scadenza", lambda i: i.scadenza.isoformat() if i.scadenza else ""),
    ("Note", lambda i: i.note or ""),
    ("Data inserimento", lambda i: i.data_inserimento.strftime("%Y-%m-%d %H:%M") if i.data_inserimento else ""),
    ("Ultima modifica", lambda i: i.data_modifica.strftime("%Y-%m-%d %H:%M") if i.data_modifica else ""),
]


def build_items_excel(items: list[Item]) -> BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Mauri Garage"

    headers = [name for name, _ in _COLUMNS]
    ws.append(headers)
    for cell in ws[1]:
        cell.font = Font(bold=True)

    for item in items:
        ws.append([getter(item) for _, getter in _COLUMNS])

    for column_cells in ws.columns:
        length = max((len(str(cell.value)) for cell in column_cells if cell.value is not None), default=10)
        ws.column_dimensions[column_cells[0].column_letter].width = min(max(length + 2, 10), 50)

    buffer = BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer
