import type { NavLink } from '../types';
import packageJson from '../../package.json'

const NAV_LINKS: NavLink[] = [
  { id: 'sec-upload', icon: '📂', label: 'Cargar Archivo' },
  { id: 'sec-object', icon: '🔧', label: 'Objeto' },
  { id: 'sec-model', icon: '📋', label: 'Modelo / KB' },
  { id: 'sec-doc', icon: '📝', label: 'Documentación' },
  { id: 'sec-vars', icon: '📊', label: 'Variables' },
  { id: 'sec-attrs', icon: '🗄️', label: 'Atributos BD' },
  { id: 'sec-rules', icon: '📐', label: 'Reglas' },
  { id: 'sec-source', icon: '💻', label: 'Código Fuente' },
  /* { id: 'sec-events', icon: '🎯', label: 'Eventos' }, */
  /* { id: 'sec-cond', icon: '⚙️', label: 'Condiciones' }, */
  /* { id: 'sec-webform', icon: '🌐', label: 'Web Form' }, */
  /* { id: 'sec-layout', icon: '📄', label: 'Layout (Report)' }, */
];

interface SidebarProps {
  activeId: string;
  open: boolean;
  onNavigate: (id: string) => void;
}

export function Sidebar({ activeId, open, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="logo flex flex-col items-start gap-1 sm:gap-2">
        <h2 className="flex items-center gap-1.5 m-0 text-xl font-semibold leading-none">
          <svg
            width="20"
            height="35"
            viewBox="0 0 22 34"
            aria-hidden="true"
          >
            <path
              d="M7 8 L15 17 L7 26"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Orion
          <small style={{ fontSize: 11, color: 'var(--accent-orange)' }}>v{packageJson.version}</small>
        </h2>
        <span className="text-sm text-muted-foreground leading-snug">
          Visualización de Objetos XML y XPZ para GeneXus 8/9
        </span>
      </div>
      <nav>
        {NAV_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={activeId === link.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(link.id);
              document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </a>
        ))}
      </nav>
      <footer className="sidebar-footer">
        <div className="footer-content">
          <span>Developed by</span>
          <strong>CDPOP - CCANAR</strong>
        </div>

        <div className="footer-meta">
          <span>© Bantotal</span>
          <span className="heart">❤️</span>
        </div>
      </footer>
    </aside>
  );
}
