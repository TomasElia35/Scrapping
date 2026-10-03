'use strict';

/** Sonda liviana que se ejecuta una vez por breakpoint para comparar el responsive. */
module.exports = function probeViewport() {
  const A = window.__A;
  const w = window.innerWidth;
  const de = document.documentElement;

  const navEl = document.querySelector('header nav, nav');

  /* burger: selectores conocidos + heuristica (boton chico con icono, en la franja superior) */
  const burgerCandidates = A.$(
    '[class*="burger" i], [class*="hamburger" i], [class*="menu-toggle" i], [class*="mobile-menu" i], [class*="nav-toggle" i], [class*="toggle-menu" i], [aria-label*="men" i], [aria-controls][aria-expanded], button[class*="menu" i], [class*="menu" i] > button, [data-toggle*="menu" i]'
  ).filter((el) => A.visible(el) && A.rect(el).top < 200);
  let burger = burgerCandidates[0] || null;
  const burgerSource = burger ? 'selector conocido' : 'heurística (botón con ícono en la franja superior)';
  if (!burger) {
    burger =
      A.$('button, a[role="button"], [role="button"]').find((el) => {
        if (!A.visible(el)) return false;
        const r = A.rect(el);
        if (r.top > 160 || r.w > 80 || r.h > 80 || r.w < 18) return false;
        const hasIcon = el.querySelector('svg, i, span:empty') || /≡|☰/.test(el.textContent || '');
        return !!hasIcon && !A.text(el, 12);
      }) || null;
  }

  /* header: <header> real, o el elemento fijo/sticky de ancho completo mas alto en la franja superior */
  let headerEl = document.querySelector('header, [role="banner"]');
  if (!headerEl || !A.visible(headerEl)) {
    const fixedTop = A.allElements(4000).filter((el) => {
      const cs = A.cs(el);
      if (!cs || !A.visible(el)) return false;
      if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
      const r = A.rect(el);
      return r.top < 120 && r.w > w * 0.8 && r.h > 30 && r.h < 300;
    });
    headerEl = fixedTop.sort((a, b) => A.rect(b).h - A.rect(a).h)[0] || null;
  }
  const clipped = (el) => {
    let n = el.parentElement;
    let guard = 0;
    while (n && guard++ < 30) {
      const cs = A.cs(n);
      if (cs && /hidden|auto|scroll|clip/.test(cs.overflowX)) return true;
      n = n.parentElement;
    }
    return false;
  };

  /* elementos que desaparecen/aparecen segun breakpoint */
  const visibleTags = A.counter();
  let hiddenCount = 0;
  let visibleCount = 0;
  const els = A.allElements(6000);
  for (const el of els) {
    const cs = A.cs(el);
    if (!cs) continue;
    if (cs.display === 'none' || cs.visibility === 'hidden') hiddenCount++;
    else {
      visibleCount++;
      visibleTags.add(el.tagName.toLowerCase());
    }
  }

  /* columnas del grid/flex principal de contenido */
  const mainish = document.querySelector('main') || document.body;
  const gridChildren = [];
  Array.from(mainish.querySelectorAll('*'))
    .slice(0, 2500)
    .forEach((el) => {
      const cs = A.cs(el);
      if (!cs || !A.visible(el)) return;
      if (cs.display === 'grid' && el.children.length >= 2) {
        const cols = (cs.gridTemplateColumns || '').split(/\s+/).filter(Boolean).length;
        if (cols >= 1 && gridChildren.length < 8) gridChildren.push({ element: A.ident(el), columns: cols, gap: cs.gap });
      }
    });

  /* cards por fila: solo hermanos de ancho similar alineados en la misma fila */
  let cardsPerRow = null;
  const cardEls = A.$('[class*="card" i], [class*="product" i], article').filter((el) => {
    const r = A.rect(el);
    return A.visible(el) && r.w > 120 && r.h > 120 && r.w < w * 0.9;
  });
  if (cardEls.length > 2) {
    const rows = new Map();
    cardEls.slice(0, 150).forEach((c) => {
      const r = A.rect(c);
      const key = `${Math.round(r.top / 24)}|${Math.round(r.w / 24)}`; // misma fila y ancho similar
      rows.set(key, (rows.get(key) || 0) + 1);
    });
    const counts = Array.from(rows.values()).filter((n) => n <= 12);
    if (counts.length) {
      // moda de la cantidad de items por fila
      const hist = {};
      counts.forEach((n) => (hist[n] = (hist[n] || 0) + 1));
      cardsPerRow = +Object.keys(hist).sort((a, b) => hist[b] - hist[a] || b - a)[0];
    }
  }

  const bodyCs = A.cs(document.body) || {};
  let h1 = document.querySelector('h1');
  if (!h1 || !A.visible(h1)) {
    // sin h1 visible: tomamos el texto mas grande de la primera pantalla como titular
    h1 =
      A.$('h1, h2, [class*="title" i], [class*="heading" i], p, span')
        .filter((el) => A.visible(el) && A.rect(el).top < window.innerHeight * 1.5 && A.text(el, 5))
        .sort((a, b) => parseFloat((A.cs(b) || {}).fontSize || 0) - parseFloat((A.cs(a) || {}).fontSize || 0))[0] || null;
  }

  /* overflow: solo culpables que no estan recortados por un ancestro (sliders, carruseles) */
  const overflowing = A.$('*')
    .slice(0, 3000)
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > w + 4 && A.visible(el) && !clipped(el);
    })
    .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width);
  const realOverflow = document.body ? document.body.scrollWidth > w + 2 : false;

  /* tamaño de tap targets (relevante en mobile) */
  const tapTargets = A.$('a, button, [role="button"], input[type="submit"]').filter((el) => A.visible(el));
  const smallTaps = tapTargets.filter((el) => {
    const r = A.rect(el);
    return r.h > 0 && (r.h < 36 || r.w < 36);
  }).length;

  return {
    width: w,
    height: window.innerHeight,
    dpr: window.devicePixelRatio,
    scrollHeight: de.scrollHeight,
    viewportsTall: +(de.scrollHeight / window.innerHeight).toFixed(1),
    horizontalOverflow: realOverflow && overflowing.length > 0,
    overflowWidth: Math.min(de.scrollWidth, document.body ? document.body.scrollWidth : de.scrollWidth),
    overflowingElements: overflowing.slice(0, 5).map((el) => `${A.ident(el)} (${Math.round(el.getBoundingClientRect().width)}px)`),
    visibleElements: visibleCount,
    hiddenElements: hiddenCount,
    burgerVisible: burgerCandidates.length > 0,
    burgerVisibleIncludingHeuristic: burger ? A.visible(burger) : false,
    burgerSource: burger ? burgerSource : null,
    burgerElement: burger ? A.ident(burger) : null,
    navVisible: navEl ? A.visible(navEl) : false,
    navLinksVisible: navEl ? A.$('a[href]', navEl).filter((a) => A.visible(a)).length : 0,
    headerHeight: headerEl ? A.rect(headerEl).h : null,
    headerPosition: headerEl ? (A.cs(headerEl) || {}).position : null,
    bodyFontSize: bodyCs.fontSize,
    h1FontSize: h1 ? (A.cs(h1) || {}).fontSize : null,
    h1Text: h1 ? A.text(h1, 50) : null,
    containerWidth: (() => {
      const c = document.querySelector('[class*="container" i], main > div, main');
      return c ? A.rect(c).w : null;
    })(),
    mainGrids: gridChildren,
    cardsPerRow,
    imagesVisible: A.$('img').filter((i) => A.visible(i)).length,
    smallTapTargets: smallTaps,
    tapTargetsTotal: tapTargets.length,
    fixedElements: A.allElements(6000).filter((el) => {
      const cs = A.cs(el);
      return cs && (cs.position === 'fixed' || cs.position === 'sticky') && A.visible(el);
    }).length,
    topTags: visibleTags.top(6),
  };
};
