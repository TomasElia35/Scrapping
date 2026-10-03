'use strict';

/**
 * 4/5/6. Un solo recorrido de getComputedStyle sobre todos los elementos de body:
 * tipografia, paleta, sistema de espaciado, design tokens y contraste.
 */
module.exports = function extractStyles() {
  const A = window.__A;
  const CAP = 25000;
  const els = A.allElements(CAP);
  const totalElements = document.body ? document.body.getElementsByTagName('*').length : 0;

  const fontFamily = A.counter(), fontSize = A.counter(), fontWeight = A.counter(), lineHeight = A.counter();
  const letterSpacing = A.counter(), textTransform = A.counter(), textAlign = A.counter();
  const textColor = A.counter(), bgColor = A.counter(), borderColor = A.counter();
  const gradient = A.counter();
  const radius = A.counter(), shadow = A.counter(), gap = A.counter(), padding = A.counter(), margin = A.counter();
  const borderWidth = A.counter(), maxWidth = A.counter(), zIndex = A.counter();
  const display = A.counter(), position = A.counter(), overflow = A.counter();
  const cursorPointer = { count: 0 };

  let grid = 0, flex = 0, sticky = 0, fixed = 0, absolute = 0;
  const contrastIssues = [];
  const seenContrast = new Set();

  for (const el of els) {
    const cs = A.cs(el);
    if (!cs || cs.display === 'none') continue;
    const tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') continue;

    fontFamily.add(cs.fontFamily);
    fontSize.add(cs.fontSize);
    fontWeight.add(cs.fontWeight);
    lineHeight.add(cs.lineHeight);
    letterSpacing.addUseful(cs.letterSpacing);
    if (cs.textTransform !== 'none') textTransform.add(cs.textTransform);
    textAlign.add(cs.textAlign);

    if (!A.isTransparent(cs.color)) textColor.add(A.hex(cs.color));
    if (!A.isTransparent(cs.backgroundColor)) bgColor.add(A.hex(cs.backgroundColor));
    if (cs.backgroundImage && /gradient/i.test(cs.backgroundImage)) gradient.add(cs.backgroundImage.slice(0, 120));
    if (parseFloat(cs.borderTopWidth) > 0 && !A.isTransparent(cs.borderTopColor)) {
      borderColor.add(A.hex(cs.borderTopColor));
      borderWidth.addUseful(cs.borderTopWidth);
    }

    radius.addUseful(cs.borderRadius);
    shadow.addUseful(cs.boxShadow);
    gap.addUseful(cs.gap);
    padding.addUseful(cs.padding);
    margin.addUseful(cs.margin);
    if (cs.maxWidth && cs.maxWidth !== 'none' && cs.maxWidth !== '100%') maxWidth.add(cs.maxWidth);
    if (cs.zIndex && cs.zIndex !== 'auto') zIndex.add(cs.zIndex);
    display.add(cs.display);
    position.add(cs.position);
    if (cs.overflow !== 'visible') overflow.add(cs.overflow);
    if (cs.cursor === 'pointer') cursorPointer.count++;

    if (cs.display === 'grid' || cs.display === 'inline-grid') grid++;
    else if (cs.display === 'flex' || cs.display === 'inline-flex') flex++;
    if (cs.position === 'sticky') sticky++;
    else if (cs.position === 'fixed') fixed++;
    else if (cs.position === 'absolute') absolute++;

    /* contraste: solo nodos con texto propio y visibles */
    if (contrastIssues.length < 400 && el.childElementCount === 0) {
      const txt = (el.textContent || '').trim();
      if (txt.length > 1 && A.visible(el)) {
        const bg = A.effectiveBg(el);
        if (bg) {
          const ratio = A.contrast(cs.color, bg);
          if (ratio !== null) {
            const size = parseFloat(cs.fontSize);
            const bold = parseInt(cs.fontWeight, 10) >= 700;
            const large = size >= 24 || (size >= 18.66 && bold);
            const min = large ? 3 : 4.5;
            if (ratio < min) {
              const key = `${A.hex(cs.color)}|${A.hex(bg)}|${cs.fontSize}`;
              if (!seenContrast.has(key)) {
                seenContrast.add(key);
                contrastIssues.push({
                  ratio,
                  required: min,
                  color: A.hex(cs.color),
                  background: A.hex(bg),
                  fontSize: cs.fontSize,
                  fontWeight: cs.fontWeight,
                  sample: txt.replace(/\s+/g, ' ').slice(0, 50),
                  element: A.ident(el),
                });
              }
            }
          }
        }
      }
    }
  }

  /* ---- escala tipografica real de headings y body ---- */
  const scaleOf = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = A.cs(el);
    return cs
      ? { fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight, fontFamily: cs.fontFamily.split(',')[0].replace(/["']/g, ''), letterSpacing: cs.letterSpacing, color: A.hex(cs.color) }
      : null;
  };
  const typeScale = {};
  ['body', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'button', 'input', 'small'].forEach((s) => {
    const v = scaleOf(s);
    if (v) typeScale[s] = v;
  });

  /* ---- design tokens: custom properties en :root ---- */
  const tokens = { color: [], space: [], radius: [], shadow: [], font: [], other: [] };
  try {
    const rootStyles = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (e) {
        continue;
      }
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (rule.type === 1 && /^(:root|html|\*)/.test(rule.selectorText || '')) rootStyles.push(rule.style);
      }
    }
    const seen = new Set();
    rootStyles.forEach((st) => {
      for (let i = 0; i < st.length; i++) {
        const prop = st[i];
        if (!prop.startsWith('--') || seen.has(prop)) continue;
        seen.add(prop);
        const value = st.getPropertyValue(prop).trim().slice(0, 120);
        const entry = { name: prop, value };
        if (/color|bg|background|fg|text|brand|primary|secondary|accent|gray|grey|neutral/i.test(prop) || /^#|rgb|hsl/i.test(value)) tokens.color.push(entry);
        else if (/space|spacing|gap|size-\d|margin|padding/i.test(prop)) tokens.space.push(entry);
        else if (/radius|rounded/i.test(prop)) tokens.radius.push(entry);
        else if (/shadow|elevation/i.test(prop)) tokens.shadow.push(entry);
        else if (/font|type|leading|tracking|weight/i.test(prop)) tokens.font.push(entry);
        else tokens.other.push(entry);
      }
    });
  } catch (e) {}
  Object.keys(tokens).forEach((k) => (tokens[k] = tokens[k].slice(0, 40)));

  /* ---- fuentes realmente cargadas ---- */
  const loadedFonts = [];
  try {
    if (document.fonts && document.fonts.forEach) {
      document.fonts.forEach((f) => {
        if (loadedFonts.length < 30) loadedFonts.push(`${f.family} ${f.weight} ${f.style} (${f.status})`);
      });
    }
  } catch (e) {}

  return {
    typography: {
      fontFamilies: fontFamily.top(5),
      fontFamiliesAll: fontFamily.top(12),
      fontSizes: fontSize.top(8),
      fontSizesAll: fontSize.top(20),
      fontWeights: fontWeight.top(5),
      lineHeights: lineHeight.top(5),
      letterSpacings: letterSpacing.top(5),
      textTransforms: textTransform.top(4),
      textAligns: textAlign.top(4),
      typeScale,
      loadedFonts: Array.from(new Set(loadedFonts)),
      distinct: { families: fontFamily.distinct(), sizes: fontSize.distinct(), weights: fontWeight.distinct(), lineHeights: lineHeight.distinct() },
    },
    palette: {
      textColors: textColor.top(8),
      textColorsAll: textColor.top(20),
      backgrounds: bgColor.top(8),
      backgroundsAll: bgColor.top(20),
      borderColors: borderColor.top(5),
      gradients: gradient.top(5),
      distinct: { text: textColor.distinct(), background: bgColor.distinct(), border: borderColor.distinct() },
    },
    spacing: {
      borderRadius: radius.top(6),
      boxShadows: shadow.top(5),
      gaps: gap.top(6),
      paddings: padding.top(8),
      margins: margin.top(8),
      borderWidths: borderWidth.top(5),
      distinct: { radius: radius.distinct(), shadow: shadow.distinct(), gap: gap.distinct(), padding: padding.distinct() },
    },
    displayStats: {
      grid,
      flex,
      sticky,
      fixed,
      absolute,
      displays: display.top(8),
      positions: position.top(6),
      overflows: overflow.top(5),
      zIndexes: zIndex.top(8),
      maxWidths: maxWidth.top(6),
      cursorPointer: cursorPointer.count,
    },
    contrast: {
      issues: contrastIssues.sort((a, b) => a.ratio - b.ratio).slice(0, 25),
      totalIssues: contrastIssues.length,
    },
    elementsScanned: els.length,
    elementsTotal: totalElements,
    scanCapped: totalElements > els.length,
  };
};
