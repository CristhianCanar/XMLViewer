export function getTag(parent: Element, tag: string): string {
  const el = parent.querySelector(tag);
  return el?.textContent?.trim() ?? '';
}

export function parseXmlDocument(xmlText: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlText, 'application/xml');
}

export function getParseError(doc: Document): string | null {
  const err = doc.querySelector('parsererror');
  return err?.textContent?.trim() ?? null;
}

export function normalizeXmlEncoding(xmlText: string): string {
  return xmlText.replace(/encoding=['"]iso-8859-1['"]/gi, 'encoding="UTF-8"');
}

export function decodeIso8859(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('iso-8859-1');
  return normalizeXmlEncoding(decoder.decode(buffer));
}
