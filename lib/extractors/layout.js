'use strict';

/** 3. Estructura y layout: landmarks, anatomia seccion por seccion, capas, profundidad. */
module.exports = function extractLayout() {
  const A = window.__A;

  const landmarks = {
    header: A.count('header, [role="banner"]'),
    nav: A.count('nav, [role="navigation"]'),
    footer: A.count('footer, [role="contentinfo"]'),
    main: A.count('main, [role="main"]'),
    aside: A.count('aside, [role="complementary"]'),
    section: A.count('section'),
    article: A.count('article'),
    search: A.count('[role="search"], form[role="search"]'),
  };

  /* ---- anatomia de secciones de primer nivel ---- */
  const root = document.querySelector('main') || document.body;
  const blocks = [];
  /**
   * Muchos sitios (sobre todo SPAs) envuelven todo en uno o dos divs gigantes.
   * Bajamos de nivel mientras el bloque siga siendo más alto que ~1,8 viewports,
   * hasta 4 pasadas, para llegar a las secciones reales.
   */
  let level = Array.from(root.children).filter((el) => A.visible(el) && A.rect(el).h > 40);
  const isWrapper = (el) =>
    A.rect(el).h > window.innerHeight * 1.8 && el.children.length >= 1 && /^(div|main|section|article|form)$/i.test(el.tagName);

  const kidsOf = (el) => Array.from(el.children).filter((ch) => A.visible(ch) && A.rect(ch).h > 40);
  /** Los divs que envuelven a un único hijo del mismo alto no aportan nada: los saltamos. */
  const unwrap = (el) => {
    let n = el;
    for (let guard = 0; guard < 15; guard++) {
      const kids = kidsOf(n);
      if (kids.length === 1 && A.rect(kids[0]).h > A.rect(n).h * 0.8) n = kids[0];
      else break;
    }
    return n;
  };

  for (let pass = 0; pass < 6; pass++) {
    level = level.map(unwrap);
    if (!level.some(isWrapper)) break;
    const next = [];
    level.forEach((el) => {
      if (!isWrapper(el)) {
        next.push(el);
        return;
      }
      const kids = kidsOf(el);
      if (kids.length > 1) next.push.apply(next, kids);
      else next.push(el);
    });
    if (next.length === level.length && next.every((el, i) => el === level[i])) break;
    level = next;
    if (level.length > 60) break;
  }
  const expanded = level.map(unwrap);

  expanded.slice(0, 40).forEach((el, i) => {
    const cs = A.cs(el);
    const r = A.rect(el);
    const heading = el.querySelector('h1, h2, h3');
    let columns = null;
    if (cs.display === 'grid') columns = (cs.gridTemplateColumns || '').split(/\s+/).filter(Boolean).length || null;
    else if (/flex/.test(cs.display)) columns = Array.from(el.children).filter((c) => A.visible(c)).length || null;

    blocks.push({
      order: i + 1,
      element: A.ident(el),
      heading: heading ? A.text(heading, 70) : null,
      height: r.h,
      viewportsTall: +(r.h / window.innerHeight).toFixed(2),
      display: cs.display,
      columns,
      gridTemplate: cs.display === 'grid' ? (cs.gridTemplateColumns || '').slice(0, 90) : null,
      padding: cs.padding,
      background: A.isTransparent(cs.backgroundColor) ? (cs.backgroundImage !== 'none' ? 'imagen/gradiente' : 'transparente') : A.hex(cs.backgroundColor),
      children: el.children.length,
      images: A.count('img', el),
      links: A.count('a[href]', el),
      buttons: A.count('button, [role="button"], .btn', el),
      cards: A.count('[class*="card" i], article, li', el),
      text: A.text(el, 90),
    });
  });

  /* ---- contenedores: max-width dominante y padding lateral ---- */
  const containerCounter = A.counter();
  const containerPad = A.counter();
  A.$('div, section, header, footer, main, article').slice(0, 3000).forEach((el) => {
    const cs = A.cs(el);
    if (!cs || cs.display === 'none') return;
    if (cs.maxWidth && cs.maxWidth !== 'none' && cs.maxWidth !== '100%') {
      containerCounter.add(cs.maxWidth);
      containerPad.addUseful(`${cs.paddingLeft} / ${cs.paddingRight}`);
    }
  });

  /* ---- capas fijas y sticky ---- */
  const layers = [];
  A.allElements(9000).forEach((el) => {
    const cs = A.cs(el);
    if (!cs) return;
    if (cs.position === 'sticky' || cs.position === 'fixed') {
      if (!A.visible(el)) return;
      const r = A.rect(el);
      if (layers.length < 25) {
        layers.push({
          element: A.ident(el),
          position: cs.position,
          zIndex: cs.zIndex,
          size: `${r.w}x${r.h}`,
          top: cs.top,
          bottom: cs.bottom,
          background: A.isTransparent(cs.backgroundColor) ? '—' : A.hex(cs.backgroundColor),
          role: /header|nav|top/i.test(A.ident(el)) ? 'header/nav' : /cookie|consent/i.test(A.ident(el)) ? 'cookies' : /chat|whats/i.test(A.ident(el)) ? 'chat' : /modal|popup/i.test(A.ident(el)) ? 'modal' : /footer|bottom/i.test(A.ident(el)) ? 'footer' : 'otro',
        });
      }
    }
  });

  /* ---- profundidad del DOM ---- */
  let maxDepth = 0;
  let sumDepth = 0;
  let n = 0;
  let deepest = null;
  A.allElements(9000).forEach((el) => {
    const d = A.depthOf(el);
    sumDepth += d;
    n++;
    if (d > maxDepth) {
      maxDepth = d;
      deepest = A.ident(el);
    }
  });

  /* ---- grillas reales ---- */
  const gridSamples = [];
  A.$('*').slice(0, 4000).forEach((el) => {
    const cs = A.cs(el);
    if (!cs || cs.display !== 'grid' || !A.visible(el)) return;
    if (gridSamples.length >= 12) return;
    gridSamples.push({
      element: A.ident(el),
      columns: (cs.gridTemplateColumns || '').slice(0, 100),
      rows: (cs.gridTemplateRows || '').slice(0, 60),
      gap: cs.gap,
      items: el.children.length,
    });
  });

  const docEl = document.documentElement;
  return {
    landmarks,
    header: landmarks.header > 0,
    nav: landmarks.nav > 0,
    footer: landmarks.footer > 0,
    main: landmarks.main > 0,
    sections: landmarks.section,
    containerMaxWidths: containerCounter.top(6),
    containerPaddings: containerPad.top(5),
    blocks,
    blocksCount: blocks.length,
    layers,
    grids: gridSamples,
    dom: {
      totalNodes: document.getElementsByTagName('*').length,
      maxDepth,
      avgDepth: n ? +(sumDepth / n).toFixed(1) : 0,
      deepestElement: deepest,
      textNodes: document.body ? document.body.innerText.length : 0,
    },
    page: {
      scrollHeight: docEl.scrollHeight,
      scrollWidth: docEl.scrollWidth,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      viewportsTall: +(docEl.scrollHeight / window.innerHeight).toFixed(1),
      horizontalOverflow: docEl.scrollWidth > window.innerWidth + 2,
      bodyBackground: A.hex((A.cs(document.body) || {}).backgroundColor),
    },
    overflowingElements: A.$('*')
      .slice(0, 4000)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > window.innerWidth + 4 && A.visible(el);
      })
      .slice(0, 10)
      .map((el) => ({ element: A.ident(el), width: Math.round(el.getBoundingClientRect().width) })),
  };
};
