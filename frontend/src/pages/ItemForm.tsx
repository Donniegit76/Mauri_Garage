import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createItem, getItem, updateItem } from "../api/client";
import { CATEGORIE_CARROZZERIA } from "../api/types";
import type { ItemInput, Sezione } from "../api/types";

const SEZIONE_LABELS: Record<Sezione, string> = {
  ricambio: "Ricambio",
  cosmetica: "Car_Detailing",
  carrozzeria: "Carrozzeria",
};

const EMPTY_FORM: ItemInput = {
  sezione: "ricambio",
  codice: "",
  descrizione: "",
  categoria: "",
  scaffale: "",
  scatola: "",
  quantita: null,
  note: "",
  tipo_prodotto: "",
  scadenza: "",
};

export default function ItemForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState<ItemInput>({
    ...EMPTY_FORM,
    sezione: (searchParams.get("sezione") as Sezione) || "ricambio",
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getItem(Number(id))
      .then((item) =>
        setForm({
          sezione: item.sezione,
          codice: item.codice ?? "",
          descrizione: item.descrizione,
          categoria: item.categoria ?? "",
          scaffale: item.scaffale,
          scatola: item.scatola ?? "",
          quantita: item.quantita ?? null,
          note: item.note ?? "",
          tipo_prodotto: item.tipo_prodotto ?? "",
          scadenza: item.scadenza ?? "",
        })
      )
      .finally(() => setLoading(false));
  }, [id]);

  function update<K extends keyof ItemInput>(key: K, value: ItemInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload: ItemInput = {
        ...form,
        codice: form.codice || null,
        categoria: form.categoria || null,
        scatola: form.scatola || null,
        note: form.note || null,
        tipo_prodotto: form.sezione === "cosmetica" ? form.tipo_prodotto || null : null,
        scadenza: form.sezione === "cosmetica" && form.scadenza ? form.scadenza : null,
      };

      const saved = isEditing
        ? await updateItem(Number(id), payload)
        : await createItem(payload);

      navigate(`/items/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gti-silver">Caricamento...</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-black text-white uppercase tracking-wide">
        {isEditing ? "Modifica elemento" : "Nuovo elemento"}
      </h2>

      {!isEditing && (
        <div className="flex gap-2">
          {(["ricambio", "cosmetica", "carrozzeria"] as Sezione[]).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => update("sezione", s)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm ${
                form.sezione === s ? "bg-gti-red text-white" : "bg-gti-charcoal text-gti-silver"
              }`}
            >
              {SEZIONE_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      <Field label="Codice">
        <input
          className="input-field"
          value={form.codice ?? ""}
          onChange={(e) => update("codice", e.target.value)}
        />
      </Field>

      <Field label="Descrizione *">
        <textarea
          required
          rows={3}
          className="input-field"
          value={form.descrizione}
          onChange={(e) => update("descrizione", e.target.value)}
        />
      </Field>

      <Field label="Categoria">
        {form.sezione === "carrozzeria" ? (
          <select
            className="input-field"
            value={form.categoria ?? ""}
            onChange={(e) => update("categoria", e.target.value)}
          >
            <option value="">Seleziona categoria...</option>
            {CATEGORIE_CARROZZERIA.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              className="input-field"
              list={form.sezione === "cosmetica" ? "categoria-suggestions" : undefined}
              placeholder={form.sezione === "cosmetica" ? "es. Interni, Esterni" : "es. Golf GTI Mk1"}
              value={form.categoria ?? ""}
              onChange={(e) => update("categoria", e.target.value)}
            />
            {form.sezione === "cosmetica" && (
              <datalist id="categoria-suggestions">
                <option value="Interni" />
                <option value="Esterni" />
              </datalist>
            )}
          </>
        )}
      </Field>

      <div className="flex gap-2">
        <Field label="Scaffale *" className="flex-1">
          <input
            required
            className="input-field"
            value={form.scaffale}
            onChange={(e) => update("scaffale", e.target.value)}
          />
        </Field>
        <Field label="Scatola" className="flex-1">
          <input
            className="input-field"
            value={form.scatola ?? ""}
            onChange={(e) => update("scatola", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Quantità">
        <input
          type="number"
          min={0}
          className="input-field"
          value={form.quantita ?? ""}
          onChange={(e) => update("quantita", e.target.value === "" ? null : Number(e.target.value))}
        />
      </Field>

      {form.sezione === "cosmetica" && (
        <>
          <Field label="Tipo prodotto">
            <input
              className="input-field"
              placeholder="es. cera, shampoo, lucidante"
              value={form.tipo_prodotto ?? ""}
              onChange={(e) => update("tipo_prodotto", e.target.value)}
            />
          </Field>
          <Field label="Scadenza">
            <input
              type="date"
              className="input-field"
              value={form.scadenza ?? ""}
              onChange={(e) => update("scadenza", e.target.value)}
            />
          </Field>
        </>
      )}

      <Field label="Note">
        <textarea
          rows={2}
          className="input-field"
          value={form.note ?? ""}
          onChange={(e) => update("note", e.target.value)}
        />
      </Field>

      {error && <p className="text-gti-red text-sm">{error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={saving}>
        {saving ? "Salvataggio..." : "Salva"}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block space-y-1 ${className ?? ""}`}>
      <span className="text-sm text-gti-silver font-semibold">{label}</span>
      {children}
    </label>
  );
}
