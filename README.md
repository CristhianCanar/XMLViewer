# ⚡ GeneXus XML Viewer

Visualizador web de objetos GeneXus exportados en **XML** y **XPZ**, construido con **React + TypeScript + Vite**.

## Características

- Carga de archivos `.xml` y `.xpz` (drag & drop)
- Descompresión de XPZ con selección cuando hay varios XML
- Selector de objetos cuando el XML contiene múltiples `GXObject`
- Secciones: Modelo/KB, Objeto, Documentación, Variables, Código, Eventos, Reglas, Condiciones, Atributos, Web Form, Layout
- Syntax highlighting GeneXus (highlight.js)
- Tema oscuro responsive
- 100% client-side (sin backend)

## Requisitos

- Node.js 18+

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

Los archivos estáticos quedan en `dist/`.

## Estructura

```
XMLViewer/
├── src/
│   ├── App.tsx              # Orquestación principal
│   ├── components/          # UI (Sidebar, DropZone, ObjectView, etc.)
│   ├── utils/               # Parser XML, XPZ, highlight GeneXus
│   └── types/               # Tipos TypeScript
├── index.html               # Entrada Vite
├── package.json
├── vite.config.ts
└── mejorado_v3.html         # Versión HTML monolítica original (referencia)
```

## Deploy (Vercel / Netlify)

- **Build command:** `npm run build`
- **Output directory:** `dist`

## Licencia

MIT
