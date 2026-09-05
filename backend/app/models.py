import enum

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Date,
    ForeignKey,
    Enum as SAEnum,
    func,
)
from sqlalchemy.orm import relationship

from .database import Base


class Sezione(str, enum.Enum):
    ricambio = "ricambio"
    cosmetica = "cosmetica"
    carrozzeria = "carrozzeria"


# Etichetta usata per filtrare gli item appoggiati sullo scaffale senza scatola
NO_SCATOLA_LABEL = "Senza scatola"


def normalizza_scatola(valore: str | None) -> str | None:
    """Riporta a None le scatole vuote o composte da soli spazi.

    Nel database storico alcune scatole possono essere salvate come stringa
    vuota invece che NULL: entrambe significano "ricambio sciolto sullo
    scaffale" e vanno trattate allo stesso modo.
    """
    if valore is None:
        return None
    valore = valore.strip()
    return valore or None


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    sezione = Column(SAEnum(Sezione), nullable=False, index=True, default=Sezione.ricambio)

    codice = Column(String(100), nullable=True, index=True)
    descrizione = Column(Text, nullable=False)
    categoria = Column(String(100), nullable=True, index=True)
    scaffale = Column(String(50), nullable=False, index=True)
    scatola = Column(String(50), nullable=True, index=True)
    quantita = Column(Integer, nullable=True)
    note = Column(Text, nullable=True)

    # Campi specifici sezione cosmetica
    tipo_prodotto = Column(String(100), nullable=True)
    scadenza = Column(Date, nullable=True)

    data_inserimento = Column(DateTime(timezone=True), server_default=func.now())
    data_modifica = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    photos = relationship(
        "Photo", back_populates="item", cascade="all, delete-orphan", order_by="Photo.id"
    )


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    data_caricamento = Column(DateTime(timezone=True), server_default=func.now())

    item = relationship("Item", back_populates="photos")
