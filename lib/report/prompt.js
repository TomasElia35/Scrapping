'use strict';

/**
 * Convierte el analisis de un sitio en un prompt de construccion listo para pasarle a una IA:
 * especificacion de stack, design tokens, estructura, componentes, responsive, animaciones,
 * y las mejoras concretas de accesibilidad y rendimiento respecto del original.
 */

const val = (list, n) => (list || []).slice(0, n || 5).map((i) => i.value);
const listOf = (list, n) => val(list, n).join(', ') || '—';
const num = (v, d) => (v === null || v === undefined ? d === undefined ? '—' : d : v);

/** Ordena valores de una sola medida (descarta shorthands y ceros). */
function pxSort(list) {
  return val(list, 12)
    .filter((v) => !/\s/.test(v))
    .map((v) => ({ v, n: parseFloat(v) }))
    .filter((x) => !isNaN(x.n) && x.n > 0)
    .sort((a, b) => a.n - b.n)
    .map((x) => x.v);
}

/** Stack recomendado segun lo detectado y el tipo de sitio. */
function recommendStack(r) {
  const s = r.stack || {};
  const extras = r.stackExtras || [];
  const isEcommerce =
    r.components.counts.prices > 3 ||
    r.components.counts.addToCart > 0 ||
    extras.some((e) => /Shopify|VTEX|Magento|WooCommerce|PrestaShop|Tiendanube/i.test(e));
  const heavyContent = r.components.counts.cards > 60 || r.layout.blocksCount > 12;

  const lines = [];
  if (s.next) lines.push('El original ya usa Next.js: mantener Next.js (App Router) con React Server Components para el contenido estático.');
  else if (s.react) lines.push('El original usa React sin framework de SSR: usar **Next.js (App Router)** para ganar SSR/SSG y mejor LCP.');
  else if (s.wordpress) lines.push('El original es WordPress: reemplazar por **Next.js (App Router)** consumiendo el contenido vía API/headless, o mantener WP solo como CMS.');
  else if (s.angular) lines.push('El original usa Angular: se puede mantener Angular con SSR (Angular Universal) o migrar a Next.js. Elegir según el equipo del cliente.');
  else if (s.vue) lines.push('El original usa Vue: usar **Nuxt 3** para SSR, o Next.js si el equipo prefiere React.');
  else lines.push('El original es HTML/JS clásico: usar **Next.js (App Router)** o **Astro** si el sitio es mayormente estático.');

  lines.push(
    s.tailwind
      ? 'Estilos: el original ya usa Tailwind. Mantener **Tailwind CSS** con los tokens de este documento cargados en `tailwind.config`.'
      : 'Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio' +
          (s.bootstrap ? ' sobre Bootstrap' : '') +
          ').'
  );
  if (isEcommerce) lines.push('Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.');
  if (heavyContent) lines.push('Home extensa y con muchas tarjetas: paginar o virtualizar listados largos y usar `next/image` con `sizes` correctos.');
  lines.push('TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).');
  return lines;
}

/** Mejoras exigibles, derivadas de los problemas medidos. */
function improvements(r) {
  const out = [];
  const a = r.a11y;
  const c = r.contrast;
  const im = r.components.images;
  const rs = r.responsiveSummary;
  const pf = r.perf;

  if (a.imagesWithoutAlt > 0) out.push(`Accesibilidad: el original tiene ${a.imagesWithoutAlt} de ${a.imagesTotal} imágenes sin \`alt\`. En la nueva app, \`alt\` es obligatorio (vacío solo si es decorativa).`);
  if (a.inputsWithoutLabel > 0) out.push(`Formularios: ${a.inputsWithoutLabel} de ${a.inputsTotal} inputs sin label asociado. Usar \`<label for>\` real, no solo placeholder.`);
  if (a.buttonsWithoutAccessibleName > 0) out.push(`${a.buttonsWithoutAccessibleName} botones sin nombre accesible. Todo botón de solo ícono lleva \`aria-label\`.`);
  if ((a.headingOrderIssues || []).length) out.push(`Jerarquía de encabezados con saltos (${a.headingOrderIssues.slice(0, 2).join('; ')}). Respetar h1 → h2 → h3 sin saltear niveles.`);
  if (a.h1Count !== 1) out.push(`El original tiene ${a.h1Count} \`h1\`. Usar exactamente uno por página.`);
  if (a.focusOutlineRemoved > 0) out.push(`${a.focusOutlineRemoved} elementos focusables sin foco visible. Mantener un \`:focus-visible\` claro.`);
  if (!a.skipLink) out.push('Agregar "saltar al contenido principal" (skip link), que el original no tiene.');
  if (c.totalIssues > 0) out.push(`Contraste: ${c.totalIssues} combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.`);
  if (a.iframesWithoutTitle > 0) out.push(`${a.iframesWithoutTitle} iframes sin \`title\`.`);

  if (im.missingDimensions > 0) out.push(`Rendimiento: ${im.missingDimensions} imágenes sin \`width\`/\`height\` (causan CLS). Declarar siempre las dimensiones o usar \`next/image\`.`);
  if (im.oversized > 0) out.push(`${im.oversized} imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con \`srcset\`/\`sizes\`.`);
  if (im.withoutLoadingAttr > 0) out.push(`${im.withoutLoadingAttr} imágenes sin estrategia de carga: \`loading="lazy"\` fuera del viewport inicial y \`priority\` solo para la del hero.`);
  if (!(im.formats || []).some((f) => /webp|avif/i.test(f.value))) out.push('El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.');
  if (pf.lcp && pf.lcp.timeMs > 2500) out.push(`LCP del original: ${pf.lcp.timeMs} ms (objetivo < 2500 ms). Elemento crítico: \`${pf.lcp.element || pf.lcp.url}\`.`);
  if (pf.cls !== null && pf.cls !== undefined && pf.cls > 0.1) out.push(`CLS del original: ${pf.cls} (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.`);
  if (r.network.totalRequests > 120) out.push(`El original hace ${r.network.totalRequests} requests (${r.network.totalKb} KB) desde ${r.network.thirdPartyHosts} dominios de terceros. Reducir terceros y agrupar assets propios.`);
  if (r.layout.dom.totalNodes > 2500) out.push(`DOM de ${r.layout.dom.totalNodes} nodos y ${r.layout.dom.maxDepth} niveles de profundidad. Apuntar a menos de 1500 nodos por vista y estructura más plana.`);
  if ((rs.horizontalOverflowAt || []).length) out.push(`Responsive roto: hay overflow horizontal en ${rs.horizontalOverflowAt.map((o) => o.width + 'px').join(', ')}. La nueva app no debe tener scroll horizontal en ningún breakpoint.`);
  if ((rs.smallTapTargetsMobile || []).some((x) => x.small > 0)) {
    const worst = rs.smallTapTargetsMobile.sort((a2, b2) => b2.small - a2.small)[0];
    out.push(`Táctil: ${worst.small} de ${worst.total} áreas clicables miden menos de 36px en ${worst.width}px. Mínimo 44x44px.`);
  }
  if (!r.animations.prefersReducedMotionSupport && r.animations.elementsWithAnimation > 0) out.push('Animaciones: el original ignora `prefers-reduced-motion`. Respetarlo y desactivar movimiento no esencial.');
  if (!r.cssom.hasDarkModeQuery) out.push('El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.');
  if (r.consoleErrors && r.consoleErrors.length) out.push(`El original arroja ${r.consoleErrors.length} errores de consola en el home. La nueva app debe cargar sin errores.`);
  if (!r.meta.description) out.push('SEO: falta meta description.');
  if (!(r.meta.jsonLdTypes || []).length) out.push('SEO: no hay datos estructurados JSON-LD. Agregar Organization/WebSite y Product o Article según corresponda.');

  return out;
}

/** @returns {string} markdown del prompt */
module.exports = function buildPrompt(r, opts) {
  const L = [];
  const t = r.typography;
  const p = r.palette;
  const s = r.spacing;
  const c = r.components;
  const lay = r.layout;
  const rs = r.responsiveSummary;
  const an = r.animations;
  const scale = t.typeScale || {};

  L.push(`# Prompt de construcción — ${r.name}`);
  L.push('');
  L.push(`_Generado a partir del análisis automatizado de ${r.url} el ${(opts && opts.generatedAt) || new Date().toISOString()}._`);
  L.push('');
  L.push('> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.');
  L.push('');

  /* ---- 0. briefing del cliente ---- */
  const brief = opts && opts.brief;
  if (brief && brief.text) {
    L.push('## 0. Pedido del cliente (tiene prioridad sobre todo lo demás)');
    L.push('');
    L.push(`_Fuente: ${brief.file}_`);
    L.push('');
    brief.text.split(/\r?\n/).forEach((line) => L.push(line.replace(/^#{1,6}\s+/, '**') .replace(/^\*\*(.+)$/, '**$1**')));
    L.push('');
    L.push('> Donde el pedido del cliente contradiga lo medido en el sitio actual, **gana el pedido del cliente**. Lo que sigue describe el sitio existente como punto de partida y línea base a superar.');
    L.push('');
  }

  /* ---- 1. objetivo ---- */
  L.push('## 1. Objetivo');
  L.push('');
  L.push(
    `Construir una aplicación web equivalente en estructura y propósito a **${r.name}**, con mejor rendimiento, accesibilidad y mantenibilidad. ` +
      'Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.'
  );
  L.push('');
  L.push(`Contexto del original: ${num(r.meta.title, 'sin title')} — ${num(r.meta.description, 'sin description')}`);
  L.push('');

  /* ---- 2. stack ---- */
  L.push('## 2. Stack y decisiones técnicas');
  L.push('');
  L.push(`Detectado en el original: ${Object.keys(r.stack).filter((k) => r.stack[k]).join(', ') || 'sin framework identificable'}${(r.stackExtras || []).length ? ` · ${r.stackExtras.slice(0, 8).join(', ')}` : ''}`);
  L.push('');
  recommendStack(r).forEach((l) => L.push(`- ${l}`));
  L.push('');

  /* ---- 3. design tokens ---- */
  L.push('## 3. Design tokens (medidos por frecuencia de uso real)');
  L.push('');
  L.push('**Color**');
  L.push('');
  L.push('| Rol | Valor | Uso en el original |');
  L.push('| --- | --- | --- |');
  (p.backgrounds || []).slice(0, 5).forEach((b, i) => L.push(`| surface-${i + 1}${i === 0 ? ' (fondo base)' : ''} | \`${b.value}\` | ${b.count} elementos |`));
  (p.textColors || []).slice(0, 4).forEach((x, i) => L.push(`| text-${i + 1}${i === 0 ? ' (texto base)' : ''} | \`${x.value}\` | ${x.count} elementos |`));
  (p.borderColors || []).slice(0, 2).forEach((x, i) => L.push(`| border-${i + 1} | \`${x.value}\` | ${x.count} elementos |`));
  L.push('');
  if ((p.gradients || []).length) {
    L.push(`Gradientes en uso: ${(p.gradients || []).slice(0, 2).map((g) => `\`${g.value}\``).join(' · ')}`);
    L.push('');
  }
  L.push('> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.');
  L.push('');

  L.push('**Tipografía**');
  L.push('');
  L.push(`- Familias: ${listOf(t.fontFamilies, 3)}`);
  L.push(`- Escala de tamaños en uso: ${pxSort(t.fontSizes).join(' · ')}`);
  L.push(`- Pesos: ${listOf(t.fontWeights, 5)}`);
  L.push(`- Line-heights: ${listOf(t.lineHeights, 4)}`);
  if ((t.letterSpacings || []).length) L.push(`- Letter-spacing: ${listOf(t.letterSpacings, 3)}`);
  L.push('');
  L.push('| Elemento | font-size | weight | line-height |');
  L.push('| --- | --- | --- | --- |');
  ['body', 'h1', 'h2', 'h3', 'h4', 'p', 'button', 'small'].forEach((k) => {
    if (scale[k]) L.push(`| ${k} | ${scale[k].fontSize} | ${scale[k].fontWeight} | ${scale[k].lineHeight} |`);
  });
  L.push('');
  if ((r.cssom.fontFaces || []).length) {
    L.push(`Fuentes propias declaradas: ${r.cssom.fontFaces.slice(0, 4).map((f) => `${f.family} (${f.weight}, font-display: ${f.display})`).join(' · ')}. Cargarlas con \`font-display: swap\` y \`preload\` solo la del hero.`);
    L.push('');
  }
  L.push(`Consistencia del original: ${t.distinct.families} familias, ${t.distinct.sizes} tamaños, ${t.distinct.weights} pesos distintos.` + (t.distinct.sizes > 12 ? ' **Consolidar** a una escala de 7-9 pasos.' : ' La escala es acotada: mantenerla.'));
  L.push('');

  L.push('**Espaciado, radios y elevación**');
  L.push('');
  L.push(`- Radios: ${pxSort(s.borderRadius).join(' · ') || '—'}${s.distinct.radius > 8 ? ` (el original usa ${s.distinct.radius} valores distintos: **reducir a 3-4**)` : ''}`);
  L.push(`- Gaps de grilla/flex: ${pxSort(s.gaps).join(' · ') || '—'}`);
  L.push(`- Paddings más usados: ${listOf(s.paddings, 5)}`);
  L.push(`- Sombras: ${(s.boxShadows || []).slice(0, 3).map((x) => `\`${x.value}\``).join(' · ') || 'ninguna'}${s.distinct.shadow > 6 ? ` (${s.distinct.shadow} distintas: **normalizar a 3 niveles de elevación**)` : ''}`);
  const layoutWidths = (lay.containerMaxWidths || []).filter((x) => {
    const n = parseFloat(x.value);
    return /rem$/.test(x.value) ? n >= 40 : /px$/.test(x.value) ? n >= 600 : false;
  });
  L.push(`- Ancho de contenedor: ${listOf(layoutWidths, 3)} · padding lateral: ${listOf(lay.containerPaddings, 2)}`);
  L.push('');
  L.push('Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.');
  L.push('');

  /* ---- 4. estructura ---- */
  const pages = (r.pages || []).filter((x) => x && x.ok);
  if (pages.length > 1) {
    L.push('## 4. Mapa de páginas a construir');
    L.push('');
    L.push('| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |');
    L.push('| --- | --- | --- | --- | --- |');
    pages.forEach((x) => {
      let ruta = x.url;
      try {
        ruta = new URL(x.url).pathname;
      } catch (e) {}
      const destacados = [
        x.components.counts.cards > 8 ? `${x.components.counts.cards} cards` : '',
        x.components.counts.carousels ? `${x.components.counts.carousels} carruseles` : '',
        x.components.counts.tables ? `${x.components.counts.tables} tablas` : '',
        x.components.counts.prices > 3 ? 'precios' : '',
        x.components.counts.addToCart ? 'agregar al carrito' : '',
      ]
        .filter(Boolean)
        .join(', ');
      L.push(`| ${x.pageLabel || x.pageType} | \`${ruta}\` | ${x.layout.blocksCount} | ${destacados || '—'} | ${x.components.counts.forms} |`);
    });
    L.push('');
    L.push('Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.');
    L.push('');
    pages
      .filter((x) => x.pageType !== 'home')
      .forEach((x) => {
        L.push(`**${x.pageLabel || x.pageType}** — secciones en orden: ${(x.layout.blocks || []).slice(0, 10).map((b) => b.heading || b.element).join(' → ') || 'sin bloques detectados'}`);
        L.push('');
      });
  }

  L.push(`## ${pages.length > 1 ? '4b' : '4'}. Estructura del home (orden de scroll del original)`);
  L.push('');
  L.push('| # | Sección | Encabezado | Alto | Layout | Contenido |');
  L.push('| --- | --- | --- | --- | --- | --- |');
  (lay.blocks || []).slice(0, 25).forEach((b) => {
    const contenido = [b.images ? `${b.images} img` : '', b.links ? `${b.links} links` : '', b.buttons ? `${b.buttons} btn` : '', b.cards ? `${b.cards} items` : '']
      .filter(Boolean)
      .join(', ');
    L.push(
      `| ${b.order} | ${(b.element || '').replace(/\|/g, '/')} | ${(b.heading || '—').replace(/\|/g, '/')} | ${b.height}px (${b.viewportsTall} vh) | ${b.display}${b.columns ? `, ${b.columns} col` : ''} | ${contenido || '—'} |`
    );
  });
  L.push('');
  L.push(`Alto total del home: ${lay.page.scrollHeight}px (${lay.page.viewportsTall} viewports). ${lay.blocksCount} bloques de primer nivel.`);
  L.push('');
  if (c.navigation) {
    L.push('**Navegación principal**');
    L.push('');
    L.push(`- ${c.navigation.topLevelItems} ítems de primer nivel, ${c.navigation.totalLinks} links en total, header \`position: ${c.navigation.sticky}\`${c.navigation.hasSearch ? ', con buscador' : ''}.`);
    (c.navigation.items || []).slice(0, 12).forEach((it) => L.push(`  - ${it.label || '(sin texto)'}${it.submenuItems ? ` → submenú con ${it.submenuItems} links${it.hasMegaMenu ? ' (mega menú)' : ''}` : ''}`));
    L.push('');
  }
  if (c.footer) {
    L.push(`**Footer**: ${c.footer.columns} columnas, ${c.footer.links} links, ${c.footer.socialLinks} redes${c.footer.hasNewsletter ? ', con formulario de newsletter' : ''}${c.footer.paymentIcons ? `, ${c.footer.paymentIcons} medios de pago` : ''}.`);
    L.push('');
  }
  if ((lay.layers || []).length) {
    L.push(`**Capas fijas**: ${lay.layers.slice(0, 5).map((x) => `${x.role} (${x.position}, z-index ${x.zIndex})`).join(' · ')}. Definir una escala de z-index documentada.`);
    L.push('');
  }

  /* ---- 5. componentes ---- */
  L.push('## 5. Componentes a construir');
  L.push('');
  L.push('| Componente | Cantidad en el original | Nota de implementación |');
  L.push('| --- | --- | --- |');
  const notes = {
    buttons: 'un solo componente `Button` con variantes',
    links: 'links internos con el router, externos con `rel="noopener"`',
    forms: 'validación accesible con mensajes asociados al campo',
    inputs: 'componente `Input` con label obligatorio',
    images: 'componente de imagen optimizada (AVIF/WebP + sizes)',
    svg: 'sprite o componentes de ícono, no SVG inline duplicado',
    videosEmbeds: 'carga diferida con póster; no autoplay con sonido',
    modals: '`<dialog>` nativo o Radix, con foco atrapado y cierre por Escape',
    tables: 'contenedor con scroll propio + `th` con `scope`',
    carousels: 'accesible por teclado, con pausa; considerar scroll-snap en lugar de librería',
    cards: 'componente `Card` con variantes',
    accordions: '`<details>` o accordion accesible con `aria-expanded`',
    tabs: 'patrón tablist/tab/tabpanel con navegación por flechas',
    breadcrumbs: '`nav[aria-label="Breadcrumb"]` + JSON-LD BreadcrumbList',
    pagination: 'links reales navegables, no solo JS',
    badges: 'componente `Badge` con variantes semánticas',
    search: 'input tipo search con `role="search"` y resultados accesibles',
    newsletter: 'formulario con estados de carga, éxito y error',
    prices: 'formateo de moneda centralizado (Intl.NumberFormat es-AR)',
    addToCart: 'estado optimista + feedback accesible al agregar',
  };
  Object.keys(c.counts)
    .filter((k) => c.counts[k] > 0 && notes[k])
    .sort((a2, b2) => c.counts[b2] - c.counts[a2])
    .forEach((k) => L.push(`| ${k} | ${c.counts[k]} | ${notes[k]} |`));
  L.push('');

  if ((c.buttonVariants || []).length) {
    L.push('**Variantes de botón detectadas** (usar como base del componente `Button`)');
    L.push('');
    L.push('| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |');
    L.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
    c.buttonVariants.slice(0, 6).forEach((v, i) => {
      const nombre = i === 0 ? 'primary' : i === 1 ? 'secondary' : i === 2 ? 'ghost' : `alt-${i - 1}`;
      L.push(`| ${nombre} | ${v.count} | \`${v.styles.backgroundColor}\` | \`${v.styles.color}\` | ${v.styles.borderRadius} | ${v.styles.padding} | ${v.styles.fontSize} | ${v.styles.fontWeight} |`);
    });
    L.push('');
    L.push(`El original tiene ${c.buttonVariants.length}+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).`);
    L.push('');
  }
  if ((c.cardVariants || []).length) {
    L.push('**Variantes de card**');
    L.push('');
    L.push('| Variante | Usos | Fondo | Radio | Sombra | Padding | Tamaño típico |');
    L.push('| --- | --- | --- | --- | --- | --- | --- |');
    c.cardVariants.slice(0, 5).forEach((v, i) =>
      L.push(`| card-${i + 1} | ${v.count} | \`${v.styles.backgroundColor}\` | ${v.styles.borderRadius} | ${v.styles.boxShadow === 'none' ? 'sin sombra' : `\`${v.styles.boxShadow}\``} | ${v.styles.padding} | ${v.commonSize} |`)
    );
    L.push('');
  }
  if ((c.forms || []).length) {
    L.push('**Formularios del original**');
    L.push('');
    c.forms.slice(0, 4).forEach((f, i) => {
      const campos = (f.fields || []).map((x) => `${x.name || x.type}${x.required ? '*' : ''} (${x.type})`).join(', ');
      L.push(`- Form ${i + 1} — ${f.method} → \`${f.action}\`, submit "${f.submit || '—'}": ${campos || 'sin campos'}`);
    });
    L.push('');
  }
  if ((c.carousels || []).length) {
    L.push(`**Carruseles**: ${c.carousels.length} en el home (${Array.from(new Set(c.carousels.map((x) => x.lib))).join(', ')}), con ${c.carousels.map((x) => x.slides).join('/')} slides. ${c.carousels.some((x) => x.autoplayHint) ? 'Alguno tiene autoplay: en la nueva app el autoplay debe poder pausarse y respetar `prefers-reduced-motion`.' : ''}`);
    L.push('');
  }

  /* ---- 5b. catálogo ---- */
  if (r.catalog && !r.catalog.error && r.catalog.cardsDetected > 2) {
    const cat = r.catalog;
    L.push('## 5b. Estructura del listado y de la card');
    L.push('');
    L.push(`El sitio muestra **${cat.cardsDetected}** cards de producto con **${cat.fieldsPerCard}** campos en promedio${cat.grid ? `, ${cat.grid.perRow} por fila, de ${cat.grid.commonSize}` : ''}.`);
    L.push('');
    L.push('| Bloque de la card | Cards que lo muestran | Obligatorio en la estructura |');
    L.push('| --- | --- | --- |');
    (cat.fieldFrequency || []).slice(0, 14).forEach((f) => {
      L.push(`| ${f.value} | ${f.count} | ${f.count >= cat.cardsDetected * 0.6 ? 'sí' : 'opcional'} |`);
    });
    L.push('');
    const b = cat.b2b || {};
    const b2bLines = [];
    if (b.pricesHiddenHint) b2bLines.push('Parte del contenido aparece solo con sesión iniciada: la card debe soportar un estado "sin precio" sin romperse.');

    if (b.unitOfSaleShown) b2bLines.push(`Muestra unidad de venta en ${b.unitOfSaleShown} card(s): el producto necesita unidad (bulto, caja, pack) y factor de conversión.`);
    if (b.minQuantityShown) b2bLines.push(`Muestra cantidad mínima en ${b.minQuantityShown} card(s): validar el mínimo en el carrito, no solo mostrarlo.`);
    if (b.stockShown) b2bLines.push(`Muestra stock en ${b.stockShown} card(s): prever estado de stock y comportamiento cuando falta.`);
    if (b.quantitySelectors) b2bLines.push(`Hay ${b.quantitySelectors} selectores de cantidad en la grilla: se puede agregar al carrito desde el listado, sin entrar al producto.`);
    if (b.cuitFields) b2bLines.push('El registro pide CUIT: el formulario de alta es de empresas, no de consumidores.');
    if ((b.mentions || []).length) b2bLines.push(`Vocabulario del rubro presente: ${b.mentions.join(', ')}.`);
    if (b2bLines.length) {
      L.push('**Notas de estructura:**');
      L.push('');
      b2bLines.forEach((x) => L.push(`- ${x}`));
      L.push('');
    }
    const sample = (cat.samples || [])[0];
    if (sample) {
      L.push(`**Orden de los campos en la card** (${sample.size}, radio ${sample.borderRadius}, padding ${sample.padding}): ${(sample.fields || []).map((f) => f.kind).join(' → ')}`);
      L.push('');
    }
  }

  /* ---- 6. responsive ---- */
  L.push('## 6. Comportamiento responsive');
  L.push('');
  L.push(`- Breakpoints declarados en el CSS original: ${(rs.declaredBreakpoints || []).join(', ') || '—'}`);
  L.push(`- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.`);
  L.push(`- Menú: colapsar a hamburguesa por debajo de ${rs.burgerThreshold || 1024}px, con panel accesible (foco atrapado, cierre por Escape).`);
  L.push(`- Contenedor: máximo ${(val(layoutWidths, 1)[0]) || '1280px'}, centrado, con padding lateral ${(val(lay.containerPaddings, 1)[0]) || '16px'}.`);
  L.push('');
  const probes = (r.responsive || []).filter((x) => x && !x.error && !x.emulatedTouch);
  if (probes.length) {
    L.push('| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |');
    L.push('| --- | --- | --- | --- | --- |');
    probes.forEach((x) => L.push(`| ${x.width}px | ${num(x.cardsPerRow)} | ${x.navLinksVisible} | ${num(x.headerHeight)} | ${num(x.h1FontSize)} |`));
    L.push('');
  }
  (rs.transitions || []).slice(0, 6).forEach((tr) => L.push(`- De ${tr.from}px a ${tr.to}px: ${tr.changes.join('; ')}`));
  L.push('');
  L.push('**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.');
  L.push('');

  /* ---- 7. animaciones ---- */
  L.push('## 7. Movimiento e interacción');
  L.push('');
  L.push(`- Duraciones del original: ${listOf(an.transitionDurations, 3)} · easings: ${listOf(an.transitionEasings, 3)}`);
  L.push(`- Propiedades animadas: ${listOf(an.transitionProperties, 5)}`);
  L.push(`- En \`:hover\` cambian: ${listOf(an.hoverProperties, 5)}`);
  L.push(`- ${an.elementsWithTransition} elementos con transición y ${an.elementsWithAnimation} con animación; ${(an.keyframesDefined || []).length} \`@keyframes\` declarados.`);
  if ((an.scrollRevealHints || []).length) L.push(`- Animación al hacer scroll en el original: ${an.scrollRevealHints.join(' · ')}. Reimplementar con \`IntersectionObserver\` liviano, animando solo \`transform\` y \`opacity\`.`);
  if (r.interactions) {
    const ix = r.interactions;
    const hov = (ix.hover || []).filter((h) => h.changed);
    if (hov.length) {
      const props = Array.from(new Set(hov.flatMap((h) => (h.changes || []).map((c) => c.property))));
      L.push(`- En hover, los botones del original cambian: ${props.join(', ')}. Replicar ese tipo de respuesta, no necesariamente los valores.`);
    } else if ((ix.hover || []).length) {
      L.push('- Los botones del original **no dan feedback visual en hover**. La app nueva debe darlo.');
    }
    if (ix.focus) L.push(`- Foco de teclado del original: ${ix.focus.visible ? `visible (${ix.focus.outline})` : '**inexistente**, hay que agregarlo'}.`);
    if (ix.megaMenu && ix.megaMenu.size) L.push(`- Menú de categorías: panel de ${ix.megaMenu.size}${ix.megaMenu.fullWidth ? ' a ancho completo' : ''} con ${ix.megaMenu.links} links${ix.megaMenu.columns ? ` en ${ix.megaMenu.columns} columnas` : ''}. Accesible por teclado y con cierre por Escape.`);
    if (ix.filters) L.push(`- Filtros: ${ix.filters.alwaysVisible ? 'barra lateral siempre visible' : 'panel que se abre con un botón'}, ${ix.filters.checkboxes} checkboxes${(ix.filters.groups || []).length ? `, grupos: ${ix.filters.groups.join(', ')}` : ''}.`);
    if (ix.cart) L.push(`- Carrito: ${ix.cart.isDrawer ? 'drawer lateral' : 'popover'} de ${ix.cart.size} a la ${ix.cart.side}.`);
    if (ix.searchSuggestions && ix.searchSuggestions.hasSuggestions) L.push(`- Buscador con autocompletado: ${ix.searchSuggestions.items} sugerencias${ix.searchSuggestions.showsImages ? ' con imágenes' : ''}${ix.searchSuggestions.showsPrices ? ' y precios' : ''}. Implementarlo con debounce y navegable por teclado.`);
  }
  L.push('- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.');
  L.push('');

  /* ---- 8. contenido y datos ---- */
  L.push('## 8. Contenido y datos');
  L.push('');
  L.push(`- El home del original tiene ${lay.dom.textNodes} caracteres de texto visible, ${c.counts.images} imágenes y ${c.counts.links} links.`);
  L.push('- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.');
  L.push(`- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD${(r.meta.jsonLdTypes || []).length ? ` (el original usa: ${r.meta.jsonLdTypes.join(', ')})` : ''}.`);
  L.push(`- Idioma: \`lang="${r.meta.lang || 'es-AR'}"\`. Formatear moneda y fechas con \`Intl\`.`);
  if (r.content && !r.content.error) {
    const ct = r.content;
    if (ct.h1) L.push(`- H1 actual: "${ct.h1}".`);
    if ((ct.valueProps || []).length) L.push(`- Propuestas de valor que ya comunica: ${ct.valueProps.slice(0, 5).map((v) => `"${v.text}"`).join(' · ')}`);
    if ((ct.ctas || []).length) L.push(`- CTAs en uso: ${ct.ctas.slice(0, 8).map((c) => `"${c.value}" (${c.count})`).join(' · ')}. Mantener el mismo vocabulario para no confundir al usuario.`);
    if ((ct.promises || []).length) L.push(`- Promesas que hay que sostener en la app nueva: ${ct.promises.join(', ')}.`);
    if ((ct.categories || []).length) L.push(`- Taxonomía de la navegación: ${ct.categories.slice(0, 15).join(' · ')}`);
    const tn = ct.tone || {};
    L.push(`- Tono: ${tn.registro}, ${tn.palabrasPorOracion} palabras por oración, ${tn.porcentajeMayusculas}% de mayúsculas sostenidas. Escribir los textos nuevos con ese registro.`);
    if (ct.search && ct.search.present) L.push(`- Buscador con placeholder "${ct.search.placeholder || ''}"${ct.search.inHeader ? ' en el header' : ''}: mantenerlo prominente.`);
  }

  L.push('');

  /* ---- 9. mejoras exigidas ---- */
  L.push('## 9. Mejoras obligatorias respecto del original');
  L.push('');
  const imp = improvements(r);
  if (imp.length) imp.forEach((x, i) => L.push(`${i + 1}. ${x}`));
  else L.push('El original no presenta problemas medibles en accesibilidad ni rendimiento: mantener el nivel.');
  L.push('');

  /* ---- referencias visuales ---- */
  const crops = (r.screenshots && r.screenshots.components) || {};
  const cropKeys = Object.keys(crops);
  if (cropKeys.length) {
    L.push('## 9b. Referencias visuales del original');
    L.push('');
    L.push('Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):');
    L.push('');
    const order = (k) => (k.startsWith('zone') ? 0 : k.startsWith('btn') ? 1 : k.startsWith('card') ? 2 : 3);
    cropKeys
      .sort((a2, b2) => order(a2) - order(b2) || a2.localeCompare(b2))
      .forEach((k) => L.push(`[${crops[k].label}](${(opts && opts.prefix) || '../../'}${crops[k].path})`));
    L.push('');
  }

  /* ---- 10. criterios de aceptacion ---- */
  L.push('## 10. Criterios de aceptación');
  L.push('');
  const pf = r.perf;
  const baseLcp = pf.lcp ? pf.lcp.timeMs : null;
  const baseCls = pf.cls === null || pf.cls === undefined ? null : pf.cls;
  L.push(
    table2([
      ['Métrica', 'Original', 'Objetivo'],
      ['LCP', baseLcp ? `${baseLcp} ms` : 'sin dato', '< 2500 ms'],
      ['CLS', baseCls === null ? 'sin dato' : String(baseCls), '< 0.1'],
      ['FCP', pf.paint && pf.paint['first-contentful-paint'] ? `${pf.paint['first-contentful-paint']} ms` : 'sin dato', '< 1800 ms'],
      ['TTFB', pf.navigation ? `${pf.navigation.ttfbMs} ms` : 'sin dato', '< 800 ms'],
      ['Requests', String(r.network.totalRequests), `< ${Math.max(40, Math.round(r.network.totalRequests * 0.6))}`],
      ['Peso transferido', `${r.network.totalKb} KB`, `< ${Math.max(500, Math.round(r.network.totalKb * 0.6))} KB`],
      ['Nodos DOM', String(r.layout.dom.totalNodes), `< ${Math.max(1200, Math.round(r.layout.dom.totalNodes * 0.6))}`],
      ['Imágenes sin alt', `${r.a11y.imagesWithoutAlt}`, '0'],
      ['Inputs sin label', `${r.a11y.inputsWithoutLabel}`, '0'],
      ['Fallos de contraste AA', `${r.contrast.totalIssues}`, '0'],
      ['Overflow horizontal', (rs.horizontalOverflowAt || []).length ? `sí (${rs.horizontalOverflowAt.map((o) => o.width + 'px').join(', ')})` : 'no', 'no, en ningún breakpoint'],
      ['Errores de consola', String((r.consoleErrors || []).length), '0'],
    ])
  );
  const lh = r.lighthouse;
  if (lh && lh.categories) {
    L.push('');
    L.push(`**Línea base de Lighthouse del sitio actual** (perfil ${lh.preset}, con throttling — estos son los números a superar):`);
    L.push('');
    const a3 = lh.audits || {};
    L.push(
      table2([
        ['Categoría / métrica', 'Original', 'Objetivo'],
        ['Performance', `${lh.categories.performance}/100`, '≥ 90'],
        ['Accesibilidad', `${lh.categories.accessibility}/100`, '≥ 95'],
        ['Best practices', `${lh.categories['best-practices']}/100`, '≥ 95'],
        ['SEO', `${lh.categories.seo}/100`, '≥ 95'],
        ['LCP', a3['largest-contentful-paint'] ? a3['largest-contentful-paint'].display : '—', '< 2,5 s'],
        ['TBT', a3['total-blocking-time'] ? a3['total-blocking-time'].display : '—', '< 200 ms'],
        ['CLS', a3['cumulative-layout-shift'] ? a3['cumulative-layout-shift'].display : '—', '< 0,1'],
        ['Speed Index', a3['speed-index'] ? a3['speed-index'].display : '—', '< 3,4 s'],
      ])
    );
    if ((lh.opportunities || []).length) {
      L.push('Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:');
      L.push('');
      lh.opportunities.slice(0, 8).forEach((o) =>
        L.push(`- ${o.title}${o.savingsMs ? ` (ahorro estimado ${o.savingsMs} ms)` : ''}${o.savingsKb ? ` (${o.savingsKb} KB)` : ''}`)
      );
      L.push('');
    }
  }
  L.push('- Lighthouse ≥ 90 en Performance, Accessibility, Best Practices y SEO (mobile, con throttling).');
  L.push('- Navegación completa por teclado, con foco visible en todos los elementos interactivos.');
  L.push('- Sin scroll horizontal entre 320px y 1920px.');
  L.push('');

  /* ---- 11. entregables ---- */
  L.push('## 11. Entregables esperados');
  L.push('');
  L.push('1. Proyecto que compila y corre con `npm install && npm run dev`.');
  L.push('2. Tokens de diseño centralizados (variables CSS + config del framework de estilos).');
  L.push('3. Componentes reutilizables tipados, con las variantes de la sección 5.');
  L.push('4. Las secciones de la sección 4 armadas con datos de ejemplo.');
  L.push('5. README con estructura de carpetas, decisiones tomadas y cómo reemplazar el contenido de ejemplo.');
  L.push('');
  L.push('**No incluir:** logos, marcas, fotos ni textos del sitio original. Usar placeholders propios.');
  L.push('');

  return L.join('\n');
};

function table2(rows) {
  const out = [];
  out.push(`| ${rows[0].join(' | ')} |`);
  out.push(`| ${rows[0].map(() => '---').join(' | ')} |`);
  rows.slice(1).forEach((r) => out.push(`| ${r.join(' | ')} |`));
  return out.join('\n') + '\n';
}
