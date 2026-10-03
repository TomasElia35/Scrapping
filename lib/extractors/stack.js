'use strict';

/** 2. Stack tecnologico. Booleanos requeridos + extras detectados. */
module.exports = function extractStack() {
  const A = window.__A;
  const html = document.documentElement.outerHTML;
  const scripts = A.$('script[src]').map((s) => s.src);
  const sheets = A.$('link[rel="stylesheet"]').map((l) => l.href);
  const assets = scripts.concat(sheets).join(' ');

  const anyAttr = (re, cap) => {
    const els = A.allElements(cap || 2500);
    for (const el of els) {
      const attrs = el.attributes;
      if (!attrs) continue;
      for (let i = 0; i < attrs.length; i++) if (re.test(attrs[i].name)) return true;
    }
    return false;
  };
  const anyClass = (re) => {
    const els = document.querySelectorAll('[class]');
    for (let i = 0; i < els.length && i < 5000; i++) {
      if (re.test(A.cls(els[i]))) return true;
    }
    return false;
  };
  const reactRoot = () =>
    !!document.querySelector('[data-reactroot]') ||
    !!window.React ||
    !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ||
    /_reactRootContainer|__reactContainer|__reactFiber|__reactProps/.test(Object.keys(document.body || {}).join(' ')) ||
    Array.from(document.querySelectorAll('#root, #app, #__next, [id^="root"]')).some((el) =>
      Object.keys(el).some((k) => /^__react/.test(k))
    );

  const stack = {
    react: !!reactRoot() || !!window.__NEXT_DATA__ || /\/_next\/static/.test(assets),
    next: !!document.getElementById('__next') || !!window.__NEXT_DATA__ || /\/_next\//.test(html),
    vue:
      !!window.Vue ||
      !!window.__VUE__ ||
      !!document.querySelector('[data-v-app], [data-server-rendered]') ||
      anyAttr(/^data-v-[a-f0-9]{6,}$|^v-(if|for|bind|model|show|on)/),
    angular:
      !!window.ng ||
      !!window.getAllAngularRootElements ||
      !!document.querySelector('[ng-version], [ng-app], app-root, [_nghost], [_ngcontent]') ||
      /ng-version/.test(html),
    jquery: !!(window.jQuery || (window.$ && window.$.fn && window.$.fn.jquery)) || /jquery[.\-]/i.test(assets),
    tailwind:
      anyClass(/(^|\s)(flex|grid|hidden|block|absolute|relative)(\s|$)/) &&
      anyClass(
        /(^|\s)(text-(xs|sm|base|lg|xl|\dxl)|bg-(white|black|gray|slate|zinc|neutral|stone|red|blue|green)(-\d{2,3})?|[pm][xytblr]?-\d{1,2}|w-full|max-w-(xs|sm|md|lg|xl|\dxl|screen-\w+)|rounded(-(sm|md|lg|xl|full|\dxl))?|space-[xy]-\d|gap-\d|items-center|justify-(center|between)|leading-(tight|normal|relaxed))(\s|$)/
      ),
    bootstrap:
      /bootstrap(\.min)?\.(css|js)/i.test(assets) ||
      (anyClass(/(^|\s)(container(-fluid)?|row)(\s|$)/) &&
        anyClass(/(^|\s)(col(-(sm|md|lg|xl|xxl))?(-\d{1,2})?|navbar(-\w+)?|btn-(primary|secondary|outline-\w+)|d-(none|flex|block))(\s|$)/)),
    wordpress:
      /wp-content|wp-includes|wp-json/i.test(html) ||
      !!document.querySelector('meta[name="generator"][content*="WordPress" i]') ||
      anyClass(/(^|\s)(wp-|wpb_|elementor|has-\w+-color)/),
  };
  Object.keys(stack).forEach((k) => (stack[k] = !!stack[k]));

  /* ---- extras ---- */
  const probes = {
    'Nuxt': () => !!window.__NUXT__ || !!document.getElementById('__nuxt'),
    'Gatsby': () => !!window.___gatsby || !!document.getElementById('___gatsby'),
    'Astro': () => !!document.querySelector('astro-island, [astro-island]') || /astro/i.test(assets),
    'Svelte': () => !!window.__svelte || anyClass(/(^|\s)s-[a-zA-Z0-9]{6,}(\s|$)/),
    'Alpine.js': () => !!window.Alpine || anyAttr(/^x-(data|show|on|bind)/),
    'htmx': () => !!window.htmx || anyAttr(/^hx-/),
    'React Router': () => /react-router/i.test(assets),
    'Redux': () => !!window.__REDUX_DEVTOOLS_EXTENSION__,
    'Shopify': () => !!window.Shopify || /cdn\.shopify/i.test(assets),
    'VTEX': () => /vtex/i.test(assets) || /vtexassets/i.test(html),
    'Magento': () => !!window.Magento_ || /mage\/|static\/version/i.test(assets) || !!window.checkout,
    'WooCommerce': () => /woocommerce/i.test(html),
    'PrestaShop': () => !!window.prestashop,
    'Tiendanube': () => /tiendanube|nuvemshop/i.test(assets + html),
    'Elementor': () => anyClass(/(^|\s)elementor/),
    'WPBakery': () => anyClass(/(^|\s)(vc_|wpb_)/),
    'Divi': () => anyClass(/(^|\s)et_pb_/),
    'Swiper': () => !!window.Swiper || anyClass(/(^|\s)swiper/),
    'Slick': () => anyClass(/(^|\s)slick/),
    'Owl Carousel': () => anyClass(/(^|\s)owl-/),
    'Splide': () => anyClass(/(^|\s)splide/),
    'GSAP': () => !!window.gsap || !!window.TweenMax || /gsap/i.test(assets),
    'ScrollTrigger': () => !!(window.ScrollTrigger || (window.gsap && window.gsap.plugins && window.gsap.plugins.scrollTrigger)),
    'AOS': () => !!window.AOS || anyAttr(/^data-aos/),
    'Framer Motion': () => /framer-motion/i.test(assets) || anyAttr(/^data-framer/),
    'Lottie': () => !!window.lottie || A.count('lottie-player') > 0,
    'Font Awesome': () => /font-?awesome/i.test(assets) || anyClass(/(^|\s)(fa[srlbd]?|fa-)/),
    'Material Icons': () => anyClass(/material-icons/),
    'Google Fonts': () => /fonts\.(googleapis|gstatic)\.com/i.test(assets + html),
    'Google Tag Manager': () => !!window.google_tag_manager || /googletagmanager/i.test(html),
    'Google Analytics': () => !!window.gtag || !!window.ga || /google-analytics|gtag\/js/i.test(html),
    'Meta Pixel': () => !!window.fbq || /connect\.facebook\.net/i.test(html),
    'Hotjar': () => !!window.hj,
    'Clarity': () => !!window.clarity,
    'TikTok Pixel': () => !!window.ttq,
    'Cloudflare': () => /cdn-cgi\//i.test(html),
    'reCAPTCHA': () => !!window.grecaptcha || /recaptcha/i.test(html),
    'Intercom / chat': () => !!(window.Intercom || window.zE || window.Tawk_API || window.$crisp || window.HubSpotConversations),
    'Service Worker': () => !!(navigator.serviceWorker && navigator.serviceWorker.controller),
  };

  const extras = [];
  Object.keys(probes).forEach((k) => {
    let hit = false;
    try {
      hit = !!probes[k]();
    } catch (e) {}
    if (hit) extras.push(k);
  });

  return {
    stack,
    extras,
    scriptHosts: Array.from(new Set(scripts.map((s) => A.hostOf(s)).filter(Boolean))).slice(0, 25),
    inlineScripts: A.count('script:not([src])'),
    externalScripts: scripts.length,
    externalStylesheets: sheets.length,
    inlineStyleTags: A.count('style'),
  };
};
