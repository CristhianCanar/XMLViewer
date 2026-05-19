import hljs from 'highlight.js/lib/core';

const GX_KEYWORDS = [
  'For', 'Each', 'EndFor', 'If', 'Else', 'EndIf', 'Do', 'While', 'EndDo',
  'Case', 'EndCase', 'Otherwise', 'Sub', 'EndSub', 'Call', 'Where',
  'Defined', 'By', 'Parm', 'Exit', 'Return', 'New', 'EndNew', 'Print',
  'When', 'Duplicate', 'Order', 'None', 'Using', 'Link', 'Blocking',
  'To', 'Step', 'From', 'In', 'Of', 'Then',
  'Msg', 'Confirm', 'Error', 'Event', 'EndEvent',
  'Fetch', 'First', 'Into', 'Unique',
];

const GX_BUILT_IN = [
  'Val', 'Str', 'Trim', 'LTrim', 'RTrim', 'Len', 'Upper', 'Lower',
  'CtoD', 'DtoC', 'CtoT', 'TtoC', 'Cdow', 'Cmonth',
  'NullValue', 'IsEmpty', 'IsNull',
  'UserId', 'Today', 'Now', 'ServerDate', 'ServerDatetime',
  'Udp', 'Int', 'Round', 'Abs', 'Mod', 'Max', 'Min',
  'Year', 'Month', 'Day', 'Hour', 'Minute', 'Second',
  'AddMth', 'AddYr', 'Age', 'Eom', 'TAdd', 'TDiff',
  'Concat', 'PadL', 'PadR', 'StrReplace', 'StrSearch', 'StrSearchRev',
  'RGZ', 'Format', 'Space', 'Repl', 'Substr',
  'ExcelDocument', 'ExcelCells', 'Open', 'Save', 'Close',
  'HttpClient', 'Execute', 'AddHeader', 'AddVariable',
  'XmlReader', 'XmlWriter', 'Read', 'ReadType', 'Write', 'WriteElement',
  'Commit', 'Rollback', 'Submit', 'Sleep', 'Shell', 'Link',
  'MsgBox', 'AddMsg', 'GXMLines', 'GXMLi',
  'ToXml', 'FromXml', 'ToString', 'ToNumeric',
  'Random', 'Iif', 'Type', 'GetMessage', 'SetLanguage',
];

const GX_LITERALS = ['True', 'False', 'true', 'false', 'Y', 'N'];

let registered = false;

export function registerGenexusLanguage(): void {
  if (registered) return;
  registered = true;

  hljs.registerLanguage('genexus', () => ({
    name: 'GeneXus',
    aliases: ['genexus', 'gx', 'gxprocedure'],
    case_insensitive: true,
    keywords: {
      keyword: GX_KEYWORDS.join(' '),
      built_in: GX_BUILT_IN.join(' '),
      literal: GX_LITERALS.join(' '),
    },
    contains: [
      { className: 'variable', begin: /&[A-Za-z_]\w*/ },
      { className: 'string', begin: /'/, end: /'/, contains: [{ begin: /''/ }] },
      { className: 'string', begin: /"/, end: /"/, contains: [{ begin: /""/ }] },
      hljs.COMMENT('//', '$'),
      { className: 'number', begin: /\b\d+(\.\d+)?\b/ },
      { className: 'operator', begin: /\b(And|Or|Not|Like)\b/i },
    ],
  }));
}

export function highlightGenexus(code: string): string {
  registerGenexusLanguage();
  return hljs.highlight(code, { language: 'genexus' }).value;
}
