# Prompt de construcción — authogar.com

_Generado a partir del análisis automatizado de https://www.authogar.com/ el 2026-08-17T18:21:20.265Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **authogar.com**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Authogar — Authogar

## 2. Stack y decisiones técnicas

Detectado en el original: react, tailwind · VTEX, Google Tag Manager, Google Analytics, Meta Pixel, Clarity, reCAPTCHA, Service Worker

- El original usa React sin framework de SSR: usar **Next.js (App Router)** para ganar SSR/SSG y mejor LCP.
- Estilos: el original ya usa Tailwind. Mantener **Tailwind CSS** con los tokens de este documento cargados en `tailwind.config`.
- Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.
- Home extensa y con muchas tarjetas: paginar o virtualizar listados largos y usar `next/image` con `sizes` correctos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#ffffff` | 99 elementos |
| surface-2 | `#d9e1f2` | 65 elementos |
| surface-3 | `#f9f6f4` | 54 elementos |
| surface-4 | `#00249c (0.80)` | 36 elementos |
| surface-5 | `#d6fc52` | 24 elementos |
| text-1 (texto base) | `#000000` | 1899 elementos |
| text-2 | `#0000ee` | 257 elementos |
| text-3 | `#00249c` | 254 elementos |
| text-4 | `#4e4e4e` | 178 elementos |
| border-1 | `#bababa` | 65 elementos |
| border-2 | `#e0e0e0` | 36 elementos |

Gradientes en uso: `linear-gradient(90deg, rgb(224, 224, 224), rgb(224, 224, 224) 50%, rgb(232, 232, 232) 60%, rgb(224, 224, 224) 65%, rgb(2`

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: NotoSans, sans-serif, Agrandir, "Noto Sans", sans-serif
- Escala de tamaños en uso: 11px · 12px · 14px · 16px · 22px · 24px · 32px
- Pesos: 400, 700, 600, 500
- Line-heights: 18.4px, normal, 16px, 11px
- Letter-spacing: 0.64px, 0.15px, 0.13px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 16px | 400 | 18.4px |
| h2 | 32px | 700 | normal |
| h3 | 16px | 700 | 18.4px |
| p | 14px | 400 | 21px |
| button | 16px | 400 | 18.4px |

Fuentes propias declaradas: NotoSans (400, font-display: (no declarado)) · NotoSans (500, font-display: (no declarado)) · Agrandir (200, font-display: (no declarado)) · Agrandir (400, font-display: (no declarado)). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 6 familias, 8 tamaños, 4 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 4px · 6px · 10px · 12px · 20px (el original usa 16 valores distintos: **reducir a 3-4**)
- Gaps de grilla/flex: 2px · 4px · 12px · 16px · 24px · 40px
- Paddings más usados: 0px 2px, 1px 2px, 22px 15px, 8px 0px 0px, 0px 4px
- Sombras: `rgba(0, 0, 0, 0.15) 0px 0px 2px 0px` · `rgb(128, 128, 128) 0px 0px 5px 0px` · `rgba(0, 0, 0, 0.11) 0px 3px 6px 0px`
- Ancho de contenedor: 1296px, 1536px · padding lateral: 0px / 0px, 15px / 15px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.vtex-sticky-layout-0-x-container.vtex-sticky-layout-0-x-container--sticky-header.z-999 | — | 137px (0.15 vh) | block | 3 img, 12 links, 3 btn, 4 items |
| 2 | img.vtex-store-components-3-x-imageElement.vtex-store-components-3-x-imageElement--wssp-fi | — | 57px (0.06 vh) | inline | — |
| 3 | div.vtex-slider-layout-0-x-sliderTrack.vtex-slider-layout-0-x-sliderTrack--hero.flex | — | 280px (0.31 vh) | flex, 9 col | 2 img, 2 links |
| 4 | div.authogar-components-0-x-wrapperCategorySliderDesktop | Hogar y Tecnología: | 235px (0.26 vh) | flex, 2 col | 18 img, 18 links, 2 btn |
| 5 | div.vtex-slider-layout-0-x-sliderTrack.vtex-slider-layout-0-x-sliderTrack--home-brands.fle | — | 67px (0.07 vh) | flex, 29 col | 11 img, 11 links |
| 6 | div.authogar-components-0-x-wrapperCategorySliderDesktop | Deporte y Moda: | 235px (0.26 vh) | flex, 2 col | 18 img, 18 links, 2 btn |
| 7 | div.vtex-slider-layout-0-x-sliderTrack.vtex-slider-layout-0-x-sliderTrack--home-brands.fle | — | 67px (0.07 vh) | flex, 27 col | 11 img, 11 links |
| 8 | div.flex.mt0.mb0 | PS5 PlayStation 5 Slim + Astro Bot y Gran Turismo 7 Digital | 640px (0.71 vh) | flex, 2 col | 25 img, 5 links, 2 btn, 65 items |
| 9 | div.flex.mt0.mb0 | — | 160px (0.18 vh) | flex, 3 col | 3 img, 3 links |
| 10 | div.flex.mt0.mb0 | Tablet TCL TAB A1 Plus 12.2" 128GB 6GB Space Blue + Teclado | 639px (0.71 vh) | flex, 2 col | 28 img, 5 links, 2 btn, 80 items |
| 11 | div.flex.mt0.mb0 | — | 365px (0.41 vh) | flex, 2 col | 3 img, 6 links |
| 12 | div.flex.mt0.mb0 | Zapatillas Nike Vomero 18 Ver. Hombre | 612px (0.68 vh) | flex, 2 col | 24 img, 5 links, 2 btn, 80 items |
| 13 | div.flex.mt0.mb0 | — | 365px (0.41 vh) | flex, 2 col | 3 img, 8 links |
| 14 | div.flex.mt0.mb0 | Zapatillas Vans U Knu Skool Cel. Hombre | 612px (0.68 vh) | flex, 2 col | 24 img, 5 links, 2 btn, 80 items |
| 15 | section#slider-items-4pudh1k.w-100.flex.items-center | — | 120px (0.13 vh) | flex, 3 col | 2 img, 2 links, 2 btn |
| 16 | div.flex.mt0.mb0 | Rack Para Colgar Tables 1,80M Tono Olmo Finlandes/Everest 1407-Coe | 641px (0.71 vh) | flex, 2 col | 26 img, 5 links, 2 btn, 80 items |
| 17 | div.flex.mt0.mb0 | Termotanque Coppens 120L Multigas De Pie | 639px (0.71 vh) | flex, 2 col | 24 img, 5 links, 2 btn, 62 items |
| 18 | div.flex.mt0.mb0 | — | 223px (0.25 vh) | flex, 1 col | 2 img, 2 links |
| 19 | div | — | 267px (0.3 vh) | block | 10 img, 21 links, 1 btn |
| 20 | div.authogar-minicart-0-x-drawer.authogar-minicart-0-x-closed.right-0 | — | 900px (1 vh) | flex, 1 col | 1 btn |

Alto total del home: 6610px (7.3 viewports). 20 bloques de primer nivel.

**Navegación principal**

- 4 ítems de primer nivel, 4 links en total, header `position: static`.
  - Revista Authogar
  - Deporte y Moda
  - Zapatillas
  - Promo 12 Sin Interés

**Capas fijas**: otro (sticky, z-index 1000) · otro (fixed, z-index 9999) · otro (fixed, z-index 999). Definir una escala de z-index documentada.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| carousels | 548 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| cards | 447 | componente `Card` con variantes |
| prices | 284 | formateo de moneda centralizado (Intl.NumberFormat es-AR) |
| images | 238 | componente de imagen optimizada (AVIF/WebP + sizes) |
| links | 145 | links internos con el router, externos con `rel="noopener"` |
| buttons | 32 | un solo componente `Button` con variantes |
| svg | 26 | sprite o componentes de ícono, no SVG inline duplicado |
| badges | 23 | componente `Badge` con variantes semánticas |
| pagination | 8 | links reales navegables, no solo JS |
| inputs | 4 | componente `Input` con label obligatorio |
| addToCart | 3 | estado optimista + feedback accesible al agregar |
| videosEmbeds | 2 | carga diferida con póster; no autoplay con sonido |
| forms | 1 | validación accesible con mensajes asociados al campo |
| modals | 1 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| search | 1 | input tipo search con `role="search"` y resultados accesibles |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 14 | `rgb(249, 246, 244)` | `rgb(0, 0, 0)` | 10px | 5px | 16px | 400 |
| secondary | 6 | `rgb(221, 214, 208)` | `rgb(0, 0, 0)` | 100% | 4px | 16px | 400 |
| ghost | 4 | `rgba(0, 0, 0, 0)` | `rgb(0, 0, 0)` | 0px | 0px | 16px | 400 |
| alt-2 | 4 | `rgb(249, 246, 244)` | `rgb(0, 0, 0)` | 8px | 11px | 16px | 400 |
| alt-3 | 1 | `rgba(0, 0, 0, 0)` | `rgb(0, 36, 156)` | 4px | 0px | 16px | 500 |
| alt-4 | 1 | `rgba(0, 0, 0, 0)` | `rgb(15, 62, 153)` | 4px | 0px | 0px | 500 |

El original tiene 8+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Variantes de card**

| Variante | Usos | Fondo | Radio | Sombra | Padding | Tamaño típico |
| --- | --- | --- | --- | --- | --- | --- |
| card-1 | 24 | `rgba(0, 0, 0, 0)` | 0px | sin sombra | 16px 5px | 311x524 |

**Formularios del original**

- Form 1 — GET → `(mismo)`, submit "—": account (text), credential (text)

**Carruseles**: 8 en el home (custom/desconocido), con 39/38/36/23/22/1/0/3 slides. 

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 300, 320, 370, 400, 481, 500, 600, 640, 650, 680, 700, 720, 768, 784, 800, 850, 940, 1024, 1025, 1100, 1130, 1156, 1200, 1260, 1280, 1296, 1300, 1328, 1366, 1400, 1540
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1024px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1296px, centrado, con padding lateral 0px / 0px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | 12 | 0 | 137 | 24px |
| 390px | 12 | 0 | 137 | 24px |
| 768px | 2 | 0 | 137 | 24px |
| 1024px | 2 | 0 | 137 | 24px |
| 1280px | 12 | 4 | 137 | 32px |
| 1440px | 8 | 4 | 137 | 32px |
| 1920px | 8 | 4 | 137 | 32px |

- De 390px a 768px: cards por fila 12 → 2; alto de página 6.8 → 5.8 viewports
- De 1024px a 1280px: cards por fila 2 → 12; links de nav visibles 0 → 4; h1 24px → 32px
- De 1280px a 1440px: cards por fila 12 → 8

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.3s, 0.25s, 0.25s, 0.4s · easings: ease-out, ease
- Propiedades animadas: all, transform, -webkit-transform, opacity, right
- En `:hover` cambian: background-color, color, border-left-color, border-bottom-color, border-right-color
- 57 elementos con transición y 1 con animación; 30 `@keyframes` declarados.
- Animación al hacer scroll en el original: 1 elementos con opacity:0 inline (pre-reveal). Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 5780 caracteres de texto visible, 238 imágenes y 145 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: WebSite, ItemList).
- Idioma: `lang="es-AR"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Accesibilidad: el original tiene 5 de 239 imágenes sin `alt`. En la nueva app, `alt` es obligatorio (vacío solo si es decorativa).
2. Formularios: 3 de 4 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
3. 6 botones sin nombre accesible. Todo botón de solo ícono lleva `aria-label`.
4. Jerarquía de encabezados con saltos (el primer heading es h2, no h1). Respetar h1 → h2 → h3 sin saltear niveles.
5. El original tiene 0 `h1`. Usar exactamente uno por página.
6. 182 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
7. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
8. Contraste: 3 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
9. 1 iframes sin `title`.
10. Rendimiento: 235 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
11. 82 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
12. 141 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
13. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
14. El original hace 673 requests (7863 KB) desde 19 dominios de terceros. Reducir terceros y agrupar assets propios.
15. DOM de 3080 nodos y 29 niveles de profundidad. Apuntar a menos de 1500 nodos por vista y estructura más plana.
16. Táctil: 78 de 146 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
17. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
18. El original arroja 20 errores de consola en el home. La nueva app debe cargar sin errores.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/authogar.com/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/authogar.com/00-home/05-componentes/zone-footer.png)
[Header](../../shots/authogar.com/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/authogar.com/00-home/05-componentes/zone-hero.png)
[Navegación](../../shots/authogar.com/00-home/05-componentes/zone-nav.png)
[Botón variante 1](../../shots/authogar.com/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/authogar.com/00-home/05-componentes/boton-02.png)
[Botón variante 3](../../shots/authogar.com/00-home/05-componentes/boton-03.png)
[Botón variante 4](../../shots/authogar.com/00-home/05-componentes/boton-04.png)
[Botón variante 5](../../shots/authogar.com/00-home/05-componentes/boton-05.png)
[Botón variante 6](../../shots/authogar.com/00-home/05-componentes/boton-06.png)
[Botón variante 7](../../shots/authogar.com/00-home/05-componentes/boton-07.png)
[Botón variante 8](../../shots/authogar.com/00-home/05-componentes/boton-08.png)
[Card variante 1](../../shots/authogar.com/00-home/05-componentes/card-01.png)
[Input variante 1](../../shots/authogar.com/00-home/05-componentes/input-01.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.0337 | < 0.1 |
| FCP | 1360 ms | < 1800 ms |
| TTFB | 19 ms | < 800 ms |
| Requests | 673 | < 404 |
| Peso transferido | 7863 KB | < 4718 KB |
| Nodos DOM | 3080 | < 1848 |
| Imágenes sin alt | 5 | 0 |
| Inputs sin label | 3 | 0 |
| Fallos de contraste AA | 3 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 20 | 0 |

- Lighthouse ≥ 90 en Performance, Accessibility, Best Practices y SEO (mobile, con throttling).
- Navegación completa por teclado, con foco visible en todos los elementos interactivos.
- Sin scroll horizontal entre 320px y 1920px.

## 11. Entregables esperados

1. Proyecto que compila y corre con `npm install && npm run dev`.
2. Tokens de diseño centralizados (variables CSS + config del framework de estilos).
3. Componentes reutilizables tipados, con las variantes de la sección 5.
4. Las secciones de la sección 4 armadas con datos de ejemplo.
5. README con estructura de carpetas, decisiones tomadas y cómo reemplazar el contenido de ejemplo.

**No incluir:** logos, marcas, fotos ni textos del sitio original. Usar placeholders propios.
