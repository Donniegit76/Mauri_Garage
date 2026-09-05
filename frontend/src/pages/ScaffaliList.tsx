import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getScaffali } from "../api/client";
import type { ScaffaleSummary } from "../api/types";

export default function ScaffaliList() {
  const [scaffali, setScaffali] = useState<ScaffaleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScaffali()
      .then(setScaffali)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gti-silver">Caricamento...</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black text-white uppercase tracking-wide">Scaffali</h2>
      <div className="space-y-2">
        {scaffali.map((s) => (
          <Link key={s.scaffale} to={`/scaffali/${encodeURIComponent(s.scaffale)}`} className="card flex items-center justify-between hover:border-gti-red/60">
            <span className="font-black text-white text-lg">Scaffale {s.scaffale}</span>
            <span className="text-gti-silver text-sm">
              {s.numero_scatole} scatole · {s.numero_items} pezzi
              {s.numero_senza_scatola > 0 && (
                <span className="text-gti-steel"> · {s.numero_senza_scatola} fuori scatola</span>
              )}
            </span>
          </Link>
        ))}
        {scaffali.length === 0 && (
          <p className="text-center text-gti-steel py-8">Nessuno scaffale ancora censito.</p>
        )}
      </div>
    </div>
  );
}
