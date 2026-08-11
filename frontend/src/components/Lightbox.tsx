interface Props {
  src: string;
  onClose: () => void;
}

export default function Lightbox({ src, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img src={src} alt="" className="max-w-full max-h-full rounded-lg object-contain" />
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 text-white text-2xl leading-none flex items-center justify-center"
      >
        ×
      </button>
    </div>
  );
}
