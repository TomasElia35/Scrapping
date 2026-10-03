'use strict';

/** 10. CSSOM: hojas, reglas, media queries (breakpoints declarados), @font-face, @supports. */
module.exports = function extractCssom() {
  const A = window.__A;

  const stats = {
    stylesheets: 0,
    accessible: 0,
    crossOrigin: 0,
    totalRules: 0,
    styleRules: 0,
    mediaRules: 0,
    keyframeRules: 0,
    fontFaceRules: 0,
    supportsRules: 0,
    importRules: 0,
    importantCount: 0,
    customPropertyDeclarations: 0,
    inlineStyleAttributes: A.count('[style]'),
    approxCssBytes: 0,
  };

  const mediaCounter = A.counter();
  const widthBreakpoints = A.counter();
  const fontFaces = [];
  const supports = A.counter();
  const sheetList = [];
  const selectorDepth = A.counter();
  let longestSelector = '';

  const sheets = Array.from(document.styleSheets);
  stats.stylesheets = sheets.length;

  const walk = (rules, sheetInfo) => {
    for (const r of Array.from(rules)) {
      stats.totalRules++;
      switch (r.type) {
        case 1: {
          stats.styleRules++;
          const sel = r.selectorText || '';
          if (sel.length > longestSelector.length) longestSelector = sel;
          selectorDepth.add(String(Math.min(8, sel.split(/\s+/).filter(Boolean).length)));
          const css = r.cssText || '';
          stats.approxCssBytes += css.length;
          const bangs = css.match(/!important/g);
          if (bangs) stats.importantCount += bangs.length;
          const st = r.style;
          for (let i = 0; i < st.length; i++) if (st[i].startsWith('--')) stats.customPropertyDeclarations++;
          if (sheetInfo) sheetInfo.rules++;
          break;
        }
        case 3:
          stats.importRules++;
          break;
        case 4: {
          stats.mediaRules++;
          const cond = (r.conditionText || (r.media && r.media.mediaText) || '').trim();
          mediaCounter.add(cond.slice(0, 120));
          const widths = cond.match(/(min|max)-width:\s*([\d.]+)(px|em|rem)/g) || [];
          widths.forEach((w) => widthBreakpoints.add(w.replace(/\s+/g, ' ')));
          if (r.cssRules) walk(r.cssRules, sheetInfo);
          break;
        }
        case 5: {
          stats.fontFaceRules++;
          if (fontFaces.length < 30) {
            const st = r.style;
            fontFaces.push({
              family: (st.getPropertyValue('font-family') || '').replace(/["']/g, '').trim(),
              weight: st.getPropertyValue('font-weight') || 'normal',
              style: st.getPropertyValue('font-style') || 'normal',
              display: st.getPropertyValue('font-display') || '(no declarado)',
              format: (() => {
                const src = st.getPropertyValue('src') || '';
                const m = src.match(/format\(["']?([\w-]+)["']?\)/g);
                return m ? m.map((x) => x.replace(/format\(["']?|["']?\)/g, '')).join(', ') : (src.match(/\.(woff2|woff|ttf|otf|eot)/) || [, '?'])[1];
              })(),
              host: A.hostOf((((st.getPropertyValue('src') || '').match(/url\(["']?([^"')]+)/) || [])[1]) || ''),
            });
          }
          break;
        }
        case 7:
          stats.keyframeRules++;
          break;
        case 12:
          stats.supportsRules++;
          supports.add((r.conditionText || '').slice(0, 80));
          if (r.cssRules) walk(r.cssRules, sheetInfo);
          break;
        default:
          break;
      }
    }
  };

  sheets.forEach((sheet) => {
    const info = { href: sheet.href ? sheet.href.slice(-80) : '(inline <style>)', host: A.hostOf(sheet.href || location.href), rules: 0, media: sheet.media ? sheet.media.mediaText : '' };
    let rules;
    try {
      rules = sheet.cssRules;
    } catch (e) {
      stats.crossOrigin++;
      info.rules = null;
      sheetList.push(info);
      return;
    }
    if (!rules) return;
    stats.accessible++;
    walk(rules, info);
    sheetList.push(info);
  });

  /* breakpoints numericos ordenados */
  const bpNumbers = new Set();
  widthBreakpoints.top(200).forEach((b) => {
    const m = b.value.match(/([\d.]+)(px|em|rem)/);
    if (!m) return;
    const n = m[2] === 'px' ? +m[1] : +m[1] * 16;
    if (n >= 240 && n <= 2600) bpNumbers.add(Math.round(n));
  });

  return {
    stats,
    sheets: sheetList.slice(0, 25),
    mediaQueries: mediaCounter.top(20),
    mediaQueryCount: mediaCounter.distinct(),
    widthBreakpoints: widthBreakpoints.top(20),
    inferredBreakpoints: Array.from(bpNumbers).sort((a, b) => a - b),
    fontFaces,
    supportsQueries: supports.top(8),
    selectorDepthDistribution: selectorDepth.top(8),
    longestSelector: longestSelector.slice(0, 160),
    hasDarkModeQuery: mediaCounter.top(200).some((m) => /prefers-color-scheme/i.test(m.value)),
    hasPrintStyles: mediaCounter.top(200).some((m) => /print/i.test(m.value)),
    hasHoverQuery: mediaCounter.top(200).some((m) => /hover|pointer/i.test(m.value)),
  };
};
