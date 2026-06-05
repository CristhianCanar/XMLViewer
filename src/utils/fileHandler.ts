import JSZip from 'jszip';
import type { LoadedFileInfo } from '../types';
import { normalizeXmlEncoding } from './xmlUtils';
import { decodeBufferWithEncoding, readFileWithEncoding } from './fileDecoder';

export interface XmlFileEntry {
  path: string;
  loadContent: () => Promise<string>;
  loadSize: () => Promise<number>;
}

export async function processUploadedFile(
  file: File,
): Promise<
  | { kind: 'xml'; content: string; fileInfo: LoadedFileInfo }
  | { kind: 'xpz-select'; entries: XmlFileEntry[]; fileInfo: LoadedFileInfo }
  | { kind: 'error'; message: string }
> {
  const name = file.name.toLowerCase();
  const isXpz = name.endsWith('.xpz');
  const isXml = name.endsWith('.xml');

  if (!isXpz && !isXml) {
    return { kind: 'error', message: 'Por favor selecciona un archivo .xml o .xpz' };
  }

  if (isXml) {
    const text = await readXmlFile(file);
    return {
      kind: 'xml',
      content: text,
      fileInfo: {
        fileName: file.name,
        fileSize: file.size,
        format: 'XML',
      },
    };
  }

  try {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const entries: XmlFileEntry[] = [];

    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && relativePath.toLowerCase().endsWith('.xml')) {
        entries.push({
          path: relativePath,
          loadContent: async () => {
            const buffer = await zipEntry.async('arraybuffer');
            return normalizeXmlEncoding(decodeBufferWithEncoding(buffer));
          },
          loadSize: async () => {
            const data = await zipEntry.async('uint8array');
            return data.length;
          },
        });
      }
    });

    if (entries.length === 0) {
      return { kind: 'error', message: 'No se encontraron archivos XML dentro del XPZ.' };
    }

    const fileInfo: LoadedFileInfo = {
      fileName: file.name,
      fileSize: file.size,
      format: 'XPZ',
    };

    if (entries.length === 1) {
      const content = await entries[0].loadContent();
      return {
        kind: 'xml',
        content,
        fileInfo: { ...fileInfo, xmlPaths: [entries[0].path] },
      };
    }

    return { kind: 'xpz-select', entries, fileInfo };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { kind: 'error', message: `Error al descomprimir el archivo XPZ:\n${message}` };
  }
}

async function readXmlFile(file: File): Promise<string> {
  const text = await readFileWithEncoding(file);
  return normalizeXmlEncoding(text);
}
