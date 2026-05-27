import { useRef, useState, useCallback } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
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


// ── Constantes de tipografía ──
const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
//const FONT_FAMILY = "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace";


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

  
  // ✅ Se ejecuta ANTES de montar el editor → tema ya existe cuando Monaco lo necesita
  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerGenexusWithMonaco(monaco);
  }, []);


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
        theme="genexus-dark"
        beforeMount={handleBeforeMount}   // ← Registra ANTES
        onMount={handleEditorMount}        // ← Referencia DESPUÉ
        options={{
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          readOnly,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          //fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          domReadOnly: readOnly,
          contextmenu: true,
          folding: true,
          renderLineHighlight: 'line',
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
      />

      {/* Contenedor aislado para evitar herencia de CSS */}
      {/* <div
        style={{
          height,
          border: '1px solid #333',
          borderRadius: '4px',
          overflow: 'hidden',
          lineHeight: 'normal',  // ← Reset crítico
          fontSize: 'initial',   // ← Reset crítico
        }}
      >
        <Editor
          height="100%"
          defaultLanguage={GENEXUS_LANGUAGE_ID}
          value={displayCode}
          theme="genexus-dark"
          onMount={handleEditorMount}
          options={{
            readOnly,
            domReadOnly: readOnly,
            // ─── Tipografía sincronizada ───
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            fontFamily: FONT_FAMILY,
            fontLigatures: false,
            // ─── Layout ───
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            // ─── Líneas ───
            lineNumbers: 'on',
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            glyphMargin: false,
            folding: true,
            renderLineHighlight: 'line',
            // ─── Padding ───
            padding: { top: 8, bottom: 8 },
            // ─── Scroll ───
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            contextmenu: true,
          }}
        />
      </div> */}

    </div>
  );
}