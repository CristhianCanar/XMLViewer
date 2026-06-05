import { useState, type ReactNode } from 'react';

interface CollapsibleSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  maxHeight?: string;
}

export function CollapsibleSection({
  id,
  title,
  children,
  defaultOpen = false,
  maxHeight = '80vh',
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(!defaultOpen);

  return (
    <section className={`section${collapsed ? ' collapsed' : ''}`} id={id}>
      <button
        type="button"
        className={`section-header${collapsed ? ' collapsed' : ''}`}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <h3>{title}</h3>
        <span className="toggle">▼</span>
      </button>
      <div className="section-body" style={{ maxHeight, overflowY: 'auto' }}>
        {children}
      </div>
    </section>
  );
}
