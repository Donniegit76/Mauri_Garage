import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg font-bold text-base whitespace-nowrap ${
    isActive ? "bg-gti-red text-white" : "text-gti-silver hover:bg-white/10"
  }`;

export default function Header() {
  return (
    <header>
      <div className="tartan-bg px-4 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gti-red border-2 border-white flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white font-black text-lg leading-none">MG</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white leading-none">
              MAURI<span className="text-gti-red">_</span>GARAGE
            </h1>
            <p className="text-[11px] text-gti-silver uppercase tracking-widest">
              Officina &amp; Catalogo Ricambi
              <span className="text-gti-steel normal-case tracking-normal"> · v{__APP_VERSION__}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="tartan-divider" />
      <nav className="flex gap-2 overflow-x-auto bg-gti-black px-3 py-2">
        <NavLink to="/" end className={linkClass}>
          Ricambi
        </NavLink>
        <NavLink to="/car-detailing" className={linkClass}>
          Car_Detailing
        </NavLink>
        <NavLink to="/carrozzeria" className={linkClass}>
          Carrozzeria
        </NavLink>
        <NavLink to="/scaffali" className={linkClass}>
          Scaffali
        </NavLink>
        <NavLink to="/items/new" className={linkClass}>
          + Nuovo
        </NavLink>
      </nav>
    </header>
  );
}
