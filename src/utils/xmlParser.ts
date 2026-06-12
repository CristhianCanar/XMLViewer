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

function isGx16Export(doc: Document): boolean {
  return doc.querySelector('ExportFile > Objects > Object') !== null;
}

function getDependenciesMap(doc: Document): Map<string, { name: string; type: string; packageName: string }> {
  const map = new Map<string, { name: string; type: string; packageName: string }>();

  doc.querySelectorAll('ExportFile > Dependencies > Reference').forEach((ref) => {
    const id = ref.getAttribute('Id') || ref.getAttribute('id') || '';
    const type = ref.getAttribute('Type') || '';
    const props = ref.querySelector('Properties');

    if (!id) return;

    map.set(id, {
      name: props?.getAttribute('Name') || '',
      type,
      packageName: props?.getAttribute('PackageName') || '',
    });
  });

  return map;
}

function getObjectsIdentityMap(doc: Document): Map<string, string> {
  const map = new Map<string, string>();

  doc.querySelectorAll('ExportFile > ObjectsIdentityMapping > ObjectIdentity').forEach((identity) => {
    const guid = identity.querySelector('Guid')?.textContent?.trim() || '';
    const name = identity.getAttribute('Name') || '';

    if (guid) {
      map.set(guid, name);
    }
  });

  return map;
}

function resolveObjectType(typeId: string, dependencies: Map<string, { name: string; type: string; packageName: string }>): string {
  const dependency = dependencies.get(typeId);
  return dependency?.name || typeId;
}

function getDependencyReference(doc: Document, type: 'Object' | 'Part', id?: string, name?: string) {
  const refs = Array.from(doc.querySelectorAll('ExportFile > Dependencies > Reference'));

  return refs.find((ref) => {
    const refType = ref.getAttribute('Type') || '';
    const refId = ref.getAttribute('Id') || '';
    const properties = ref.querySelector('Properties');
    const refName = properties?.getAttribute('Name') || '';

    return refType === type && (!id || refId === id) && (!name || refName === name);
  });
}

function getPartIdByName(doc: Document, name: string): string {
  const ref = getDependencyReference(doc, 'Part', undefined, name);
  return ref?.getAttribute('Id') || '';
}

function resolveGuidName(guid: string | null | undefined, identityMap: Map<string, string>): string {
  if (!guid) return '';
  return identityMap.get(guid) || guid;
}

function getGx16ObjectElements(doc: Document): Element[] {
  return Array.from(doc.querySelectorAll('ExportFile > Objects > Object'));
}

export function getAllGXObjects(doc: Document): GXObjectSummary[] {
  if (isGx16Export(doc)) {
    const dependencies = getDependenciesMap(doc);
    const identityMap = getObjectsIdentityMap(doc);

    return getGx16ObjectElements(doc).map((objectEl, index) => {
      const typeId = objectEl.getAttribute('type') || '';
      const parentGuid = objectEl.getAttribute('parentGuid') || objectEl.getAttribute('parent') || '';

      return {
        index,
        type: resolveObjectType(typeId, dependencies) || typeId || 'Object',
        name: objectEl.getAttribute('name') || objectEl.getAttribute('fullyQualifiedName') || '',
        description: objectEl.getAttribute('description') || '',
        guid: objectEl.getAttribute('guid') || '',
        parentGuid,
        parentName: resolveGuidName(parentGuid, identityMap),
      };
    });
  }

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
  if (isGx16Export(doc)) {
    return getGx16ObjectElements(doc)[summary.index] ?? null;
  }

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
    objectInfo: extractObjectInfo(obj, objType, summary),
    documentation: extractDocumentation(doc, obj),
    variables: extractVariables(doc, obj),
    sourceCode: extractSourceCode(doc, obj, objType),
    eventsCode: extractEventsCode(obj, objType),
    rules: extractRules(doc, obj),
    conditions: extractConditions(doc, obj),
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

function extractObjectInfo(obj: Element | null, objType: string, summary?: GXObjectSummary): InfoItem[] {
  if (!obj) return [];

  if (isGx16Export(obj.ownerDocument)) {
    const lastUpdate = obj.getAttribute('lastUpdate') || '';
    const fullyQualified = obj.getAttribute('fullyQualifiedName') || '';
    const guid = obj.getAttribute('guid') || '';
    const parentGuid = obj.getAttribute('parentGuid') || '';

    return [
      { label: 'Tipo Objeto', value: objType },
      { label: 'Nombre', value: obj.getAttribute('name') || '' },
      { label: 'Nombre completo', value: fullyQualified },
      { label: 'Descripción', value: obj.getAttribute('description') || '' },
      { label: 'GUID', value: guid },
      { label: 'Parent GUID', value: parentGuid || summary?.parentName || '' },
      { label: 'Última Actualización', value: lastUpdate },
    ].filter((item) => item.value !== '');
  }

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

function extractDocumentation(doc: Document, obj?: Element | null): string {
  if (obj && isGx16Export(doc)) {
    const documentationPartId = getPartIdByName(doc, 'Documentation');
    const documentationPart = documentationPartId
      ? obj.querySelector(`Part[type="${documentationPartId}"]`)
      : null;
    const innerHtml = documentationPart?.querySelector('InnerHtml')?.textContent ?? '';

    if (innerHtml) {
      return innerHtml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/<BR\s*\/?>/gi, '\n')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

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

function extractVariables(doc: Document, obj: Element | null): VariableRow[] {
  if (!obj) return [];

  const rows: VariableRow[] = [];
  let i = 0;

  if (isGx16Export(doc)) {
    const variablesPartId = getPartIdByName(doc, 'Variables');
    const variablesPart = variablesPartId
      ? obj.querySelector(`Part[type="${variablesPartId}"]`)
      : null;
    const variableNodes = variablesPart ? variablesPart.querySelectorAll(':scope > Variable') : obj.querySelectorAll(':scope > Variable');

    variableNodes.forEach((v) => {
      i++;
      const name = v.getAttribute('Name') || '';
      const title = v.getAttribute('Title') || '';
      const length = v.querySelector('Length')?.textContent?.trim() || '';
      const decimals = v.querySelector('Decimals')?.textContent?.trim() || '';
      const picture = v.querySelector('Picture')?.textContent?.trim() || '';
      const basedOn = v.querySelector('BasedOn')?.textContent?.trim() || '';
      const filas = v.querySelector('Rows')?.textContent?.trim() ? parseInt(v.querySelector('Rows')?.textContent?.trim() ?? '0', 10) : 0;

      rows.push({
        index: i,
        name,
        title,
        type: inferVariableType(length, decimals, picture, basedOn),
        length,
        decimals,
        picture,
        basedOn,
        filas,
      });
    });

    return rows;
  }

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
  if (obj && isGx16Export(doc)) {
    const sourcePartId = getPartIdByName(doc, 'Source');
    const sourcePart = sourcePartId
      ? obj.querySelector(`Part[type="${sourcePartId}"]`)
      : null;
    const sourceText = sourcePart?.querySelector('Source')?.textContent?.trim() ?? '';
    if (sourceText) return sourceText;

    const allSources = Array.from(obj.querySelectorAll('Part > Source'))
      .map((s) => s.textContent?.trim() ?? '')
      .filter(Boolean);

    return allSources.join('\n\n');
  }

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

function extractRules(doc: Document, obj: Element | null): string {
  if (obj && isGx16Export(doc)) {
    const rulesPartId = getPartIdByName(doc, 'Rules');
    const rulesPart = rulesPartId
      ? obj.querySelector(`Part[type="${rulesPartId}"]`)
      : null;
    return rulesPart?.querySelector('Source')?.textContent?.trim() ?? '';
  }

  const rulesEl = obj?.querySelector('Rules');
  return rulesEl?.textContent?.trim() ?? '';
}

function extractConditions(doc: Document, obj: Element | null): string {
  if (obj && isGx16Export(doc)) {
    const conditionsPartId = getPartIdByName(doc, 'Conditions');
    const conditionsPart = conditionsPartId
      ? obj.querySelector(`Part[type="${conditionsPartId}"]`)
      : null;
    return conditionsPart?.querySelector('Source')?.textContent?.trim() ?? '';
  }

  const condEl = obj?.querySelector('Conditions');
  return condEl?.textContent?.trim() ?? '';
}

function extractAttributes(doc: Document): AttributeRow[] {
  const rows: AttributeRow[] = [];
  let i = 0;

  if (isGx16Export(doc)) {
    doc.querySelectorAll('ExportFile > Attributes > Attribute').forEach((att) => {
      i++;
      const name = att.getAttribute('name') || att.getAttribute('fullyQualifiedName') || '';
      const description = att.getAttribute('description') || '';
      const type = att.querySelector('Properties > Property > Name') ? '' : '';

      rows.push({
        index: i,
        name,
        title: description,
        type: type || 'Attribute',
        length: '',
        decimals: '',
        domain: '',
        picture: '',
      });
    });

    return rows;
  }

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
