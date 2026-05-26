import { useEffect, useMemo, useState } from 'react';
import { highlightGenexus } from '../utils/genexusLanguage';

interface CodeBlockProps {
  code: string;
  emptyMessage?: string;
  infoLabel?: string;
  showCopy?: boolean;
  copyLabel?: string;
}

type CodeLine = {
  type: 'line';
  html: string;
  lineNumber: number;
};

type CodeSection = {
  type: 'section';
  titleHtml: string;
  lineNumber: number;
  id: string;
  children: CodeNode[];
};

type CodeNode = CodeLine | CodeSection;

const SECTION_STARTERS = [
  { regex: /^\s*Sub\b/i, endToken: 'EndSub' },
  { regex: /^\s*Do\s+Case\b/i, endToken: 'EndDo' },
  { regex: /^\s*Do\s+While\b/i, endToken: 'EndDo' },
  { regex: /^\s*Do\b/i, endToken: 'EndDo' },
  { regex: /^\s*For\b/i, endToken: 'EndFor' },
  { regex: /^\s*Each\b/i, endToken: 'EndFor' },
  { regex: /^\s*If\b/i, endToken: 'EndIf' },
  { regex: /^\s*Case\b/i, endToken: 'EndCase' },
];

const SECTION_ENDERS = [
  { regex: /^\s*EndSub\b/i, token: 'EndSub' },
  { regex: /^\s*EndDo\b/i, token: 'EndDo' },
  { regex: /^\s*EndFor\b/i, token: 'EndFor' },
  { regex: /^\s*EndIf\b/i, token: 'EndIf' },
  { regex: /^\s*EndCase\b/i, token: 'EndCase' },
];

function getSectionStart(rawLine: string) {
  return SECTION_STARTERS.find((starter) => starter.regex.test(rawLine));
}

function getSectionEnd(rawLine: string) {
  return SECTION_ENDERS.find((ender) => ender.regex.test(rawLine));
}

function buildNodes(rawLines: string[], highlightedLines: string[]) {
  const nodes: CodeNode[] = [];
  const stack: Array<CodeSection & { endToken: string }> = [];

  const getHtml = (index: number) => highlightedLines[index] ?? rawLines[index];

  for (let i = 0; i < rawLines.length; i += 1) {
    const raw = rawLines[i];
    const html = getHtml(i);
    const currentParent = stack.length ? stack[stack.length - 1].children : nodes;
    const start = getSectionStart(raw);
    const end = getSectionEnd(raw);

    if (start) {
      const section: CodeSection & { endToken: string } = {
        type: 'section',
        titleHtml: html,
        lineNumber: i + 1,
        id: `section-${i + 1}-${stack.length}`,
        children: [],
        endToken: start.endToken,
      };

      currentParent.push(section);
      stack.push(section);
      continue;
    }

    if (end && stack.length && end.token === stack[stack.length - 1].endToken) {
      currentParent.push({ type: 'line', html, lineNumber: i + 1 });
      stack.pop();
      continue;
    }

    currentParent.push({ type: 'line', html, lineNumber: i + 1 });
  }

  return nodes;
}

function renderNodes(nodes: CodeNode[]) {
  return nodes.map((node) => {
    if (node.type === 'line') {
      return (
        <div className="code-row" key={`line-${node.lineNumber}`}>
          <span className="code-line-number" aria-hidden="true">
            {node.lineNumber}
          </span>
          <span className="code-line-content" dangerouslySetInnerHTML={{ __html: node.html }} />
        </div>
      );
    }

    return <CodeSectionNode key={node.id} section={node} />;
  });
}

function CodeSectionNode({ section }: { section: CodeSection }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`code-section${collapsed ? ' collapsed' : ''}`}>
      <button
        type="button"
        className="code-row code-section-header"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span className="code-line-number" aria-hidden="true">
          {section.lineNumber}
        </span>
        <span className="code-line-content" dangerouslySetInnerHTML={{ __html: section.titleHtml }} />
        <span className="code-section-toggle">{collapsed ? '▶' : '▼'}</span>
      </button>
      <div className="code-section-body">{renderNodes(section.children)}</div>
    </div>
  );
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
  const rawLines = displayCode.split('\n');
  const highlightedLines = useMemo(() => highlightGenexus(displayCode).split('\n'), [displayCode]);
  const codeNodes = useMemo(() => buildNodes(rawLines, highlightedLines), [rawLines, highlightedLines]);

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
          {rawLines.map((_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <pre className="code-lines">{renderNodes(codeNodes)}</pre>
      </div>
    </>
  );
}
