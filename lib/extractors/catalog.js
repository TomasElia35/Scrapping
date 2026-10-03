'use strict';

/**
 * Anatomia del catalogo: detecta cards de producto reales y los campos que muestran.
 * Pensado para e-commerce y mayoristas B2B: unidad de venta, cantidad minima,
 * precios visibles u ocultos sin sesion, stock.
 */
module.exports = function extractCatalog() {
  const A = window.__A;

  const RE = {
    price: /(\$|ars|us\$|usd)\s?\d{1,3}([.,]\d{3})*([.,]\d{1,2})?|\d{1,3}([.,]\d{3})+([.,]\d{2})?\s?(\$|pesos)/i,
    unit: /\b(bulto|bultos|caja|cajas|pack|display|blister|unidad(es)?|un\.|kg|gr|lt|ml|cc|x\s?\d{1,3}\b|por\s?\d{1,3}\b|docena)\b/i,
    minQty: /(m[ií]nimo|m[ií]n\.?|compra m[ií]nima|cantidad m[ií]nima|a partir de)\s*:?\s*\d+/i,
    stock: /(sin stock|stock disponible|hay stock|agotado|no disponible|\bstock\b|disponibilidad)/i,
    sku: /\b(sku|c[oó]digo|cod\.?|art\.?|art[ií]culo|ean)\b\s*:?\s*[\w-]{3,}/i,
    discount: /(-\s?\d{1,3}\s?%|\d{1,3}\s?%\s?(off|desc|de descuento))/i,
    installments: /(\d{1,2}\s*(cuotas|pagos)\b|sin inter[eé]s|\bcuotas\b)/i,
    pricePerUnit: /(\$|\d)[^a-z]{0,12}(x|por|el|la)\s?(lt|litro|kg|kilo|un|unidad|m2|mt|gr|ml|cc|docena)\b/i,
    loginForPrice: /(inici[aá]\s?r?\s?sesi[oó]n|ingres[aá]|logue[aá]|reg[ií]str)[^.]{0,50}(precio|precios|lista)|acceso\s+(a\s+)?(comerciantes|clientes|mayoristas)|solo\s+(para\s+)?(comerciantes|clientes registrados)|precios?\s+(solo\s+)?para\s+(clientes|comerciantes|registrados)/i,
    wholesaleOnly: /(solo|s[oó]lo|exclusivo)\s+(para\s+)?(mayorista|revendedor|comercio|profesional)/i,
    addToCart: /(agregar|a[ñn]adir|comprar|sumar|al carrito|pedir|cotizar|consultar precio)/i,
    brandish: /^[A-Z0-9][A-Za-z0-9&.\- ]{1,24}$/,
  };

  const pageText = document.body ? document.body.innerText.replace(/\s+/g, ' ') : '';

  /**
   * Una card de producto es el ancestro mas chico que contiene, a la vez,
   * un precio y un link o imagen de producto.
   */
  function findProductCards() {
    const withPrice = [];
    const walker = document.createTreeWalker(document.body || document.documentElement, NodeFilter.SHOW_TEXT);
    let node;
    let guard = 0;
    while ((node = walker.nextNode()) && guard++ < 20000) {
      const t = (node.nodeValue || '').trim();
      if (t.length < 2 || t.length > 40) continue;
      if (!RE.price.test(t)) continue;
      const el = node.parentElement;
      if (el && A.visible(el)) withPrice.push(el);
    }

    const cards = new Map();
    withPrice.slice(0, 400).forEach((priceEl) => {
      let n = priceEl;
      let up = 0;
      while (n && up++ < 8) {
        const r = A.rect(n);
        const hasMedia = n.querySelector('img, picture, svg');
        const hasLink = n.querySelector('a[href]') || n.closest('a[href]');
        if (hasMedia && hasLink && r.w > 100 && r.h > 100 && r.w < window.innerWidth * 0.9) {
          if (!cards.has(n)) cards.set(n, true);
          break;
        }
        n = n.parentElement;
      }
    });

    // nos quedamos con las hojas: descartamos las cards que contienen otras
    const list = Array.from(cards.keys());
    return list.filter((el) => !list.some((other) => other !== el && el.contains(other)));
  }

  /**
   * Fallback para sitios que esconden los precios (mayoristas con login):
   * una grilla de productos es un contenedor con 4+ hijos de tamaño parecido,
   * cada uno con imagen y link.
   */
  function findGridItems() {
    const containers = new Map();
    A.$('ul, div, section, ol')
      .slice(0, 2500)
      .forEach((cont) => {
        const kids = Array.from(cont.children).filter((k) => {
          const r = A.rect(k);
          // una card de producto no ocupa todo el ancho ni es una franja apaisada: eso es un banner
          const ratio = r.h ? r.w / r.h : 99;
          return A.visible(k) && r.w > 90 && r.h > 90 && r.w < window.innerWidth * 0.5 && ratio < 2.2 && k.querySelector('img, picture') && (k.querySelector('a[href]') || k.tagName === 'A');
        });
        if (kids.length < 4) return;
        const widths = kids.map((k) => A.rect(k).w);
        const avg = widths.reduce((a, b) => a + b, 0) / widths.length;
        const similar = widths.filter((w) => Math.abs(w - avg) < avg * 0.2).length;
        if (similar < kids.length * 0.8) return;
        // tienen que estar dispuestos en filas: al menos dos comparten la misma altura
        const tops = kids.map((k) => Math.round(A.rect(k).top / 24));
        const sameRow = tops.filter((t, i) => tops.indexOf(t) !== i).length;
        if (!sameRow) return;
        containers.set(cont, kids);
      });

    // el contenedor con más items parejos gana; descartamos los anidados
    const conts = Array.from(containers.keys()).filter((c) => !Array.from(containers.keys()).some((o) => o !== c && o.contains(c)));
    const best = conts.sort((a, b) => containers.get(b).length - containers.get(a).length)[0];
    return best ? containers.get(best) : [];
  }

  let cardEls = findProductCards();
  let detection = 'por precio';
  if (cardEls.length < 3) {
    const gridItems = findGridItems();
    if (gridItems.length >= 4) {
      cardEls = gridItems;
      detection = 'por estructura repetida (sin precios visibles)';
    }
  }

  /** Campos de una card, en el orden en que aparecen. */
  function anatomy(el) {
    const fields = [];
    const seen = new Set();
    const push = (kind, value, node) => {
      if (seen.has(kind)) return;
      seen.add(kind);
      const cs = node ? A.cs(node) : null;
      fields.push({
        kind,
        value: String(value).slice(0, 70),
        fontSize: cs ? cs.fontSize : null,
        fontWeight: cs ? cs.fontWeight : null,
        color: cs ? A.hex(cs.color) : null,
      });
    };

    const img = el.querySelector('img');
    if (img) push('imagen', `${img.naturalWidth}x${img.naturalHeight}`, img);

    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    const texts = [];
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      // el CSS o el JS embebido en la card no es contenido
      if (!parent || /^(STYLE|SCRIPT|NOSCRIPT|TEMPLATE)$/.test(parent.tagName)) continue;
      const t = (node.nodeValue || '').replace(/\s+/g, ' ').trim();
      if (!t || /[{};]\s*$|^\.|^@media|^\s*[\w-]+\s*:\s*[^;]+;/.test(t)) continue;
      texts.push({ t, parent });
    }

    texts.forEach(({ t, parent }) => {
      if (RE.discount.test(t)) push('descuento', t, parent);
      else if (RE.installments.test(t)) push('cuotas', t, parent);
      else if (RE.pricePerUnit.test(t)) push('precio por unidad de medida', t, parent);
      else if (RE.minQty.test(t)) push('cantidad mínima', t, parent);
      else if (RE.price.test(t)) {
        if (!seen.has('precio')) push('precio', t, parent);
        else push('precio secundario', t, parent);
      } else if (RE.sku.test(t)) push('sku / código', t, parent);
      else if (RE.stock.test(t)) push('stock', t, parent);
      else if (RE.unit.test(t) && t.length < 30) push('unidad de venta', t, parent);
      else if (RE.addToCart.test(t) && t.length < 30) push('botón de compra', t, parent);
      else if (!seen.has('título') && t.length > 12) push('título', t, parent);
      else if (!seen.has('marca') && RE.brandish.test(t) && t.length < 25) push('marca', t, parent);
    });

    const qty = el.querySelector('input[type="number"], [class*="qty" i], [class*="cantidad" i], [class*="quantity" i]');
    if (qty) push('selector de cantidad', 'input numérico', qty);

    const r = A.rect(el);
    const cs = A.cs(el) || {};
    return {
      element: A.ident(el),
      size: `${r.w}x${r.h}`,
      aspect: r.h ? +(r.w / r.h).toFixed(2) : null,
      background: A.isTransparent(cs.backgroundColor) ? 'transparente' : A.hex(cs.backgroundColor),
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow === 'none' ? null : cs.boxShadow,
      padding: cs.padding,
      border: parseFloat(cs.borderTopWidth) > 0 ? `${cs.borderTopWidth} ${A.hex(cs.borderTopColor)}` : null,
      textAlign: cs.textAlign,
      fields,
    };
  }

  const analyzed = cardEls.slice(0, 40).map(anatomy);

  const fieldFreq = A.counter();
  analyzed.forEach((c) => c.fields.forEach((f) => fieldFreq.add(f.kind)));

  /* grilla del catálogo */
  let grid = null;
  if (cardEls.length > 2) {
    const rows = new Map();
    cardEls.forEach((c) => {
      const key = Math.round(A.rect(c).top / 24);
      rows.set(key, (rows.get(key) || 0) + 1);
    });
    const counts = Array.from(rows.values()).filter((n) => n <= 12);
    const hist = {};
    counts.forEach((n) => (hist[n] = (hist[n] || 0) + 1));
    const perRow = +Object.keys(hist).sort((a, b) => hist[b] - hist[a] || b - a)[0] || null;
    const container = cardEls[0].parentElement;
    const ccs = container ? A.cs(container) : null;
    const sizes = A.counter();
    cardEls.forEach((c) => {
      const r = A.rect(c);
      sizes.add(`${Math.round(r.w / 10) * 10}x${Math.round(r.h / 10) * 10}`);
    });
    grid = {
      perRow,
      display: ccs ? ccs.display : null,
      gridTemplateColumns: ccs && ccs.display === 'grid' ? (ccs.gridTemplateColumns || '').slice(0, 90) : null,
      gap: ccs ? ccs.gap : null,
      commonSize: (sizes.top(1)[0] || {}).value || null,
    };
  }

  /* señales B2B / mayorista */
  const mentions = [];
  ['bulto', 'mayorista', 'revendedor', 'cuit', 'lista de precios', 'pedido mínimo', 'sucursal', 'reparto', 'cuenta corriente', 'factura', 'iva'].forEach((term) => {
    if (new RegExp(term.replace(/ /g, '\\s+'), 'i').test(pageText)) mentions.push(term);
  });

  const b2b = {
    cardsWithPrice: analyzed.filter((c) => c.fields.some((f) => f.kind === 'precio')).length,
    pricesHiddenHint: RE.loginForPrice.test(pageText),
    wholesaleOnlyHint: RE.wholesaleOnly.test(pageText),
    unitOfSaleShown: analyzed.filter((c) => c.fields.some((f) => f.kind === 'unidad de venta')).length,
    minQuantityShown: analyzed.filter((c) => c.fields.some((f) => f.kind === 'cantidad mínima')).length,
    stockShown: analyzed.filter((c) => c.fields.some((f) => f.kind === 'stock')).length,
    quantitySelectors: A.count('input[type="number"], [class*="qty" i] input, [class*="cantidad" i] input'),
    cuitFields: A.$('input, label').filter((el) => /cuit/i.test(el.getAttribute('name') || el.getAttribute('placeholder') || el.textContent || '')).length,
    mentions,
  };

  /* marcamos las primeras cards para recortarlas después */
  const shotIds = [];
  cardEls.slice(0, 3).forEach((el, i) => {
    const id = `producto-${i + 1}`;
    if (A.tag(el, id)) shotIds.push({ shotId: id, label: `Card de producto ${i + 1}` });
  });

  return {
    cardsDetected: cardEls.length,
    detection,
    grid,
    fieldFrequency: fieldFreq.top(15),
    fieldsPerCard: analyzed.length ? +(analyzed.reduce((a, c) => a + c.fields.length, 0) / analyzed.length).toFixed(1) : 0,
    samples: analyzed.slice(0, 6),
    b2b,
    shotIds,
  };
};
