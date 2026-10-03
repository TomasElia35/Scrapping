'use strict';

/**
 * Prompt de sintesis: cruza los sitios de referencia (competencia que le gustó al cliente)
 * para extraer la estetica en comun, y usa el sitio del cliente -si hay- como base
 * de estructura, contenido y funcionalidad.
 */

const table = (rows) => {
  const out = [`| ${rows[0].join(' | ')} |`, `| ${rows[0].map(() => '---').join(' | ')} |`];
  rows.slice(1).forEach((r) => out.push(`| ${r.map((c) => (c === null || c === undefined || c === '' ? '—' : String(c).replace(/\|/g, '/'))).join(' | ')} |`));
  return out.join('\n') + '\n';
};

/** Cuenta en cuántos sitios aparece cada valor y cuánto se usa en total. */
function consensus(sites, getter, opts) {
  const o = opts || {};
  const map = new Map();
  sites.forEach((s) => {
    const seen = new Set();
    (getter(s) || []).forEach((item) => {
      const value = typeof item === 'string' ? item : item.value;
      const count = typeof item === 'string' ? 1 : item.count || 1;
      if (!value) return;
      const key = o.normalize ? o.normalize(value) : value;
      if (!map.has(key)) map.set(key, { display: new Map(), sites: new Set(), usage: 0 });
      const e = map.get(key);
      e.display.set(value, (e.display.get(value) || 0) + count);
      e.usage += count;
      if (!seen.has(key)) {
        e.sites.add(s.name);
        seen.add(key);
      }
    });
  });
  return Array.from(map.values())
    .map((e) => ({
      value: Array.from(e.display.entries()).sort((a, b) => b[1] - a[1])[0][0],
      variants: Array.from(e.display.keys()),
      sites: Array.from(e.sites),
      siteCount: e.sites.size,
      usage: e.usage,
    }))
    .sort((a, b) => b.siteCount - a.siteCount || b.usage - a.usage);
}

/** Agrupa colores parecidos: redondea cada canal para que #fff y #fefefe caigan juntos. */
function colorBucket(hex) {
  const m = String(hex).match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return String(hex);
  const q = (h) => Math.round(parseInt(h, 16) / 24) * 24;
  return `${q(m[1])},${q(m[2])},${q(m[3])}`;
}

const isNeutral = (hex) => {
  const m = String(hex).match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (!m) return false;
  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
  return Math.max(r, g, b) - Math.min(r, g, b) <= 22;
};

const pxOnly = (list) =>
  list.filter((x) => /^[\d.]+px$/.test(x.value) && parseFloat(x.value) > 0).sort((a, b) => parseFloat(a.value) - parseFloat(b.value));

const shareLabel = (n, total) => `${n}/${total}`;

/* ------------------------------------------------------------------ */

module.exports = function buildSynthesis(results, opts) {
  const o = opts || {};
  const ok = results.filter((r) => r && r.ok);
  const refs = ok.filter((r) => r.role !== 'cliente');
  const clients = ok.filter((r) => r.role === 'cliente');
  const client = clients[0] || null;
  const total = refs.length;
  const L = [];

  L.push('# Prompt de síntesis — estética de referencias + estructura del cliente');
  L.push('');
  L.push(`_Generado el ${o.generatedAt || new Date().toISOString()} a partir de ${ok.length} sitio(s) analizado(s)._`);
  L.push('');
  L.push('> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación.');
  L.push('');

  if (!total) {
    L.push('**No hay sitios de referencia marcados.** Marcá al menos uno con `@referencia` en `links.txt` (o desde la interfaz) para poder sintetizar una estética en común.');
    L.push('');
    return L.join('\n');
  }

  /* ---- 0. quién es quién ---- */
  L.push('## 0. Punto de partida');
  L.push('');
  L.push(
    table(
      [
        ['Rol', 'Sitio', 'Qué aporta al proyecto'],
        ...(client ? [['Cliente', client.name, 'Estructura, contenido, funcionalidad y línea base a superar']] : []),
        ...clients.slice(1).map((c) => ['Cliente (adicional)', c.name, 'Estructura y contenido complementarios']),
        ...refs.map((r) => ['Referencia', r.name, 'Estética: color, tipografía, espaciado, componentes y movimiento']),
      ]
    )
  );
  if (!client) {
    L.push('No se analizó ningún sitio del cliente, así que la estructura sale del consenso de las referencias. Si el cliente tiene un sitio actual, marcalo con `@cliente` y volvé a correr el análisis para que la especificación respete su arquitectura de información y sus integraciones.');
    L.push('');
  }
  if (o.brief && o.brief.text) {
    L.push('### Pedido del cliente (tiene prioridad sobre todo lo demás)');
    L.push('');
    L.push(`_Fuente: ${o.brief.file}_`);
    L.push('');
    o.brief.text.split(/\r?\n/).forEach((line) => L.push(line.replace(/^#{1,6}\s+/, '**')));
    L.push('');
  }
  L.push('**Regla de oro:** replicar el *lenguaje visual* de las referencias, no su contenido. Nada de logos, marcas, fotos, textos ni nombres de producto de los sitios analizados. Cualquier coincidencia literal con una referencia es un error.');
  L.push('');

  /* ---- 1. objetivo ---- */
  L.push('## 1. Objetivo');
  L.push('');
  L.push(
    `Construir una aplicación web con una estética coherente con las ${total} referencia(s) analizada(s)` +
      (client ? `, replicando la arquitectura de información y las funcionalidades de **${client.name}**` : '') +
      ', con mejor rendimiento y accesibilidad que todos los sitios analizados.'
  );
  L.push('');

  /* ---- 2. estética en común ---- */
  L.push('## 2. Estética en común entre las referencias');
  L.push('');
  L.push('Cada valor indica en cuántas referencias aparece. Lo que está en la mayoría define el estilo; lo que aparece en una sola es una opción, no una regla.');
  L.push('');

  /* colores */
  const bgs = consensus(refs, (r) => (r.palette.backgroundsAll || []).slice(0, 10), { normalize: colorBucket });
  const texts = consensus(refs, (r) => (r.palette.textColorsAll || []).slice(0, 8), { normalize: colorBucket });
  const sharedNeutrals = bgs.filter((x) => isNeutral(x.value) && x.siteCount > 1).slice(0, 6);
  const accents = bgs.filter((x) => !isNeutral(x.value)).slice(0, 10);

  L.push('### 2.1 Color');
  L.push('');
  L.push('**Neutros compartidos** (base de superficies y texto):');
  L.push('');
  L.push(table([['Color', 'Referencias', 'Usos totales', 'Dónde'], ...sharedNeutrals.map((x) => [`\`${x.value}\``, shareLabel(x.siteCount, total), x.usage, x.sites.join(', ')])]));
  L.push('**Acentos de cada referencia** (elegir uno como color de marca, o el que indique el cliente):');
  L.push('');
  L.push(table([['Color', 'Referencias', 'Usos', 'Dónde'], ...accents.map((x) => [`\`${x.value}\``, shareLabel(x.siteCount, total), x.usage, x.sites.join(', ')])]));
  L.push('**Colores de texto más usados:**');
  L.push('');
  L.push(table([['Color', 'Referencias', 'Usos', 'Dónde'], ...texts.slice(0, 6).map((x) => [`\`${x.value}\``, shareLabel(x.siteCount, total), x.usage, x.sites.join(', ')])]));
  L.push('Definir la paleta como variables CSS con roles (`--surface`, `--surface-alt`, `--text`, `--text-muted`, `--accent`, `--border`), no como colores sueltos. Todo par texto/fondo debe cumplir WCAG AA (4.5:1 en texto normal, 3:1 en texto grande) — ver sección 6.');
  L.push('');

  /* tipografía */
  const fams = consensus(refs, (r) => (r.typography.fontFamiliesAll || []).slice(0, 6));
  const sizes = pxOnly(consensus(refs, (r) => r.typography.fontSizesAll || []));
  const weights = consensus(refs, (r) => r.typography.fontWeights || []);
  const lineHeights = consensus(refs, (r) => (r.typography.lineHeights || []).filter((x) => !/^0px$/.test(x.value)));

  L.push('### 2.2 Tipografía');
  L.push('');
  L.push(table([['Familia', 'Referencias', 'Usos', 'Dónde'], ...fams.slice(0, 8).map((x) => [x.value, shareLabel(x.siteCount, total), x.usage, x.sites.join(', ')])]));
  L.push(`**Escala de tamaños presente en la mayoría:** ${sizes.filter((x) => x.siteCount > total / 2).map((x) => x.value).join(' · ') || '—'}`);
  L.push('');
  L.push(`**Escala completa observada:** ${sizes.map((x) => x.value).join(' · ')}`);
  L.push('');
  L.push(`**Pesos:** ${weights.slice(0, 5).map((x) => `${x.value} (${shareLabel(x.siteCount, total)})`).join(' · ')}`);
  L.push('');
  L.push(`**Line-heights:** ${lineHeights.slice(0, 4).map((x) => x.value).join(' · ')}`);
  L.push('');
  L.push('Escala tipográfica de cada referencia, para elegir el carácter (más contraste = más editorial, menos contraste = más utilitario):');
  L.push('');
  L.push(
    table([
      ['Referencia', 'body', 'h1', 'h2', 'h3', 'Familia principal'],
      ...refs.map((r) => {
        const s = r.typography.typeScale || {};
        return [
          r.name,
          s.body ? s.body.fontSize : '—',
          s.h1 ? `${s.h1.fontSize}/${s.h1.fontWeight}` : '—',
          s.h2 ? `${s.h2.fontSize}/${s.h2.fontWeight}` : '—',
          s.h3 ? `${s.h3.fontSize}/${s.h3.fontWeight}` : '—',
          (r.typography.fontFamilies[0] || {}).value || '—',
        ];
      }),
    ])
  );

  /* forma y espaciado */
  const radii = pxOnly(consensus(refs, (r) => r.spacing.borderRadius || []));
  const gaps = pxOnly(consensus(refs, (r) => r.spacing.gaps || []));
  const shadows = consensus(refs, (r) => r.spacing.boxShadows || []);
  // los max-width chicos son de iconos y badges, no de contenedores de layout
  const isContainerWidth = (v) => {
    const n = parseFloat(v);
    if (/rem$/.test(v)) return n >= 40;
    if (/px$/.test(v)) return n >= 600;
    return /vw|%|ch/.test(v) === false ? false : n >= 60;
  };
  const containers = consensus(refs, (r) => (r.layout.containerMaxWidths || []).filter((x) => isContainerWidth(x.value)));

  L.push('### 2.3 Forma, espaciado y elevación');
  L.push('');
  L.push(`**Radios:** ${radii.map((x) => `${x.value} (${shareLabel(x.siteCount, total)})`).join(' · ') || '—'}`);
  L.push('');
  const dominantRadius = radii.filter((x) => x.siteCount > 1).slice(0, 3).map((x) => x.value);
  L.push(`Usar una escala de 3 radios como máximo. Los que se repiten entre referencias son: ${dominantRadius.join(' · ') || 'ninguno en común, elegir uno'}.`);
  L.push('');
  L.push(`**Gaps de grilla:** ${gaps.slice(0, 8).map((x) => x.value).join(' · ') || '—'}`);
  L.push('');
  L.push(`**Ancho de contenedor:** ${containers.slice(0, 4).map((x) => `${x.value} (${shareLabel(x.siteCount, total)})`).join(' · ') || '—'}`);
  L.push('');
  L.push('**Sombras más usadas:**');
  L.push('');
  L.push(table([['box-shadow', 'Referencias', 'Usos'], ...shadows.slice(0, 5).map((x) => [`\`${x.value}\``, shareLabel(x.siteCount, total), x.usage])]));
  L.push('Normalizar en 3 niveles de elevación: sutil para cards, media para menús y popovers, fuerte para modales.');
  L.push('');

  /* componentes */
  L.push('### 2.4 Componentes: qué usan las referencias');
  L.push('');
  const compKeys = ['buttons', 'cards', 'carousels', 'badges', 'tabs', 'accordions', 'modals', 'tables', 'breadcrumbs', 'pagination', 'ratings', 'prices', 'addToCart', 'search', 'newsletter', 'social', 'banners'];
  L.push(
    table([
      ['Componente', 'Referencias que lo usan', 'Promedio por sitio', 'Conclusión'],
      ...compKeys
        .map((k) => {
          const using = refs.filter((r) => (r.components.counts[k] || 0) > 0);
          const avg = using.length ? Math.round(using.reduce((a, r) => a + r.components.counts[k], 0) / using.length) : 0;
          return { k, using: using.length, avg };
        })
        .filter((x) => x.using > 0)
        .sort((a, b) => b.using - a.using || b.avg - a.avg)
        .map((x) => [x.k, shareLabel(x.using, total), x.avg, x.using === total ? 'obligatorio: lo usan todas' : x.using > total / 2 ? 'esperable en el rubro' : 'opcional']),
    ])
  );

  L.push('**Estilo de botón de cada referencia** (para definir el `Button` primario):');
  L.push('');
  L.push(
    table([
      ['Referencia', 'Fondo', 'Texto', 'Radio', 'Padding', 'Tamaño', 'Peso', 'Sombra'],
      ...refs
        .map((r) => {
          const v = (r.components.buttonVariants || [])[0];
          return v ? [r.name, `\`${v.styles.backgroundColor}\``, `\`${v.styles.color}\``, v.styles.borderRadius, v.styles.padding, v.styles.fontSize, v.styles.fontWeight, v.styles.boxShadow === 'none' ? 'sin sombra' : 'con sombra'] : null;
        })
        .filter(Boolean),
    ])
  );

  L.push('**Estilo de card de cada referencia:**');
  L.push('');
  L.push(
    table([
      ['Referencia', 'Fondo', 'Radio', 'Sombra', 'Padding', 'Tamaño típico'],
      ...refs
        .map((r) => {
          const v = (r.components.cardVariants || [])[0];
          return v ? [r.name, `\`${v.styles.backgroundColor}\``, v.styles.borderRadius, v.styles.boxShadow === 'none' ? 'sin sombra (borde)' : 'con sombra', v.styles.padding, v.commonSize] : null;
        })
        .filter(Boolean),
    ])
  );

  /* layout y densidad */
  L.push('### 2.5 Layout y densidad');
  L.push('');
  L.push(
    table([
      ['Referencia', 'Secciones', 'Alto del home', 'Header', 'Hamburguesa desde', 'Cards/fila @1440', 'grid vs flex', 'Nodos DOM'],
      ...refs.map((r) => {
        const p1440 = (r.responsive || []).find((x) => x && x.width === 1440) || {};
        return [
          r.name,
          r.layout.blocksCount,
          `${r.layout.page.viewportsTall} viewports`,
          (r.components.navigation && r.components.navigation.sticky) || '—',
          r.responsiveSummary.burgerThreshold ? `${r.responsiveSummary.burgerThreshold}px` : '—',
          p1440.cardsPerRow === null || p1440.cardsPerRow === undefined ? '—' : p1440.cardsPerRow,
          `${r.layout.displayStats.grid} / ${r.layout.displayStats.flex}`,
          r.layout.dom.totalNodes,
        ];
      }),
    ])
  );
  const bpConsensus = consensus(refs, (r) => (r.cssom.inferredBreakpoints || []).map(String));
  L.push(`**Breakpoints que comparten las referencias:** ${bpConsensus.filter((x) => x.siteCount > 1).slice(0, 12).map((x) => `${x.value}px (${shareLabel(x.siteCount, total)})`).join(' · ') || '—'}`);
  L.push('');
  L.push('Implementar con 640 / 768 / 1024 / 1280 / 1536 y verificar además 360px. Sin scroll horizontal en ningún ancho entre 320 y 1920.');
  L.push('');

  /* movimiento */
  const durs = consensus(refs, (r) => r.animations.transitionDurations || []);
  const eases = consensus(refs, (r) => r.animations.transitionEasings || []);
  const hoverProps = consensus(refs, (r) => r.animations.hoverProperties || []);
  L.push('### 2.6 Movimiento');
  L.push('');
  L.push(`**Duraciones:** ${durs.slice(0, 5).map((x) => `${x.value} (${shareLabel(x.siteCount, total)})`).join(' · ') || '—'}`);
  L.push('');
  L.push(`**Easings:** ${eases.slice(0, 4).map((x) => x.value).join(' · ') || '—'}`);
  L.push('');
  L.push(`**Qué cambia en hover:** ${hoverProps.slice(0, 6).map((x) => x.value).join(' · ') || '—'}`);
  L.push('');
  L.push(`Referencias con animación al scroll: ${refs.filter((r) => (r.animations.scrollRevealHints || []).length).map((r) => r.name).join(', ') || 'ninguna'}. Respetar siempre \`prefers-reduced-motion\` (${refs.filter((r) => r.animations.prefersReducedMotionSupport).length}/${total} referencias lo hacen).`);
  L.push('');

  /* ---- 3. estructura ---- */
  /**
   * La estructura no siempre puede salir del sitio del cliente: si su sitio actual
   * es institucional y las referencias son catálogos, copiar su arquitectura dejaría
   * afuera el negocio. Elegimos por riqueza funcional y lo decimos explícito.
   */
  const richness = (x) => {
    if (!x || !x.ok) return 0;
    const pages = (x.pages || []).filter((pp) => pp.ok).length || 1;
    const cards = x.catalog ? x.catalog.cardsDetected || 0 : 0;
    return pages * 4 + x.layout.blocksCount + Math.min(cards, 60) / 2 + (x.components.counts.prices > 3 ? 10 : 0) + (x.components.counts.addToCart > 0 ? 10 : 0) + (x.components.counts.search > 0 ? 4 : 0);
  };
  const bestRef = refs.slice().sort((a, b) => richness(b) - richness(a))[0];
  const clientScore = client ? richness(client) : 0;
  const refScore = bestRef ? richness(bestRef) : 0;
  const clientTooThin = !!client && !!bestRef && clientScore < refScore * 0.5;
  const structureSource = clientTooThin ? bestRef : client || bestRef;

  L.push('## 3. Estructura y funcionalidad');
  L.push('');
  if (clientTooThin) {
    L.push(
      `El sitio actual del cliente (**${client.name}**) es mucho más chico que las referencias: ` +
        `${(client.pages || []).filter((pp) => pp.ok).length || 1} página(s) analizada(s), ${client.layout.blocksCount} secciones, ` +
        `${client.catalog ? client.catalog.cardsDetected : 0} cards de producto detectadas y ${client.components.counts.prices} precios. ` +
        `No alcanza como base de arquitectura: **la estructura se toma de la referencia más completa (${bestRef.name})** y del consenso del rubro.`
    );
    L.push('');
    L.push(
      `Del sitio del cliente se conservan: identidad de marca, contenido institucional, textos propios` +
        `${(client.stackExtras || []).length ? ` e integraciones ya en uso (${client.stackExtras.slice(0, 6).join(', ')})` : ''}. ` +
        `Lo que hay que construir de cero es todo el catálogo y su flujo.`
    );
    L.push('');
    L.push(
      table([
        ['Sitio', 'Rol', 'Páginas', 'Secciones', 'Cards de producto', 'Precios', 'Nodos DOM'],
        ...[client].concat(refs).map((x) => [
          x.name,
          x.role === 'cliente' ? 'cliente' : 'referencia',
          (x.pages || []).filter((pp) => pp.ok).length || 1,
          x.layout.blocksCount,
          x.catalog ? x.catalog.cardsDetected : '—',
          x.components.counts.prices,
          x.layout.dom.totalNodes,
        ]),
      ])
    );
  } else {
    L.push(client ? `La arquitectura de información sale del sitio del cliente (**${client.name}**). Las referencias definen cómo se ve, no qué secciones hay.` : `Sin sitio del cliente, la estructura se toma de la referencia más completa (**${structureSource.name}**) y se valida con el cliente.`);
    L.push('');
  }
  const cpages = (structureSource.pages || []).filter((x) => x && x.ok);
  if (cpages.length > 1) {
    L.push('**Páginas a construir:**');
    L.push('');
    L.push(
      table([
        ['Tipo', 'Ruta del original', 'Secciones', 'Formularios'],
        ...cpages.map((x) => {
          let ruta = x.url;
          try {
            ruta = new URL(x.url).pathname;
          } catch (e) {}
          return [x.pageLabel || x.pageType, `\`${ruta}\``, x.layout.blocksCount, x.components.counts.forms];
        }),
      ])
    );
  }
  L.push('**Secciones del home, en orden de scroll:**');
  L.push('');
  L.push(
    table([
      ['#', 'Sección', 'Encabezado', 'Alto', 'Layout', 'Contenido'],
      ...(structureSource.layout.blocks || []).slice(0, 20).map((b) => [
        b.order,
        b.element,
        b.heading || '—',
        `${b.height}px`,
        `${b.display}${b.columns ? `, ${b.columns} col` : ''}`,
        [b.images ? `${b.images} img` : '', b.links ? `${b.links} links` : '', b.cards ? `${b.cards} items` : ''].filter(Boolean).join(', ') || '—',
      ]),
    ])
  );
  if (structureSource.components.navigation) {
    const n = structureSource.components.navigation;
    L.push(`**Navegación:** ${n.topLevelItems} ítems de primer nivel${n.hasSearch ? ', con buscador' : ''}: ${(n.items || []).slice(0, 12).map((it) => it.label || '—').join(' · ')}`);
    L.push('');
  }
  if (structureSource.components.footer) {
    const f = structureSource.components.footer;
    L.push(`**Footer:** ${f.columns} columnas, ${f.links} links, ${f.socialLinks} redes${f.hasNewsletter ? ', con newsletter' : ''}.`);
    L.push('');
  }
  if (client) {
    const extras = (client.stackExtras || []).filter((e) => /Shopify|VTEX|Magento|WooCommerce|Tiendanube|PrestaShop|Intercom|chat|reCAPTCHA|Tag Manager|Analytics|Pixel/i.test(e));
    if (extras.length) {
      L.push(`**Integraciones que el cliente ya tiene y hay que prever:** ${extras.join(', ')}.`);
      L.push('');
    }
  }

  /* ---- 4. stack ---- */
  L.push('## 4. Stack');
  L.push('');
  L.push(
    table([
      ['Sitio', 'Rol', 'Stack detectado'],
      ...ok.map((r) => [r.name, r.role === 'cliente' ? 'Cliente' : 'Referencia', Object.keys(r.stack).filter((k) => r.stack[k]).join(', ') || '—']),
    ])
  );
  L.push('Usar **Next.js (App Router) + TypeScript strict + Tailwind CSS**, con los tokens de la sección 2 en `tailwind.config` y variables CSS. Contenido desde datos (JSON/CMS/API), nunca hardcodeado en el markup.');
  L.push('');

  /* ---- 4b. catálogo y modelo de negocio ---- */
  const refsWithCatalog = refs.filter((x) => x.catalog && x.catalog.cardsDetected > 2);
  if (refsWithCatalog.length) {
    L.push('## 4b. Estructura del listado y de la card de producto');
    L.push('');
    L.push('Consenso de los bloques que las referencias ponen dentro de cada card, en el orden en que aparecen. Define la estructura del componente `ProductCard` y de la grilla que lo contiene.');
    L.push('');
    const fieldConsensus = consensus(refsWithCatalog, (x) => x.catalog.fieldFrequency || []);
    L.push(
      table([
        ['Campo', 'Referencias que lo muestran', 'Cards en total', 'Conclusión'],
        ...fieldConsensus.slice(0, 14).map((f) => [
          f.value,
          shareLabel(f.siteCount, refsWithCatalog.length),
          f.usage,
          f.siteCount === refsWithCatalog.length ? 'obligatorio' : f.siteCount > refsWithCatalog.length / 2 ? 'esperable' : 'opcional',
        ]),
      ])
    );
    L.push('**Grilla del catálogo en cada referencia**');
    L.push('');
    L.push(
      table([
        ['Referencia', 'Cards detectadas', 'Por fila', 'Tamaño típico', 'display', 'gap'],
        ...refsWithCatalog.map((x) => [
          x.name,
          x.catalog.cardsDetected,
          x.catalog.grid ? x.catalog.grid.perRow : '—',
          x.catalog.grid ? x.catalog.grid.commonSize : '—',
          x.catalog.grid ? x.catalog.grid.display : '—',
          x.catalog.grid ? x.catalog.grid.gap : '—',
        ]),
      ])
    );
    L.push('**Elementos que la card tiene que poder mostrar** (independientemente de qué datos cargue el cliente)');
    L.push('');
    L.push(
      table([
        ['Referencia', 'Unidad de venta', 'Cantidad mínima', 'Stock', 'Selector de cantidad', 'Acción de compra'],
        ...refsWithCatalog.map((x) => {
          const b = x.catalog.b2b || {};
          const hasAction = (x.catalog.fieldFrequency || []).some((f) => /bot[oó]n/i.test(f.value));
          return [x.name, `${b.unitOfSaleShown} card(s)`, `${b.minQuantityShown} card(s)`, `${b.stockShown} card(s)`, b.quantitySelectors, hasAction ? 'sí' : 'no'];
        }),
      ])
    );
    L.push('Cada uno de esos elementos es un slot del componente: si el cliente no tiene el dato, se oculta, no se rediseña la card.');
    L.push('');
    const allMentions = consensus(refsWithCatalog, (x) => (x.catalog.b2b || {}).mentions || []);
    if (allMentions.length) {
      L.push(`**Vocabulario del rubro que usan las referencias:** ${allMentions.slice(0, 12).map((m) => `${m.value} (${shareLabel(m.siteCount, refsWithCatalog.length)})`).join(' · ')}`);
      L.push('');
    }
    const model = refsWithCatalog.slice().sort((a, b) => (b.catalog.fieldsPerCard || 0) - (a.catalog.fieldsPerCard || 0))[0];
    const sample = (model.catalog.samples || [])[0];
    if (sample) {
      L.push(`**Card modelo** — la más completa es la de **${model.name}** (${model.catalog.fieldsPerCard} campos por card, ${sample.size}, radio ${sample.borderRadius}, padding ${sample.padding}). Orden de los campos:`);
      L.push('');
      L.push(table([['Orden', 'Campo', 'Ejemplo', 'size', 'weight'], ...(sample.fields || []).map((f, i) => [i + 1, f.kind, f.value, f.fontSize, f.fontWeight])]));
    }
    L.push('Implementar `ProductCard` con los bloques marcados como obligatorios y esperables, cada uno opcional a nivel de datos. La estructura y la jerarquía visual son lo que hay que replicar; cómo el cliente resuelva precios o stock es una decisión suya posterior y no debe condicionar el layout.');
    L.push('');
  }

  /* ---- 4c. estados interactivos ---- */
  const refsWithIx = refs.filter((x) => x.interactions);
  if (refsWithIx.length) {
    L.push('## 4c. Estados interactivos de las referencias');
    L.push('');
    L.push(
      table([
        ['Referencia', 'Hover cambia', 'Qué cambia en hover', 'Foco visible', 'Menú desplegado', 'Filtros', 'Carrito', 'Autocompletado'],
        ...refsWithIx.map((x) => {
          const ix = x.interactions;
          const hov = (ix.hover || []).filter((h) => h.changed);
          const props = Array.from(new Set(hov.flatMap((h) => (h.changes || []).map((c) => c.property)))).slice(0, 4);
          return [
            x.name,
            hov.length ? `${hov.length}/${(ix.hover || []).length} botones` : 'no',
            props.join(', ') || '—',
            ix.focus ? (ix.focus.visible ? 'sí' : 'NO') : '—',
            ix.megaMenu && ix.megaMenu.size ? `${ix.megaMenu.size}${ix.megaMenu.fullWidth ? ' (mega)' : ''}, ${ix.megaMenu.links} links` : 'no detectado',
            ix.filters ? `${ix.filters.checkboxes} checks${ix.filters.alwaysVisible ? ', barra fija' : ', se abre'}` : 'no detectado',
            ix.cart ? `${ix.cart.isDrawer ? 'drawer' : 'popover'} ${ix.cart.side}` : 'no detectado',
            ix.searchSuggestions ? (ix.searchSuggestions.hasSuggestions ? `${ix.searchSuggestions.items} sugerencias` : 'no') : '—',
          ];
        }),
      ])
    );
    const hoverProps = consensus(refsWithIx, (x) => (x.interactions.hover || []).flatMap((h) => (h.changes || []).map((c) => ({ value: c.property, count: 1 }))));
    if (hoverProps.length) {
      L.push(`**Qué animan en hover, por consenso:** ${hoverProps.slice(0, 6).map((h) => `${h.value} (${shareLabel(h.siteCount, refsWithIx.length)})`).join(' · ')}`);
      L.push('');
    }
    const menus = refsWithIx.filter((x) => x.interactions.megaMenu && x.interactions.megaMenu.size);
    if (menus.length) {
      L.push('**Menú de categorías**: ' + menus.map((x) => `${x.name} ${x.interactions.megaMenu.size} con ${x.interactions.megaMenu.links} links`).join(' · ') + '. Implementarlo accesible: navegable por teclado, con `aria-expanded` y cierre por Escape.');
      L.push('');
    }
    const noFocus = refsWithIx.filter((x) => x.interactions.focus && !x.interactions.focus.visible);
    if (noFocus.length) {
      L.push(`Atención: ${noFocus.map((x) => x.name).join(', ')} no muestra foco de teclado. **La app nueva debe tener foco visible (:focus-visible) claro en todo elemento interactivo.**`);
      L.push('');
    }
  }

  /* ---- 4d. copy y tono ---- */
  const refsWithContent = refs.filter((x) => x.content && !x.content.error);
  if (refsWithContent.length) {
    L.push('## 4d. Copy, tono y taxonomía');
    L.push('');
    const ctas = consensus(refsWithContent, (x) => x.content.ctas || []);
    L.push('**Llamados a la acción del rubro**');
    L.push('');
    L.push(table([['Texto', 'Referencias', 'Veces en total'], ...ctas.slice(0, 12).map((c) => [c.value, shareLabel(c.siteCount, refsWithContent.length), c.usage])]));
    const promises = consensus(refsWithContent, (x) => x.content.promises || []);
    if (promises.length) {
      L.push('**Promesas que comunica el rubro** (lo que el cliente espera encontrar)');
      L.push('');
      L.push(table([['Promesa', 'Referencias'], ...promises.slice(0, 14).map((pr) => [pr.value, shareLabel(pr.siteCount, refsWithContent.length)])]));
    }
    L.push(
      table([
        ['Referencia', 'Registro', 'Palabras', 'Palabras por oración', '% mayúsculas', 'Buscador'],
        ...refsWithContent.map((x) => {
          const t = x.content.tone || {};
          return [x.name, t.registro, t.palabras, t.palabrasPorOracion, t.porcentajeMayusculas, x.content.search && x.content.search.present ? `sí ("${x.content.search.placeholder || ''}")` : 'no'];
        }),
      ])
    );
    const cats = consensus(refsWithContent, (x) => x.content.categories || []);
    if (cats.length) {
      L.push('**Categorías que aparecen en más de una referencia** (base de la taxonomía)');
      L.push('');
      L.push(table([['Categoría', 'Referencias'], ...cats.filter((c) => c.siteCount > 1).slice(0, 20).map((c) => [c.value, shareLabel(c.siteCount, refsWithContent.length)])]));
    }
    if (client && client.content && client.content.h1) {
      L.push(`**Del cliente se conserva su voz**: H1 actual "${client.content.h1}", registro ${(client.content.tone || {}).registro}. Los textos nuevos deben sonar a ${client.name}, no a las referencias.`);
      L.push('');
    }
  }

  /* ---- 5. referencias visuales ---- */
  const anyCrops = ok.filter((r) => Object.keys((r.screenshots && r.screenshots.components) || {}).length);
  if (anyCrops.length) {
    L.push('## 5. Referencias visuales');
    L.push('');
    L.push('Recortes reales de cada sitio. Sirven para calibrar el estilo, no para copiarlos.');
    L.push('');
    anyCrops.forEach((r) => {
      const crops = r.screenshots.components;
      const keys = Object.keys(crops).filter((k) => /^(zone-header|zone-hero|zone-nav|card-01|boton-01|input-01)$/.test(k));
      if (!keys.length) return;
      L.push(`**${r.name}** (${r.role === 'cliente' ? 'cliente' : 'referencia'})`);
      L.push('');
      keys.forEach((k) => L.push(`[${r.name} — ${crops[k].label}](${(o.prefix || '')}${crops[k].path})`));
      L.push('');
    });
  }

  /* ---- 6. calidad exigida ---- */
  L.push('## 6. Calidad exigida (mejor que todos los sitios analizados)');
  L.push('');
  const best = (getter, cmp) => {
    const vals = ok.map((r) => ({ name: r.name, v: getter(r) })).filter((x) => x.v !== null && x.v !== undefined && !isNaN(x.v));
    if (!vals.length) return null;
    return vals.sort((a, b) => (cmp === 'min' ? a.v - b.v : b.v - a.v))[0];
  };
  const bestLcp = best((r) => (r.perf.lcp ? r.perf.lcp.timeMs : null), 'min');
  const bestReq = best((r) => r.network.totalRequests, 'min');
  const bestKb = best((r) => r.network.totalKb, 'min');
  const bestDom = best((r) => r.layout.dom.totalNodes, 'min');
  const bestLh = best((r) => (r.lighthouse && r.lighthouse.categories ? r.lighthouse.categories.performance : null), 'max');

  L.push(
    table([
      ['Métrica', 'Mejor de los sitios analizados', 'Objetivo de la app nueva'],
      ['LCP', bestLcp ? `${bestLcp.v} ms (${bestLcp.name})` : 'sin dato', '< 2500 ms'],
      ['Requests', bestReq ? `${bestReq.v} (${bestReq.name})` : 'sin dato', bestReq ? `< ${Math.max(40, Math.round(bestReq.v * 0.8))}` : '< 60'],
      ['Peso transferido', bestKb ? `${bestKb.v} KB (${bestKb.name})` : 'sin dato', bestKb ? `< ${Math.max(500, Math.round(bestKb.v * 0.8))} KB` : '< 1000 KB'],
      ['Nodos DOM', bestDom ? `${bestDom.v} (${bestDom.name})` : 'sin dato', bestDom ? `< ${Math.max(1200, Math.round(bestDom.v * 0.8))}` : '< 1500'],
      ['Lighthouse Performance', bestLh ? `${bestLh.v}/100 (${bestLh.name})` : 'no medido', '≥ 90'],
      ['Contraste WCAG AA', `el mejor tiene ${Math.min.apply(null, ok.map((r) => r.contrast.totalIssues))} fallos`, '0 fallos'],
      ['Imágenes sin alt', `el mejor tiene ${Math.min.apply(null, ok.map((r) => r.a11y.imagesWithoutAlt))}`, '0'],
      ['Overflow horizontal', ok.every((r) => (r.responsiveSummary.horizontalOverflowAt || []).length) ? 'todos tienen roturas' : 'algunos no tienen', 'ninguno entre 320 y 1920px'],
    ])
  );

  L.push('**Errores que cometen los sitios analizados y que esta app no debe repetir:**');
  L.push('');
  const problems = [];
  const withIssue = (pred, text) => {
    const list = ok.filter(pred);
    if (list.length) problems.push(`${text} (${list.map((r) => r.name).join(', ')})`);
  };
  withIssue((r) => r.a11y.imagesWithoutAlt > 0, 'Imágenes sin `alt`');
  withIssue((r) => r.a11y.inputsWithoutLabel > 0, 'Inputs sin label asociado');
  withIssue((r) => r.a11y.h1Count !== 1, 'Cantidad de `h1` distinta de uno');
  withIssue((r) => (r.a11y.headingOrderIssues || []).length > 0, 'Saltos en la jerarquía de encabezados');
  withIssue((r) => r.a11y.focusOutlineRemoved > 0, 'Foco visible removido');
  withIssue((r) => !r.a11y.skipLink, 'Sin skip link');
  withIssue((r) => r.contrast.totalIssues > 0, 'Contraste por debajo de AA');
  withIssue((r) => r.components.images.missingDimensions > 0, 'Imágenes sin `width`/`height` (causan CLS)');
  withIssue((r) => r.components.images.oversized > 0, 'Imágenes servidas mucho más grandes de lo que se muestran');
  withIssue((r) => !(r.components.images.formats || []).some((f) => /webp|avif/i.test(f.value)), 'Sin formatos de imagen modernos (WebP/AVIF)');
  withIssue((r) => (r.responsiveSummary.horizontalOverflowAt || []).length > 0, 'Scroll horizontal en algún breakpoint');
  withIssue((r) => (r.responsiveSummary.smallTapTargetsMobile || []).some((x) => x.small > 0), 'Áreas clicables menores a 36px en mobile');
  withIssue((r) => !r.animations.prefersReducedMotionSupport && r.animations.elementsWithAnimation > 0, 'Animaciones que ignoran `prefers-reduced-motion`');
  withIssue((r) => (r.consoleErrors || []).length > 0, 'Errores de consola en el home');
  withIssue((r) => r.network.thirdPartyHosts > 10, 'Demasiados dominios de terceros');
  problems.forEach((p, i) => L.push(`${i + 1}. ${p}`));
  L.push('');
  L.push('- Navegación completa por teclado con foco visible.');
  L.push('- Lighthouse ≥ 90 en Performance, Accessibility, Best Practices y SEO (mobile con throttling).');
  L.push('');

  /* ---- 7. entregables ---- */
  L.push('## 7. Entregables');
  L.push('');
  L.push('1. Proyecto que compila y corre con `npm install && npm run dev`.');
  L.push('2. Tokens de diseño centralizados (variables CSS + config de Tailwind) con los valores de la sección 2.');
  L.push('3. Componentes tipados y reutilizables, con las variantes de la sección 2.4.');
  L.push('4. Las páginas y secciones de la sección 3, con datos de ejemplo propios.');
  L.push('5. README con estructura de carpetas, decisiones tomadas y cómo reemplazar el contenido de ejemplo.');
  L.push('');
  L.push('**No incluir:** logos, marcas, fotos, textos ni nombres de producto de ninguno de los sitios analizados.');
  L.push('');
  L.push('---');
  L.push('');
  L.push(`_Detalle completo de cada sitio en su reporte individual: ${ok.map((r) => `\`reportes/${r.name}/\``).join(', ')}._`);
  L.push('');

  return L.join('\n');
};
