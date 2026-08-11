import { ChangeEvent, useRef, useState } from "react";
import type { Photo } from "../api/types";
import { deletePhoto, photoUrl, uploadPhoto } from "../api/client";
import Lightbox from "./Lightbox";

interface Props {
  itemId: number;
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
}

export default function PhotoUploader({ itemId, photos, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const photo = await uploadPhoto(itemId, file);
      onChange([...photos, photo]);
    } catch {
      setError("Caricamento foto non riuscito");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(photoId: number) {
    if (!confirm("Eliminare questa foto?")) return;
    await deletePhoto(photoId);
    onChange(photos.filter((p) => p.id !== photoId));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border border-gti-steel/30">
            <img
              src={photoUrl(photo.filename)}
              alt=""
              onClick={() => setLightboxSrc(photoUrl(photo.filename))}
              className="w-full h-full object-cover cursor-pointer"
            />
            <button
              type="button"
              onClick={() => handleDelete(photo.id)}
              className="absolute top-1 right-1 bg-black/70 text-white w-7 h-7 rounded-full text-sm font-bold"
              aria-label="Elimina foto"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
        {uploading ? "Caricamento..." : "Aggiungi foto"}
      </label>
      {error && <p className="text-gti-red text-sm">{error}</p>}

      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
    </div>
  );
}
