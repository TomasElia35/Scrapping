'use strict';

/** 8. Accesibilidad y semantica. */
module.exports = function extractA11y() {
  const A = window.__A;

  const imgs = A.$('img');
  const missingAlt = imgs.filter((i) => !i.hasAttribute('alt'));
  const emptyAlt = imgs.filter((i) => i.hasAttribute('alt') && !i.getAttribute('alt').trim());

  const labelFor = new Set();
  A.$('label[for]').forEach((l) => labelFor.add(l.getAttribute('for')));

  const fields = A.$('input, textarea, select').filter((f) => {
    const t = (f.getAttribute('type') || '').toLowerCase();
    return !['hidden', 'submit', 'button', 'reset', 'image'].includes(t);
  });
  const unlabeled = fields.filter((f) => {
    if (f.getAttribute('aria-label') || f.getAttribute('aria-labelledby') || f.getAttribute('title')) return false;
    if (f.id && labelFor.has(f.id)) return false;
    if (f.closest('label')) return false;
    return true;
  });

  /* ---- jerarquia de headings y orden ---- */
  const headings = A.$('h1, h2, h3, h4, h5, h6').map((h) => ({
    level: +h.tagName[1],
    text: A.text(h, 70),
    visible: A.visible(h),
    fontSize: (A.cs(h) || {}).fontSize,
  }));
  const orderIssues = [];
  let prev = 0;
  headings.forEach((h, i) => {
    if (prev && h.level > prev + 1) {
      orderIssues.push(`salto h${prev} → h${h.level} en "${h.text.slice(0, 40)}"`);
    }
    prev = h.level;
    if (i === 0 && h.level !== 1) orderIssues.push(`el primer heading es h${h.level}, no h1`);
  });

  /* ---- botones/links sin nombre accesible ---- */
  const accName = (el) =>
    (el.getAttribute('aria-label') || '').trim() ||
    (el.getAttribute('title') || '').trim() ||
    A.text(el, 30) ||
    (el.value || '').trim() ||
    (el.querySelector('img[alt]') ? el.querySelector('img[alt]').getAttribute('alt').trim() : '') ||
    (el.getAttribute('aria-labelledby') ? 'via aria-labelledby' : '');
  const buttonsNoName = A.$('button, [role="button"], input[type="button"], input[type="submit"]').filter((b) => !accName(b));
  const linksNoName = A.$('a[href]').filter((a) => !accName(a));

  /* ---- foco ---- */
  let outlineNone = 0;
  A.$('a, button, input, select, textarea, [tabindex]').slice(0, 800).forEach((el) => {
    const cs = A.cs(el);
    if (cs && (cs.outlineStyle === 'none' || cs.outlineWidth === '0px')) outlineNone++;
  });

  /* ---- roles y aria ---- */
  const roles = A.counter();
  A.$('[role]').forEach((el) => roles.add(el.getAttribute('role')));
  const ariaAttrs = A.counter();
  A.allElements(6000).forEach((el) => {
    const at = el.attributes;
    if (!at) return;
    for (let i = 0; i < at.length; i++) if (/^aria-/.test(at[i].name)) ariaAttrs.add(at[i].name);
  });

  const langIssues = [];
  if (!document.documentElement.getAttribute('lang')) langIssues.push('<html> sin atributo lang');

  return {
    imagesTotal: imgs.length,
    imagesWithoutAlt: missingAlt.length,
    imagesEmptyAlt: emptyAlt.length,
    imagesWithoutAltSamples: missingAlt.slice(0, 10).map((i) => (i.currentSrc || i.src || A.ident(i)).slice(-70)),
    h1Count: A.count('h1'),
    headings: { h1: A.count('h1'), h2: A.count('h2'), h3: A.count('h3'), h4: A.count('h4'), h5: A.count('h5'), h6: A.count('h6') },
    headingOutline: headings.slice(0, 40),
    headingOrderIssues: orderIssues.slice(0, 10),
    ariaLabelElements: A.count('[aria-label]'),
    ariaAttributes: ariaAttrs.top(12),
    roles: roles.top(12),
    inputsTotal: fields.length,
    inputsWithoutLabel: unlabeled.length,
    inputsWithoutLabelSamples: unlabeled.slice(0, 10).map((f) => `${f.tagName.toLowerCase()}[${f.getAttribute('type') || 'text'}] name=${f.getAttribute('name') || '—'} ph=${f.getAttribute('placeholder') || '—'}`),
    buttonsWithoutAccessibleName: buttonsNoName.length,
    buttonsWithoutAccessibleNameSamples: buttonsNoName.slice(0, 8).map((b) => A.ident(b)),
    linksWithoutAccessibleName: linksNoName.length,
    focusOutlineRemoved: outlineNone,
    positiveTabindex: A.$('[tabindex]').filter((el) => +el.getAttribute('tabindex') > 0).length,
    skipLink: A.$('a[href^="#"]').slice(0, 5).some((a) => /skip|saltar|contenido principal/i.test(A.text(a, 40))),
    landmarksPresent: {
      banner: A.count('header, [role="banner"]') > 0,
      navigation: A.count('nav, [role="navigation"]') > 0,
      main: A.count('main, [role="main"]') > 0,
      contentinfo: A.count('footer, [role="contentinfo"]') > 0,
      search: A.count('[role="search"]') > 0,
    },
    iframesWithoutTitle: A.$('iframe').filter((f) => !f.getAttribute('title')).length,
    tablesWithoutHeaders: A.$('table').filter((t) => !t.querySelector('th')).length,
    autoplayMedia: A.$('video[autoplay], audio[autoplay]').length,
    langIssues,
  };
};
