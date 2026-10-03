'use strict';

/** 7. Inventario profundo de componentes: conteos + variantes por firma de estilo + detalle. */
module.exports = function extractComponents() {
  const A = window.__A;

  const SEL = {
    buttons: 'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"], a[class*="btn" i], a[class*="button" i]',
    links: 'a[href]',
    forms: 'form',
    inputs: 'input, textarea, select',
    images: 'img',
    picture: 'picture',
    svg: 'svg',
    videos: 'video',
    embeds: 'iframe, embed, object',
    modals: 'dialog, [role="dialog"], [role="alertdialog"], [class*="modal" i], [class*="popup" i], [class*="lightbox" i]',
    tables: 'table',
    carousels: '[class*="carousel" i], [class*="swiper" i], [class*="slider" i], [class*="slick" i], [class*="splide" i], [class*="glide" i], [class*="owl-carousel" i]',
    cards: '[class*="card" i], [class*="tile" i], article',
    lists: 'ul, ol',
    accordions: '[class*="accordion" i], details, [class*="collapse" i]',
    tabs: '[role="tablist"], [class*="tab" i][class*="nav" i], [class*="tabs" i]',
    breadcrumbs: '[class*="breadcrumb" i], [aria-label*="breadcrumb" i]',
    pagination: '[class*="pagination" i], [class*="pager" i], [aria-label*="pagination" i]',
    badges: '[class*="badge" i], [class*="tag" i], [class*="chip" i], [class*="label" i]',
    tooltips: '[class*="tooltip" i], [data-tooltip], [title]',
    icons: 'svg, i[class*="icon" i], i[class*="fa" i], span[class*="icon" i]',
    ratings: '[class*="rating" i], [class*="star" i], [class*="review" i]',
    prices: '[class*="price" i], [class*="precio" i], [itemprop="price"]',
    addToCart: '[class*="cart" i] button, button[class*="cart" i], [class*="comprar" i], [class*="add-to" i], [class*="agregar" i]',
    search: 'input[type="search"], [role="search"], [class*="search" i] input, [class*="buscar" i] input',
    newsletter: 'form[class*="newsletter" i], [class*="suscri" i] form, [class*="subscribe" i] form',
    social: 'a[href*="facebook.com"], a[href*="instagram.com"], a[href*="twitter.com"], a[href*="x.com"], a[href*="youtube.com"], a[href*="linkedin.com"], a[href*="tiktok.com"], a[href*="wa.me"], a[href*="whatsapp"]',
    skeletons: '[class*="skeleton" i], [class*="placeholder" i], [class*="shimmer" i]',
    banners: '[class*="banner" i], [class*="hero" i], [class*="slide" i]',
  };

  const counts = {};
  Object.keys(SEL).forEach((k) => (counts[k] = A.count(SEL[k])));
  counts.videosEmbeds = counts.videos + counts.embeds;

  /* ---- variantes de botones ---- */
  const btnProps = ['backgroundColor', 'color', 'borderRadius', 'padding', 'fontSize', 'fontWeight', 'borderTopWidth', 'borderTopColor', 'textTransform', 'boxShadow'];
  const buttonEls = A.$(SEL.buttons).filter((el) => A.visible(el));
  const buttonVariants = A.variants(buttonEls, btnProps, 10, (el) => A.text(el, 35) || el.getAttribute('aria-label') || el.value || A.ident(el), 'btn');

  /* ---- variantes de cards ---- */
  const cardProps = ['backgroundColor', 'borderRadius', 'boxShadow', 'padding', 'borderTopWidth', 'borderTopColor'];
  const cardEls = A.$(SEL.cards).filter((el) => {
    const r = A.rect(el);
    return A.visible(el) && r.w > 120 && r.h > 90;
  });
  const cardVariants = A.variants(
    cardEls,
    cardProps,
    8,
    (el) => {
      const h = el.querySelector('h1,h2,h3,h4,h5,strong,[class*="title" i]');
      return h ? A.text(h, 40) : A.text(el, 40);
    },
    'card'
  );

  /* ---- variantes de inputs ---- */
  const inputEls = A.$('input:not([type="hidden"]), textarea, select').filter((el) => A.visible(el));
  const inputVariants = A.variants(
    inputEls,
    ['backgroundColor', 'color', 'borderRadius', 'padding', 'fontSize', 'borderTopWidth', 'borderTopColor', 'height'],
    6,
    (el) => el.getAttribute('placeholder') || el.getAttribute('name') || el.type || A.ident(el),
    'input'
  );

  /* zonas clave marcadas para recortar: header, nav, footer, hero, primer form y primera card */
  const zoneShots = [];
  const markZone = (el, id, label) => {
    if (!el || !A.visible(el)) return;
    const r = A.rect(el);
    if (r.w < 40 || r.h < 24) return;
    if (A.tag(el, id)) zoneShots.push({ shotId: id, label, element: A.ident(el), size: `${r.w}x${r.h}` });
  };
  /* muchos sitios no usan <header>/<footer>: buscamos el equivalente por posición y contenido */
  const wide = (el, ratio) => A.rect(el).w > window.innerWidth * (ratio || 0.7);
  const bigBlocks = A.$('body > *, main > *, body > div > *').filter((el) => A.visible(el) && A.rect(el).h > 60 && wide(el, 0.6));
  const headerEl =
    document.querySelector('header, [role="banner"]') ||
    A.allElements(4000).filter((el) => {
      const cs = A.cs(el);
      return cs && (cs.position === 'fixed' || cs.position === 'sticky') && A.visible(el) && A.rect(el).top < 130 && wide(el, 0.8) && A.rect(el).h > 40 && A.rect(el).h < 320;
    })[0] ||
    bigBlocks[0];
  const footerEl2 =
    document.querySelector('footer') ||
    bigBlocks
      .slice()
      .reverse()
      .filter((el) => A.count('a[href]', el) > 5)[0];
  const heroEl = (document.querySelector('main') || document.body).firstElementChild && A.visible((document.querySelector('main') || document.body).firstElementChild)
    ? (document.querySelector('main') || document.body).firstElementChild
    : bigBlocks.filter((el) => A.rect(el).top < window.innerHeight * 1.2 && el !== headerEl)[0];

  markZone(headerEl, 'zone-header', 'Header');
  markZone(document.querySelector('header nav, nav'), 'zone-nav', 'Navegación');
  markZone(heroEl, 'zone-hero', 'Primera sección / hero');
  markZone(footerEl2, 'zone-footer', 'Footer');
  markZone(document.querySelector('form'), 'zone-form', 'Primer formulario');
  markZone(A.$(SEL.carousels).filter((el) => A.visible(el) && A.rect(el).w > 300)[0], 'zone-carousel', 'Carrusel');

  /* ---- links ---- */
  const host = location.hostname;
  const linkEls = A.$('a[href]');
  const linkHosts = A.counter();
  let internal = 0, external = 0, anchors = 0, tel = 0, mail = 0, nofollow = 0, blank = 0, empty = 0, js = 0;
  linkEls.forEach((a) => {
    const href = a.getAttribute('href') || '';
    if (/^#/.test(href)) anchors++;
    else if (/^tel:/i.test(href)) tel++;
    else if (/^mailto:/i.test(href)) mail++;
    else if (/^javascript:/i.test(href)) js++;
    else {
      const h = A.hostOf(href);
      if (!h || h === host) internal++;
      else {
        external++;
        linkHosts.add(h);
      }
    }
    if (/nofollow/i.test(a.getAttribute('rel') || '')) nofollow++;
    if (a.getAttribute('target') === '_blank') blank++;
    if (!A.text(a, 5) && !a.querySelector('img, svg') && !a.getAttribute('aria-label')) empty++;
  });

  /* ---- formularios en detalle ---- */
  const forms = A.$('form')
    .slice(0, 12)
    .map((f) => ({
      element: A.ident(f),
      action: (f.getAttribute('action') || '(mismo)').slice(0, 120),
      method: (f.getAttribute('method') || 'get').toUpperCase(),
      novalidate: f.hasAttribute('novalidate'),
      fields: A.$('input, textarea, select', f)
        .slice(0, 25)
        .map((i) => ({
          tag: i.tagName.toLowerCase(),
          type: (i.getAttribute('type') || (i.tagName === 'SELECT' ? 'select' : 'text')).toLowerCase(),
          name: i.getAttribute('name') || i.id || null,
          placeholder: i.getAttribute('placeholder') || null,
          required: i.hasAttribute('required') || i.getAttribute('aria-required') === 'true',
          autocomplete: i.getAttribute('autocomplete') || null,
          pattern: i.getAttribute('pattern') || null,
        })),
      submit: (() => {
        const s = f.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
        return s ? A.text(s, 40) || s.value || '(sin texto)' : null;
      })(),
    }));

  /* ---- imagenes en detalle ---- */
  const imgs = A.$('img');
  const imageFormats = A.counter();
  const imageDetail = [];
  let lazy = 0, eager = 0, noLoading = 0, withSrcset = 0, oversized = 0, missingDims = 0, decorative = 0;
  imgs.forEach((img) => {
    const src = img.currentSrc || img.src || '';
    const ext = (src.split('?')[0].match(/\.(\w{2,5})$/) || [, 'sin-extensión'])[1].toLowerCase();
    imageFormats.add(ext);
    const loading = img.getAttribute('loading');
    if (loading === 'lazy') lazy++;
    else if (loading === 'eager') eager++;
    else noLoading++;
    if (img.getAttribute('srcset') || img.closest('picture')) withSrcset++;
    if (!img.getAttribute('width') || !img.getAttribute('height')) missingDims++;
    if (img.getAttribute('alt') === '') decorative++;
    const r = A.rect(img);
    const natural = { w: img.naturalWidth || 0, h: img.naturalHeight || 0 };
    const over = natural.w && r.w && natural.w > r.w * 2 && r.w > 0;
    if (over) oversized++;
    if (imageDetail.length < 20) {
      imageDetail.push({
        src: src.slice(-90),
        host: A.hostOf(src),
        displayed: `${r.w}x${r.h}`,
        natural: `${natural.w}x${natural.h}`,
        oversized: !!over,
        loading: loading || '(default)',
        srcset: !!img.getAttribute('srcset'),
        alt: img.getAttribute('alt') === null ? '(falta)' : img.getAttribute('alt') === '' ? '(vacío/decorativa)' : A.text(img, 0) || img.getAttribute('alt').slice(0, 40),
        objectFit: (A.cs(img) || {}).objectFit,
        radius: (A.cs(img) || {}).borderRadius,
      });
    }
  });

  /* ---- carruseles ---- */
  const carousels = A.$(SEL.carousels)
    .filter((el) => A.visible(el) && A.rect(el).w > 200)
    .slice(0, 8)
    .map((el) => {
      const cls = A.cls(el);
      const lib = /swiper/i.test(cls) ? 'Swiper' : /slick/i.test(cls) ? 'Slick' : /owl/i.test(cls) ? 'Owl' : /splide/i.test(cls) ? 'Splide' : /glide/i.test(cls) ? 'Glide' : 'custom/desconocido';
      const slides = A.count('[class*="slide" i], [class*="item" i], li', el);
      return {
        element: A.ident(el),
        lib,
        slides,
        size: `${A.rect(el).w}x${A.rect(el).h}`,
        hasArrows: A.count('[class*="next" i], [class*="prev" i], [class*="arrow" i]', el) > 0,
        hasDots: A.count('[class*="dot" i], [class*="bullet" i], [class*="pagination" i]', el) > 0,
        autoplayHint: /autoplay/i.test(el.outerHTML.slice(0, 2000)),
      };
    });

  /* ---- tablas ---- */
  const tables = A.$('table')
    .slice(0, 8)
    .map((t) => ({
      element: A.ident(t),
      rows: A.count('tr', t),
      cols: (() => {
        const tr = t.querySelector('tr');
        return tr ? tr.children.length : 0;
      })(),
      hasThead: !!t.querySelector('thead'),
      headerCells: A.count('th', t),
      caption: t.querySelector('caption') ? A.text(t.querySelector('caption'), 50) : null,
      responsiveWrapper: !!t.closest('[class*="table-responsive" i], [style*="overflow"]'),
    }));

  /* ---- navegacion: arbol del menu principal ---- */
  const navEl = document.querySelector('header nav, nav[class*="main" i], nav[class*="primary" i], nav') || null;
  let navigation = null;
  if (navEl) {
    const topItems = Array.from(navEl.querySelectorAll(':scope > ul > li, :scope > div > ul > li, :scope > ul > li'))
      .slice(0, 20)
      .map((li) => {
        const a = li.querySelector('a');
        const sub = li.querySelector('ul, [class*="submenu" i], [class*="dropdown" i]');
        return {
          label: a ? A.text(a, 40) : A.text(li, 40),
          href: a ? (a.getAttribute('href') || '').slice(0, 80) : null,
          submenuItems: sub ? A.count('a', sub) : 0,
          hasMegaMenu: sub ? A.rect(sub).w > window.innerWidth * 0.6 : false,
        };
      });
    navigation = {
      element: A.ident(navEl),
      totalLinks: A.count('a[href]', navEl),
      topLevelItems: topItems.length,
      items: topItems,
      sticky: (A.cs(navEl.closest('header') || navEl) || {}).position,
      hasBurger: A.count('[class*="burger" i], [class*="hamburger" i], [class*="menu-toggle" i], [aria-label*="menú" i], [aria-label*="menu" i]') > 0,
      hasSearch: A.count('input[type="search"], [class*="search" i]', navEl) > 0,
    };
  }

  /* ---- footer ---- */
  const footerEl = document.querySelector('footer');
  const footer = footerEl
    ? {
        columns: (() => {
          const cs = A.cs(footerEl);
          if (cs && cs.display === 'grid') return (cs.gridTemplateColumns || '').split(/\s+/).filter(Boolean).length;
          const inner = footerEl.querySelector('[class*="row" i], [class*="grid" i], [class*="container" i]') || footerEl;
          return Array.from(inner.children).filter((c) => A.visible(c)).length;
        })(),
        links: A.count('a[href]', footerEl),
        headings: A.count('h1,h2,h3,h4,h5,h6,strong', footerEl),
        socialLinks: A.count(SEL.social, footerEl),
        height: A.rect(footerEl).h,
        background: A.hex((A.cs(footerEl) || {}).backgroundColor),
        hasNewsletter: A.count('form', footerEl) > 0,
        paymentIcons: A.count('img[alt*="visa" i], img[alt*="master" i], img[src*="pago" i], [class*="payment" i] img', footerEl),
      }
    : null;

  /* ---- iframes / embeds ---- */
  const embeds = A.$('iframe, video, embed, object')
    .slice(0, 12)
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      host: A.hostOf(el.getAttribute('src') || el.currentSrc || ''),
      size: `${A.rect(el).w}x${A.rect(el).h}`,
      title: el.getAttribute('title') || null,
      lazy: el.getAttribute('loading') === 'lazy',
      autoplay: el.hasAttribute('autoplay') || /autoplay=1/.test(el.getAttribute('src') || ''),
      muted: el.hasAttribute('muted'),
      controls: el.hasAttribute('controls'),
    }));

  return {
    counts: {
      buttons: counts.buttons,
      links: counts.links,
      forms: counts.forms,
      inputs: counts.inputs,
      images: counts.images + counts.picture,
      svg: counts.svg,
      videosEmbeds: counts.videosEmbeds,
      modals: counts.modals,
      tables: counts.tables,
      carousels: counts.carousels,
      cards: counts.cards,
      lists: counts.lists,
      accordions: counts.accordions,
      tabs: counts.tabs,
      breadcrumbs: counts.breadcrumbs,
      pagination: counts.pagination,
      badges: counts.badges,
      icons: counts.icons,
      ratings: counts.ratings,
      prices: counts.prices,
      addToCart: counts.addToCart,
      search: counts.search,
      newsletter: counts.newsletter,
      social: counts.social,
      skeletons: counts.skeletons,
      banners: counts.banners,
    },
    buttonVariants,
    cardVariants,
    inputVariants,
    zoneShots,
    links: { total: linkEls.length, internal, external, anchors, tel, mail, javascript: js, nofollow, targetBlank: blank, withoutText: empty, topExternalHosts: linkHosts.top(10) },
    forms,
    images: {
      total: imgs.length,
      formats: imageFormats.top(8),
      lazy,
      eager,
      withoutLoadingAttr: noLoading,
      withSrcset,
      oversized,
      missingDimensions: missingDims,
      decorative,
      detail: imageDetail,
    },
    carousels,
    tables,
    navigation,
    footer,
    embeds,
  };
};
