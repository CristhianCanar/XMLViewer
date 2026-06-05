/**
 * Lee un File como ArrayBuffer y lo decodifica respetando el encoding
 * declarado en el XML (<?xml ... encoding="ISO-8859-1"?>).
 * Si no encuentra declaración, prueba UTF-8 primero y hace fallback a ISO-8859-1.
 */
export async function readFileWithEncoding(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return decodeBufferWithEncoding(buffer);
}

export function decodeBufferWithEncoding(buffer: ArrayBuffer): string {
  const header = new TextDecoder('ascii').decode(buffer.slice(0, 200));
  const declaredEncoding = detectXmlEncoding(header);

  if (declaredEncoding) {
    return new TextDecoder(declaredEncoding, { fatal: false }).decode(buffer);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('iso-8859-1').decode(buffer);
  }
}

/**
 * Extrae el encoding de la declaración <?xml ... encoding="xxx" ?>
 */
function detectXmlEncoding(header: string): string | null {
  const match = header.match(/<\?xml[^?]*encoding=["']([^"']+)["']/i);
  if (!match) return null;

  const enc = match[1].trim().toLowerCase();

  // Mapear nombres comunes a los que TextDecoder acepta
  const encodingMap: Record<string, string> = {
    'iso-8859-1':    'iso-8859-1',
    'latin1':        'iso-8859-1',
    'latin-1':       'iso-8859-1',
    'windows-1252':  'windows-1252',
    'cp1252':        'windows-1252',
    'utf-8':         'utf-8',
    'us-ascii':      'utf-8',
    'ascii':         'utf-8',
  };

  return encodingMap[enc] ?? enc;
}