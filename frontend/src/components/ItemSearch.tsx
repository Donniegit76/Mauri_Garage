import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import ItemCard from "../components/ItemCard";
import { downloadExport, listItems } from "../api/client";
import type { Item, Sezione } from "../api/types";

interface Props {
  sezione: Sezione;
  title: string;
}

export default function ItemSearch({ sezione, title }: Props) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [scaffale, setScaffale] = useState("");
  const [scatola, setScatola] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      listItems({ sezione, search, categoria, scaffale, scatola, page: 1, page_size: 100 })
        .then((res) => {
          setItems(res.items);
          setTotal(res.total);
        })
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [sezione, search, categoria, scaffale, scatola]);

  async function handleExport() {
    setExporting(true);
    try {
      await downloadExport({ sezione, search, categoria, scaffale, scatola });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black text-white uppercase tracking-wide">{title}</h2>
      <SearchBar value={search} onChange={setSearch} />
      <FilterBar
        sezione={sezione}
        categoria={categoria}
        scaffale={scaffale}
        scatola={scatola}
        onChange={(next) => {
          setCategoria(next.categoria);
          setScaffale(next.scaffale);
          setScatola(next.scatola);
        }}
      />

      <div className="flex items-center justify-between text-sm text-gti-silver">
        <span>{loading ? "Ricerca..." : `${total} risultati`}</span>
        <button
          onClick={handleExport}
          disabled={exporting || total === 0}
          className="text-gti-red font-bold disabled:opacity-40"
        >
          {exporting ? "Esportazione..." : "Esporta Excel"}
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
        {!loading && items.length === 0 && (
          <p className="text-center text-gti-steel py-8">Nessun risultato trovato.</p>
        )}
      </div>
    </div>
  );
}
