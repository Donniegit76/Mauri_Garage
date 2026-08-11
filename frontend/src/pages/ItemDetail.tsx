import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteItem, getItem, photoUrl } from "../api/client";
import type { Item, Sezione } from "../api/types";
import PhotoUploader from "../components/PhotoUploader";
import Lightbox from "../components/Lightbox";

const SEZIONE_PATH: Record<Sezione, string> = {
  ricambio: "/",
  cosmetica: "/car-detailing",
  carrozzeria: "/carrozzeria",
};

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getItem(Number(id))
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!item) return;
    const label = item.codice || item.descrizione;
    if (!confirm(`Eliminare "${label}"? L'operazione non è reversibile.`)) return;
    await deleteItem(item.id);
    navigate(SEZIONE_PATH[item.sezione]);
  }

  if (loading) return <p className="text-gti-silver">Caricamento...</p>;
  if (!item) return <p className="text-gti-silver">Elemento non trovato.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xl font-black text-white">{item.codice || "Senza codice"}</h2>
          <p className="text-gti-silver">{item.descrizione}</p>
        </div>
        <span className="text-xs bg-gti-red/20 text-gti-red font-bold px-2 py-1 rounded shrink-0">
          {item.scaffale} / {item.scatola || "Senza scatola"}
        </span>
      </div>

      {item.photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {item.photos.map((p) => (
            <img
              key={p.id}
              src={photoUrl(p.filename)}
              alt=""
              onClick={() => setLightboxSrc(photoUrl(p.filename))}
              className="aspect-square object-cover rounded-lg border border-gti-steel/30 cursor-pointer"
            />
          ))}
        </div>
      )}

      <div className="card space-y-2 text-sm">
        {item.categoria && <Row label="Categoria" value={item.categoria} />}
        {item.quantita !== null && item.quantita !== undefined && (
          <Row label="Quantità" value={String(item.quantita)} />
        )}
        {item.sezione === "cosmetica" && item.tipo_prodotto && (
          <Row label="Tipo prodotto" value={item.tipo_prodotto} />
        )}
        {item.sezione === "cosmetica" && item.scadenza && (
          <Row label="Scadenza" value={item.scadenza} />
        )}
        {item.note && <Row label="Note" value={item.note} />}
        <Row label="Ultima modifica" value={new Date(item.data_modifica).toLocaleString("it-IT")} />
      </div>

      <div className="card">
        <h3 className="font-bold text-white mb-2">Foto</h3>
        <PhotoUploader
          itemId={item.id}
          photos={item.photos}
          onChange={(photos) => setItem({ ...item, photos })}
        />
      </div>

      <div className="flex gap-2">
        <Link to={`/items/${item.id}/edit`} className="btn-primary flex-1 text-center">
          Modifica
        </Link>
        <button onClick={handleDelete} className="btn-secondary flex-1">
          Elimina
        </button>
      </div>

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gti-steel">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}
