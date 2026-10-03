# Prompt de construcción — devre.la

_Generado a partir del análisis automatizado de https://www.devre.la/ el 2026-08-17T18:21:20.265Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **devre.la**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Devré - Ropa de Hombre — En Devré tenemos las mejores ofertas para que consigas Ropa de Hombre a precios increíbles. ¡Suscribite y recibí las novedades!

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, bootstrap · Magento, Slick, Google Tag Manager, Google Analytics, Meta Pixel, Hotjar, Clarity, TikTok Pixel

- El original es HTML/JS clásico: usar **Next.js (App Router)** o **Astro** si el sitio es mayormente estático.
- Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio sobre Bootstrap).
- Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#f0f0f0` | 3545 elementos |
| surface-2 | `#ffffff` | 817 elementos |
| surface-3 | `#000000` | 662 elementos |
| surface-4 | `#000080` | 317 elementos |
| surface-5 | `#e42621` | 185 elementos |
| text-1 (texto base) | `#000000` | 13775 elementos |
| text-2 | `#686868` | 5455 elementos |
| text-3 | `#ffffff` | 737 elementos |
| text-4 | `#666666` | 432 elementos |
| border-1 | `#999999` | 5455 elementos |
| border-2 | `#dddddd` | 618 elementos |

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif
- Escala de tamaños en uso: 10px · 12px · 14px · 16px · 18px · 22px · 26px
- Pesos: 400, 700, 200, 800
- Line-heights: 19.6px, 20px, 0px, 16.8px
- Letter-spacing: -14px, -0.5px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 14px | 400 | 19.6px |
| h3 | 22px | 400 | 26.4px |
| p | 12px | 400 | 16px |
| button | 14px | 400 | 19.6px |
| small | 12px | 400 | 16.8px |

Fuentes propias declaradas: Nunito Sans (300, font-display: swap) · Nunito Sans (400, font-display: swap) · Nunito Sans (500, font-display: swap) · Nunito Sans (600, font-display: swap). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 1 familias, 8 tamaños, 4 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 3px · 10px · 50%
- Gaps de grilla/flex: 5px · 20px
- Paddings más usados: 0px 4px, 0px 20px, 0px 10px, 12px 0px, 0px 0px 8px
- Sombras: `rgba(51, 51, 51, 0.2) 0px 0px 10px 0px`
- Ancho de contenedor: 1430px · padding lateral: 4px / 4px, 0px / 0px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.slick-track | — | 570px (0.63 vh) | block | 30 img, 15 links |
| 2 | figure | — | 91px (0.1 vh) | block | 2 img, 1 links |
| 3 | div.pagebuilder-column-line | — | 703px (0.78 vh) | flex, 3 col | 6 img, 3 links |
| 4 | div.pagebuilder-column-line | — | 611px (0.68 vh) | flex, 2 col | 33 img, 274 links, 69 btn, 5 items |
| 5 | div.pagebuilder-column-line | — | 611px (0.68 vh) | flex, 2 col | 33 img, 439 links, 69 btn, 36 items |
| 6 | div.pagebuilder-column-line | — | 611px (0.68 vh) | flex, 2 col | 37 img, 451 links, 78 btn, 41 items |
| 7 | div.pagebuilder-column-line | — | 611px (0.68 vh) | flex, 2 col | 35 img, 415 links, 73 btn, 38 items |
| 8 | iframe | — | 810px (0.9 vh) | block | — |
| 9 | div.pagebuilder-column-line | — | 524px (0.58 vh) | flex, 2 col | 4 img, 2 links |
| 10 | div.slick-track | ENVÍO GRATIS A TODO EL PAÍS | 80px (0.09 vh) | block | 3 img |
| 11 | figure.images-deferred | — | 724px (0.8 vh) | block | 2 img, 1 links |

Alto total del home: 7367px (8.2 viewports). 11 bloques de primer nivel.

**Navegación principal**

- 11 ítems de primer nivel, 156 links en total, header `position: static`.
  - 2da al 70% OFF
  - 2da al 60% OFF
  - Cápsula Aquiles
  - Performance
  - Básicos
  - Destacados
  - COLECCIÓN → submenú con 47 links
  - CASUAL → submenú con 39 links
  - SASTRERÍA → submenú con 24 links
  - ACCESORIOS → submenú con 29 links
  - Promociones → submenú con 5 links

**Footer**: 1 columnas, 20 links, 2 redes, con formulario de newsletter.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| links | 3876 | links internos con el router, externos con `rel="noopener"` |
| prices | 3522 | formateo de moneda centralizado (Intl.NumberFormat es-AR) |
| badges | 2984 | componente `Badge` con variantes semánticas |
| inputs | 1747 | componente `Input` con label obligatorio |
| search | 1747 | input tipo search con `role="search"` y resultados accesibles |
| buttons | 669 | un solo componente `Button` con variantes |
| addToCart | 669 | estado optimista + feedback accesible al agregar |
| carousels | 445 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| images | 401 | componente de imagen optimizada (AVIF/WebP + sizes) |
| forms | 297 | validación accesible con mensajes asociados al campo |
| modals | 6 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| videosEmbeds | 2 | carga diferida con póster; no autoplay con sonido |
| svg | 1 | sprite o componentes de ícono, no SVG inline duplicado |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 23 | `rgb(221, 221, 221)` | `rgb(255, 255, 255)` | 10px | 0px | 14px | 400 |
| secondary | 8 | `rgba(0, 0, 0, 0)` | `rgba(0, 0, 0, 0)` | 0px | 0px | 0px | 400 |
| ghost | 5 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 10px | 0px | 14px | 400 |
| alt-2 | 1 | `rgba(0, 0, 0, 0)` | `rgb(255, 255, 255)` | 3px | 0px | 14px | 400 |

El original tiene 4+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Formularios del original**

- Form 1 — GET → `https://www.devre.la/catalogsearch/result/`, submit "Search": q (text)
- Form 2 — POST → `https://www.devre.la/checkout/cart/add/uenc/aHR0cHM6Ly93d3cuZGV2cmUubGEv/product/122916/`, submit "Agregar al Carrito": product (hidden), uenc (hidden), form_key (hidden), super_attribute[649]* (text), super_attribute[649]* (text), super_attribute[649]* (text)
- Form 3 — POST → `https://www.devre.la/checkout/cart/add/uenc/aHR0cHM6Ly93d3cuZGV2cmUubGEv/product/94598/`, submit "Agregar al Carrito": product (hidden), uenc (hidden), form_key (hidden), super_attribute[649]* (text), super_attribute[649]* (text), super_attribute[649]* (text)
- Form 4 — POST → `https://www.devre.la/checkout/cart/add/uenc/aHR0cHM6Ly93d3cuZGV2cmUubGEv/product/94571/`, submit "Agregar al Carrito": product (hidden), uenc (hidden), form_key (hidden), super_attribute[649]* (text), super_attribute[649]* (text), super_attribute[649]* (text)

**Carruseles**: 8 en el home (Slick), con 37/30/30/1/1/1/1/1 slides. Alguno tiene autoplay: en la nueva app el autoplay debe poder pausarse y respetar `prefers-reduced-motion`.

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 360, 390, 400, 472, 479, 500, 576, 600, 639, 640, 700, 767, 768, 769, 1023, 1024, 1200, 1250, 1314, 1440, 1470, 1480, 1500
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1920px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1430px, centrado, con padding lateral 4px / 4px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 12 | 86 | 16px |
| 390px | — | 12 | 86 | 16px |
| 768px | — | 0 | 116 | 18px |
| 1024px | 1 | 0 | 130 | 16px |
| 1280px | 2 | 0 | 130 | 16px |
| 1440px | 1 | 0 | 130 | 16px |
| 1920px | 1 | 0 | 130 | 16px |

- De 390px a 768px: links de nav visibles 12 → 0; h1 16px → 18px; header 86px → 116px; alto de página 8.7 → 4.1 viewports
- De 768px a 1024px: cards por fila null → 1; h1 18px → 16px; header 116px → 130px; alto de página 4.1 → 6.6 viewports
- De 1024px a 1280px: cards por fila 1 → 2
- De 1280px a 1440px: cards por fila 2 → 1

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.3s · easings: ease, linear
- Propiedades animadas: border-color, all, opacity, background-color
- En `:hover` cambian: color, background-color, border-bottom-color, border-left-color, border-right-color
- 2319 elementos con transición y 12 con animación; 18 `@keyframes` declarados.
- Animación al hacer scroll en el original: 1771 elementos con opacity:0 inline (pre-reveal). Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 20336 caracteres de texto visible, 401 imágenes y 3876 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: WebSite, Organization, WebPage, BreadcrumbList).
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Accesibilidad: el original tiene 10 de 401 imágenes sin `alt`. En la nueva app, `alt` es obligatorio (vacío solo si es decorativa).
2. Formularios: 858 de 860 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
3. 1 botones sin nombre accesible. Todo botón de solo ícono lleva `aria-label`.
4. Jerarquía de encabezados con saltos (el primer heading es h3, no h1). Respetar h1 → h2 → h3 sin saltear niveles.
5. El original tiene 0 `h1`. Usar exactamente uno por página.
6. 800 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
7. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
8. 1 iframes sin `title`.
9. Rendimiento: 17 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
10. 25 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
11. 302 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
12. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
13. El original hace 1035 requests (30186 KB) desde 19 dominios de terceros. Reducir terceros y agrupar assets propios.
14. DOM de 34779 nodos y 27 niveles de profundidad. Apuntar a menos de 1500 nodos por vista y estructura más plana.
15. Táctil: 269 de 558 áreas clicables miden menos de 36px en 390px. Mínimo 44x44px.
16. Animaciones: el original ignora `prefers-reduced-motion`. Respetarlo y desactivar movimiento no esencial.
17. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
18. El original arroja 9 errores de consola en el home. La nueva app debe cargar sin errores.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/devre.la/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/devre.la/00-home/05-componentes/zone-footer.png)
[Header](../../shots/devre.la/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/devre.la/00-home/05-componentes/zone-hero.png)
[Botón variante 1](../../shots/devre.la/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/devre.la/00-home/05-componentes/boton-02.png)
[Botón variante 3](../../shots/devre.la/00-home/05-componentes/boton-03.png)
[Botón variante 4](../../shots/devre.la/00-home/05-componentes/boton-04.png)
[Input variante 1](../../shots/devre.la/00-home/05-componentes/input-01.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.0035 | < 0.1 |
| FCP | 376 ms | < 1800 ms |
| TTFB | 10 ms | < 800 ms |
| Requests | 1035 | < 621 |
| Peso transferido | 30186 KB | < 18112 KB |
| Nodos DOM | 34779 | < 20867 |
| Imágenes sin alt | 10 | 0 |
| Inputs sin label | 858 | 0 |
| Fallos de contraste AA | 0 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 9 | 0 |

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
