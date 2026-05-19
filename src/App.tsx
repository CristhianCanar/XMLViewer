import { useCallback, useRef, useState } from 'react';
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
import { registerGenexusLanguage } from './utils/genexusLanguage';
import {
  buildObjectView,
  getAllGXObjects,
  getAnalyzableObjects,
} from './utils/xmlParser';
import { getParseError, parseXmlDocument } from './utils/xmlUtils';

registerGenexusLanguage();

function objectIcon(type: string): string {
  if (type === 'WebPanel') return '🌐';
  if (type === 'Report') return '📄';
  return '🔧';
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('sec-upload');
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
    setActiveNav('sec-model');
    requestAnimationFrame(() => {
      document.getElementById('sec-model')?.scrollIntoView({ behavior: 'smooth' });
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

  const handleNavigate = (id: string) => {
    setActiveNav(id);
    setSidebarOpen(false);
  };

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
