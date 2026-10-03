'use strict';

/**
 * Inventario de contenido: titulares, CTAs, propuestas de valor, promesas
 * y señales de tono. Sirve para que el prompt indique QUÉ dice el sitio,
 * no solo cómo se ve.
 */
module.exports = function extractContent() {
  const A = window.__A;
  const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  /* ---- titulares en orden de aparición ---- */
  const headlines = A.$('h1, h2, h3')
    .filter((el) => A.visible(el) && clean(el.innerText).length > 2)
    .slice(0, 40)
    .map((el) => {
      const cs = A.cs(el) || {};
      return {
        level: el.tagName.toLowerCase(),
        text: clean(el.innerText).slice(0, 110),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        transform: cs.textTransform,
        top: A.rect(el).top,
      };
    });

  /* ---- CTAs: texto de botones y links con aspecto de botón ---- */
  const ctaCounter = A.counter();
  const ctaSamples = [];
  A.$('button, [role="button"], a[class*="btn" i], a[class*="button" i], input[type="submit"]')
    .filter((el) => A.visible(el))
    .slice(0, 300)
    .forEach((el) => {
      const t = clean(el.innerText || el.value || el.getAttribute('aria-label'));
      if (!t || t.length > 40) return;
      // los controles de carrusel y paginación no son llamados a la acción
      if (
        /^(anterior|siguiente|prev(ious)?|next|atr[aá]s|adelante|cerrar|close|menu|men[uú]|ir a (la )?(diapositiva|slide|p[aá]gina)\s*\d*|(go to |goto )?(slide|page|item)\s*\d*|(diapositiva|p[aá]gina)\s*\d*|\d+|[<>«»‹›→←+-])$/i.test(t)
      ) {
        return;
      }
      ctaCounter.add(t);
      if (ctaSamples.length < 25) {
        const cs = A.cs(el) || {};
        ctaSamples.push({ text: t.slice(0, 40), size: cs.fontSize, weight: cs.fontWeight, transform: cs.textTransform, background: A.hex(cs.backgroundColor) });
      }
    });

  /* ---- propuestas de valor: frases cortas y destacadas de la primera pantalla ---- */
  const valueProps = [];
  A.allElements(6000)
    .filter((el) => {
      if (!A.visible(el) || el.children.length > 2) return false;
      const r = A.rect(el);
      if (r.top > window.innerHeight * 2.2) return false;
      const t = clean(el.innerText);
      if (t.length < 8 || t.length > 90) return false;
      const cs = A.cs(el);
      if (!cs) return false;
      const big = parseFloat(cs.fontSize) >= 18;
      const bold = parseInt(cs.fontWeight, 10) >= 600;
      const upper = cs.textTransform === 'uppercase';
      return big || bold || upper;
    })
    .slice(0, 25)
    .forEach((el) => {
      const t = clean(el.innerText);
      if (!valueProps.some((v) => v.text === t)) {
        const cs = A.cs(el) || {};
        valueProps.push({ text: t.slice(0, 90), fontSize: cs.fontSize, fontWeight: cs.fontWeight, top: A.rect(el).top });
      }
    });

  /* ---- promesas y beneficios frecuentes en el rubro ---- */
  const pageText = document.body ? clean(document.body.innerText) : '';
  const PROMISES = {
    'envío gratis': /env[ií]o\s+(gratis|sin cargo)/i,
    'envíos': /\benv[ií]os?\b/i,
    'retiro en sucursal': /(retir[aoá]|pickup)[^.]{0,25}(sucursal|local|tienda)/i,
    'cuotas sin interés': /cuotas?\s+sin\s+inter[eé]s/i,
    'descuento por pago en efectivo': /(efectivo|transferencia)[^.]{0,25}(descuento|off|\d{1,2}\s?%)/i,
    'compra mínima': /(compra|pedido)\s+m[ií]nim[oa]/i,
    'atención al cliente': /(atenci[oó]n|contact[áa]|whatsapp|hablanos)/i,
    'garantía': /garant[ií]a/i,
    'stock permanente': /stock\s+(permanente|disponible|real)/i,
    'precios mayoristas': /precios?\s+(mayorista|por mayor)/i,
    'cuenta corriente': /cuenta\s+corriente/i,
    'facturación A': /factura[^.]{0,15}\b[aA]\b/i,
    'cobertura nacional': /(todo el pa[ií]s|nacional|todo el territorio)/i,
    'años de experiencia': /\d{1,3}\s+a[ñn]os/i,
    'seguridad de pago': /(pago|compra)\s+segur[ao]/i,
    'newsletter': /(suscrib|newsletter|novedades por mail)/i,
  };
  const promises = Object.keys(PROMISES).filter((k) => PROMISES[k].test(pageText));

  /* ---- tono: métricas simples sobre el texto visible ---- */
  const words = pageText.split(/\s+/).filter(Boolean);
  const sentences = pageText.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const upperWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(w));
  const tone = {
    caracteres: pageText.length,
    palabras: words.length,
    oraciones: sentences.length,
    palabrasPorOracion: sentences.length ? +(words.length / sentences.length).toFixed(1) : null,
    mayusculasSostenidas: upperWords.length,
    porcentajeMayusculas: words.length ? +((upperWords.length / words.length) * 100).toFixed(1) : 0,
    exclamaciones: (pageText.match(/!/g) || []).length,
    preguntas: (pageText.match(/\?/g) || []).length,
    tratamientoVos: /\b(compr[áa]|ingres[áa]|consult[áa]|ped[íi]|reg[íi]strate|hac[ée]|ten[ée]s|pod[ée]s|sum[áa]|descubr[íi]|mir[áa]|eleg[íi]|aprovech[áa])\b/i.test(pageText),
    tratamientoUsted: /\b(compre|ingrese|consulte|reg[íi]strese|puede usted|solicite|su (pedido|empresa|cuenta|comercio)|d[eé]jenos)\b/i.test(pageText),
    tratamientoTu: /\b(compra ahora|ingresa|consulta|reg[íi]strate ya|puedes|tienes|tu (pedido|cuenta|carrito))\b/i.test(pageText),
  };
  tone.registro = tone.tratamientoUsted ? 'formal (usted)' : tone.tratamientoVos ? 'informal rioplatense (vos)' : tone.tratamientoTu ? 'informal neutro (tú)' : 'indeterminado';

  /* ---- buscador interno ---- */
  const searchInput = A.$('input[type="search"], input[name*="search" i], input[name*="busca" i], input[placeholder*="busc" i], [role="search"] input').filter((el) => A.visible(el))[0] || null;
  const search = searchInput
    ? {
        present: true,
        placeholder: searchInput.getAttribute('placeholder') || null,
        width: A.rect(searchInput).w,
        position: A.rect(searchInput).top < 200 ? 'header' : 'dentro del contenido',
        inHeader: !!searchInput.closest('header'),
        hasButton: !!(searchInput.closest('form') && searchInput.closest('form').querySelector('button, input[type="submit"]')),
        autocompleteAttr: searchInput.getAttribute('autocomplete'),
        shotId: A.tag(searchInput.closest('form') || searchInput, 'zone-buscador') ? 'zone-buscador' : null,
      }
    : { present: false };

  /* ---- categorías visibles: la taxonomía del negocio ---- */
  /* el nav de categorías es el que más links tiene, no el primero del DOM:
     los sitios suelen tener antes un nav de sucursales o de idioma */
  const navCandidates = A.$('header nav, nav, [role="navigation"], [class*="categor" i]')
    .filter((el) => A.visible(el))
    .map((el) => ({ el, links: A.$('a[href]', el).filter((a) => A.visible(a) && clean(a.innerText).length > 2).length }))
    .filter((x) => x.links > 1)
    .sort((a, b) => b.links - a.links);
  const navEl = navCandidates.length ? navCandidates[0].el : null;
  const categories = navEl
    ? A.$('a[href]', navEl)
        .filter((a) => A.visible(a) && clean(a.innerText).length > 2)
        .slice(0, 30)
        .map((a) => clean(a.innerText).slice(0, 40))
        .filter((t) => !/^(sucursal|inicio|home|contacto|ingres|acceso|registr|mi cuenta|carrito)/i.test(t))
    : [];

  return {
    headlines,
    h1: (headlines.find((h) => h.level === 'h1') || {}).text || null,
    ctas: ctaCounter.top(15),
    ctaSamples,
    valueProps: valueProps.slice(0, 12),
    promises,
    tone,
    search,
    categories: Array.from(new Set(categories)),
  };
};
