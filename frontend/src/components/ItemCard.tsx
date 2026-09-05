import { Link } from "react-router-dom";
import type { Item } from "../api/types";
import { photoUrl } from "../api/client";

export default function ItemCard({ item }: { item: Item }) {
  const thumb = item.photos[0];

  return (
    <Link to={`/items/${item.id}`} className="card flex gap-3 items-center hover:border-gti-red/60">
      <div className="w-16 h-16 rounded-lg bg-black/40 border border-gti-steel/30 shrink-0 overflow-hidden flex items-center justify-center">
        {thumb ? (
          <img src={photoUrl(thumb.filename)} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gti-steel text-xs">Nessuna foto</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-black text-white text-base truncate">
            {item.codice || "Senza codice"}
          </span>
          {item.quantita !== null && item.quantita !== undefined && (
            <span className="text-xs bg-gti-steel/30 text-gti-silver px-2 py-0.5 rounded-full shrink-0">
              x{item.quantita}
            </span>
          )}
        </div>
        <p className="text-gti-silver text-sm truncate">{item.descrizione}</p>
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <span className="text-[11px] bg-gti-red/20 text-gti-red font-bold px-2 py-0.5 rounded">
            {item.scatola ? `${item.scaffale} / ${item.scatola}` : `${item.scaffale} · fuori scatola`}
          </span>
          {item.categoria && (
            <span className="text-[11px] bg-white/5 text-gti-silver px-2 py-0.5 rounded">
              {item.categoria}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
