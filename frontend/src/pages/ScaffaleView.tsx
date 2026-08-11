import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getScaffale } from "../api/client";
import type { ScaffaleGroup } from "../api/types";
import ItemCard from "../components/ItemCard";

export default function ScaffaleView() {
  const { scaffale } = useParams<{ scaffale: string }>();
  const [group, setGroup] = useState<ScaffaleGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scaffale) return;
    getScaffale(scaffale)
      .then(setGroup)
      .finally(() => setLoading(false));
  }, [scaffale]);

  if (loading) return <p className="text-gti-silver">Caricamento...</p>;
  if (!group) return <p className="text-gti-silver">Scaffale non trovato.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white uppercase tracking-wide">
          Scaffale {group.scaffale}
        </h2>
        <Link to="/scaffali" className="text-gti-red font-bold text-sm">
          Tutti gli scaffali
        </Link>
      </div>

      {group.scatole.map((scatola) => (
        <div key={scatola.scatola} className="space-y-2">
          <div className="tartan-divider rounded-full" />
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gti-silver">
              Scatola {scatola.scatola}{" "}
              <span className="text-gti-steel font-normal">({scatola.items.length})</span>
            </h3>
            <Link
              to={`/scaffali/${encodeURIComponent(group.scaffale)}/${encodeURIComponent(scatola.scatola)}`}
              className="text-xs text-gti-red font-bold"
            >
              Vista scatola
            </Link>
          </div>
          <div className="space-y-2">
            {scatola.items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
