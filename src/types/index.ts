export type FileFormat = 'XML' | 'XPZ';

export interface LoadedFileInfo {
  fileName: string;
  fileSize: number;
  format: FileFormat;
  xmlPaths?: string[];
}

export interface InfoItem {
  label: string;
  value: string;
}

export interface GXObjectSummary {
  index: number;
  type: string;
  name: string;
  description: string;
}

export interface VariableRow {
  index: number;
  name: string;
  title: string;
  type: string;
  length: string;
  decimals: string;
  picture: string;
  basedOn: string;
  filas: number; // >0 = array
}

export interface AttributeRow {
  index: number;
  name: string;
  title: string;
  type: string;
  length: string;
  decimals: string;
  domain: string;
  picture: string;
}

export interface WebFormGrid {
  name: string;
  columns: string[];
}

export interface WebFormButton {
  id: string;
  caption: string;
}

export interface WebFormData {
  grids: WebFormGrid[];
  buttons: WebFormButton[];
  labels: string[];
  childCount: number;
}

export interface PrintBlockRow {
  index: number;
  name: string;
  type: string;
  controlCount: number;
}

export interface LayoutCodeBlock {
  index: number;
  lineCount: number;
}

export interface LayoutData {
  paper?: { type: string; width: string; length: string };
  printBlocks: PrintBlockRow[];
  codeBlocks: LayoutCodeBlock[];
  childCount: number;
}

export interface ObjectViewData {
  objectType: string;
  objectName: string;
  modelInfo: InfoItem[];
  objectInfo: InfoItem[];
  documentation: string;
  variables: VariableRow[];
  sourceCode: string;
  eventsCode: string | null;
  rules: string;
  conditions: string;
  attributes: AttributeRow[];
  webForm: WebFormData | null;
  layout: LayoutData | null;
}

export interface ModalItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

export interface ModalState {
  title: string;
  description: string;
  items: ModalItem[];
  onSelect: (id: string) => void;
}

export interface NavLink {
  id: string;
  icon: string;
  label: string;
}
