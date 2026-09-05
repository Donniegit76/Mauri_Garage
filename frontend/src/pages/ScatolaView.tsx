import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getScatola } from "../api/client";
import { SENZA_SCATOLA } from "../api/types";
import type { Item } from "../api/types";
import ItemCard from "../components/ItemCard";

export default function ScatolaView() {
  const { scaffale, scatola } = useParams<{ scaffale: string; scatola: string }>();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scaffale || !scatola) return;
    getScatola(scaffale, scatola)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [scaffale, scatola]);

  if (loading) return <p className="text-gti-silver">Caricamento...</p>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white uppercase tracking-wide">
          {scatola === SENZA_SCATOLA ? "Fuori scatola" : `Scatola ${scatola}`}
        </h2>
        <Link to={`/scaffali/${encodeURIComponent(scaffale ?? "")}`} className="text-gti-red font-bold text-sm">
          Scaffale {scaffale}
        </Link>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <p className="text-center text-gti-steel py-8">
            {scatola === SENZA_SCATOLA ? "Nessun pezzo fuori scatola." : "Scatola vuota."}
          </p>
        )}
      </div>
    </div>
  );
}
