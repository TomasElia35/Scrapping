'use strict';

/** Genera reporte.md a partir del array de resultados. */

const esc = (v) =>
  String(v === null || v === undefined || v === '' ? '—' : v)
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
    .replace(/</g, '&lt;');

function table(headers, rows) {
  const clean = (rows || []).filter(Boolean);
  if (!clean.length) return '_sin datos_\n';
  const out = [`| ${headers.join(' | ')} |`, `| ${headers.map(() => '---').join(' | ')} |`];
  clean.forEach((r) => out.push(`| ${r.map(esc).join(' | ')} |`));
  return out.join('\n') + '\n';
}

const topTable = (title, list, header) =>
  `**${title}**\n\n` + table([header || 'Valor', 'Usos'], (list || []).map((i) => [i.value, i.count]));

const yn = (b) => (b ? 'sí' : 'no');
const kv = (obj) => table(['Campo', 'Valor'], Object.keys(obj || {}).map((k) => [k, obj[k]]));

function details(summary, body) {
  return `<details>\n<summary>${summary}</summary>\n\n${body}\n</details>\n`;
}

/* ------------------------------------------------------------------ */

function siteSection(r, idx, prefix, headingLevel) {
  const L = [];
  const pfx = prefix || '';
  const link = (x) => (x ? `${pfx}${x}` : x);
  const h = headingLevel || 2;
  const hh = '#'.repeat(h);
  if (h === 2) {
    L.push('---');
    L.push('');
  }
  L.push(`${hh} ${idx ? `${idx}. ` : ''}${r.name}`);
  L.push('');
  L.push(`- URL: ${r.url}`);

  if (!r.ok) {
    L.push(`- **ERROR:** \`${esc(r.error)}\``);
    L.push('');
    if (r.steps && r.steps.length) L.push(details('Pasos ejecutados antes del error', '```\n' + r.steps.join('\n') + '\n```'));
    return L.join('\n');
  }

  L.push(`- URL final: ${r.finalUrl}`);
  L.push(`- HTTP ${r.status} · estrategia de espera: ${r.waitStrategy} · carga ${r.loadMs} ms · análisis total ${(r.totalMs / 1000).toFixed(1)} s`);
  L.push(
    `- Elementos analizados: ${r.elementsScanned}${r.scanCapped ? ` de ${r.elementsTotal} (**tope alcanzado**: las frecuencias son de una muestra, no del total)` : ''}` +
      ` · nodos DOM: ${r.layout.dom.totalNodes} · profundidad máx: ${r.layout.dom.maxDepth}`
  );
  if (r.role) L.push(`- Rol en el proyecto: **${r.role === 'cliente' ? 'sitio del cliente' : 'referencia (competencia)'}**${r.label ? ` — ${r.label}` : ''}`);
  const sc = r.screenshots;
  const bpLinks = Object.keys(sc.breakpoints || {}).map((w) => `[${w}px](${link(sc.breakpoints[w])})`);
  L.push(
    `- Capturas: ${sc.desktop ? `[desktop full](${link(sc.desktop)})` : '—'}` +
      `${sc.mobile ? ` · [mobile full](${link(sc.mobile)})` : ''}` +
      `${sc.popup ? ` · [popup inicial](${link(sc.popup)})` : ''}` +
      `${bpLinks.length ? ` · breakpoints: ${bpLinks.join(' ')}` : ''}`
  );
  L.push('');

  /* ---- páginas analizadas ---- */
  const pages = (r.pages || []).filter((x) => x);
  if (pages.length > 1) {
    L.push('### Páginas analizadas');
    L.push('');
    L.push(
      table(
        ['#', 'Tipo', 'URL', 'Origen', 'Estado', 'Elementos', 'Botones', 'Cards', 'Alto', 'Overflow X'],
        pages.map((x, i) => [
          i + 1,
          x.pageLabel || x.pageType,
          (() => {
            try {
              return new URL(x.url).pathname;
            } catch (e) {
              return x.url;
            }
          })(),
          x.source || '—',
          x.ok ? '✓' : `✗ ${x.error || ''}`,
          x.ok ? x.elementsScanned : '—',
          x.ok ? x.components.counts.buttons : '—',
          x.ok ? x.components.counts.cards : '—',
          x.ok ? `${x.layout.page.scrollHeight}px` : '—',
          x.ok ? ((x.responsiveSummary.horizontalOverflowAt || []).length ? 'sí' : 'no') : '—',
        ])
      )
    );
    L.push(`El detalle completo que sigue corresponde al **home**. Las demás páginas están resumidas al final, en "Páginas adicionales".`);
    L.push('');
  }

  /* ---- 0. recorrido ---- */
  L.push('### 0. Recorrido del análisis y popups');
  L.push('');
  if (r.popups.detected.length) {
    L.push(`Overlays detectados al entrar: **${r.popups.detected.length}**`);
    L.push('');
    L.push(
      table(
        ['Elemento', 'Tipo', 'Tamaño', 'position', 'z-index', 'Tapa viewport', 'Form', 'Texto'],
        r.popups.detected.slice(0, 10).map((d) => [d.element, d.kind, d.size, d.position, d.zIndex, yn(d.coversViewport), yn(d.hasForm), d.text])
      )
    );
    L.push(`Cierres ejecutados: ${r.popups.dismissed.length ? r.popups.dismissed.map((d) => `\`${esc(d)}\``).join(', ') : '_ninguno (solo Escape)_'}`);
    L.push('');
    L.push(`Overlays visibles después del cierre: **${r.popups.stillVisible}**`);
  } else {
    L.push('Sin popups ni banners de cookies detectados al entrar.');
  }
  L.push('');
  if (r.consoleErrors && r.consoleErrors.length) {
    L.push(details(`Errores de consola (${r.consoleErrors.length})`, '```\n' + r.consoleErrors.join('\n') + '\n```'));
  }
  L.push(details('Traza paso a paso', '```\n' + (r.steps || []).join('\n') + '\n```'));
  L.push('');

  /* ---- 1. meta ---- */
  const m = r.meta;
  L.push('### 1. Meta, SEO y datos estructurados');
  L.push('');
  L.push(
    table(
      ['Campo', 'Valor'],
      [
        ['title', `${m.title} _(${m.titleLength} car.)_`],
        ['description', `${m.description} _(${m.descriptionLength} car.)_`],
        ['viewport', m.viewport],
        ['lang / dir / charset', `${m.lang} / ${m.dir} / ${m.charset}`],
        ['favicon', m.favicon],
        ['og:image', m.ogImage],
        ['canonical', m.canonical],
        ['robots', m.robots],
        ['theme-color', m.themeColor],
        ['generator', m.generator],
        ['manifest (PWA)', m.manifest],
        ['hreflang', (m.hreflang || []).join(', ')],
        ['JSON-LD', (m.jsonLdTypes || []).join(', ')],
        ['meta tags', m.metaTagCount],
        ['peso del HTML', `${Math.round(m.htmlBytes / 1024)} KB`],
      ]
    )
  );
  if ((m.resourceHints || []).length) {
    L.push(details('Resource hints (preload/preconnect)', table(['Hint'], m.resourceHints.map((h) => [h]))));
  }
  L.push(details('Open Graph / Twitter completos', kv(Object.assign({}, m.og, m.twitter))));
  L.push('');

  /* ---- 2. stack ---- */
  L.push('### 2. Stack tecnológico');
  L.push('');
  L.push(table(['Tecnología', 'Detectado'], Object.keys(r.stack).map((k) => [k, yn(r.stack[k])])));
  L.push(`**Otras detecciones:** ${(r.stackExtras || []).length ? r.stackExtras.join(' · ') : '—'}`);
  L.push('');
  L.push(
    table(
      ['Assets', 'Cantidad'],
      [
        ['scripts externos', r.stackAssets.externalScripts],
        ['scripts inline', r.stackAssets.inlineScripts],
        ['hojas de estilo externas', r.stackAssets.externalStylesheets],
        ['tags <style>', r.stackAssets.inlineStyleTags],
        ['hosts de scripts', (r.stackAssets.scriptHosts || []).length],
      ]
    )
  );
  L.push(details('Hosts que sirven scripts', table(['Host'], (r.stackAssets.scriptHosts || []).map((h) => [h]))));
  L.push('');

  /* ---- 3. layout ---- */
  const lay = r.layout;
  L.push('### 3. Estructura y layout');
  L.push('');
  L.push(table(['Landmark', 'Cantidad'], Object.keys(lay.landmarks).map((k) => [k, lay.landmarks[k]])));
  L.push(
    table(
      ['Métrica', 'Valor'],
      [
        ['display:grid', lay.displayStats.grid],
        ['display:flex', lay.displayStats.flex],
        ['position:sticky', lay.displayStats.sticky],
        ['position:fixed', lay.displayStats.fixed],
        ['position:absolute', lay.displayStats.absolute],
        ['elementos con cursor:pointer', lay.displayStats.cursorPointer],
        ['alto de página', `${lay.page.scrollHeight}px (${lay.page.viewportsTall} viewports)`],
        ['overflow horizontal @1440', yn(lay.page.horizontalOverflow)],
        ['background del body', lay.page.bodyBackground],
        ['nodos DOM / profundidad máx / media', `${lay.dom.totalNodes} / ${lay.dom.maxDepth} / ${lay.dom.avgDepth}`],
        ['elemento más profundo', lay.dom.deepestElement],
        ['caracteres de texto visible', lay.dom.textNodes],
      ]
    )
  );
  L.push(topTable('max-width de contenedores (más frecuentes)', lay.containerMaxWidths, 'max-width'));
  L.push(topTable('padding lateral de contenedores', lay.containerPaddings, 'padding izq / der'));
  L.push(topTable('z-index en uso', lay.displayStats.zIndexes, 'z-index'));
  L.push('');
  L.push('**Anatomía sección por sección (orden de scroll)**');
  L.push('');
  L.push(
    table(
      ['#', 'Elemento', 'Encabezado', 'Alto', 'Vh', 'display', 'Cols', 'Padding', 'Fondo', 'Hijos', 'Img', 'Links', 'Btn', 'Cards'],
      (lay.blocks || []).map((b) => [
        b.order,
        b.element,
        b.heading,
        `${b.height}px`,
        b.viewportsTall,
        b.display,
        b.columns,
        b.padding,
        b.background,
        b.children,
        b.images,
        b.links,
        b.buttons,
        b.cards,
      ])
    )
  );
  if ((lay.layers || []).length) {
    L.push('**Capas sticky / fixed**');
    L.push('');
    L.push(
      table(
        ['Elemento', 'position', 'z-index', 'Tamaño', 'top', 'bottom', 'Fondo', 'Rol inferido'],
        lay.layers.map((x) => [x.element, x.position, x.zIndex, x.size, x.top, x.bottom, x.background, x.role])
      )
    );
  }
  if ((lay.grids || []).length) {
    L.push(
      details(
        'Grillas CSS reales',
        table(['Elemento', 'grid-template-columns', 'rows', 'gap', 'Items'], lay.grids.map((g) => [g.element, g.columns, g.rows, g.gap, g.items]))
      )
    );
  }
  if ((lay.overflowingElements || []).length) {
    L.push('**Elementos que exceden el viewport @1440**');
    L.push('');
    L.push(table(['Elemento', 'Ancho'], lay.overflowingElements.map((o) => [o.element, `${o.width}px`])));
  }
  L.push('');

  /* ---- 4. tipografia ---- */
  const t = r.typography;
  L.push('### 4. Tipografía');
  L.push('');
  L.push(topTable('font-family (top 5 por uso real)', t.fontFamilies, 'font-family'));
  L.push(topTable('font-size (top 8)', t.fontSizes, 'font-size'));
  L.push(topTable('font-weight (top 5)', t.fontWeights, 'font-weight'));
  L.push(topTable('line-height (top 5)', t.lineHeights, 'line-height'));
  L.push(topTable('letter-spacing', t.letterSpacings, 'letter-spacing'));
  L.push(topTable('text-transform', t.textTransforms, 'text-transform'));
  L.push('**Escala tipográfica real por elemento**');
  L.push('');
  L.push(
    table(
      ['Elemento', 'size', 'weight', 'line-height', 'letter-spacing', 'familia', 'color'],
      Object.keys(t.typeScale || {}).map((k) => {
        const v = t.typeScale[k];
        return [k, v.fontSize, v.fontWeight, v.lineHeight, v.letterSpacing, v.fontFamily, v.color];
      })
    )
  );
  L.push(
    `**Consistencia:** ${t.distinct.families} familias distintas · ${t.distinct.sizes} tamaños · ${t.distinct.weights} pesos · ${t.distinct.lineHeights} line-heights` +
      `${t.distinct.sizes > 15 ? ' → escala poco sistematizada' : ' → escala acotada'}`
  );
  L.push('');
  if ((t.loadedFonts || []).length) {
    L.push(details('Fuentes cargadas (document.fonts)', table(['Fuente'], t.loadedFonts.map((f) => [f]))));
  }
  L.push(details('font-size — lista extendida', topTable('font-size (top 20)', t.fontSizesAll, 'font-size')));
  L.push('');

  /* ---- 5. paleta ---- */
  const p = r.palette;
  L.push('### 5. Paleta de color');
  L.push('');
  L.push(topTable('Colores de texto (top 8)', p.textColors, 'color'));
  L.push(topTable('Backgrounds (top 8, sin transparentes)', p.backgrounds, 'background'));
  L.push(topTable('Colores de borde (top 5)', p.borderColors, 'border-color'));
  if ((p.gradients || []).length) L.push(topTable('Gradientes', p.gradients, 'background-image'));
  L.push(`**Amplitud:** ${p.distinct.text} colores de texto distintos · ${p.distinct.background} de fondo · ${p.distinct.border} de borde`);
  L.push('');
  L.push(details('Paleta extendida (top 20 de cada grupo)', topTable('Texto', p.textColorsAll, 'color') + '\n' + topTable('Fondos', p.backgroundsAll, 'background')));
  L.push('');

  /* ---- 6. espaciado ---- */
  const s = r.spacing;
  L.push('### 6. Sistema de espaciado y superficie');
  L.push('');
  L.push(topTable('border-radius (top 6)', s.borderRadius, 'border-radius'));
  L.push(topTable('box-shadow (top 5)', s.boxShadows, 'box-shadow'));
  L.push(topTable('gap (top 6)', s.gaps, 'gap'));
  L.push(topTable('padding (top 8)', s.paddings, 'padding'));
  L.push(topTable('margin (top 8)', s.margins, 'margin'));
  L.push(topTable('border-width', s.borderWidths, 'border-width'));
  L.push(`**Amplitud:** ${s.distinct.radius} radios · ${s.distinct.shadow} sombras · ${s.distinct.gap} gaps · ${s.distinct.padding} paddings distintos`);
  L.push('');

  /* ---- 7. componentes ---- */
  const c = r.components;
  L.push('### 7. Inventario de componentes');
  L.push('');
  L.push(table(['Componente', 'Cantidad'], Object.keys(c.counts).map((k) => [k, c.counts[k]])));

  L.push('**Variantes de botón (agrupadas por firma de estilo)**');
  L.push('');
  L.push(
    table(
      ['Usos', 'Ejemplos', 'Fondo', 'Texto', 'Radio', 'Padding', 'Size', 'Weight', 'Borde', 'Sombra', 'Tamaño típico'],
      (c.buttonVariants || []).map((v) => [
        v.count,
        v.samples.join(' / '),
        v.styles.backgroundColor,
        v.styles.color,
        v.styles.borderRadius,
        v.styles.padding,
        v.styles.fontSize,
        v.styles.fontWeight,
        `${v.styles.borderTopWidth} ${v.styles.borderTopColor}`,
        v.styles.boxShadow === 'none' ? '—' : v.styles.boxShadow,
        v.commonSize,
      ])
    )
  );

  L.push('**Variantes de card**');
  L.push('');
  L.push(
    table(
      ['Usos', 'Ejemplos', 'Fondo', 'Radio', 'Sombra', 'Padding', 'Borde', 'Tamaño típico'],
      (c.cardVariants || []).map((v) => [
        v.count,
        v.samples.join(' / '),
        v.styles.backgroundColor,
        v.styles.borderRadius,
        v.styles.boxShadow === 'none' ? '—' : v.styles.boxShadow,
        v.styles.padding,
        `${v.styles.borderTopWidth} ${v.styles.borderTopColor}`,
        v.commonSize,
      ])
    )
  );

  L.push('**Variantes de input**');
  L.push('');
  L.push(
    table(
      ['Usos', 'Ejemplos', 'Fondo', 'Radio', 'Padding', 'Alto', 'Size', 'Borde'],
      (c.inputVariants || []).map((v) => [v.count, v.samples.join(' / '), v.styles.backgroundColor, v.styles.borderRadius, v.styles.padding, v.styles.height, v.styles.fontSize, `${v.styles.borderTopWidth} ${v.styles.borderTopColor}`])
    )
  );

  L.push('**Links**');
  L.push('');
  const lk = c.links;
  L.push(
    table(
      ['Métrica', 'Valor'],
      [
        ['total', lk.total],
        ['internos', lk.internal],
        ['externos', lk.external],
        ['anclas (#)', lk.anchors],
        ['tel: / mailto:', `${lk.tel} / ${lk.mail}`],
        ['javascript:', lk.javascript],
        ['rel=nofollow', lk.nofollow],
        ['target=_blank', lk.targetBlank],
        ['sin texto ni aria-label', lk.withoutText],
      ]
    )
  );
  if ((lk.topExternalHosts || []).length) L.push(topTable('Dominios externos más enlazados', lk.topExternalHosts, 'Host'));

  L.push('**Imágenes**');
  L.push('');
  const im = c.images;
  L.push(
    table(
      ['Métrica', 'Valor'],
      [
        ['total', im.total],
        ['loading=lazy / eager / sin atributo', `${im.lazy} / ${im.eager} / ${im.withoutLoadingAttr}`],
        ['con srcset o <picture>', im.withSrcset],
        ['sobredimensionadas (>2x del tamaño mostrado)', im.oversized],
        ['sin width/height declarados (riesgo de CLS)', im.missingDimensions],
        ['decorativas (alt="")', im.decorative],
        ['formatos', (im.formats || []).map((f) => `${f.value}: ${f.count}`).join(' · ')],
      ]
    )
  );
  L.push(
    details(
      'Detalle de imágenes (muestra)',
      table(
        ['src', 'Host', 'Mostrada', 'Natural', 'Sobredim.', 'loading', 'srcset', 'alt', 'object-fit', 'radio'],
        (im.detail || []).map((d) => [d.src, d.host, d.displayed, d.natural, yn(d.oversized), d.loading, yn(d.srcset), d.alt, d.objectFit, d.radius])
      )
    )
  );

  if ((c.forms || []).length) {
    L.push('**Formularios**');
    L.push('');
    c.forms.forEach((f, i) => {
      L.push(`_Form ${i + 1}: \`${esc(f.element)}\` → ${esc(f.method)} ${esc(f.action)} · submit: ${esc(f.submit)} · novalidate: ${yn(f.novalidate)}_`);
      L.push('');
      L.push(table(['Campo', 'Tipo', 'name', 'placeholder', 'Requerido', 'autocomplete', 'pattern'], f.fields.map((x) => [x.tag, x.type, x.name, x.placeholder, yn(x.required), x.autocomplete, x.pattern])));
    });
  }

  if ((c.carousels || []).length) {
    L.push('**Carruseles / sliders**');
    L.push('');
    L.push(
      table(
        ['Elemento', 'Librería', 'Slides', 'Tamaño', 'Flechas', 'Dots', 'Autoplay'],
        c.carousels.map((x) => [x.element, x.lib, x.slides, x.size, yn(x.hasArrows), yn(x.hasDots), yn(x.autoplayHint)])
      )
    );
  }

  if ((c.tables || []).length) {
    L.push('**Tablas**');
    L.push('');
    L.push(table(['Elemento', 'Filas', 'Cols', 'thead', 'th', 'caption', 'Wrapper responsive'], c.tables.map((x) => [x.element, x.rows, x.cols, yn(x.hasThead), x.headerCells, x.caption, yn(x.responsiveWrapper)])));
  }

  if (c.navigation) {
    const n = c.navigation;
    L.push('**Navegación principal**');
    L.push('');
    L.push(
      table(
        ['Métrica', 'Valor'],
        [
          ['elemento', n.element],
          ['links totales', n.totalLinks],
          ['ítems de primer nivel', n.topLevelItems],
          ['position del header', n.sticky],
          ['tiene hamburguesa', yn(n.hasBurger)],
          ['tiene buscador', yn(n.hasSearch)],
        ]
      )
    );
    L.push(table(['Ítem', 'href', 'Items de submenú', 'Mega menú'], (n.items || []).map((x) => [x.label, x.href, x.submenuItems, yn(x.hasMegaMenu)])));
  }

  if (c.footer) {
    L.push('**Footer**');
    L.push('');
    L.push(kv(c.footer));
  }

  if ((c.embeds || []).length) {
    L.push(details('Videos / iframes / embeds', table(['Tag', 'Host', 'Tamaño', 'title', 'lazy', 'autoplay', 'muted', 'controls'], c.embeds.map((e) => [e.tag, e.host, e.size, e.title, yn(e.lazy), yn(e.autoplay), yn(e.muted), yn(e.controls)]))));
  }

  /* recortes: un párrafo por imagen para que HTML y DOCX las embeban */
  const crops = (r.screenshots && r.screenshots.components) || {};
  const cropKeys = Object.keys(crops);
  if (cropKeys.length) {
    L.push('**Recortes de componentes y zonas**');
    L.push('');
    const order = (k) => (k.startsWith('zone') ? 0 : k.startsWith('btn') ? 1 : k.startsWith('card') ? 2 : 3);
    cropKeys
      .sort((a2, b2) => order(a2) - order(b2) || a2.localeCompare(b2))
      .forEach((k) => L.push(`[${crops[k].label}](${link(crops[k].path)})`));
    L.push('');
  }
  L.push('');

  /* ---- 8. accesibilidad ---- */
  const a = r.a11y;
  L.push('### 8. Accesibilidad');
  L.push('');
  L.push(
    table(
      ['Métrica', 'Valor'],
      [
        ['imágenes sin alt', `${a.imagesWithoutAlt} de ${a.imagesTotal}`],
        ['imágenes con alt="" (decorativas)', a.imagesEmptyAlt],
        ['cantidad de h1', a.h1Count],
        ['jerarquía h1/h2/h3/h4/h5/h6', `${a.headings.h1} / ${a.headings.h2} / ${a.headings.h3} / ${a.headings.h4} / ${a.headings.h5} / ${a.headings.h6}`],
        ['saltos de jerarquía', (a.headingOrderIssues || []).length ? a.headingOrderIssues.join(' · ') : 'ninguno'],
        ['elementos con aria-label', a.ariaLabelElements],
        ['inputs sin label asociado', `${a.inputsWithoutLabel} de ${a.inputsTotal}`],
        ['botones sin nombre accesible', a.buttonsWithoutAccessibleName],
        ['links sin nombre accesible', a.linksWithoutAccessibleName],
        ['foco visible removido (outline:none)', a.focusOutlineRemoved],
        ['tabindex positivo', a.positiveTabindex],
        ['skip link', yn(a.skipLink)],
        ['iframes sin title', a.iframesWithoutTitle],
        ['tablas sin th', a.tablesWithoutHeaders],
        ['media con autoplay', a.autoplayMedia],
        ['landmarks', Object.keys(a.landmarksPresent).filter((k) => a.landmarksPresent[k]).join(', ') || 'ninguno'],
        ['problemas de lang', (a.langIssues || []).join(' · ') || 'ninguno'],
      ]
    )
  );
  if (r.contrast && r.contrast.totalIssues) {
    L.push(`**Contraste WCAG AA: ${r.contrast.totalIssues} combinaciones por debajo del mínimo**`);
    L.push('');
    L.push(
      table(
        ['Ratio', 'Mínimo', 'Color', 'Fondo', 'Size', 'Weight', 'Elemento', 'Texto'],
        r.contrast.issues.map((x) => [x.ratio, x.required, x.color, x.background, x.fontSize, x.fontWeight, x.element, x.sample])
      )
    );
  } else {
    L.push('**Contraste WCAG AA:** sin problemas detectados en el texto evaluable.');
    L.push('');
  }
  if ((a.inputsWithoutLabelSamples || []).length) {
    L.push(details('Inputs sin label (muestra)', table(['Input'], a.inputsWithoutLabelSamples.map((x) => [x]))));
  }
  if ((a.imagesWithoutAltSamples || []).length) {
    L.push(details('Imágenes sin alt (muestra)', table(['src'], a.imagesWithoutAltSamples.map((x) => [x]))));
  }
  L.push(details('Outline de encabezados', table(['Nivel', 'Texto', 'Visible', 'font-size'], (a.headingOutline || []).map((h) => [`h${h.level}`, h.text, yn(h.visible), h.fontSize]))));
  L.push(details('Roles y atributos ARIA en uso', topTable('role', a.roles, 'role') + '\n' + topTable('atributos aria-*', a.ariaAttributes, 'atributo')));
  L.push('');

  /* ---- 9. animaciones ---- */
  const an = r.animations;
  L.push('### 9. Animaciones y efectos');
  L.push('');
  L.push(
    table(
      ['Métrica', 'Valor'],
      [
        ['elementos con transition activa', an.elementsWithTransition],
        ['elementos con animation', an.elementsWithAnimation],
        ['elementos con transform', an.elementsWithTransform],
        ['elementos con will-change', an.elementsWithWillChange],
        ['elementos con filter', an.elementsWithFilter],
        ['elementos con backdrop-filter', an.elementsWithBackdropFilter],
        ['@keyframes definidos', (an.keyframesDefined || []).length],
        ['soporta prefers-reduced-motion', yn(an.prefersReducedMotionSupport)],
        ['pistas de animación al scroll', (an.scrollRevealHints || []).join(' · ') || 'ninguna'],
      ]
    )
  );
  L.push(topTable('Propiedades animadas por transition', an.transitionProperties, 'propiedad'));
  L.push(topTable('Duraciones de transition', an.transitionDurations, 'duración'));
  L.push(topTable('Easings', an.transitionEasings, 'timing-function'));
  L.push(topTable('animation-name en uso', an.animationNames, 'animation'));
  L.push(topTable('Propiedades que cambian en :hover', an.hoverProperties, 'propiedad'));
  L.push(details('Muestra de transiciones', table(['Elemento', 'Propiedad', 'Duración', 'Easing', 'Delay'], (an.transitionSamples || []).map((x) => [x.element, x.property, x.duration, x.easing, x.delay]))));
  L.push(details('Muestra de animaciones', table(['Elemento', 'Nombre', 'Duración', 'Iteraciones', 'Easing', 'Dirección', 'Estado'], (an.animationSamples || []).map((x) => [x.element, x.name, x.duration, x.iterations, x.easing, x.direction, x.playState]))));
  if ((an.keyframesDefined || []).length) L.push(details('@keyframes declarados', '`' + an.keyframesDefined.join('`, `') + '`\n'));
  L.push('');

  /* ---- 10. responsive ---- */
  const rs = r.responsiveSummary;
  L.push('### 10. Responsive');
  L.push('');
  L.push(`**Veredicto:** ${esc(rs.verdict)}`);
  L.push('');
  L.push(`- Breakpoints medidos: ${rs.breakpointsProbed.join(', ')}`);
  L.push(`- Breakpoints declarados en CSS: ${(rs.declaredBreakpoints || []).join(', ') || '—'}`);
  L.push(`- Hamburguesa (selector conocido) visible en: ${(rs.burgerVisibleAt || []).join(', ') || 'nunca'}${rs.burgerThreshold ? ` — umbral ≈ ${rs.burgerThreshold}px` : ''}`);
  if ((rs.burgerHeuristicAt || []).length) {
    L.push(`- Candidato por heurística (botón con ícono arriba) en: ${rs.burgerHeuristicAt.join(', ')} → \`${esc(rs.burgerElement)}\` _(verificar a mano)_`);
  }
  L.push('');
  L.push(
    table(
      ['Ancho', 'Alto pág.', 'Vh', 'Overflow X', 'Visibles', 'Ocultos', 'Burger', 'Links nav', 'Header', 'h1', 'body', 'Container', 'Cards/fila', 'Img vis.', 'Fixed'],
      (r.responsive || [])
        .filter((x) => x && !x.error)
        .map((x) => [
          `${x.width}${x.emulatedTouch ? ' (touch)' : ''}`,
          `${x.scrollHeight}px`,
          x.viewportsTall,
          yn(x.horizontalOverflow),
          x.visibleElements,
          x.hiddenElements,
          yn(x.burgerVisible),
          x.navLinksVisible,
          x.headerHeight === null ? '—' : `${x.headerHeight}px`,
          x.h1FontSize,
          x.bodyFontSize,
          x.containerWidth === null ? '—' : `${x.containerWidth}px`,
          x.cardsPerRow,
          x.imagesVisible,
          x.fixedElements,
        ])
    )
  );
  L.push('**Transiciones de layout entre breakpoints**');
  L.push('');
  L.push(table(['De → a', 'Cambios detectados'], (rs.transitions || []).map((x) => [`${x.from}px → ${x.to}px`, x.changes.join(' · ')])));
  if ((rs.horizontalOverflowAt || []).length) {
    L.push('**Overflow horizontal (layout roto)**');
    L.push('');
    L.push(table(['Ancho', 'scrollWidth', 'Culpables'], rs.horizontalOverflowAt.map((o) => [`${o.width}px`, `${o.scrollWidth}px`, (o.culprits || []).join(' · ')])));
  }
  if ((rs.smallTapTargetsMobile || []).length) {
    L.push('**Tap targets chicos en mobile (< 36px)**');
    L.push('');
    L.push(table(['Ancho', 'Chicos', 'Total'], rs.smallTapTargetsMobile.map((x) => [`${x.width}px`, x.small, x.total])));
  }
  L.push('');

  /* ---- 11. CSSOM ---- */
  const cs = r.cssom;
  L.push('### 11. CSS: hojas, media queries y tokens');
  L.push('');
  L.push(kv(cs.stats));
  L.push(
    table(
      ['Chequeo', 'Valor'],
      [
        ['media queries distintas', cs.mediaQueryCount],
        ['breakpoints inferidos', (cs.inferredBreakpoints || []).join(', ') || '—'],
        ['soporta dark mode (prefers-color-scheme)', yn(cs.hasDarkModeQuery)],
        ['estilos de impresión', yn(cs.hasPrintStyles)],
        ['queries de hover/pointer', yn(cs.hasHoverQuery)],
        ['selector más largo', cs.longestSelector],
      ]
    )
  );
  L.push(topTable('Media queries más usadas', cs.mediaQueries, 'condición'));
  L.push(topTable('Breakpoints por declaración', cs.widthBreakpoints, 'declaración'));
  if ((cs.fontFaces || []).length) {
    L.push('**@font-face**');
    L.push('');
    L.push(table(['Familia', 'Weight', 'Style', 'font-display', 'Formato', 'Host'], cs.fontFaces.map((f) => [f.family, f.weight, f.style, f.display, f.format, f.host])));
  }
  L.push(details('Hojas de estilo cargadas', table(['Hoja', 'Host', 'Reglas', 'media'], (cs.sheets || []).map((s2) => [s2.href, s2.host, s2.rules === null ? '(cross-origin)' : s2.rules, s2.media]))));
  L.push(details('Distribución de profundidad de selectores', topTable('niveles', cs.selectorDepthDistribution, 'niveles')));
  L.push('');

  /* ---- 12. performance y red ---- */
  const nw = r.network;
  const pf = r.perf;
  L.push('### 12. Performance y red');
  L.push('');
  if (pf.navigation) {
    L.push(
      table(
        ['Métrica', 'Valor'],
        [
          ['TTFB', `${pf.navigation.ttfbMs} ms`],
          ['DNS / TCP / TLS', `${pf.navigation.dnsMs} / ${pf.navigation.tcpMs} / ${pf.navigation.tlsMs} ms`],
          ['respuesta del documento', `${pf.navigation.responseMs} ms`],
          ['DOM interactive', `${pf.navigation.domInteractiveMs} ms`],
          ['DOMContentLoaded', `${pf.navigation.domContentLoadedMs} ms`],
          ['load', `${pf.navigation.loadEventMs} ms`],
          ['protocolo', pf.navigation.protocol],
          ['first-paint / first-contentful-paint', `${pf.paint['first-paint'] || '—'} / ${pf.paint['first-contentful-paint'] || '—'} ms`],
          ['LCP', pf.lcp ? `${pf.lcp.timeMs} ms — ${pf.lcp.element || pf.lcp.url || ''}` : '—'],
          ['CLS', pf.cls === null || pf.cls === undefined ? '—' : pf.cls],
          ['HTML decodificado', `${Math.round((pf.navigation.decodedBodySize || 0) / 1024)} KB`],
        ]
      )
    );
  }
  L.push(
    table(
      ['Recursos (intercepción de red)', 'Cantidad', 'KB'],
      Object.keys(nw.byType).map((k) => [k, nw.byType[k].count, nw.byType[k].kb])
    )
  );
  L.push(
    table(
      ['Total', 'Valor'],
      [
        ['requests', nw.totalRequests],
        ['peso declarado', `${nw.totalKb} KB`],
        ['status', Object.keys(nw.byStatus).map((k) => `${k}: ${nw.byStatus[k]}`).join(' · ')],
        ['redirecciones', nw.redirects],
        ['304 not modified', nw.notModified],
        ['hosts de terceros', nw.thirdPartyHosts],
        ['requests fallidos', (nw.failed || []).length],
        ['tiempo total de carga', `${r.loadMs} ms`],
      ]
    )
  );
  L.push(details('Hosts por cantidad de requests', table(['Host', 'Requests', 'KB', 'Tercero'], (nw.hosts || []).map((h) => [h.host, h.count, h.kb, yn(h.thirdParty)]))));
  if ((pf.slowest || []).length) {
    L.push(details('Recursos más lentos', table(['URL', 'Tipo', 'ms', 'KB', 'Host'], pf.slowest.map((x) => [x.url, x.type, x.ms, x.kb, x.host]))));
  }
  if ((nw.failed || []).length) {
    L.push(details('Requests fallidos', table(['URL', 'Tipo', 'Error'], nw.failed.map((f) => [f.url, f.type, f.error]))));
  }
  L.push('');

  /* ---- 13. lighthouse ---- */
  const lh = r.lighthouse;
  if (lh) {
    L.push('### 13. Lighthouse (con throttling)');
    L.push('');
    if (lh.error) {
      L.push(`No se pudo completar: \`${esc(lh.error)}\``);
      L.push('');
    } else {
      L.push(`Perfil **${lh.preset}** · Lighthouse ${lh.lighthouseVersion} · ${lh.fetchTime}`);
      L.push('');
      L.push(
        table(
          ['Categoría', 'Puntaje'],
          Object.keys(lh.categories || {}).map((k) => [k, lh.categories[k] === null ? '—' : `${lh.categories[k]}/100`])
        )
      );
      const met = lh.audits || {};
      L.push(
        table(
          ['Métrica', 'Valor', 'Puntaje'],
          ['largest-contentful-paint', 'first-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'speed-index', 'interactive', 'server-response-time', 'total-byte-weight', 'dom-size']
            .filter((k) => met[k])
            .map((k) => [met[k].title, met[k].display || met[k].numericValue, met[k].score === null ? '—' : Math.round(met[k].score * 100)])
        )
      );
      if ((lh.opportunities || []).length) {
        L.push('**Oportunidades de mejora que reporta Lighthouse**');
        L.push('');
        L.push(table(['Auditoría', 'Ahorro estimado'], lh.opportunities.map((o) => [o.title, [o.savingsMs ? `${o.savingsMs} ms` : null, o.savingsKb ? `${o.savingsKb} KB` : null].filter(Boolean).join(' · ') || '—'])));
      }
      if ((lh.failedAccessibilityAudits || []).length) {
        L.push(details(`Auditorías de accesibilidad falladas (${lh.failedAccessibilityAudits.length})`, table(['Auditoría', 'Elementos'], lh.failedAccessibilityAudits.map((a2) => [a2.title, a2.items]))));
      }
      if ((lh.runWarnings || []).length) L.push(details('Advertencias de la corrida', table(['Advertencia'], lh.runWarnings.map((w) => [w]))));
      L.push('');
    }
  }


  /* ---- 15. catálogo ---- */
  const cat = r.catalog;
  if (cat && !cat.error && cat.cardsDetected) {
    L.push('### 15. Catálogo: anatomía de la card de producto');
    L.push('');
    L.push(`Cards de producto detectadas: **${cat.cardsDetected}** · campos por card (promedio): **${cat.fieldsPerCard}**`);
    L.push('');
    if (cat.grid) {
      L.push(
        table(
          ['Grilla', 'Valor'],
          [
            ['cards por fila', cat.grid.perRow],
            ['display del contenedor', cat.grid.display],
            ['grid-template-columns', cat.grid.gridTemplateColumns],
            ['gap', cat.grid.gap],
            ['tamaño más común', cat.grid.commonSize],
          ]
        )
      );
    }
    L.push('**Campos que muestra el catálogo** (en cuántas cards aparece cada uno)');
    L.push('');
    L.push(table(['Campo', 'Cards'], (cat.fieldFrequency || []).map((f) => [f.value, f.count])));
    L.push('**Señales B2B / mayorista**');
    L.push('');
    const bb = cat.b2b || {};
    L.push(
      table(
        ['Señal', 'Valor'],
        [
          ['cards con precio visible', bb.cardsWithPrice],
          ['pide iniciar sesión para ver precios', yn(bb.pricesHiddenHint)],
          ['dice ser exclusivo para mayoristas', yn(bb.wholesaleOnlyHint)],
          ['cards que muestran unidad de venta', bb.unitOfSaleShown],
          ['cards que muestran cantidad mínima', bb.minQuantityShown],
          ['cards que muestran stock', bb.stockShown],
          ['selectores de cantidad en la página', bb.quantitySelectors],
          ['campos de CUIT', bb.cuitFields],
          ['términos del rubro presentes', (bb.mentions || []).join(', ')],
        ]
      )
    );
    (cat.samples || []).slice(0, 3).forEach((c, i) => {
      L.push(`**Card ${i + 1}** — \`${esc(c.element)}\` · ${c.size} (aspecto ${c.aspect}) · fondo ${c.background} · radio ${c.borderRadius} · padding ${c.padding}${c.border ? ` · borde ${c.border}` : ''}${c.boxShadow ? ' · con sombra' : ''}`);
      L.push('');
      L.push(table(['Orden', 'Campo', 'Contenido', 'size', 'weight', 'color'], (c.fields || []).map((f, j) => [j + 1, f.kind, f.value, f.fontSize, f.fontWeight, f.color])));
    });
    L.push('');
  }

  /* ---- 16. estados interactivos ---- */
  const ix = r.interactions;
  if (ix) {
    L.push('### 16. Estados interactivos');
    L.push('');
    if ((ix.hover || []).length) {
      L.push('**Hover real sobre los botones principales** (medido con el navegador aplicando `:hover`)');
      L.push('');
      (ix.hover || []).forEach((h, i) => {
        L.push(`Botón ${i + 1}${h.text ? ` — "${esc(h.text)}"` : ''}: ${h.changed ? `${h.changes.length} propiedad(es) cambian` : '**no cambia nada al pasar el mouse**'}`);
        L.push('');
        if (h.changed) L.push(table(['Propiedad', 'En reposo', 'En hover'], h.changes.map((c) => [c.property, c.from, c.to])));
      });
    }
    if (ix.focus) {
      L.push(`**Foco de teclado:** ${ix.focus.visible ? 'visible' : '**sin indicación visible**'} · outline: ${esc(ix.focus.outline)}`);
      L.push('');
      if ((ix.focus.changes || []).length) L.push(table(['Propiedad', 'Sin foco', 'Con foco'], ix.focus.changes.map((c) => [c.property, c.from, c.to])));
    }
    if (ix.megaMenu && !ix.megaMenu.navigated) {
      L.push('**Menú de categorías desplegado**');
      L.push('');
      L.push(
        table(
          ['Dato', 'Valor'],
          [
            ['disparador', ix.megaMenu.trigger],
            ['tamaño', ix.megaMenu.size],
            ['ancho completo (mega menú)', yn(ix.megaMenu.fullWidth)],
            ['columnas', ix.megaMenu.columns],
            ['links', ix.megaMenu.links],
            ['fondo', ix.megaMenu.background],
            ['sombra', ix.megaMenu.boxShadow || 'sin sombra'],
            ['items', (ix.megaMenu.items || []).join(' · ')],
          ]
        )
      );
    } else if (ix.megaMenu && ix.megaMenu.navigated) {
      L.push('**Menú:** el disparador navega en vez de desplegar un panel.');
      L.push('');
    }
    if (ix.filters) {
      L.push('**Filtros**');
      L.push('');
      L.push(
        table(
          ['Dato', 'Valor'],
          [
            ['modo', ix.filters.alwaysVisible ? 'siempre visible (barra lateral)' : 'se abre con un botón'],
            ['tamaño', ix.filters.size],
            ['checkboxes', ix.filters.checkboxes],
            ['radios', ix.filters.radios],
            ['rangos / sliders', ix.filters.ranges],
            ['grupos', (ix.filters.groups || []).join(' · ')],
          ]
        )
      );
    }
    if (ix.cart) {
      L.push(`**Carrito:** ${ix.cart.size}, ${ix.cart.isDrawer ? 'drawer' : 'popover'} a la ${ix.cart.side}, position ${ix.cart.position}${ix.cart.empty ? ', vacío al abrir' : ''}`);
      L.push('');
    }
    if (ix.searchSuggestions) {
      const ss = ix.searchSuggestions;
      L.push(
        ss.hasSuggestions
          ? `**Buscador:** autocompletado con ${ss.items} sugerencia(s), ${ss.size}${ss.showsImages ? ', con imágenes' : ''}${ss.showsPrices ? ', con precios' : ''}. Ejemplos: ${(ss.sample || []).slice(0, 5).map((x) => `"${esc(x)}"`).join(', ')}`
          : '**Buscador:** sin autocompletado detectado al escribir.'
      );
      L.push('');
    }
    L.push('');
  }

  /* ---- 17. copy, tono y contenido ---- */
  const ct = r.content;
  if (ct && !ct.error) {
    L.push('### 17. Copy, tono y contenido');
    L.push('');
    L.push(`**H1:** ${esc(ct.h1)}`);
    L.push('');
    if ((ct.valueProps || []).length) {
      L.push('**Propuestas de valor de la primera pantalla**');
      L.push('');
      L.push(table(['Texto', 'size', 'weight'], ct.valueProps.map((v) => [v.text, v.fontSize, v.fontWeight])));
    }
    if ((ct.ctas || []).length) {
      L.push('**Llamados a la acción más usados**');
      L.push('');
      L.push(table(['Texto', 'Veces'], ct.ctas.map((c) => [c.value, c.count])));
    }
    if ((ct.promises || []).length) {
      L.push(`**Promesas y beneficios que comunica:** ${ct.promises.join(' · ')}`);
      L.push('');
    }
    if ((ct.categories || []).length) {
      L.push(`**Taxonomía visible en la navegación:** ${ct.categories.slice(0, 20).join(' · ')}`);
      L.push('');
    }
    const tn = ct.tone || {};
    L.push('**Tono**');
    L.push('');
    L.push(
      table(
        ['Métrica', 'Valor'],
        [
          ['registro', tn.registro],
          ['palabras de texto visible', tn.palabras],
          ['palabras por oración', tn.palabrasPorOracion],
          ['mayúsculas sostenidas', `${tn.mayusculasSostenidas} (${tn.porcentajeMayusculas}%)`],
          ['exclamaciones / preguntas', `${tn.exclamaciones} / ${tn.preguntas}`],
        ]
      )
    );
    if (ct.search && ct.search.present) {
      L.push(`**Buscador:** placeholder "${esc(ct.search.placeholder)}", ${ct.search.width}px de ancho, en ${ct.search.inHeader ? 'el header' : ct.search.position}${ct.search.hasButton ? ', con botón' : ''}`);
      L.push('');
    } else {
      L.push('**Buscador:** no se detectó buscador interno.');
      L.push('');
    }
    L.push('');
  }

  /* ---- 18. páginas adicionales ---- */
  const others = pages.filter((x) => x.ok && x.pageType !== 'home');
  if (others.length) {
    L.push('### 18. Páginas adicionales');
    L.push('');
    others.forEach((x, i) => L.push(pageDigest(x, pfx, i + 1)));
  }

  return L.join('\n');
}

/** Resumen por página secundaria: lo que cambia respecto del home. */
function pageDigest(x, prefix, idx) {
  const L = [];
  const link = (v) => (v ? `${prefix || ''}${v}` : v);
  L.push(`#### 18.${idx} ${x.pageLabel || x.pageType} — ${x.url}`);
  L.push('');
  L.push(
    table(
      ['Campo', 'Valor'],
      [
        ['title', x.meta.title],
        ['h1', `${x.a11y.h1Count} (jerarquía ${x.a11y.headings.h1}/${x.a11y.headings.h2}/${x.a11y.headings.h3})`],
        ['HTTP / carga', `${x.status} · ${x.loadMs} ms`],
        ['elementos / nodos DOM', `${x.elementsScanned} / ${x.layout.dom.totalNodes}`],
        ['alto de página', `${x.layout.page.scrollHeight}px (${x.layout.page.viewportsTall} viewports)`],
        ['secciones de primer nivel', x.layout.blocksCount],
        ['componentes', `${x.components.counts.buttons} botones · ${x.components.counts.cards} cards · ${x.components.counts.forms} forms · ${x.components.counts.inputs} inputs · ${x.components.counts.images} imágenes`],
        ['accesibilidad', `${x.a11y.imagesWithoutAlt} img sin alt · ${x.a11y.inputsWithoutLabel}/${x.a11y.inputsTotal} inputs sin label · ${x.contrast.totalIssues} fallos de contraste`],
        ['responsive', x.responsiveSummary.verdict],
        ['requests / peso', `${x.network.totalRequests} · ${x.network.totalKb} KB`],
        ['LCP / CLS', `${x.perf.lcp ? x.perf.lcp.timeMs + ' ms' : '—'} / ${x.perf.cls === null || x.perf.cls === undefined ? '—' : x.perf.cls}`],
        ['overlays al entrar', x.popups.detected.length],
      ]
    )
  );
  const sc = x.screenshots || {};
  const bp = Object.keys(sc.breakpoints || {}).map((w) => `[${w}px](${link(sc.breakpoints[w])})`);
  L.push(
    `Capturas: ${sc.desktop ? `[desktop](${link(sc.desktop)})` : '—'}${sc.mobile ? ` · [mobile](${link(sc.mobile)})` : ''}${bp.length ? ` · ${bp.join(' ')}` : ''}`
  );
  L.push('');
  L.push('**Estructura de la página**');
  L.push('');
  L.push(
    table(
      ['#', 'Elemento', 'Encabezado', 'Alto', 'display', 'Cols', 'Img', 'Links', 'Btn', 'Items'],
      (x.layout.blocks || []).slice(0, 15).map((b) => [b.order, b.element, b.heading, `${b.height}px`, b.display, b.columns, b.images, b.links, b.buttons, b.cards])
    )
  );
  if ((x.components.forms || []).length) {
    L.push('**Formularios**');
    L.push('');
    x.components.forms.slice(0, 3).forEach((f) =>
      L.push(`- ${f.method} → \`${esc(f.action)}\` · submit "${esc(f.submit)}" · campos: ${(f.fields || []).map((y) => `${y.name || y.type}${y.required ? '*' : ''}`).join(', ') || '—'}`)
    );
    L.push('');
  }
  L.push(details(`Traza del análisis de ${x.pageLabel || x.pageType}`, '```\n' + (x.steps || []).join('\n') + '\n```'));
  L.push('');
  return L.join('\n');
}

/* ------------------------------------------------------------------ */
/* Patrones comunes                                                    */
/* ------------------------------------------------------------------ */

function commonPatterns(ok) {
  const L = [];
  L.push('---');
  L.push('');
  L.push('## Patrones comunes entre sitios');
  L.push('');
  if (ok.length < 2) {
    L.push('_Se necesitan al menos 2 sitios analizados con éxito para comparar._');
    return L.join('\n');
  }

  const shared = (title, getter, header, minSites) => {
    const map = new Map();
    ok.forEach((r) => {
      const seen = new Set();
      (getter(r) || []).forEach((i) => {
        const v = typeof i === 'string' ? i : i.value;
        if (!v || seen.has(v)) return;
        seen.add(v);
        if (!map.has(v)) map.set(v, []);
        map.get(v).push(r.name);
      });
    });
    const rows = Array.from(map.entries())
      .filter(([, sites]) => sites.length >= (minSites || 2))
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .slice(0, 20)
      .map(([v, sites]) => [v, `${sites.length}/${ok.length}`, sites.join(', ')]);
    L.push(`### ${title}`);
    L.push('');
    L.push(rows.length ? table([header, 'Sitios', 'Dónde'], rows) : '_sin coincidencias entre sitios_\n');
  };

  shared('Fuentes que se repiten', (r) => r.typography.fontFamiliesAll, 'font-family');
  shared('Tamaños de fuente que se repiten', (r) => r.typography.fontSizes, 'font-size');
  shared('Pesos tipográficos compartidos', (r) => r.typography.fontWeights, 'font-weight');
  shared('Colores que se repiten', (r) => (r.palette.textColorsAll || []).concat(r.palette.backgroundsAll || []), 'color');
  shared('border-radius que se repiten', (r) => r.spacing.borderRadius, 'border-radius');
  shared('gap que se repiten', (r) => r.spacing.gaps, 'gap');
  shared('Sombras compartidas', (r) => r.spacing.boxShadows, 'box-shadow');
  shared('max-width de contenedor compartidos', (r) => r.layout.containerMaxWidths, 'max-width');
  shared('Breakpoints declarados en común', (r) => (r.cssom.inferredBreakpoints || []).map(String), 'breakpoint (px)');
  shared('Tecnologías en común', (r) => Object.keys(r.stack).filter((k) => r.stack[k]).concat(r.stackExtras || []), 'tecnología');

  L.push('### Stack por sitio');
  L.push('');
  const techs = Object.keys(ok[0].stack);
  L.push(table(['Sitio'].concat(techs), ok.map((r) => [r.name].concat(techs.map((t) => (r.stack[t] ? '✓' : ''))))));

  L.push('### Densidad de componentes');
  L.push('');
  const compKeys = ['buttons', 'links', 'forms', 'inputs', 'images', 'svg', 'videosEmbeds', 'modals', 'tables', 'carousels', 'cards'];
  L.push(table(['Sitio'].concat(compKeys), ok.map((r) => [r.name].concat(compKeys.map((k) => r.components.counts[k])))));

  L.push('### Diseño comparado');
  L.push('');
  L.push(
    table(
      ['Sitio', 'Familias', 'Tamaños', 'Pesos', 'Colores texto', 'Colores fondo', 'Radios', 'Sombras', 'Gaps', 'grid', 'flex'],
      ok.map((r) => [
        r.name,
        r.typography.distinct.families,
        r.typography.distinct.sizes,
        r.typography.distinct.weights,
        r.palette.distinct.text,
        r.palette.distinct.background,
        r.spacing.distinct.radius,
        r.spacing.distinct.shadow,
        r.spacing.distinct.gap,
        r.layout.displayStats.grid,
        r.layout.displayStats.flex,
      ])
    )
  );

  L.push('### Responsive comparado');
  L.push('');
  L.push(
    table(
      ['Sitio', 'Breakpoints CSS', 'Umbral burger', 'Transiciones', 'Overflow X', 'Veredicto'],
      ok.map((r) => [
        r.name,
        (r.cssom.inferredBreakpoints || []).join(', ') || '—',
        r.responsiveSummary.burgerThreshold ? `${r.responsiveSummary.burgerThreshold}px` : '—',
        r.responsiveSummary.transitions.length,
        (r.responsiveSummary.horizontalOverflowAt || []).map((o) => o.width).join(', ') || 'no',
        r.responsiveSummary.verdict,
      ])
    )
  );

  L.push('### Accesibilidad comparada');
  L.push('');
  L.push(
    table(
      ['Sitio', 'Img sin alt', 'h1', 'Saltos de heading', 'Inputs sin label', 'Botones sin nombre', 'Contraste AA', 'aria-label', 'Skip link'],
      ok.map((r) => [
        r.name,
        `${r.a11y.imagesWithoutAlt}/${r.a11y.imagesTotal}`,
        r.a11y.h1Count,
        (r.a11y.headingOrderIssues || []).length,
        `${r.a11y.inputsWithoutLabel}/${r.a11y.inputsTotal}`,
        r.a11y.buttonsWithoutAccessibleName,
        `${r.contrast.totalIssues} fallos`,
        r.a11y.ariaLabelElements,
        r.a11y.skipLink ? 'sí' : 'no',
      ])
    )
  );

  L.push('### Performance comparada');
  L.push('');
  L.push(
    table(
      ['Sitio', 'TTFB', 'FCP', 'LCP', 'CLS', 'load', 'Requests', 'Peso', 'Terceros', 'Nodos DOM', 'Animaciones'],
      ok.map((r) => [
        r.name,
        r.perf.navigation ? `${r.perf.navigation.ttfbMs} ms` : '—',
        r.perf.paint['first-contentful-paint'] ? `${r.perf.paint['first-contentful-paint']} ms` : '—',
        r.perf.lcp ? `${r.perf.lcp.timeMs} ms` : '—',
        r.perf.cls === null || r.perf.cls === undefined ? '—' : r.perf.cls,
        r.perf.navigation ? `${r.perf.navigation.loadEventMs} ms` : '—',
        r.network.totalRequests,
        `${r.network.totalKb} KB`,
        r.network.thirdPartyHosts,
        r.layout.dom.totalNodes,
        r.animations.elementsWithTransition + r.animations.elementsWithAnimation,
      ])
    )
  );

  const withLh = ok.filter((r) => r.lighthouse && r.lighthouse.categories);
  if (withLh.length) {
    L.push('### Lighthouse comparado');
    L.push('');
    L.push(
      table(
        ['Sitio', 'Perfil', 'Performance', 'Accesibilidad', 'Best practices', 'SEO', 'LCP', 'CLS', 'TBT'],
        withLh.map((r) => {
          const a2 = r.lighthouse.audits || {};
          return [
            r.name,
            r.lighthouse.preset,
            r.lighthouse.categories.performance,
            r.lighthouse.categories.accessibility,
            r.lighthouse.categories['best-practices'],
            r.lighthouse.categories.seo,
            a2['largest-contentful-paint'] ? a2['largest-contentful-paint'].display : '—',
            a2['cumulative-layout-shift'] ? a2['cumulative-layout-shift'].display : '—',
            a2['total-blocking-time'] ? a2['total-blocking-time'].display : '—',
          ];
        })
      )
    );
  }

  L.push('### Páginas analizadas por sitio');
  L.push('');
  L.push(
    table(
      ['Sitio', 'Páginas', 'Tipos'],
      ok.map((r) => [r.name, (r.pages || []).filter((x) => x.ok).length || 1, Array.from(new Set((r.pages || []).filter((x) => x.ok).map((x) => x.pageLabel || x.pageType))).join(', ') || 'Home'])
    )
  );

  L.push('### Popups al entrar');
  L.push('');
  L.push(
    table(
      ['Sitio', 'Overlays', 'Tipos', 'Cerrados', 'Quedaron'],
      ok.map((r) => [
        r.name,
        r.popups.detected.length,
        Array.from(new Set(r.popups.detected.map((d) => d.kind))).join(', ') || '—',
        r.popups.dismissed.length,
        r.popups.stillVisible,
      ])
    )
  );

  return L.join('\n');
}

/* ------------------------------------------------------------------ */

function indexTable(results, linkTo) {
  return table(
    ['#', 'Sitio', 'Rol', 'Estado', 'Reporte', 'Elementos', 'Botones', 'Cards', 'Overflow X', 'Contraste AA', 'Carga'],
    results.map((r, i) =>
      r.ok
        ? [
            i + 1,
            r.name,
            r.role === 'cliente' ? 'cliente' : 'referencia',
            '✓',
            linkTo ? `[md](${linkTo(r, 'md')}) · [html](${linkTo(r, 'html')}) · [docx](${linkTo(r, 'docx')})` : '—',
            r.elementsScanned,
            r.components.counts.buttons,
            r.components.counts.cards,
            (r.responsiveSummary.horizontalOverflowAt || []).length ? 'sí' : 'no',
            `${r.contrast.totalIssues} fallos`,
            `${r.loadMs} ms`,
          ]
        : [i + 1, r.name, r.role === 'cliente' ? 'cliente' : 'referencia', '✗', linkTo ? `[md](${linkTo(r, 'md')})` : '—', '—', '—', '—', '—', '—', '—']
    )
  );
}

/** Reporte de un solo sitio (archivo propio). */
function siteMarkdown(r, opts, prefix) {
  const L = [];
  L.push(`# ${r.name}`);
  L.push('');
  L.push(`Análisis de ${r.url}`);
  L.push('');
  L.push(`Generado: ${(opts && opts.generatedAt) || new Date().toISOString()}`);
  L.push('');
  L.push(siteSection(r, null, prefix, 2));
  L.push('');
  return L.join('\n');
}

/** Resumen: índice, comparativas y patrones comunes. */
function indexMarkdown(results, opts, linkTo) {
  const ok = results.filter((x) => x.ok);
  const L = [];
  L.push('# Resumen del análisis');
  L.push('');
  L.push(`Generado: ${(opts && opts.generatedAt) || new Date().toISOString()}`);
  L.push('');
  const totalPages = results.reduce((a, r) => a + ((r.pages || []).filter((x) => x.ok).length || (r.ok ? 1 : 0)), 0);
  L.push(`Sitios: **${results.length}** · OK: **${ok.length}** · fallidos: **${results.length - ok.length}** · páginas analizadas: **${totalPages}**`);
  L.push(`Breakpoints medidos: ${(opts && opts.breakpoints ? opts.breakpoints : []).join(', ')} (más contexto mobile emulado 390x844)`);
  if (opts && opts.brief) L.push(`Briefing del cliente incorporado a los prompts: \`${esc(opts.brief.file)}\``);
  L.push('');
  L.push('## Sitios analizados');
  L.push('');
  L.push(indexTable(results, linkTo));
  L.push('');
  results.filter((x) => !x.ok).forEach((x) => L.push(`- ✗ **${x.name}** — \`${esc(x.error)}\``));
  L.push('');
  L.push(commonPatterns(ok));
  L.push('');
  return L.join('\n');
}

/** Reporte único con todos los sitios (compatibilidad). */
function combinedMarkdown(results, opts) {
  const ok = results.filter((r) => r.ok);
  const L = [];
  L.push('# Reporte de análisis de sitios');
  L.push('');
  L.push(`Generado: ${(opts && opts.generatedAt) || new Date().toISOString()}`);
  L.push('');
  L.push(`Sitios: **${results.length}** · OK: **${ok.length}** · fallidos: **${results.length - ok.length}**`);
  L.push('');
  L.push('## Índice');
  L.push('');
  L.push(indexTable(results, null));
  L.push('');
  results.forEach((r, i) => L.push(siteSection(r, i + 1, opts && opts.prefix)));
  L.push(commonPatterns(ok));
  L.push('');
  return L.join('\n');
}

module.exports = { siteMarkdown, indexMarkdown, combinedMarkdown };
