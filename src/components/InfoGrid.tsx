import type { InfoItem } from '../types';

interface InfoGridProps {
  items: InfoItem[];
  emptyMessage?: string;
}

export function InfoGrid({ items, emptyMessage = 'Sin información disponible.' }: InfoGridProps) {
  if (items.length === 0) {
    return <div className="no-aplica">{emptyMessage}</div>;
  }

  return (
    <div className="info-grid">
      {items.map((item) => (
        <div key={item.label} className="info-item">
          <label>{item.label}</label>
          {item.label === 'Nombre' ? (
            <span className="highlight-name">{item.value || '—'}</span>
          ) : item.label === 'Tipo Objeto' ? (
            <span className="badge badge-type">{item.value}</span>
          ) : item.label === 'Es Main (IsMain)' ? (
            <span className={`badge ${item.value === 'Sí' ? 'badge-yes' : 'badge-no'}`}>
              {item.value === 'Sí' ? '✔ Sí' : '✘ No'}
            </span>
          ) : (
            <span>{item.value || '—'}</span>
          )}
        </div>
      ))}
    </div>
  );
}
