export type Sezione = "ricambio" | "cosmetica" | "carrozzeria";

export const CATEGORIE_CARROZZERIA = [
  "Bombolette",
  "Vernice",
  "Trasparente",
  "Diluente",
  "Stucchi e Fondi",
  "Additivi",
  "Abrasivi",
] as const;

export interface Photo {
  id: number;
  filename: string;
  data_caricamento: string;
}

export interface Item {
  id: number;
  sezione: Sezione;
  codice?: string | null;
  descrizione: string;
  categoria?: string | null;
  scaffale: string;
  scatola?: string | null;
  quantita?: number | null;
  note?: string | null;
  tipo_prodotto?: string | null;
  scadenza?: string | null;
  data_inserimento: string;
  data_modifica: string;
  photos: Photo[];
}

export interface ItemListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Item[];
}

export interface ItemInput {
  sezione: Sezione;
  codice?: string | null;
  descrizione: string;
  categoria?: string | null;
  scaffale: string;
  scatola?: string | null;
  quantita?: number | null;
  note?: string | null;
  tipo_prodotto?: string | null;
  scadenza?: string | null;
}

export interface ScaffaleSummary {
  scaffale: string;
  numero_items: number;
  numero_scatole: number;
}

export interface ScatolaGroup {
  scatola: string;
  items: Item[];
}

export interface ScaffaleGroup {
  scaffale: string;
  scatole: ScatolaGroup[];
}

export interface SearchFilters {
  search?: string;
  sezione?: Sezione;
  categoria?: string;
  scaffale?: string;
  scatola?: string;
  page?: number;
  page_size?: number;
}
