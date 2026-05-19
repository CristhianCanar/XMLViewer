import { useMemo, useState, type ReactNode } from 'react';

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface SearchableTableProps<T extends { index: number }> {
  rows: T[];
  columns: TableColumn<T>[];
  searchPlaceholder: string;
  countLabel: string;
  emptyMessage: string;
  getSearchText: (row: T) => string;
}

export function SearchableTable<T extends { index: number }>({
  rows,
  columns,
  searchPlaceholder,
  countLabel,
  emptyMessage,
  getSearchText,
}: SearchableTableProps<T>) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((row) => getSearchText(row).toLowerCase().includes(q));
  }, [rows, query, getSearchText]);

  const countText = query
    ? `${filtered.length} de ${rows.length}`
    : `${rows.length} ${countLabel}`;

  return (
    <>
      <div className="search-box">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="count">{countText}</span>
      </div>
      <div className="table-wrap">
        <table className="gx-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.index}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className={col.className}>
                      {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
