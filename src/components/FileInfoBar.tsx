import type { LoadedFileInfo } from '../types';

interface FileInfoBarProps {
  info: LoadedFileInfo;
}

export function FileInfoBar({ info }: FileInfoBarProps) {
  const badgeClass = info.format === 'XPZ' ? 'badge-xpz' : 'badge-xml';
  const badgeLabel = info.format === 'XPZ' ? '📦 XPZ' : '📄 XML';
  const extra =
    info.xmlPaths && info.xmlPaths.length > 0
      ? ` — XML: ${info.xmlPaths.join(', ')}`
      : '';

  return (
    <div className="file-info">
      <strong>✅ {info.fileName}</strong> — {(info.fileSize / 1024).toFixed(1)} KB{' '}
      <span className={`badge-format ${badgeClass}`}>{badgeLabel}</span>
      {extra && (
        <>
          {' '}
          — <em>{info.xmlPaths?.join(', ')}</em>
        </>
      )}{' '}
      — Cargado correctamente
    </div>
  );
}
