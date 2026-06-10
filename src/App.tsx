import { useCallback, useEffect, useRef, useState } from 'react';
import { DropZone } from './components/DropZone';
import { FileInfoBar } from './components/FileInfoBar';
import { Modal } from './components/Modal';
import { ObjectView } from './components/ObjectView';
import { Sidebar } from './components/Sidebar';
import type {
  GXObjectSummary,
  LoadedFileInfo,
  ModalState,
  ObjectViewData,
} from './types';
import type { XmlFileEntry } from './utils/fileHandler';
import { processUploadedFile } from './utils/fileHandler';
import {
  buildObjectView,
  getAllGXObjects,
  getAnalyzableObjects,
} from './utils/xmlParser';
import { getParseError, parseXmlDocument } from './utils/xmlUtils';

function objectIcon(type: string): string {
  if (type === 'WebPanel') return '🌐';
  if (type === 'Report') return '📄';
  return '🔧';
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('sec-upload');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fileInfo, setFileInfo] = useState<LoadedFileInfo | null>(null);
  const [objectData, setObjectData] = useState<ObjectViewData | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  const xmlDocRef = useRef<Document | null>(null);
  const pendingFileInfoRef = useRef<LoadedFileInfo | null>(null);

  const renderObject = useCallback((doc: Document, summary: GXObjectSummary, info: LoadedFileInfo) => {
    const view = buildObjectView(doc, summary);
    setFileInfo(info);
    setObjectData(view);
    setModal(null);
    setActiveNav('sec-object');
    requestAnimationFrame(() => {
      document.getElementById('sec-object')?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const handleXmlContent = useCallback(
    (xmlText: string, info: LoadedFileInfo) => {
      const doc = parseXmlDocument(xmlText);
      const parseError = getParseError(doc);
      if (parseError) {
        alert(`Error al parsear el XML:\n${parseError}`);
        return;
      }

      xmlDocRef.current = doc;
      pendingFileInfoRef.current = info;

      const analyzable = getAnalyzableObjects(doc);
      if (analyzable.length === 0) {
        alert('No se encontraron objetos analizables (Procedure, Report o WebPanel).');
        return;
      }

      if (analyzable.length === 1) {
        renderObject(doc, analyzable[0], info);
        return;
      }

      const allObjects = getAllGXObjects(doc);
      setModal({
        title: '📦 Múltiples Objetos GX Detectados',
        description: `Se encontraron ${allObjects.length} objetos en el XML (${analyzable.length} analizables). Selecciona cuál deseas analizar:`,
        items: analyzable.map((obj) => ({
          id: String(obj.index),
          icon: objectIcon(obj.type),
          title: obj.name,
          subtitle: `${obj.type} — ${obj.description}`,
        })),
        onSelect: (id) => {
          const selected = analyzable.find((o) => String(o.index) === id);
          if (selected && xmlDocRef.current && pendingFileInfoRef.current) {
            const detailInfo: LoadedFileInfo = {
              ...pendingFileInfoRef.current,
              xmlPaths: [`${selected.name} (${selected.type})`],
            };
            renderObject(xmlDocRef.current, selected, detailInfo);
          }
        },
      });
    },
    [renderObject],
  );

  const handleFile = useCallback(
    async (file: File) => {
      const result = await processUploadedFile(file);

      if (result.kind === 'error') {
        alert(result.message);
        return;
      }

      if (result.kind === 'xml') {
        handleXmlContent(result.content, result.fileInfo);
        return;
      }

      const entries: XmlFileEntry[] = result.entries;
      setModal({
        title: '📦 Archivo XPZ Detectado',
        description:
          'Se encontraron varios archivos XML dentro del XPZ. Selecciona cuál deseas analizar:',
        items: await Promise.all(
          entries.map(async (entry) => ({
            id: entry.path,
            icon: '📄',
            title: entry.path,
            meta: `${((await entry.loadSize()) / 1024).toFixed(1)} KB`,
          })),
        ),
        onSelect: async (id) => {
          const entry = entries.find((e) => e.path === id);
          if (!entry) return;
          const content = await entry.loadContent();
          handleXmlContent(content, {
            ...result.fileInfo,
            xmlPaths: [entry.path],
          });
        },
      });
    },
    [handleXmlContent],
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleNavigate = (id: string) => {
    setActiveNav(id);
    setSidebarOpen(false);
  };

  const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="#EF9F27" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="#B4B2A9" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );

  return (
    <div className="app">
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Menú"
      >
        ☰
      </button>

      <Sidebar activeId={activeNav} open={sidebarOpen} onNavigate={handleNavigate} />

      <main className="main">
        <div className="theme-toggle">
          <button
            type="button"
            className="theme-button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            {/* {theme === 'dark' ? 'Tema Claro' : 'Tema Oscuro'} */}
          </button>
        </div>

        <section id="sec-upload">
          <DropZone onFile={handleFile} />
          {fileInfo && <FileInfoBar info={fileInfo} />}
        </section>

        {objectData && <ObjectView data={objectData} />}
      </main>

      <Modal modal={modal} onClose={() => setModal(null)} />
    </div>
  );
}
