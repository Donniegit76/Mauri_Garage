import { useEffect, useState } from "react";
import { getCategorie, getScaffaliMeta } from "../api/client";
import type { Sezione } from "../api/types";

interface Props {
  sezione: Sezione;
  categoria: string;
  scaffale: string;
  onChange: (next: { categoria: string; scaffale: string }) => void;
}

export default function FilterBar({ sezione, categoria, scaffale, onChange }: Props) {
  const [categorie, setCategorie] = useState<string[]>([]);
  const [scaffali, setScaffali] = useState<string[]>([]);

  useEffect(() => {
    getCategorie(sezione).then(setCategorie).catch(() => setCategorie([]));
    getScaffaliMeta().then(setScaffali).catch(() => setScaffali([]));
  }, [sezione]);

  return (
    <div className="flex gap-2">
      <select
        className="input-field text-base"
        value={categoria}
        onChange={(e) => onChange({ categoria: e.target.value, scaffale })}
      >
        <option value="">Tutte le categorie</option>
        {categorie.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className="input-field text-base"
        value={scaffale}
        onChange={(e) => onChange({ categoria, scaffale: e.target.value })}
      >
        <option value="">Tutti gli scaffali</option>
        {scaffali.map((s) => (
          <option key={s} value={s}>
            Scaffale {s}
          </option>
        ))}
      </select>
    </div>
  );
}
