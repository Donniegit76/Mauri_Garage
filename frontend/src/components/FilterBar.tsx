import { useEffect, useState } from "react";
import { getCategorie, getScaffaliMeta, getScatoleMeta } from "../api/client";
import { SENZA_SCATOLA } from "../api/types";
import type { Sezione } from "../api/types";

interface Props {
  sezione: Sezione;
  categoria: string;
  scaffale: string;
  scatola: string;
  onChange: (next: { categoria: string; scaffale: string; scatola: string }) => void;
}

export default function FilterBar({ sezione, categoria, scaffale, scatola, onChange }: Props) {
  const [categorie, setCategorie] = useState<string[]>([]);
  const [scaffali, setScaffali] = useState<string[]>([]);
  const [scatole, setScatole] = useState<string[]>([]);

  useEffect(() => {
    getCategorie(sezione).then(setCategorie).catch(() => setCategorie([]));
    getScaffaliMeta().then(setScaffali).catch(() => setScaffali([]));
  }, [sezione]);

  // L'elenco delle scatole segue lo scaffale selezionato
  useEffect(() => {
    getScatoleMeta(scaffale || undefined, sezione)
      .then(setScatole)
      .catch(() => setScatole([]));
  }, [sezione, scaffale]);

  // Se la scatola scelta non esiste più nello scaffale selezionato, azzera il filtro
  useEffect(() => {
    if (scatola && scatola !== SENZA_SCATOLA && scatole.length > 0 && !scatole.includes(scatola)) {
      onChange({ categoria, scaffale, scatola: "" });
    }
  }, [scatole]);

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="input-field text-base flex-1 min-w-[9rem]"
        value={categoria}
        onChange={(e) => onChange({ categoria: e.target.value, scaffale, scatola })}
      >
        <option value="">Tutte le categorie</option>
        {categorie.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        className="input-field text-base flex-1 min-w-[9rem]"
        value={scaffale}
        onChange={(e) => onChange({ categoria, scaffale: e.target.value, scatola })}
      >
        <option value="">Tutti gli scaffali</option>
        {scaffali.map((s) => (
          <option key={s} value={s}>
            Scaffale {s}
          </option>
        ))}
      </select>
      <select
        className="input-field text-base flex-1 min-w-[9rem]"
        value={scatola}
        onChange={(e) => onChange({ categoria, scaffale, scatola: e.target.value })}
      >
        <option value="">Tutte le scatole</option>
        <option value={SENZA_SCATOLA}>Senza scatola (sciolti)</option>
        {scatole.map((s) => (
          <option key={s} value={s}>
            Scatola {s}
          </option>
        ))}
      </select>
    </div>
  );
}
