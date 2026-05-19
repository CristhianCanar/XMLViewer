import type { NavLink } from '../types';

const NAV_LINKS: NavLink[] = [
  { id: 'sec-upload', icon: '📂', label: 'Cargar Archivo' },
  { id: 'sec-model', icon: '📋', label: 'Modelo / KB' },
  { id: 'sec-object', icon: '🔧', label: 'Objeto' },
  { id: 'sec-doc', icon: '📝', label: 'Documentación' },
  { id: 'sec-vars', icon: '📊', label: 'Variables' },
  { id: 'sec-source', icon: '💻', label: 'Código Fuente' },
  { id: 'sec-events', icon: '🎯', label: 'Eventos' },
  { id: 'sec-rules', icon: '📐', label: 'Reglas' },
  { id: 'sec-cond', icon: '⚙️', label: 'Condiciones' },
  { id: 'sec-attrs', icon: '🗄️', label: 'Atributos' },
  { id: 'sec-webform', icon: '🌐', label: 'Web Form' },
  { id: 'sec-layout', icon: '📄', label: 'Layout (Report)' },
];

interface SidebarProps {
  activeId: string;
  open: boolean;
  onNavigate: (id: string) => void;
}

export function Sidebar({ activeId, open, onNavigate }: SidebarProps) {
  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      <div className="logo">
        <h2>
          ⚡ GX Viewer GeneXus 9
          <small style={{ fontSize: 11, color: 'var(--accent-orange)' }}>v3</small>
        </h2>
        <span>GeneXus XML / XPZ Object Viewer</span>
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
    </aside>
  );
}
