import type {
  AttributeRow,
  GXObjectSummary,
  InfoItem,
  LayoutData,
  ObjectViewData,
  VariableRow,
  WebFormData,
} from '../types';
import { getTag } from './xmlUtils';

const ANALYZABLE_TYPES = ['Procedure', 'Report', 'WebPanel'];

export function getAllGXObjects(doc: Document): GXObjectSummary[] {
  const objects: GXObjectSummary[] = [];
  doc.querySelectorAll('GXObject').forEach((gxObj, index) => {
    const child = gxObj.firstElementChild;
    if (!child) return;
    const info = child.querySelector('Info');
    objects.push({
      index,
      type: child.tagName,
      name: info ? getTag(info, 'Name') : '',
      description: info ? getTag(info, 'Description') : '',
    });
  });
  return objects;
}

export function getAnalyzableObjects(doc: Document): GXObjectSummary[] {
  return getAllGXObjects(doc).filter((o) => ANALYZABLE_TYPES.includes(o.type));
}

function findObjectElement(doc: Document, summary: GXObjectSummary): Element | null {
  const gxObjects = doc.querySelectorAll('GXObject');
  const gxObj = gxObjects[summary.index];
  return gxObj?.firstElementChild ?? null;
}

export function buildObjectView(doc: Document, summary: GXObjectSummary): ObjectViewData {
  const obj = findObjectElement(doc, summary);
  const objType = summary.type;

  return {
    objectType: objType,
    objectName: summary.name,
    modelInfo: extractModelInfo(doc),
    objectInfo: extractObjectInfo(obj, objType),
    documentation: extractDocumentation(doc),
    variables: extractVariables(obj),
    sourceCode: extractSourceCode(doc, obj, objType),
    eventsCode: extractEventsCode(obj, objType),
    rules: extractRules(obj),
    conditions: extractConditions(obj),
    attributes: extractAttributes(doc),
    webForm: extractWebForm(obj, objType),
    layout: extractLayout(obj, objType),
  };
}

function extractModelInfo(doc: Document): InfoItem[] {
  const items: InfoItem[] = [];
  const model = doc.querySelector('Model');
  const kmw = doc.querySelector('KMW');

  if (model) {
    items.push(
      { label: 'Modelo', value: getTag(model, 'Name') },
      { label: 'Tipo', value: getTag(model, 'Type') },
      { label: 'ID', value: getTag(model, 'Id') },
      { label: 'Att Length', value: getTag(model, 'AttLen') },
      { label: 'Table Length', value: getTag(model, 'TblLen') },
      { label: 'Object Length', value: getTag(model, 'ObjLen') },
      { label: 'Nulls Behavior', value: getTag(model, 'NullsBehavior') },
    );
  }

  if (kmw) {
    items.push(
      {
        label: 'Versión KMW',
        value: `${getTag(kmw, 'MajorVersion')}.${getTag(kmw, 'MinorVersion')}`,
      },
      { label: 'Max GX Build', value: getTag(kmw, 'MaxGxBuildSaved') },
      { label: 'KB Path', value: getTag(kmw, 'Path') },
    );
  }

  return items;
}

function extractObjectInfo(obj: Element | null, objType: string): InfoItem[] {
  if (!obj) return [];

  const objInfo = obj.querySelector('ObjInfo');
  const info = obj.querySelector('Info');
  const name = info ? getTag(info, 'Name') : '';
  const desc = info ? getTag(info, 'Description') : '';
  const isMain = objInfo ? getTag(objInfo, 'IsMain') : '';
  const lastUpdate = getTag(obj, 'LastUpdate');
  const isMainLabel = isMain === 'Y' ? 'Sí' : 'No';

  return [
    { label: 'Tipo Objeto', value: objType },
    { label: 'Nombre', value: name },
    { label: 'Descripción', value: desc },
    { label: 'Es Main (IsMain)', value: isMainLabel },
    { label: 'Última Actualización', value: lastUpdate },
  ];
}

function extractDocumentation(doc: Document): string {
  const docEl = doc.querySelector('Documentation > Source');
  if (!docEl) return 'Sin documentación disponible.';

  let html = docEl.textContent ?? '';
  html = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/<BR\s*\/?>/gi, '\n')
    .replace(/<\/?P>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();

  return html || 'Sin documentación disponible.';
}

function inferVariableType(
  length: string,
  decimals: string,
  picture: string,
  basedOn: string,
): string {
  if (basedOn) return 'BasedOn';
  if (length && parseInt(decimals, 10) > 0) return 'Numeric';
  if (length) return 'Character';
  if (picture.includes('9')) return 'Numeric';
  return 'Var';
}

function extractVariables(obj: Element | null): VariableRow[] {
  if (!obj) return [];

  const rows: VariableRow[] = [];
  let i = 0;

  obj.querySelectorAll(':scope > Variable').forEach((v) => {
    i++;
    const name = getTag(v, 'Name');
    const title = getTag(v, 'Title');
    const length = getTag(v, 'Length');
    const decimals = getTag(v, 'Decimals');
    const picture = getTag(v, 'Picture');
    const basedOn = getTag(v, 'BasedOn');
    const filas: number = getTag(v, 'Rows') ? parseInt(getTag(v, 'Rows'), 10) : 0;

    rows.push({
      index: i,
      name,
      title,
      type: inferVariableType(length, decimals, picture, basedOn),
      length,
      decimals,
      picture,
      basedOn,
      filas
    });
  });

  return rows;
}

function extractSourceCode(doc: Document, obj: Element | null, objType: string): string {
  let sourceText = '';
  doc.querySelectorAll('CodeBlock > Source').forEach((s) => {
    const t = s.textContent?.trim() ?? '';
    if (t) sourceText += (sourceText ? '\n' : '') + t;
  });

  if (!sourceText && objType === 'WebPanel' && obj) {
    const eventsEl = obj.querySelector('Events');
    sourceText = eventsEl?.textContent?.trim() ?? '';
  }

  return sourceText;
}

function extractEventsCode(obj: Element | null, objType: string): string | null {
  if (objType !== 'WebPanel') return null;
  const eventsEl = obj?.querySelector('Events');
  return eventsEl?.textContent?.trim() ?? '';
}

function extractRules(obj: Element | null): string {
  const rulesEl = obj?.querySelector('Rules');
  return rulesEl?.textContent?.trim() ?? '';
}

function extractConditions(obj: Element | null): string {
  const condEl = obj?.querySelector('Conditions');
  return condEl?.textContent?.trim() ?? '';
}

function extractAttributes(doc: Document): AttributeRow[] {
  const rows: AttributeRow[] = [];
  let i = 0;

  doc.querySelectorAll('Attributes > GXAtt').forEach((gxatt) => {
    const att = gxatt.querySelector('Attribute');
    if (!att) return;
    i++;
    const attInfoEl = gxatt.querySelector('AttInfo');
    rows.push({
      index: i,
      name: getTag(att, 'Name'),
      title: getTag(att, 'Title'),
      type: getTag(att, 'Type'),
      length: getTag(att, 'Length'),
      decimals: getTag(att, 'Decimals'),
      domain: attInfoEl ? getTag(attInfoEl, 'Domain') : '',
      picture: getTag(att, 'Picture'),
    });
  });

  return rows;
}

function extractWebForm(obj: Element | null, objType: string): WebFormData | null {
  if (objType !== 'WebPanel' || !obj) return null;

  const htmlForm = obj.querySelector('HTMLForm');
  if (!htmlForm) return null;

  const grids: WebFormData['grids'] = [];
  const buttons: WebFormData['buttons'] = [];
  const labels: string[] = [];

  htmlForm.querySelectorAll('HTMLControl').forEach((ctrl) => {
    const ctrlType =
      ctrl.getAttribute('ControlIdType') || getTag(ctrl, 'ControlIdType') || '';
    const ctrlName =
      ctrl.getAttribute('ControlName') || getTag(ctrl, 'ControlName') || '';
    const caption = ctrl.getAttribute('Caption') || getTag(ctrl, 'Caption') || '';

    if (
      ctrlType === 'HTMLSFL' ||
      ctrlType === 'Grid' ||
      ctrlName.toLowerCase().includes('grid')
    ) {
      const colTitles: string[] = [];
      ctrl.querySelectorAll('ChildProperties > Property, ColProperty').forEach((cp) => {
        const colTitle = cp.getAttribute('ColTitle') || getTag(cp, 'ColTitle') || '';
        if (colTitle) colTitles.push(colTitle);
      });
      ctrl.querySelectorAll('Column, Col').forEach((col) => {
        const ct =
          col.getAttribute('ColTitle') ||
          col.getAttribute('Title') ||
          getTag(col, 'ColTitle') ||
          getTag(col, 'Title') ||
          '';
        if (ct && !colTitles.includes(ct)) colTitles.push(ct);
      });
      grids.push({ name: ctrlName || 'Grid', columns: colTitles });
    }

    if (
      ctrlType === 'BUTTON' ||
      ctrlType === 'IMAGE' ||
      (ctrlName &&
        (ctrlName.toLowerCase().startsWith('btn') ||
          ctrlName.toLowerCase().includes('button')))
    ) {
      buttons.push({ id: ctrlName, caption: caption || ctrlName });
    }

    if ((ctrlType === 'TEXTBLOCK' || ctrlType === 'TEXT') && caption) {
      labels.push(caption);
    }
  });

  if (grids.length === 0) {
    htmlForm.querySelectorAll('[ControlIdType="HTMLSFL"]').forEach((ctrl) => {
      grids.push({
        name: ctrl.getAttribute('ControlName') || 'Grid',
        columns: [],
      });
    });
  }

  const formText = htmlForm.textContent ?? '';
  const spanRegex = /id="([^"]*(?:btn|BTN|BUTTON|button)[^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = spanRegex.exec(formText)) !== null) {
    const btnId = match[1];
    if (!buttons.find((b) => b.id === btnId)) {
      buttons.push({ id: btnId, caption: btnId });
    }
  }

  return {
    grids,
    buttons,
    labels,
    childCount: htmlForm.children.length,
  };
}

function extractLayout(obj: Element | null, objType: string): LayoutData | null {
  if (objType !== 'Report' || !obj) return null;

  const layout = obj.querySelector('Layout');
  if (!layout) return null;

  const data: LayoutData = {
    printBlocks: [],
    codeBlocks: [],
    childCount: layout.children.length,
  };

  const paper = layout.querySelector('Paper');
  // Convierte medidas a píxeles
  // Asumiendo que SizeX y SizeY vienen en milímetros.
  // Fórmula: px = (mm * 96) / 25.4
  const toPx = (value: string | null) => {
    const pixeles = parseFloat(value || '0');
    return (pixeles) / 10;
  };

  if (paper) {
    const sizeX = getTag(paper, 'SizeX') || paper.getAttribute('SizeX') || '0';
    const sizeY = getTag(paper, 'SizeY') || paper.getAttribute('SizeY') || '0';

    data.paper = {
      type: getTag(paper, 'PaperId') || paper.getAttribute('PaperId') || '',
      //width: getTag(paper, 'SizeX') + ' px' || paper.getAttribute('SizeX') + ' px' || '0',
      //length: getTag(paper, 'SizeY') + ' px' || paper.getAttribute('SizeY') + ' px' || '0'
      // valores en píxeles
      width: String(toPx(sizeX)) + ' px',
      length: String(toPx(sizeY)) + ' px',
    };
  }

  layout.querySelectorAll('PrintBlock').forEach((pb, i) => {
    data.printBlocks.push({
      index: i + 1,
      name: pb.getAttribute('Name') || getTag(pb, 'Name') || `Block ${i + 1}`,
      type: pb.getAttribute('Type') || getTag(pb, 'Type') || '—',
      controlCount: pb.querySelectorAll('Control, PrintControl, HTMLControl').length,
    });
  });

  layout.querySelectorAll('CodeBlock').forEach((cb, i) => {
    const src = cb.querySelector('Source');
    const srcText = src?.textContent?.trim() ?? '';
    data.codeBlocks.push({
      index: i + 1,
      lineCount: srcText ? srcText.split('\n').length : 0,
    });
  });

  return data;
}
