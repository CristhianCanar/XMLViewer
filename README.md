<div align="center">

# ⚡ GeneXus XML Viewer

### Visualizador web de objetos GeneXus exportados en XML

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![GeneXus](https://img.shields.io/badge/GeneXus-0078D4?style=for-the-badge&logoColor=white)

<br/>

**Carga, parsea y visualiza archivos `.xml` exportados desde GeneXus (`.xpz`) directamente en tu navegador.**
**Incluye syntax highlighting personalizado para código GeneXus.**

<br/>

[🚀 Demo en Vivo](#deploy-en-vercel) · [📋 Características](#-características) · [⚙️ Instalación](#️-instalación) · [🤝 Contribuir](#-contribuir)

</div>

---

## 📖 Descripción

**GeneXus XML Viewer** es una aplicación web 100% client-side que permite visualizar de forma organizada y con resaltado de sintaxis los archivos XML exportados desde GeneXus (procedimientos, transacciones, web panels, etc.).

Ideal para:
- 🔍 **Revisar código fuente** de objetos GeneXus sin abrir el IDE
- 📊 **Analizar variables y atributos** de forma rápida con búsqueda en vivo
- 📋 **Documentar y compartir** objetos GeneXus con tu equipo
- 🧪 **Auditar código** de forma visual desde cualquier navegador
- 🏦 **Equipos bancarios / financieros** que trabajan con Bantotal + GeneXus

---

## ✨ Características

| Característica | Descripción |
|---|---|
| 📂 **Drag & Drop** | Arrastra tu `.xml` o haz clic para seleccionar |
| 💻 **Syntax Highlighting** | Lenguaje GeneXus personalizado con highlight.js |
| 📊 **Tabla de Variables** | Todas las variables del objeto con búsqueda en vivo |
| 🗄️ **Tabla de Atributos** | Atributos de la KB con tipo, dominio y picture |
| 📐 **Reglas y Condiciones** | Sección dedicada para Rules y Conditions |
| 📝 **Documentación** | Parseo de la sección Documentation (Historia, Autor, etc.) |
| 📋 **Info del Modelo** | Modelo, KB Path, versión, build de GeneXus |
| 🔢 **Números de línea** | En el código fuente para fácil referencia |
| 📋 **Copiar código** | Botón para copiar el source code al clipboard |
| 🎨 **Tema oscuro** | Diseño tipo VS Code / GeneXus IDE |
| 📱 **Responsive** | Funciona en desktop, tablet y móvil |
| 🔗 **Sidebar navegable** | Acceso rápido a cada sección |
| 🔒 **100% Client-side** | No se envía ningún dato a servidores |

---

## 🎨 Syntax Highlighting GeneXus

El viewer registra un **lenguaje personalizado en highlight.js** que reconoce:

```
🟢 Keywords      → For Each, EndFor, If, Else, EndIf, Sub, EndSub,
                    Do While, EndDo, Do Case, Case, EndCase, Call,
                    Where, Defined By, Parm, Exit, Return

🔵 Variables     → &NombreVariable (patrón & + identificador)

🟠 Strings       → 'texto entre comillas simples'

🟣 Números       → 123, 45.67

⚪ Comentarios   → // comentario de línea

🟡 Funciones     → Val(), Trim(), CtoD(), DtoC(), NullValue(),
                    UserId(), Today(), Str(), Len(), Upper(), etc.

🔴 Operadores    → And, Or, Not, Like
```

---

## 📁 Estructura del Proyecto

```
gx-viewer/
├── index.html          # Aplicación completa (HTML + CSS + JS)
└── README.md           # Este archivo
```

> 💡 **¡Sí, es un solo archivo!** Todo está autocontenido en `index.html`.

---

## ⚙️ Instalación

### Uso local (sin instalar nada)

```bash
# Simplemente abre el archivo en tu navegador
open index.html
# o en Windows:
start index.html
```

### Con servidor local (opcional)

```bash
# Con Python
python -m http.server 8080

# Con Node.js
npx serve .

# Luego abre http://localhost:8080
```

---

## 🚀 Deploy en Vercel

### Opción 1: Vercel CLI

```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. Crea carpeta del proyecto
mkdir gx-viewer
cp gx_xml_viewer.html gx-viewer/index.html
cp README.md gx-viewer/

# 3. Despliega
cd gx-viewer
vercel
```

### Opción 2: GitHub + Vercel

```bash
# 1. Inicializa repo
git init
git add .
git commit -m "🚀 GeneXus XML Viewer"

# 2. Sube a GitHub
git remote add origin https://github.com/tu-usuario/gx-viewer.git
git push -u origin main

# 3. En vercel.com → Import → Selecciona el repo → Deploy ✅
```

### Opción 3: Vercel Dashboard

1. Ve a [vercel.com](https://vercel.com)
2. **Add New...** → **Project**
3. Importa tu repositorio de GitHub
4. Vercel detecta automáticamente que es un sitio estático
5. **Deploy** → ¡Listo! 🎉

---

## 📄 Formato XML Soportado

El viewer parsea la estructura estándar de exportación de GeneXus:

```xml
<ExportFile>
  <Model>           <!-- Info del modelo / KB -->
  <KMW>             <!-- Versión y path de la KB -->
  <GXObject>
    <Procedure>      <!-- o Transaction, WebPanel, etc. -->
      <Info>         <!-- Nombre, descripción -->
      <ObjInfo>      <!-- IsMain, propiedades -->
      <Documentation><!-- Historia del objeto -->
      <Variable>     <!-- Variables del objeto -->
      <Layout>
        <CodeBlock>
          <Source>   <!-- ✅ CÓDIGO FUENTE GENEXUS -->
      <Rules>        <!-- Reglas (Parm, etc.) -->
      <Conditions>   <!-- Condiciones -->
  <Attributes>       <!-- Atributos de la KB -->
</ExportFile>
```

Compatible con:
- ✅ GeneXus 9.0
- ✅ GeneXus X Evolution 1/2/3
- ✅ GeneXus 15 / 16 / 17 / 18
- ✅ Archivos `.xml` extraídos de `.xpz`

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura de la aplicación |
| **CSS3** | Diseño dark theme, responsive, animaciones |
| **JavaScript (Vanilla)** | Parseo XML con DOMParser, lógica de UI |
| **[highlight.js](https://highlightjs.org/)** | Syntax highlighting con lenguaje GeneXus custom |
| **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** | Fuente monoespaciada para código |
| **[Inter](https://fonts.google.com/specimen/Inter)** | Fuente UI |

---

## 🔧 Dependencias Externas (CDN)

```html
<!-- highlight.js -->
https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js
https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.min.css

<!-- Google Fonts -->
https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Inter
```

> ⚠️ Se requiere conexión a internet para cargar estas dependencias por CDN.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar el viewer:

1. 🍴 Haz **Fork** del repositorio
2. 🌿 Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. 💾 Haz commit: `git commit -m "✨ Agrego nueva funcionalidad"`
4. 📤 Push: `git push origin feature/nueva-funcionalidad`
5. 📩 Abre un **Pull Request**

### Ideas para contribuir:
- [ ] Soporte para WebPanels y Transactions (layout visual)
- [ ] Comparador de dos XMLs (diff)
- [ ] Exportar vista a PDF
- [ ] Modo claro (light theme)
- [ ] Grafo de dependencias (Calls)
- [ ] Soporte offline (service worker + CDN local)
- [ ] Internacionalización (EN/ES/PT)

---

## 📝 Licencia

Este proyecto está bajo la licencia **MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.

```
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

### Hecho con ❤️ para la comunidad GeneXus

⭐ Si te resulta útil, ¡dale una estrella al repo!

</div>
