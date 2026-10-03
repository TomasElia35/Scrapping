# Prompt de construcción — macowens.com.ar

_Generado a partir del análisis automatizado de https://www.macowens.com.ar/ el 2026-08-17T18:21:20.265Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **macowens.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Macowens - Ropa de Hombre — En Macowens tenemos las mejores ofertas para que consigas Ropa de Hombre a precios increíbles. ¡Suscribite y recibí las novedades!

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, bootstrap · Magento, Slick, Google Fonts, Google Tag Manager, Google Analytics, Meta Pixel, Hotjar, Clarity

- El original es HTML/JS clásico: usar **Next.js (App Router)** o **Astro** si el sitio es mayormente estático.
- Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio sobre Bootstrap).
- Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#f0f0f0` | 1803 elementos |
| surface-2 | `#ffffff` | 370 elementos |
| surface-3 | `#000000` | 268 elementos |
| surface-4 | `#000080` | 204 elementos |
| surface-5 | `#e42621` | 96 elementos |
| text-1 (texto base) | `#000000` | 6691 elementos |
| text-2 | `#686868` | 2562 elementos |
| text-3 | `#ffffff` | 376 elementos |
| text-4 | `#666666` | 210 elementos |
| border-1 | `#999999` | 2562 elementos |
| border-2 | `#dddddd` | 291 elementos |

Gradientes en uso: `linear-gradient(rgb(255, 20, 0), rgb(255, 147, 0))`

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: "Hind Siliguri", "Helvetica Neue", Helvetica, Arial, sans-serif, Roboto, sans-serif, Helvetica
- Escala de tamaños en uso: 10px · 12px · 13px · 14px · 16px · 18px · 26px
- Pesos: 400, 700, 500, 600
- Line-heights: 19.6px, 20px, 0px, 16.8px
- Letter-spacing: -0.5px, -14px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 14px | 400 | 19.6px |
| h3 | 22px | 400 | 26.4px |
| p | 12px | 400 | 16.8px |
| button | 14px | 400 | 19.6px |
| small | 12px | 400 | 16.8px |

Fuentes propias declaradas: Hind Siliguri (300, font-display: swap) · Hind Siliguri (400, font-display: swap) · Hind Siliguri (500, font-display: swap) · Hind Siliguri (600, font-display: swap). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 3 familias, 11 tamaños, 4 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 3px · 10px · 50% · 50px
- Gaps de grilla/flex: 3px · 5px · 10px · 20px
- Paddings más usados: 0px 4px, 0px 20px, 0px 10px, 12px 0px, 0px 0px 411px
- Sombras: `rgba(51, 51, 51, 0.2) 0px 0px 10px 0px`
- Ancho de contenedor: 1430px · padding lateral: 4px / 4px, 0px / 0px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.slick-track | — | 684px (0.76 vh) | block | 12 img, 6 links |
| 2 | figure | — | 78px (0.09 vh) | block | 2 img, 1 links |
| 3 | div.pagebuilder-column-line | — | 654px (0.73 vh) | flex, 3 col | 6 img, 3 links |
| 4 | div.pagebuilder-column-line | — | 654px (0.73 vh) | flex, 3 col | 6 img, 3 links |
| 5 | div.pagebuilder-column-line | — | 558px (0.62 vh) | flex, 2 col | 24 img, 202 links, 47 btn, 25 items |
| 6 | div.pagebuilder-column-line | — | 558px (0.62 vh) | flex, 2 col | 32 img, 325 links, 64 btn, 34 items |
| 7 | div.pagebuilder-column-line | — | 558px (0.62 vh) | flex, 2 col | 46 img, 523 links, 93 btn, 49 items |
| 8 | iframe | — | 810px (0.9 vh) | block | — |
| 9 | figure | — | 660px (0.73 vh) | block | 2 img, 1 links |
| 10 | div.pagebuilder-column-line | — | 81px (0.09 vh) | flex, 3 col | 6 img |
| 11 | div.pagebuilder-column-line | — | 81px (0.09 vh) | flex, 3 col | 6 img, 2 links |
| 12 | figure | — | 75px (0.08 vh) | block | 2 img, 1 links |

Alto total del home: 6613px (7.3 viewports). 12 bloques de primer nivel.

**Navegación principal**

- 10 ítems de primer nivel, 161 links en total, header `position: static`.
  - 2DA AL 70% OFF
  - ESPECIAL ABRIGOS
  - BÁSICOS
  - IMBATIBLES
  - NUEVOS INGRESOS
  - COLECCIÓN → submenú con 52 links
  - CASUAL → submenú con 47 links
  - SASTRERÍA → submenú con 17 links
  - ACCESORIOS → submenú con 28 links
  - PROMOCIONES → submenú con 5 links

**Footer**: 1 columnas, 19 links, 2 redes, con formulario de newsletter.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| links | 1279 | links internos con el router, externos con `rel="noopener"` |
| prices | 1152 | formateo de moneda centralizado (Intl.NumberFormat es-AR) |
| badges | 1014 | componente `Badge` con variantes semánticas |
| inputs | 580 | componente `Input` con label obligatorio |
| search | 580 | input tipo search con `role="search"` y resultados accesibles |
| buttons | 213 | un solo componente `Button` con variantes |
| addToCart | 213 | estado optimista + feedback accesible al agregar |
| images | 179 | componente de imagen optimizada (AVIF/WebP + sizes) |
| carousels | 131 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| forms | 98 | validación accesible con mensajes asociados al campo |
| modals | 6 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| videosEmbeds | 2 | carga diferida con póster; no autoplay con sonido |
| svg | 1 | sprite o componentes de ícono, no SVG inline duplicado |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 14 | `rgb(221, 221, 221)` | `rgb(255, 255, 255)` | 10px | 0px | 14px | 400 |
| secondary | 4 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 10px | 0px | 14px | 400 |
| ghost | 1 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 0px | 0px | 14px | 400 |

El original tiene 3+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Formularios del original**

- Form 1 — GET → `https://www.macowens.com.ar/catalogsearch/result/`, submit "Search": q (text)
- Form 2 — POST → `https://www.macowens.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly93d3cubWFjb3dlbnMuY29tLmFyLw~~/product/122805/`, submit "Agregar al Carrito": product (hidden), uenc (hidden), form_key (hidden), super_attribute[649]* (text), super_attribute[649]* (text), super_attribute[649]* (text)
- Form 3 — POST → `https://www.macowens.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly93d3cubWFjb3dlbnMuY29tLmFyLw~~/product/107480/`, submit "Agregar al Carrito": product (hidden), uenc (hidden), form_key (hidden), super_attribute[649]* (text), super_attribute[649]* (text), super_attribute[649]* (text)
- Form 4 — POST → `https://www.macowens.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly93d3cubWFjb3dlbnMuY29tLmFyLw~~/product/89294/`, submit "Agregar al Carrito": product (hidden), uenc (hidden), form_key (hidden), super_attribute[649]* (text), super_attribute[649]* (text), super_attribute[649]* (text)

**Carruseles**: 8 en el home (Slick), con 18/12/12/1/1/1/1/1 slides. Alguno tiene autoplay: en la nueva app el autoplay debe poder pausarse y respetar `prefers-reduced-motion`.

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 360, 377, 390, 400, 420, 430, 472, 479, 480, 500, 576, 600, 639, 640, 700, 767, 768, 769, 991, 1023, 1024, 1200, 1250, 1314, 1340, 1410, 1440, 1470, 1480, 1500
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 390px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1430px, centrado, con padding lateral 4px / 4px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 12 | 123 | 16px |
| 390px | — | 12 | 123 | 16px |
| 768px | 1 | 10 | 268 | 18px |
| 1024px | 2 | 10 | 235 | 16px |
| 1280px | 2 | 10 | 206 | 16px |
| 1440px | 1 | 10 | 206 | 16px |
| 1920px | 1 | 10 | 206 | 16px |

- De 390px a 768px: desaparece hamburguesa (menú completo); cards por fila null → 1; links de nav visibles 12 → 10; h1 16px → 18px; header 123px → 268px; alto de página 8.8 → 3.2 viewports
- De 768px a 1024px: cards por fila 1 → 2; h1 18px → 16px; header 268px → 235px; alto de página 3.2 → 5.9 viewports
- De 1024px a 1280px: header 235px → 206px
- De 1280px a 1440px: cards por fila 2 → 1

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.3s, 0.5s · easings: ease, linear
- Propiedades animadas: border-color, all, background-color
- En `:hover` cambian: color, background-color, background-position-x, background-position-y, background-attachment
- 2410 elementos con transición y 0 con animación; 18 `@keyframes` declarados.
- Animación al hacer scroll en el original: 577 elementos con opacity:0 inline (pre-reveal). Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 10704 caracteres de texto visible, 179 imágenes y 1279 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: WebSite, Organization, WebPage, BreadcrumbList).
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Accesibilidad: el original tiene 10 de 179 imágenes sin `alt`. En la nueva app, `alt` es obligatorio (vacío solo si es decorativa).
2. Formularios: 288 de 290 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
3. 1 botones sin nombre accesible. Todo botón de solo ícono lleva `aria-label`.
4. Jerarquía de encabezados con saltos (el primer heading es h3, no h1). Respetar h1 → h2 → h3 sin saltear niveles.
5. El original tiene 0 `h1`. Usar exactamente uno por página.
6. 800 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
7. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
8. Contraste: 1 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
9. 1 iframes sin `title`.
10. Rendimiento: 14 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
11. 111 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
12. 103 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
13. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
14. El original hace 816 requests (10758 KB) desde 19 dominios de terceros. Reducir terceros y agrupar assets propios.
15. DOM de 12331 nodos y 27 niveles de profundidad. Apuntar a menos de 1500 nodos por vista y estructura más plana.
16. Táctil: 138 de 436 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
17. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
18. El original arroja 10 errores de consola en el home. La nueva app debe cargar sin errores.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/macowens.com.ar/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/macowens.com.ar/00-home/05-componentes/zone-footer.png)
[Header](../../shots/macowens.com.ar/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/macowens.com.ar/00-home/05-componentes/zone-hero.png)
[Navegación](../../shots/macowens.com.ar/00-home/05-componentes/zone-nav.png)
[Botón variante 1](../../shots/macowens.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/macowens.com.ar/00-home/05-componentes/boton-02.png)
[Botón variante 3](../../shots/macowens.com.ar/00-home/05-componentes/boton-03.png)
[Input variante 1](../../shots/macowens.com.ar/00-home/05-componentes/input-01.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0 | < 0.1 |
| FCP | 356 ms | < 1800 ms |
| TTFB | 10 ms | < 800 ms |
| Requests | 816 | < 490 |
| Peso transferido | 10758 KB | < 6455 KB |
| Nodos DOM | 12331 | < 7399 |
| Imágenes sin alt | 10 | 0 |
| Inputs sin label | 288 | 0 |
| Fallos de contraste AA | 1 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 10 | 0 |

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
