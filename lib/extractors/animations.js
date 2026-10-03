'use strict';

/** 9. Animaciones, transiciones y efectos. */
module.exports = function extractAnimations() {
  const A = window.__A;
  const els = A.allElements(10000);

  const transProp = A.counter(), transDur = A.counter(), transEase = A.counter(), transDelay = A.counter();
  const animName = A.counter(), animDur = A.counter(), animIter = A.counter();
  const transformCounter = A.counter(), willChange = A.counter(), filterCounter = A.counter();
  let withTransition = 0, withAnimation = 0, withTransform = 0, withWillChange = 0, withFilter = 0, withBackdrop = 0;
  const transitionSamples = [];
  const animationSamples = [];

  for (const el of els) {
    const cs = A.cs(el);
    if (!cs || cs.display === 'none') continue;

    const durs = (cs.transitionDuration || '').split(',').map((d) => parseFloat(d) || 0);
    if (cs.transitionProperty && cs.transitionProperty !== 'none' && durs.some((d) => d > 0)) {
      withTransition++;
      cs.transitionProperty.split(',').forEach((p) => transProp.add(p.trim()));
      transDur.add(cs.transitionDuration);
      transEase.add(cs.transitionTimingFunction.split(',')[0].trim());
      if (parseFloat(cs.transitionDelay) > 0) transDelay.add(cs.transitionDelay);
      if (transitionSamples.length < 12) {
        transitionSamples.push({
          element: A.ident(el),
          property: cs.transitionProperty.slice(0, 60),
          duration: cs.transitionDuration.slice(0, 40),
          easing: cs.transitionTimingFunction.split(',')[0].trim().slice(0, 40),
          delay: cs.transitionDelay.slice(0, 30),
        });
      }
    }

    if (cs.animationName && cs.animationName !== 'none') {
      withAnimation++;
      cs.animationName.split(',').forEach((n) => animName.add(n.trim()));
      animDur.add(cs.animationDuration);
      animIter.add(cs.animationIterationCount);
      if (animationSamples.length < 12) {
        animationSamples.push({
          element: A.ident(el),
          name: cs.animationName.slice(0, 50),
          duration: cs.animationDuration.slice(0, 30),
          iterations: cs.animationIterationCount,
          easing: cs.animationTimingFunction.split(',')[0].trim().slice(0, 30),
          direction: cs.animationDirection,
          playState: cs.animationPlayState,
        });
      }
    }

    if (cs.transform && cs.transform !== 'none') {
      withTransform++;
      transformCounter.add(cs.transform.slice(0, 60));
    }
    if (cs.willChange && cs.willChange !== 'auto') {
      withWillChange++;
      willChange.add(cs.willChange);
    }
    if (cs.filter && cs.filter !== 'none') {
      withFilter++;
      filterCounter.add(cs.filter.slice(0, 50));
    }
    if (cs.backdropFilter && cs.backdropFilter !== 'none') withBackdrop++;
  }

  /* ---- @keyframes desde CSSOM ---- */
  const keyframes = [];
  let reducedMotionSupport = false;
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (e) {
        continue;
      }
      if (!rules) continue;
      const walk = (list) => {
        for (const r of Array.from(list)) {
          if (r.type === 7 /* KEYFRAMES */) {
            if (keyframes.length < 60) keyframes.push(r.name);
          } else if (r.type === 4 /* MEDIA */) {
            if (/prefers-reduced-motion/i.test(r.conditionText || r.media.mediaText || '')) reducedMotionSupport = true;
            if (r.cssRules) walk(r.cssRules);
          } else if (r.type === 12 /* SUPPORTS */ && r.cssRules) {
            walk(r.cssRules);
          }
        }
      };
      walk(rules);
    }
  } catch (e) {}

  /* ---- animacion al scroll (librerias y patrones de clase) ---- */
  const scrollRevealHints = [];
  if (A.count('[data-aos]')) scrollRevealHints.push(`AOS: ${A.count('[data-aos]')} elementos`);
  if (A.count('[data-scroll], [data-scroll-section]')) scrollRevealHints.push('Locomotive/data-scroll');
  if (A.count('[data-sr], [data-sr-id]')) scrollRevealHints.push('ScrollReveal');
  if (A.count('[class*="wow" i]')) scrollRevealHints.push(`WOW.js: ${A.count('[class*="wow" i]')}`);
  const revealClasses = A.count('[class*="reveal" i], [class*="fade-in" i], [class*="fadein" i], [class*="animate" i], [class*="slide-up" i], [class*="in-view" i]');
  if (revealClasses) scrollRevealHints.push(`clases de reveal/animate: ${revealClasses}`);
  if (window.ScrollTrigger || (window.gsap && window.ScrollTrigger)) scrollRevealHints.push('GSAP ScrollTrigger');
  if (A.count('[style*="opacity: 0"], [style*="opacity:0"]')) scrollRevealHints.push(`${A.count('[style*="opacity: 0"], [style*="opacity:0"]')} elementos con opacity:0 inline (pre-reveal)`);

  /* ---- hover: comparacion de estilos declarados en :hover ---- */
  const hoverRules = A.counter();
  try {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules;
      try {
        rules = sheet.cssRules;
      } catch (e) {
        continue;
      }
      if (!rules) continue;
      for (const r of Array.from(rules)) {
        if (r.type === 1 && /:hover/.test(r.selectorText || '')) {
          const st = r.style;
          for (let i = 0; i < st.length; i++) hoverRules.add(st[i]);
        }
      }
    }
  } catch (e) {}

  return {
    elementsWithTransition: withTransition,
    elementsWithAnimation: withAnimation,
    elementsWithTransform: withTransform,
    elementsWithWillChange: withWillChange,
    elementsWithFilter: withFilter,
    elementsWithBackdropFilter: withBackdrop,
    transitionProperties: transProp.top(8),
    transitionDurations: transDur.top(6),
    transitionEasings: transEase.top(6),
    transitionDelays: transDelay.top(4),
    transitionSamples,
    animationNames: animName.top(10),
    animationDurations: animDur.top(6),
    animationIterations: animIter.top(4),
    animationSamples,
    keyframesDefined: Array.from(new Set(keyframes)).slice(0, 40),
    transforms: transformCounter.top(6),
    willChange: willChange.top(4),
    filters: filterCounter.top(5),
    hoverProperties: hoverRules.top(10),
    scrollRevealHints,
    prefersReducedMotionSupport: reducedMotionSupport,
  };
};
