import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react';
import type { editor, IDisposable } from 'monaco-editor';
import type { AttributeRow, VariableRow } from '../types';
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
  monaco.languages.registerDefinitionProvider(GENEXUS_LANGUAGE_ID, {
    provideDefinition(model, position) {
      const line = model.getLineContent(position.lineNumber);
      DO_CALL_REGEX.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = DO_CALL_REGEX.exec(line))) {
        const literal = match[2] ?? '';
        const startColumn = match.index + match[0].indexOf(literal) + 1;
        const endColumn = startColumn + literal.length;

        if (position.column >= startColumn && position.column <= endColumn) {
          const targetName = normalizeSubroutineName(literal);
          const definitionLine = model
            .getLinesContent()
            .findIndex((lineContent, index) => {
              if (index + 1 === position.lineNumber) return false;

              const subMatch = lineContent.match(/^\s*Sub\s+['"]([^'"]+)['"]/i);
              return subMatch ? normalizeSubroutineName(subMatch[1]) === targetName : false;
            });

          if (definitionLine >= 0) {
            return [{
              uri: model.uri,
              range: new monaco.Range(definitionLine + 1, 1, definitionLine + 1, 1),
            }];
          }
          return null;
        }
      }

      return null;
    },
  });

  // Tema personalizado (oscuro)
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

  // Tema personalizado (claro)
  monaco.editor.defineTheme('genexus-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0B5394', fontStyle: 'bold' },
      { token: 'type.identifier', foreground: '385723' },
      { token: 'variable', foreground: '003366' },
      { token: 'constant', foreground: '295A2F' },
      { token: 'operator.word', foreground: '6A1B9A' },
      { token: 'string', foreground: 'A31515' },
      { token: 'string.escape', foreground: '795E26' },
      { token: 'number', foreground: '098658' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
    },
  });
}


// ── Constantes de tipografía ──
const FONT_SIZE = 14;
const LINE_HEIGHT = 20;
//const FONT_FAMILY = "'Cascadia Code', 'Fira Code', 'Consolas', 'Courier New', monospace";

// ── Constantes de tipografía ──
const PADDING_TOP = 8;
const PADDING_BOTTOM = 8;
const MIN_HEIGHT = 60;    // altura mínima en px
//const MAX_HEIGHT = 600;   // altura máxima en px (evita que explote)
const MAX_HEIGHT = window.innerHeight * 0.6;

interface SubroutineEntry {
  name: string;
  lineNumber: number;
}

const SUBROUTINE_REGEX = /^\s*Sub\s+['"]([^'"]+)['"]/im;
const DO_CALL_REGEX = /\bDo\s+(['"])([^'"]+)\1/gi;

function normalizeSubroutineName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function getSubroutines(code: string): SubroutineEntry[] {
  return code
    .split('\n')
    .map((line, index) => {
      const match = line.match(SUBROUTINE_REGEX);
      if (!match) return null;
      return { name: match[1], lineNumber: index + 1 };
    })
    .filter((entry): entry is SubroutineEntry => Boolean(entry));
}

// ── Función para calcular la altura ──
function calcEditorHeight(code: string): number {
  const lineCount = code.split('\n').length;
  const raw = lineCount * LINE_HEIGHT + PADDING_TOP + PADDING_BOTTOM;
  return Math.min(Math.max(raw, MIN_HEIGHT), MAX_HEIGHT);
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
  hoverVariables?: VariableRow[];
  hoverAtributos?: AttributeRow[];
}

// ── Componente ──
export function CodeBlock({
  code,
  emptyMessage = '// Sin código disponible',
  infoLabel,
  showCopy = true,
  copyLabel = '📋 Copiar Código',
  height,
  readOnly = true,
  hoverVariables = [],
  hoverAtributos = [],
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSubroutine, setSelectedSubroutine] = useState('');
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>(() => {
    if (typeof document !== 'undefined' && document.documentElement.dataset.theme === 'light') {
      return 'light';
    }
    return 'dark';
  });
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const hoverProviderRef = useRef<IDisposable | null>(null);
  const hoverVariablesRef = useRef<VariableRow[]>(hoverVariables);
  const hoverAtributosRef = useRef<AttributeRow[]>(hoverAtributos);

  useEffect(() => {
    hoverVariablesRef.current = hoverVariables;
  }, [hoverVariables]);

  useEffect(() => {
    hoverAtributosRef.current = hoverAtributos;
  }, [hoverAtributos]);

  const displayCode = code.trim() || emptyMessage;
  const subroutines = useMemo(() => getSubroutines(code), [code]);

  // Si no pasan height, se calcula automáticamente
  const editorHeight = height ?? `${calcEditorHeight(displayCode)}px`;

  useEffect(() => {
    return () => {
      if (hoverProviderRef.current) {
        hoverProviderRef.current.dispose();
        hoverProviderRef.current = null;
      }
    };
  }, []);

  // ✅ Se ejecuta ANTES de montar el editor → tema ya existe cuando Monaco lo necesita
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const updateTheme = () => {
      setAppTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  const registerHoverProvider = useCallback((monaco: typeof import('monaco-editor')) => {
    if (hoverProviderRef.current) {
      hoverProviderRef.current.dispose();
      hoverProviderRef.current = null;
    }

    const variables = hoverVariablesRef.current;
    const atributos = hoverAtributosRef.current;
    if (variables.length === 0 && atributos.length === 0) return;

    const variableMap = new Map<string, VariableRow>();
    variables.forEach((variable) => {
      variableMap.set(variable.name.toLowerCase(), variable);
    });

    const atributosMap = new Map<string, AttributeRow>();
    atributos.forEach((atributo) => {
      atributosMap.set(atributo.name.toLowerCase(), atributo);
    });

    hoverProviderRef.current = monaco.languages.registerHoverProvider(
      GENEXUS_LANGUAGE_ID,
      {
        provideHover(model, position) {
          const line = model.getLineContent(position.lineNumber);
          const variableRegex = /&?[A-Za-z_]\w*/g;
          let match: RegExpExecArray | null;
          let raw = '';
          let range: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; } | null = null;

          while ((match = variableRegex.exec(line))) {
            const startColumn = match.index + 1;
            const endColumn = startColumn + match[0].length;
            if (position.column >= startColumn && position.column <= endColumn) {
              raw = match[0];
              range = {
                startLineNumber: position.lineNumber,
                startColumn,
                endLineNumber: position.lineNumber,
                endColumn,
              };
              break;
            }
          }

          if (!range) {
            const word = model.getWordAtPosition(position);
            if (!word) return null;
            raw = word.word;
            range = {
              startLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endLineNumber: position.lineNumber,
              endColumn: word.endColumn,
            };
          }

          const name = raw.startsWith('&') ? raw.slice(1).toLowerCase() : raw.toLowerCase();
          const variable = variableMap.get(name);
          if (variable) {
            const lines = [
              `**&${variable.name}**`,
              `Tipo: \`${variable.type || '—'}\``,
              `Longitud: ${variable.length || '—'}`,
            ];
            if (variable.decimals) {
              lines.push(`Decimales: ${variable.decimals}`);
            }
            if (variable.picture) {
              lines.push(`Picture: \`${variable.picture}\``);
            }
            if (variable.basedOn) {
              lines.push(`Basado en: ${variable.basedOn}`);
            }
            if (variable.filas) {
              lines.push(`Filas: ${variable.filas}`);
            }

            return {
              contents: [{ value: lines.join('  \n') }],
              range,
            };
          }

          const atributo = atributosMap.get(name);
          if (atributo) {
            const linesDos = [
              `**${atributo.name}**`,
              `Tipo: \`${atributo.type || '—'}\``,
              `Longitud: ${atributo.length || '—'}`,
            ];
            if (atributo.decimals) {
              linesDos.push(`Decimales: ${atributo.decimals}`);
            }
            if (atributo.domain) {
              linesDos.push(`Dominio: ${atributo.domain}`);
            }
            if (atributo.picture) {
              linesDos.push(`Picture: \`${atributo.picture}\``);
            }

            return {
              contents: [{ value: linesDos.join('  \n') }],
              range,
            };
          }

          return null;
        },
      },
    );
  }, []);

  const handleBeforeMount: BeforeMount = useCallback((monaco) => {
    registerGenexusWithMonaco(monaco);
  }, []);


  // Se ejecuta cuando Monaco y el editor están listos
  const handleEditorMount: OnMount = useCallback((editorInstance, monaco) => {
    registerGenexusWithMonaco(monaco);
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

    // Cambiar el modelo al lenguaje GeneXus
    const model = editorInstance.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, GENEXUS_LANGUAGE_ID);
    }

    registerHoverProvider(monaco);
  }, [registerHoverProvider]);

  useEffect(() => {
    if (monacoRef.current) {
      registerHoverProvider(monacoRef.current);
    }
  }, [hoverVariables, registerHoverProvider]);

  const handleCopy = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubroutineJump = useCallback((lineNumber: number) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    if (!editor || !monaco) return;

    editor.setSelection(new monaco.Range(lineNumber, 1, lineNumber, 1));
    editor.revealLineInCenter(lineNumber);
    editor.focus();
  }, []);

  const handleSubroutineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLine = Number(event.target.value);
    if (!Number.isFinite(nextLine) || nextLine <= 0) {
      return;
    }

    handleSubroutineJump(nextLine);
    setSelectedSubroutine(event.target.value); // ← conserva el valor en lugar de limpiar

  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Barra superior: info + botón copiar */}
      {(infoLabel || showCopy || subroutines.length > 0) && (
        <div className="code-toolbar">
          <div className="code-toolbar-left">
            {infoLabel && <span className="info-label">{infoLabel}</span>}
            {subroutines.length > 0 && (
              <label className="subroutine-switcher">
                <span className="subroutine-label">Subrutinas</span>
                <select
                  className="subroutine-select"
                  value={selectedSubroutine}
                  onChange={handleSubroutineChange}
                  aria-label="Ir a una subrutina"
                >
                  <option value="">Ir a subrutina…</option>
                  {subroutines.map((sub) => (
                    <option key={`${sub.name}-${sub.lineNumber}`} value={sub.lineNumber}>
                      {sub.name} (línea {sub.lineNumber})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

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
        height={editorHeight}
        defaultLanguage={GENEXUS_LANGUAGE_ID}
        value={displayCode}
        theme={appTheme === 'light' ? 'genexus-light' : 'genexus-dark'}
        beforeMount={handleBeforeMount}   // ← Registra ANTES
        onMount={handleEditorMount}        // ← Referencia DESPUÉS
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