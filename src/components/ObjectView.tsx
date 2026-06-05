import type { ObjectViewData } from '../types';
import { CollapsibleSection } from './CollapsibleSection';
import { CodeBlock } from './CodeBlock';
import { InfoGrid } from './InfoGrid';
import { SearchableTable } from './SearchableTable';

interface ObjectViewProps {
  data: ObjectViewData;
}

export function ObjectView({ data }: ObjectViewProps) {
  const sourceLines = data.sourceCode.trim()
    ? data.sourceCode.split('\n').length
    : 0;

  return (
    <>
      <CollapsibleSection id="sec-object" title="🔧 Información del Objeto" defaultOpen={true}>
        <InfoGrid items={[
          ...data.objectInfo,
          { label: '⚙️ Condiciones', value: data.conditions || 'Sin condiciones definidas.' }
        ]} />
      </CollapsibleSection>

      <CollapsibleSection id="sec-model" title="📋 Información del Modelo / KB" defaultOpen={true}>
        <InfoGrid items={data.modelInfo} emptyMessage="No se encontró información del modelo." />
      </CollapsibleSection>

      <CollapsibleSection id="sec-doc" title="📝 Documentación">
        <div className="doc-content">{data.documentation}</div>
      </CollapsibleSection>

      <CollapsibleSection id="sec-vars" title="📊 Variables">
        <SearchableTable
          rows={data.variables}
          columns={[
            { key: 'index', header: '#' },
            {
              key: 'name',
              header: 'Nombre',
              className: 'var-name',
              render: (r) => `&${r.name}`,
            },
            { key: 'title', header: 'Título' },
            { key: 'type', header: 'Tipo', className: 'type-col' },
            { key: 'length', header: 'Longitud', render: (r) => r.length || '—' },
            { key: 'decimals', header: 'Decimales', render: (r) => r.decimals || '—' },
            {
              key: 'picture',
              header: 'Picture',
              render: (r) => <code>{r.picture || '—'}</code>,
            },
            {
              key: 'basedOn',
              header: 'Basado En',
              render: (r) =>
                r.basedOn ? (
                  <span style={{ color: 'var(--accent-teal)' }}>{r.basedOn}</span>
                ) : (
                  '—'
                ),
            },
            {
              key: 'rows',
              header: 'Filas (para arrays)',
              render: (r) =>
                r.filas ? (
                  <span style={{ color: 'var(--accent-teal)' }}>{r.filas > 0 ? `[${r.filas}]` : ''}</span>
                ) : (
                  '—'
                ),
            },
          ]}
          searchPlaceholder="🔍 Buscar variable..."
          countLabel="variables"
          emptyMessage="No se encontraron variables en este objeto."
          getSearchText={(r) =>
            `${r.name} ${r.title} ${r.type} ${r.basedOn} ${r.picture}`
          }
        />
      </CollapsibleSection>

      <CollapsibleSection id="sec-attrs" title="🗄️ Atributos de la KB">
        <SearchableTable
          rows={data.attributes}
          columns={[
            { key: 'index', header: '#' },
            { key: 'name', header: 'Nombre', className: 'att-name' },
            { key: 'title', header: 'Título' },
            { key: 'type', header: 'Tipo', className: 'type-col', render: (r) => r.type || '—' },
            { key: 'length', header: 'Longitud', render: (r) => r.length || '—' },
            { key: 'decimals', header: 'Decimales', render: (r) => r.decimals || '—' },
            {
              key: 'domain',
              header: 'Dominio',
              render: (r) =>
                r.domain ? (
                  <span style={{ color: 'var(--accent-teal)' }}>{r.domain}</span>
                ) : (
                  '—'
                ),
            },
            {
              key: 'picture',
              header: 'Picture',
              render: (r) => <code>{r.picture || '—'}</code>,
            },
          ]}
          searchPlaceholder="🔍 Buscar atributo..."
          countLabel="atributos"
          emptyMessage="No se encontraron atributos en este XML."
          getSearchText={(r) =>
            `${r.name} ${r.title} ${r.type} ${r.domain} ${r.picture}`
          }
        />
      </CollapsibleSection>

      <CollapsibleSection id="sec-rules" title="📐 Reglas (Rules)">
        <CodeBlock
          code={data.rules}
          emptyMessage="// Sin reglas definidas."
          showCopy={false}
        />
      </CollapsibleSection>

      <CollapsibleSection id="sec-source" title="💻 Código Fuente">
        <CodeBlock
          code={data.sourceCode}
          hoverVariables={data.variables}
          emptyMessage="// Sin código fuente disponible"
          infoLabel={
            sourceLines > 0
              ? `${sourceLines} líneas — ${data.objectType}`
              : '0 líneas'
          }
        />
      </CollapsibleSection>

      {/*
        <CollapsibleSection id="sec-events" title="🎯 Eventos (WebPanel)">
          {data.objectType !== 'WebPanel' ? (
            <div className="no-aplica">
              📌 Los Eventos solo aplican para objetos de tipo <strong>WebPanel</strong>.
            </div>
          ) : !data.eventsCode ? (
            <div className="no-aplica">Sin eventos definidos en este WebPanel.</div>
          ) : (
            <CodeBlock
              code={data.eventsCode}
              infoLabel={`${data.eventsCode.split('\n').length} líneas de eventos`}
              copyLabel="📋 Copiar Eventos"
            />
          )}
        </CollapsibleSection> 
      */}


      {/* <CollapsibleSection id="sec-cond" title="⚙️ Condiciones">
        <div className="rules-code">
          {data.conditions || 'Sin condiciones definidas.'}
        </div>
      </CollapsibleSection> */}

      {/* 
      <CollapsibleSection id="sec-webform" title="🌐 Web Form">
        <WebFormSection data={data} />
      </CollapsibleSection>

      <CollapsibleSection id="sec-layout" title="📄 Layout (Report)">
        <LayoutSection data={data} />
      </CollapsibleSection> */}
      
    </>
  );
}

/* function WebFormSection({ data }: { data: ObjectViewData }) {
  if (data.objectType !== 'WebPanel') {
    return (
      <div className="no-aplica">
        📌 El Web Form solo aplica para objetos de tipo <strong>WebPanel</strong>.
      </div>
    );
  }

  const wf = data.webForm;
  if (!wf) {
    return <div className="no-aplica">Sin formulario web definido en este WebPanel.</div>;
  }

  const hasContent = wf.grids.length > 0 || wf.buttons.length > 0 || wf.labels.length > 0;

  if (!hasContent) {
    return (
      <div className="layout-card">
        <h4>🌐 Formulario Web Detectado</h4>
        <p>
          El formulario HTML contiene <strong>{wf.childCount}</strong> elementos de nivel
          superior.
        </p>
        <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 12 }}>
          El contenido del formulario está definido como HTML embebido en el XML.
        </p>
      </div>
    );
  }

  return (
    <>
      {wf.grids.length > 0 && (
        <>
          <h4 className="section-subtitle">📊 Grids Encontrados</h4>
          {wf.grids.map((g) => (
            <div key={g.name} className="wf-grid-card">
              <h4>📋 {g.name}</h4>
              {g.columns.length > 0 ? (
                <div className="col-list">
                  {g.columns.map((c) => (
                    <span key={c} className="col-tag">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  Columnas no especificadas en detalle en el XML
                </p>
              )}
            </div>
          ))}
        </>
      )}
      {wf.buttons.length > 0 && (
        <>
          <h4 className="section-subtitle mauve">🔘 Botones / Acciones</h4>
          <div className="wf-btn-list">
            {wf.buttons.map((b) => (
              <span key={b.id} className="wf-btn-tag" title={b.id}>
                {b.caption}
              </span>
            ))}
          </div>
        </>
      )}
      {wf.labels.length > 0 && (
        <>
          <h4 className="section-subtitle yellow">🏷️ Etiquetas de Texto</h4>
          <div className="wf-btn-list">
            {wf.labels.map((l) => (
              <span key={l} className="col-tag">
                {l}
              </span>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function LayoutSection({ data }: { data: ObjectViewData }) {
  if (data.objectType !== 'Report') {
    return (
      <div className="no-aplica">
        📌 El Layout solo aplica para objetos de tipo <strong>Report</strong>.
      </div>
    );
  }

  const layout = data.layout;
  if (!layout) {
    return (
      <div className="no-aplica">
        Sin información de Layout disponible en este Report.
      </div>
    );
  }

  const hasDetail =
    layout.paper || layout.printBlocks.length > 0 || layout.codeBlocks.length > 0;

  if (!hasDetail) {
    return (
      <div className="layout-card">
        <h4>📄 Layout del Report</h4>
        <p>
          El layout contiene <strong>{layout.childCount}</strong> elementos de nivel superior.
        </p>
      </div>
    );
  }

  return (
    <>
      {layout.paper && (
        <div className="layout-card">
          <h4>📏 Configuración del Papel</h4>
          <div>
            <span className="stat">
              <label>Tipo</label>
              <span>{layout.paper.type || '—'}</span>
            </span>
            <span className="stat">
              <label>Ancho</label>
              <span>{layout.paper.width || '—'}</span>
            </span>
            <span className="stat">
              <label>Alto</label>
              <span>{layout.paper.length || '—'}</span>
            </span>
          </div>
        </div>
      )}
      {layout.printBlocks.length > 0 && (
        <div className="layout-card">
          <h4>🖨️ Print Blocks ({layout.printBlocks.length})</h4>
          <div className="table-wrap">
            <table className="gx-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Controles</th>
                </tr>
              </thead>
              <tbody>
                {layout.printBlocks.map((pb) => (
                  <tr key={pb.index}>
                    <td>{pb.index}</td>
                    <td className="var-name">{pb.name}</td>
                    <td className="type-col">{pb.type}</td>
                    <td>{pb.controlCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {layout.codeBlocks.length > 0 && (
        <div className="layout-card">
          <h4>💻 Code Blocks en Layout ({layout.codeBlocks.length})</h4>
          {layout.codeBlocks.map((cb) => (
            <p key={cb.index}>
              Block {cb.index}:{' '}
              <span style={{ color: 'var(--accent-cyan)' }}>{cb.lineCount} líneas</span>
            </p>
          ))}
        </div>
      )}
    </>
  );
} */
