interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <input
      type="search"
      className="input-field"
      placeholder={placeholder ?? "Cerca per codice o descrizione..."}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
