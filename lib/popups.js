'use strict';

/**
 * Deteccion y cierre de popups / banners de cookies.
 * Prioriza cerrar o rechazar antes que aceptar.
 */

const DISMISS_SELECTORS = [
  // cerrar explicito
  '[aria-label*="cerrar" i]',
  '[aria-label*="close" i]',
  'button[title*="cerrar" i]',
  'button[title*="close" i]',
  '[class*="close" i][class*="modal" i]',
  '[class*="modal" i] [class*="close" i]',
  '[class*="popup" i] [class*="close" i]',
  '[class*="newsletter" i] [class*="close" i]',
  '[class*="subscription" i] [class*="close" i]',
  'dialog [class*="close" i]',
  '.mfp-close',
  '.fancybox-close',
  '.fancybox-close-small',
  '.swal2-close',
  '[id*="close" i][class*="btn" i]',
  // cookies: rechazar / minimo necesario
  'button:has-text("Rechazar todo")',
  'button:has-text("Rechazar")',
  'button:has-text("Solo necesarias")',
  'button:has-text("Reject all")',
  'button:has-text("Reject")',
  '#onetrust-reject-all-handler',
  '.cc-deny',
  '.cookie-reject',
  '[class*="cookie" i] [class*="reject" i]',
  // cookies: aceptar (ultimo recurso)
  'button:has-text("Aceptar todo")',
  'button:has-text("Aceptar")',
  'button:has-text("Entendido")',
  'button:has-text("De acuerdo")',
  'button:has-text("Accept")',
  '#onetrust-accept-btn-handler',
  '.cc-allow',
  '.cookie-accept',
  '[class*="cookie" i] button',
];

const OVERLAY_SELECTOR =
  'dialog[open], [role="dialog"], [role="alertdialog"], [class*="modal" i], [class*="popup" i], [class*="cookie" i], [class*="newsletter" i], [class*="consent" i], [class*="subscription" i], [class*="lightbox" i]';

function scanOverlays(sel) {
  const els = Array.from(document.querySelectorAll(sel));
  return els
    .filter((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      return (
        cs.display !== 'none' &&
        cs.visibility !== 'hidden' &&
        parseFloat(cs.opacity) > 0.1 &&
        r.width > 120 &&
        r.height > 60 &&
        r.top < window.innerHeight
      );
    })
    .map((e) => {
      const cs = getComputedStyle(e);
      const r = e.getBoundingClientRect();
      const cls = (e.className && e.className.toString ? e.className.toString() : '').replace(/\s+/g, ' ').trim();
      return {
        element: (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cls ? '.' + cls.split(' ').slice(0, 2).join('.') : '')).slice(0, 90),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        position: cs.position,
        zIndex: cs.zIndex,
        coversViewport: r.width > window.innerWidth * 0.6 && r.height > window.innerHeight * 0.4,
        kind: /cookie|consent|rgpd|gdpr/i.test(cls) ? 'cookies' : /newsletter|subscri|suscri/i.test(cls) ? 'newsletter' : /chat|whats/i.test(cls) ? 'chat' : 'modal',
        hasForm: !!e.querySelector('form, input'),
        text: (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 120),
      };
    });
}

async function dismissOverlays(page, log) {
  const dismissed = [];
  const detected = await page.evaluate(scanOverlays, OVERLAY_SELECTOR).catch(() => []);

  if (detected.length) {
    log(`overlay detectado (${detected.length}): ${detected.map((d) => `${d.kind}:${d.element}`).slice(0, 4).join(' | ')}`);
  }

  for (const sel of DISMISS_SELECTORS) {
    try {
      const loc = page.locator(sel).first();
      if (!(await loc.isVisible({ timeout: 300 }).catch(() => false))) continue;
      let label = '';
      try {
        label = (await loc.innerText({ timeout: 500 })).trim().slice(0, 40);
      } catch (e) {}
      await loc.click({ timeout: 2500, force: true });
      const entry = `${sel}${label ? ` ("${label}")` : ''}`;
      dismissed.push(entry);
      log(`click cerrar → ${entry}`);
      await page.waitForTimeout(500);
      const left = await page.evaluate(scanOverlays, OVERLAY_SELECTOR).catch(() => []);
      if (!left.filter((o) => o.coversViewport).length) break;
    } catch (e) {
      /* selector inexistente, tapado o no clickeable */
    }
  }

  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  } catch (e) {}

  // liberar scroll bloqueado por el overlay
  await page
    .evaluate(() => {
      document.documentElement.style.overflow = '';
      if (document.body) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.classList.remove('modal-open', 'no-scroll', 'overflow-hidden');
      }
    })
    .catch(() => {});

  const after = await page.evaluate(scanOverlays, OVERLAY_SELECTOR).catch(() => []);
  if (detected.length) log(`overlays visibles luego de cerrar: ${after.length}`);

  return { detected, dismissed, remaining: after, stillVisible: after.length };
}

module.exports = { dismissOverlays, DISMISS_SELECTORS, OVERLAY_SELECTOR };
