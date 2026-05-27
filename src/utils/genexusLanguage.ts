import type { languages } from 'monaco-editor';

export const GENEXUS_LANGUAGE_ID = 'genexus';

export const genexusLanguageConfig: languages.LanguageConfiguration = {
  comments: {
    lineComment: '//',
  },
  brackets: [
    ['(', ')'],
    ['[', ']'],
  ],
  autoClosingPairs: [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: "'", close: "'" },
    { open: '"', close: '"' },
  ],
  surroundingPairs: [
    { open: '(', close: ')' },
    { open: "'", close: "'" },
    { open: '"', close: '"' },
  ],
};

export const genexusMonarchTokens: languages.IMonarchLanguage = {
  ignoreCase: true,

  keywords: [
    'For', 'Each', 'EndFor', 'If', 'Else', 'EndIf', 'Do', 'While', 'EndDo',
    'Case', 'EndCase', 'Otherwise', 'Sub', 'EndSub', 'Call', 'Where',
    'Defined', 'By', 'Parm', 'Exit', 'Return', 'New', 'EndNew', 'Print',
    'When', 'Duplicate', 'Order', 'None', 'Using', 'Link', 'Blocking',
    'To', 'Step', 'From', 'In', 'Of', 'Then',
    'Msg', 'Confirm', 'Error', 'Event', 'EndEvent',
    'Fetch', 'First', 'Into', 'Unique',
  ],

  builtins: [
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
  ],

  literals: ['True', 'False', 'Y', 'N'],

  operators: ['And', 'Or', 'Not', 'Like'],

  tokenizer: {
    root: [
      // Comentarios de línea
      [/\/\/.*$/, 'comment'],

      // Variables GeneXus (&Variable)
      [/&[A-Za-z_]\w*/, 'variable'],

      // Strings con comilla simple
      [/'/, 'string', '@stringSingle'],

      // Strings con comilla doble
      [/"/, 'string', '@stringDouble'],

      // Números
      [/\b\d+(\.\d+)?\b/, 'number'],

      // Identificadores y palabras clave
      [/[A-Za-z_]\w*/, {
        cases: {
          '@keywords': 'keyword',
          '@builtins': 'type.identifier',
          '@literals': 'constant',
          '@operators': 'operator.word',
          '@default': 'identifier',
        },
      }],

      // Espacios en blanco
      [/\s+/, 'white'],

      // Operadores y delimitadores
      [/[=<>!+\-*/%]+/, 'operator'],
      [/[()[\],;.]/, 'delimiter'],
    ],

    stringSingle: [
      [/''/, 'string.escape'],       // escape de comilla simple
      [/[^']+/, 'string'],
      [/'/, 'string', '@pop'],
    ],

    stringDouble: [
      [/""/, 'string.escape'],       // escape de comilla doble
      [/[^"]+/, 'string'],
      [/"/, 'string', '@pop'],
    ],
  },
};