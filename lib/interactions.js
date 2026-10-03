'use strict';

/**
 * Captura de estados interactivos: lo que el análisis en reposo no ve.
 * Hover real (con :hover aplicado por el navegador), foco de teclado,
 * mega menú desplegado, filtros abiertos, minicart y sugerencias del buscador.
 *
 * Regla: no se envían formularios, no se completan credenciales y no se navega.
 * Si una acción provoca navegación, se vuelve atrás y se registra como tal.
 */

const path = require('path');
const fs = require('fs');

const STYLE_PROPS = [
  'backgroundColor',
  'color',
  'borderTopColor',
  'borderTopWidth',
  'borderRadius',
  'boxShadow',
  'transform',
  'opacity',
  'textDecorationLine',
  'outlineStyle',
  'outlineColor',
  'outlineWidth',
  'filter',
];

const readStyles = (el, props) => {
  const cs = getComputedStyle(el);
  const o = {};
  props.forEach((p) => (o[p] = cs[p]));
  return o;
};

/** Diferencias entre dos objetos de estilo. */
function styleDiff(before, after) {
  const diff = [];
  Object.keys(after || {}).forEach((k) => {
    if (before && before[k] !== after[k]) diff.push({ property: k, from: before[k], to: after[k] });
  });
  return diff;
}

async function capture(page, dir, file, locator) {
  const p = path.join(dir, file);
  try {
    if (locator) await locator.screenshot({ path: p, timeout: 6000 });
    else await page.screenshot({ path: p, fullPage: false, timeout: 8000 });
    return p;
  } catch (e) {
    return null;
  }
}

/**
 * @param {import('playwright').Page} page
 * @param {{dir: string, log: Function, viewport: {width:number,height:number}}} ctx
 */
async function captureInteractions(page, ctx) {
  const { dir, log } = ctx;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const out = { hover: [], focus: null, megaMenu: null, filters: null, cart: null, searchSuggestions: null, shots: {} };
  const startUrl = page.url();

  /** Ejecuta una acción y garantiza que no nos quedamos en otra página. */
  const guarded = async (label, fn) => {
    try {
      const before = page.url();
      const result = await fn();
      await page.waitForTimeout(250);
      // un objeto vacío significa "no encontré nada": lo normalizamos a null
      if (result && typeof result === 'object' && !Object.keys(result).length) return null;
      if (page.url() !== before) {
        log(`${label}: provocó navegación, volviendo atrás`);
        await page.goBack({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
        await page.waitForTimeout(600);
        return { navigated: true };
      }
      return result || null;
    } catch (e) {
      return { error: String(e.message || e).slice(0, 100) };
    }
  };

  /* ---- 1. hover real sobre los botones principales ---- */
  const btnSelectors = ['[data-shot="btn-1"]', '[data-shot="btn-2"]', '[data-shot="btn-3"]'];
  for (let i = 0; i < btnSelectors.length; i++) {
    const sel = btnSelectors[i];
    try {
      const loc = page.locator(sel).first();
      if (!(await loc.isVisible({ timeout: 500 }).catch(() => false))) continue;
      await loc.scrollIntoViewIfNeeded({ timeout: 2000 }).catch(() => {});

      const before = await loc.evaluate(readStyles, STYLE_PROPS);
      await page.mouse.move(0, 0);
      await loc.hover({ timeout: 3000 });
      await page.waitForTimeout(450); // que corra la transición
      const after = await loc.evaluate(readStyles, STYLE_PROPS);
      const diff = styleDiff(before, after);

      const shot = await capture(page, dir, `hover-boton-${i + 1}.png`, loc);
      if (shot) out.shots[`hover-boton-${i + 1}`] = { path: shot, label: `Botón ${i + 1} en hover` };
      out.hover.push({
        target: sel,
        text: (await loc.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 40),
        changes: diff,
        changed: diff.length > 0,
      });
      await page.mouse.move(0, 0);
    } catch (e) {
      /* botón tapado o removido del DOM */
    }
  }
  if (out.hover.length) log(`hover medido en ${out.hover.length} botón(es): ${out.hover.filter((h) => h.changed).length} con cambio visible`);

  /* ---- 2. foco de teclado ---- */
  try {
    const loc = page.locator('[data-shot="btn-1"]').first();
    if (await loc.isVisible({ timeout: 500 }).catch(() => false)) {
      const before = await loc.evaluate(readStyles, STYLE_PROPS);
      await loc.focus({ timeout: 2000 });
      await page.waitForTimeout(250);
      const after = await loc.evaluate(readStyles, STYLE_PROPS);
      const diff = styleDiff(before, after);
      const shot = await capture(page, dir, 'foco-teclado.png', loc);
      if (shot) out.shots['foco-teclado'] = { path: shot, label: 'Foco de teclado en el botón principal' };
      out.focus = {
        changes: diff,
        visible: diff.length > 0,
        outline: after.outlineStyle === 'none' || after.outlineWidth === '0px' ? 'sin outline' : `${after.outlineWidth} ${after.outlineStyle} ${after.outlineColor}`,
      };
      log(`foco de teclado: ${out.focus.visible ? 'visible' : 'SIN indicación visible'}`);
      await page.evaluate(() => document.activeElement && document.activeElement.blur()).catch(() => {});
    }
  } catch (e) {}

  /* ---- 3. menú desplegado ---- */
  /**
   * No buscamos nombres de clase: marcamos los paneles candidatos (elementos con
   * varios links dentro), anotamos cuáles se ven, pasamos el mouse por cada ítem
   * del nav y detectamos qué panel apareció. Funciona con menús a medida.
   */
  const markPanels = () =>
    page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('div, ul, nav, section')).filter((el) => el.querySelectorAll('a[href]').length >= 3);
      panels.slice(0, 400).forEach((el, i) => el.setAttribute('data-mx', String(i)));
      const visible = (el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5 && r.width > 150 && r.height > 100;
      };
      return Array.from(document.querySelectorAll('[data-mx]'))
        .filter(visible)
        .map((el) => el.getAttribute('data-mx'));
    });

  const panelInfo = (ids) =>
    page.evaluate((known) => {
      const el = Array.from(document.querySelectorAll('[data-mx]')).find((x) => known.includes(x.getAttribute('data-mx')));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        area: Math.round(r.width * r.height),
        links: el.querySelectorAll('a[href]').length,
        columns: cs.display === 'grid' ? (cs.gridTemplateColumns || '').split(/\s+/).filter(Boolean).length : el.children.length,
        background: cs.backgroundColor,
        boxShadow: cs.boxShadow === 'none' ? null : cs.boxShadow,
        fullWidth: r.width > window.innerWidth * 0.7,
        items: Array.from(el.querySelectorAll('a[href]')).slice(0, 14).map((a) => (a.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 32)).filter(Boolean),
      };
    }, ids);

  out.megaMenu = await guarded('menú', async () => {
    const baseline = await markPanels();
    const triggers = page.locator('header nav a, header nav button, nav > ul > li > a, nav > ul > li > button, header [class*="categor" i], header [aria-haspopup], header [aria-expanded]');
    const n = Math.min(await triggers.count().catch(() => 0), 10);
    let best = null;

    for (let i = 0; i < n; i++) {
      const item = triggers.nth(i);
      if (!(await item.isVisible({ timeout: 300 }).catch(() => false))) continue;
      const label = (await item.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      if (/sucursal|idioma|language|moneda|pa[íi]s|provincia|localidad/i.test(label)) continue;

      try {
        await item.hover({ timeout: 2000 });
      } catch (e) {
        continue;
      }
      await page.waitForTimeout(650);
      let after = await markPanels();
      let nuevos = after.filter((id) => !baseline.includes(id));

      if (!nuevos.length) {
        // algunos menús abren con clic
        await item.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(650);
        if (page.url() !== startUrl) {
          await page.goBack({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});
          await page.waitForTimeout(500);
          continue;
        }
        after = await markPanels();
        nuevos = after.filter((id) => !baseline.includes(id));
      }

      if (nuevos.length) {
        const info = await panelInfo(nuevos);
        if (info && info.links >= 3 && (!best || info.links > best.links)) {
          info.trigger = label.slice(0, 40);
          info.openedBy = 'hover o clic sobre el ítem del nav';
          const shot = await capture(page, dir, 'menu-desplegado.png');
          if (shot) out.shots['menu-desplegado'] = { path: shot, label: 'Menú desplegado' };
          best = info;
        }
      }

      await page.keyboard.press('Escape').catch(() => {});
      await page.mouse.move(0, 0);
      await page.waitForTimeout(200);
      if (best && best.links > 20) break;
    }

    if (best) log(`menú desplegado: ${best.size}, ${best.links} links${best.fullWidth ? ', ancho completo (mega menú)' : ''} (disparador: ${best.trigger})`);
    else log('menú: ningún ítem del nav despliega un panel');
    return best;
  });

  /* ---- 4. panel de filtros ---- */
  out.filters = await guarded('filtros', async () => {
    const trigger = page
      .locator('button:has-text("Filtr"), [class*="filter" i] button, [class*="filtro" i] button, button[class*="filter" i], [aria-label*="filtr" i]')
      .first();
    if (!(await trigger.isVisible({ timeout: 600 }).catch(() => false))) {
      // en desktop los filtros suelen estar siempre visibles en una barra lateral
      const panel = page.locator('[class*="filter" i], [class*="filtro" i], aside').first();
      if (!(await panel.isVisible({ timeout: 600 }).catch(() => false))) return null;
      const info = await panel.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          alwaysVisible: true,
          size: `${Math.round(r.width)}x${Math.round(r.height)}`,
          checkboxes: el.querySelectorAll('input[type="checkbox"]').length,
          radios: el.querySelectorAll('input[type="radio"]').length,
          ranges: el.querySelectorAll('input[type="range"], [class*="slider" i]').length,
          groups: Array.from(el.querySelectorAll('h2, h3, h4, [class*="title" i], legend')).slice(0, 10).map((h) => (h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)).filter(Boolean),
        };
      });
      const shot = await capture(page, dir, 'filtros.png', panel);
      if (shot) out.shots['filtros'] = { path: shot, label: 'Panel de filtros' };
      return info;
    }
    await trigger.click({ timeout: 2500 });
    await page.waitForTimeout(800);
    const info = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('[class*="filter" i], [class*="filtro" i], aside, [role="dialog"]'));
      const vis = panels.filter((p) => {
        const cs = getComputedStyle(p);
        const r = p.getBoundingClientRect();
        return cs.display !== 'none' && r.width > 150 && r.height > 150;
      });
      if (!vis.length) return null;
      const el = vis[0];
      const r = el.getBoundingClientRect();
      return {
        openedByClick: true,
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        checkboxes: el.querySelectorAll('input[type="checkbox"]').length,
        radios: el.querySelectorAll('input[type="radio"]').length,
        ranges: el.querySelectorAll('input[type="range"], [class*="slider" i]').length,
        groups: Array.from(el.querySelectorAll('h2, h3, h4, [class*="title" i], legend')).slice(0, 10).map((h) => (h.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 30)).filter(Boolean),
      };
    });
    if (info) {
      const shot = await capture(page, dir, 'filtros.png');
      if (shot) out.shots['filtros'] = { path: shot, label: 'Panel de filtros abierto' };
      log(`filtros: ${info.checkboxes} checkboxes, ${info.groups.length} grupo(s)`);
      await page.keyboard.press('Escape').catch(() => {});
    }
    return info;
  });

  /* ---- 5. minicart (abrir, nunca comprar) ---- */
  out.cart = await guarded('carrito', async () => {
    const trigger = page
      .locator('[class*="minicart" i], [class*="cart" i] button, button[class*="cart" i], [class*="carrito" i] button, [aria-label*="carrito" i], [aria-label*="cart" i]')
      .first();
    if (!(await trigger.isVisible({ timeout: 600 }).catch(() => false))) return null;
    await trigger.click({ timeout: 2500 });
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => {
      const panels = Array.from(document.querySelectorAll('[class*="minicart" i], [class*="cart" i], [role="dialog"], [class*="drawer" i]'));
      const vis = panels.filter((p) => {
        const cs = getComputedStyle(p);
        const r = p.getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.5 && r.width > 200 && r.height > 200;
      });
      if (!vis.length) return null;
      const el = vis[0];
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const text = (el.innerText || '').replace(/\s+/g, ' ').trim();
      return {
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        position: cs.position,
        side: r.left > window.innerWidth / 2 ? 'derecha' : 'izquierda',
        isDrawer: r.height > window.innerHeight * 0.7,
        empty: /vac[ií]o|sin productos|no hay productos/i.test(text),
        text: text.slice(0, 120),
      };
    });
    if (info) {
      const shot = await capture(page, dir, 'carrito.png');
      if (shot) out.shots['carrito'] = { path: shot, label: 'Carrito / minicart abierto' };
      log(`carrito: ${info.size}, ${info.isDrawer ? 'drawer lateral' : 'popover'}${info.empty ? ', vacío' : ''}`);
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(300);
    }
    return info;
  });

  /* ---- 6. sugerencias del buscador (escribir, sin enviar) ---- */
  out.searchSuggestions = await guarded('buscador', async () => {
    const input = page.locator('input[type="search"], input[placeholder*="busc" i], [role="search"] input, input[name*="search" i]').first();
    if (!(await input.isVisible({ timeout: 600 }).catch(() => false))) return null;
    await input.click({ timeout: 2500 });
    await input.type('aceite', { delay: 90 });
    await page.waitForTimeout(1600); // que responda el autocompletado
    const info = await page.evaluate(() => {
      const lists = Array.from(document.querySelectorAll('[class*="autocomplete" i], [class*="suggest" i], [class*="result" i], [role="listbox"], [class*="typeahead" i], [class*="search" i] ul'));
      const vis = lists.filter((p) => {
        const cs = getComputedStyle(p);
        const r = p.getBoundingClientRect();
        return cs.display !== 'none' && parseFloat(cs.opacity) > 0.5 && r.height > 40 && r.width > 120;
      });
      if (!vis.length) return { hasSuggestions: false };
      const el = vis[0];
      const r = el.getBoundingClientRect();
      return {
        hasSuggestions: true,
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        items: el.querySelectorAll('li, a, [class*="item" i]').length,
        showsImages: el.querySelectorAll('img').length > 0,
        showsPrices: /\$/.test((el.innerText || '')),
        sample: Array.from(el.querySelectorAll('li, a')).slice(0, 8).map((x) => (x.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 40)).filter(Boolean),
      };
    });
    if (info && info.hasSuggestions) {
      const shot = await capture(page, dir, 'buscador-sugerencias.png');
      if (shot) out.shots['buscador-sugerencias'] = { path: shot, label: 'Sugerencias del buscador' };
      log(`buscador: ${info.items} sugerencia(s)${info.showsImages ? ' con imágenes' : ''}${info.showsPrices ? ' y precios' : ''}`);
    } else {
      log('buscador: sin autocompletado detectado');
    }
    // limpiamos el input y salimos sin enviar el formulario
    await input.fill('').catch(() => {});
    await page.keyboard.press('Escape').catch(() => {});
    return info;
  });

  /* volvemos al estado inicial si algo nos movió */
  if (page.url() !== startUrl) {
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 25000 }).catch(() => {});
  }

  return out;
}

module.exports = { captureInteractions };
