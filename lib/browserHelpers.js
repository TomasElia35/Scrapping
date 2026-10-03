'use strict';

/**
 * Se inyecta con page.addInitScript() en cada documento.
 * Deja window.__A con utilidades compartidas por todos los extractores.
 * Debe ser autocontenida (sin closures externas, sin require).
 */
module.exports = function installHelpers() {
  const A = {};

  A.$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  A.count = (sel, root) => ((root || document).querySelectorAll(sel) || []).length;
  A.cs = (el) => {
    try {
      return getComputedStyle(el);
    } catch (e) {
      return null;
    }
  };

  /* ---- contadores de frecuencia ---- */
  A.counter = function () {
    const m = new Map();
    return {
      add(v, times) {
        if (v === undefined || v === null) return;
        const k = String(v).trim();
        if (!k) return;
        m.set(k, (m.get(k) || 0) + (times || 1));
      },
      addUseful(v) {
        const k = String(v === undefined || v === null ? '' : v).trim();
        if (!k || k === 'none' || k === 'normal' || k === 'auto' || k === '0px' || k === '0px 0px 0px 0px') return;
        m.set(k, (m.get(k) || 0) + 1);
      },
      top(n) {
        return Array.from(m.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
          .slice(0, n === undefined ? 10 : n);
      },
      distinct() {
        return m.size;
      },
      total() {
        let t = 0;
        m.forEach((v) => (t += v));
        return t;
      },
      raw() {
        const o = {};
        m.forEach((v, k) => (o[k] = v));
        return o;
      },
    };
  };

  /* ---- color ---- */
  A.parseColor = function (c) {
    if (!c) return null;
    const m = String(c).match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.%]+))?\s*\)/i);
    if (!m) return null;
    let a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (/%$/.test(String(m[4]))) a = parseFloat(m[4]) / 100;
    return { r: +m[1], g: +m[2], b: +m[3], a: isNaN(a) ? 1 : a };
  };
  A.isTransparent = function (c) {
    const p = A.parseColor(c);
    if (!c || c === 'transparent') return true;
    return !p || p.a < 0.05;
  };
  A.hex = function (c) {
    const p = A.parseColor(c);
    if (!p) return String(c || '');
    const h = (n) => Math.round(n).toString(16).padStart(2, '0');
    return `#${h(p.r)}${h(p.g)}${h(p.b)}` + (p.a < 1 ? ` (${p.a.toFixed(2)})` : '');
  };
  A.lum = function (c) {
    const p = A.parseColor(c);
    if (!p) return null;
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(p.r) + 0.7152 * f(p.g) + 0.0722 * f(p.b);
  };
  A.contrast = function (fg, bg) {
    const l1 = A.lum(fg);
    const l2 = A.lum(bg);
    if (l1 === null || l2 === null) return null;
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
  };
  /** background efectivo: sube por los ancestros hasta encontrar uno opaco */
  A.effectiveBg = function (el) {
    let node = el;
    let guard = 0;
    while (node && node !== document.documentElement && guard++ < 40) {
      const cs = A.cs(node);
      if (cs && !A.isTransparent(cs.backgroundColor)) return cs.backgroundColor;
      if (cs && cs.backgroundImage && cs.backgroundImage !== 'none') return null; // imagen: no evaluable
      node = node.parentElement;
    }
    const b = A.cs(document.body);
    return b && !A.isTransparent(b.backgroundColor) ? b.backgroundColor : 'rgb(255, 255, 255)';
  };

  /* ---- geometria / visibilidad ---- */
  A.rect = function (el) {
    try {
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY), left: Math.round(r.left) };
    } catch (e) {
      return { w: 0, h: 0, top: 0, left: 0 };
    }
  };
  A.visible = function (el) {
    const cs = A.cs(el);
    if (!cs) return false;
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /* ---- texto / identificacion ---- */
  A.text = function (el, max) {
    if (!el) return '';
    const t = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    return t.slice(0, max || 60);
  };
  A.cls = function (el) {
    const c = el && el.className && el.className.toString ? el.className.toString() : '';
    return c.replace(/\s+/g, ' ').trim();
  };
  A.ident = function (el) {
    if (!el) return '';
    let s = el.tagName.toLowerCase();
    if (el.id) s += `#${el.id}`;
    const c = A.cls(el).split(' ').filter(Boolean).slice(0, 3).join('.');
    if (c) s += `.${c}`;
    return s.slice(0, 90);
  };
  A.hostOf = function (u) {
    try {
      return new URL(u, location.href).hostname;
    } catch (e) {
      return '';
    }
  };

  /** firma de estilo para agrupar variantes de un componente */
  A.sig = function (el, props) {
    const cs = A.cs(el);
    if (!cs) return 'n/a';
    return props.map((p) => `${p}:${cs[p]}`).join(' | ');
  };
  A.styleObj = function (el, props) {
    const cs = A.cs(el);
    const o = {};
    if (cs) props.forEach((p) => (o[p] = cs[p]));
    return o;
  };

  /** marca un elemento para poder recortarlo despues con un screenshot */
  A.tag = function (el, id) {
    try {
      el.setAttribute('data-shot', id);
      return id;
    } catch (e) {
      return null;
    }
  };

  /**
   * Agrupa elementos por firma y devuelve variantes ordenadas por uso.
   * Si se pasa tagPrefix, marca un elemento representativo de cada variante
   * con data-shot para poder capturarlo (devuelto en .shotId).
   */
  A.variants = function (els, props, max, sampler, tagPrefix) {
    const groups = new Map();
    els.slice(0, 600).forEach((el) => {
      const key = A.sig(el, props);
      if (!groups.has(key)) {
        groups.set(key, { count: 0, styles: A.styleObj(el, props), samples: [], sizes: [], rep: el });
      }
      const g = groups.get(key);
      g.count++;
      if (g.samples.length < 3) {
        const s = sampler ? sampler(el) : A.text(el, 40) || A.ident(el);
        if (s) g.samples.push(s);
      }
      const r = A.rect(el);
      if (g.sizes.length < 40) g.sizes.push(`${r.w}x${r.h}`);
    });
    return Array.from(groups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, max || 8)
      .map((g, i) => ({
        count: g.count,
        styles: g.styles,
        samples: g.samples,
        commonSize: mode(g.sizes),
        element: A.ident(g.rep),
        shotId: tagPrefix ? A.tag(g.rep, `${tagPrefix}-${i + 1}`) : null,
      }));

    function mode(arr) {
      const m = {};
      let best = null;
      arr.forEach((v) => {
        m[v] = (m[v] || 0) + 1;
        if (!best || m[v] > m[best]) best = v;
      });
      return best;
    }
  };

  /** todos los elementos renderizados de body (con cap de seguridad) */
  A.allElements = function (cap) {
    const els = document.body ? Array.from(document.body.getElementsByTagName('*')) : [];
    return cap && els.length > cap ? els.slice(0, cap) : els;
  };

  A.depthOf = function (el) {
    let d = 0;
    let n = el;
    while (n && n.parentElement) {
      d++;
      n = n.parentElement;
    }
    return d;
  };

  window.__A = A;
};
