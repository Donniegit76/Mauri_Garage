import { FormEvent, useState } from "react";
import { login } from "../api/client";

interface Props {
  onUnlocked: (token: string) => void;
}

export default function Lockscreen({ onUnlocked }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await login(password);
      onUnlocked(token);
    } catch {
      setError("Password errata");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen tartan-bg flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="text-center space-y-1">
          <div className="w-14 h-14 mx-auto rounded-full bg-gti-red border-2 border-white flex items-center justify-center">
            <span className="text-white font-black text-xl">MG</span>
          </div>
          <h1 className="text-lg font-black text-white">MAURI_GARAGE</h1>
          <p className="text-gti-silver text-sm">Inserisci la password per accedere</p>
        </div>
        <input
          type="password"
          autoFocus
          className="input-field text-center"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-gti-red text-sm text-center">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading || !password}>
          {loading ? "Verifica..." : "Entra in officina"}
        </button>
      </form>
    </div>
  );
}
