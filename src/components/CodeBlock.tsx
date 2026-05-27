import { useRef, useState, useCallback } from 'react';
import Editor, { type OnMount, loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import {
  GENEXUS_LANGUAGE_ID,
  genexusLanguageConfig,
  genexusMonarchTokens,
} from '../utils/genexusLanguage';

// ── Registrar el lenguaje GeneXus una sola vez ──
let languageRegistered = false;

function registerGenexusWithMonaco(monaco: typeof import('monaco-editor')) {
  if (languageRegistered) return;
  languageRegistered = true;

  monaco.languages.register({ id: GENEXUS_LANGUAGE_ID });
  monaco.languages.setLanguageConfiguration(GENEXUS_LANGUAGE_ID, genexusLanguageConfig);
  monaco.languages.setMonarchTokensProvider(GENEXUS_LANGUAGE_ID, genexusMonarchTokens);

  // Tema personalizado (opcional, ajustable a tu gusto)
  monaco.editor.defineTheme('genexus-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'type.identifier', foreground: 'DCDCAA' },   // built-ins
      { token: 'variable', foreground: '9CDCFE' },   // &variables
      { token: 'constant', foreground: 'B5CEA8' },   // literals
      { token: 'operator.word', foreground: 'C586C0' },   // And/Or/Not/Like
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.escape', foreground: 'D7BA7D' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#1E1E2E',
    },
  });
}

// ── Props ──
interface CodeBlockProps {
  code: string;
  emptyMessage?: string;
  infoLabel?: string;
  showCopy?: boolean;
  copyLabel?: string;
  height?: string;
  readOnly?: boolean;
}

// ── Componente ──
export function CodeBlock({
  code,
  emptyMessage = '// Sin código disponible',
  infoLabel,
  showCopy = true,
  copyLabel = '📋 Copiar Código',
  height = '500px',
  readOnly = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const displayCode = code.trim() || emptyMessage;

  // Se ejecuta cuando Monaco y el editor están listos
  const handleEditorMount: OnMount = useCallback((editorInstance, monaco) => {
    registerGenexusWithMonaco(monaco);
    editorRef.current = editorInstance;

    // Cambiar el modelo al lenguaje GeneXus
    const model = editorInstance.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, GENEXUS_LANGUAGE_ID);
    }
  }, []);

  const handleCopy = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Barra superior: info + botón copiar */}
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

      {/* Monaco Editor */}
      <Editor
        height={height}
        defaultLanguage={GENEXUS_LANGUAGE_ID}
        value={displayCode}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          domReadOnly: readOnly,
          contextmenu: true,
          folding: true,
          renderLineHighlight: 'line',
        }}
      />
    </div>
  );
}