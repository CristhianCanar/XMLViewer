import { useEffect, useState } from 'react';
import { highlightGenexus } from '../utils/genexusLanguage';

interface CodeBlockProps {
  code: string;
  emptyMessage?: string;
  infoLabel?: string;
  showCopy?: boolean;
  copyLabel?: string;
}

export function CodeBlock({
  code,
  emptyMessage = '// Sin código disponible',
  infoLabel,
  showCopy = true,
  copyLabel = '📋 Copiar Código',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const displayCode = code.trim() || emptyMessage;
  const lines = displayCode.split('\n');

  useEffect(() => {
    setCopied(false);
  }, [code]);

  const handleCopy = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {(infoLabel || showCopy) && (
        <div className="code-toolbar">
          {infoLabel && <span className="info-label">{infoLabel}</span>}
          {showCopy && code.trim() && (
            <button
              type="button"
              className={`btn-copy${copied ? ' copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✅ Copiado!' : copyLabel}
            </button>
          )}
        </div>
      )}
      <div className="code-container">
        <div className="line-numbers" aria-hidden="true">
          {lines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre>
          <code
            className="language-genexus"
            dangerouslySetInnerHTML={{ __html: highlightGenexus(displayCode) }}
          />
        </pre>
      </div>
    </>
  );
}
