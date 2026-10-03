# Prompt de construcción — vital.com.ar

_Generado a partir del análisis automatizado de https://www.vital.com.ar/ el 2026-08-17T19:38:33.670Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 0. Pedido del cliente (tiene prioridad sobre todo lo demás)

_Fuente: brief.example.md_

**Briefing del cliente**

Copiá este archivo como `brief.md` (o el nombre que quieras) y completalo con lo que
pidió el cliente. Se inyecta como **sección 0 del prompt**, con prioridad sobre todo
lo que se infiere del sitio actual.

    node analyze.js --file links.txt --brief brief.md

Borrá las secciones que no apliquen. El texto va tal cual al prompt, así que escribí
en imperativo y sin ambigüedades.

**Cliente y proyecto**

- Cliente:
- Rubro:
- Sitio actual que se analizó:
- Tipo de trabajo: rediseño / migración / sitio nuevo desde cero

**Qué pidió textualmente**

-

**Qué le molesta del sitio actual**

-

**Qué hay que conservar sí o sí**

- Marca / identidad visual:
- Colores institucionales:
- Estructura o secciones que no se tocan:
- Integraciones que deben seguir funcionando (ERP, pasarela de pago, CRM, chat):

**Alcance**

- Páginas o vistas incluidas:
- Páginas explícitamente fuera de alcance:
- Idiomas:
- Necesita CMS para que el cliente edite contenido: sí / no — cuál:
- Necesita panel de administración: sí / no

**Restricciones técnicas**

- Stack impuesto por el cliente (si hay):
- Hosting / infraestructura:
- Navegadores o dispositivos mínimos a soportar:
- Requisitos legales (cookies, datos personales, accesibilidad obligatoria):

**Prioridades**

Ordenar de mayor a menor: rendimiento, accesibilidad, fidelidad visual al original,
velocidad de entrega, facilidad de mantenimiento.

1.
2.
3.

**Plazos y presupuesto**

- Fecha objetivo:
- Etapas o entregas parciales:

**Notas adicionales**

-

> Donde el pedido del cliente contradiga lo medido en el sitio actual, **gana el pedido del cliente**. Lo que sigue describe el sitio existente como punto de partida y línea base a superar.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **vital.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Supermayorista Vital - El mayorista de tu ahorro — Encontrá las mejores marcas, productos, promociones y descuentos todas las semanas a precios mayoristas. ¡En Vital todos pueden comprar!

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, tailwind, bootstrap, wordpress · Swiper, AOS, Google Fonts, Google Tag Manager, Google Analytics, Meta Pixel, Hotjar, Clarity

- El original es WordPress: reemplazar por **Next.js (App Router)** consumiendo el contenido vía API/headless, o mantener WP solo como CMS.
- Estilos: el original ya usa Tailwind. Mantener **Tailwind CSS** con los tokens de este documento cargados en `tailwind.config`.
- Home extensa y con muchas tarjetas: paginar o virtualizar listados largos y usar `next/image` con `sizes` correctos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#ffffff` | 15 elementos |
| surface-2 | `#000000 (0.75)` | 12 elementos |
| surface-3 | `#134b95` | 12 elementos |
| surface-4 | `#003d9e` | 5 elementos |
| surface-5 | `#000000` | 4 elementos |
| text-1 (texto base) | `#ffffff` | 293 elementos |
| text-2 | `#212529` | 224 elementos |
| text-3 | `#003d9e` | 204 elementos |
| text-4 | `#343a40` | 41 elementos |
| border-1 | `#f8f9fa` | 12 elementos |
| border-2 | `#adb5bd` | 9 elementos |

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: Roboto, sans-serif, Montserrat, sans-serif, sans-serif
- Escala de tamaños en uso: 10px · 12px · 12.8px · 14px · 16px · 20px · 40px
- Pesos: 400, 500, 300, 600, 700
- Line-heights: 24px, 30.4px, 21px, normal

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 16px | 400 | 24px |
| h1 | 40px | 500 | 48px |
| h2 | 40px | 600 | 48px |
| h3 | 40px | 600 | 48px |
| h4 | 40px | 600 | 48px |
| button | 16px | 400 | 24px |
| small | 12.8px | 400 | 19.2px |

Fuentes propias declaradas: Roboto (400, font-display: swap) · Roboto (500, font-display: swap) · Roboto (700, font-display: swap) · Montserrat (400, font-display: swap). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 3 familias, 9 tamaños, 5 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 4.8px · 12px · 30px · 50% · 100% · 800px
- Gaps de grilla/flex: 4px · 6px · 7px · 8px · 10px · 16px
- Paddings más usados: 0px 2px 1px, 0px 8px, 0px 15px, 8px, 4px 24px
- Sombras: `rgba(0, 0, 0, 0.15) 0px 2px 10px 0px` · `rgba(0, 0, 0, 0.15) 0px 8px 16px 0px` · `rgba(0, 0, 0, 0.25) 0px 0px 8px 0px` (8 distintas: **normalizar a 3 niveles de elevación**)
- Ancho de contenedor: 1100px · padding lateral: 15px / 15px, 8px / 8px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Mapa de páginas a construir

| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |
| --- | --- | --- | --- | --- |
| Home | `/` | 21 | 69 carruseles | 1 |
| Contacto / sucursales | `/contactos/` | 2 | — | 1 |
| Institucional | `/empresas/` | 7 | — | 1 |
| Ayuda / legales | `/ayudaresvital/` | 1 | — | 0 |
| Página interna | `/obras/s_t/` | 1 | — | 1 |
| Página | `/ofertas/` | 2 | 21 carruseles | 1 |
| Contacto / sucursales | `/sucursales/` | 2 | 17 cards, 13 carruseles | 1 |
| Ayuda / legales | `/terminos-condiciones` | 29 | — | 1 |
| Ayuda / legales | `/terminos-y-condiciones-giftcard/` | 5 | 1 tablas | 1 |
| Ayuda / legales | `/terminos-y-condiciones-giftcard-salon/` | 3 | 1 tablas | 1 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Contacto / sucursales** — secciones en orden: Comunicate con nosotros → div.col-md-6.col-lg-auto.m-3

**Institucional** — secciones en orden: img.img-fluid → img.img-fluid → img.img-fluid → img.img-fluid → img.img-fluid → img.img-fluid → Nuestro propósito

**Ayuda / legales** — secciones en orden: ¡Desafío cumplido!

**Página interna** — secciones en orden: Brenda Erdei

**Página** — secciones en orden: Nuestras ofertas Abasto → div.swiper-wrapper

**Contacto / sucursales** — secciones en orden: ¡Descubrí nuestras sucursales! → div.swiper-wrapper

**Ayuda / legales** — secciones en orden: h1.my-3 → strong → p.wp-block-paragraph → p.wp-block-paragraph → p.wp-block-paragraph → p.wp-block-paragraph → p.wp-block-paragraph → p.wp-block-paragraph → p.wp-block-paragraph → p.wp-block-paragraph

**Ayuda / legales** — secciones en orden: h1.my-3 → ol.wp-block-list → p.wp-block-paragraph → ul.wp-block-list → tbody

**Ayuda / legales** — secciones en orden: h1.my-3 → ul.wp-block-list → tbody

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div#home-slider.swiper-container.swiper-container-initialized.swiper-container-horizontal | — | 618px (0.69 vh) | block | 7 img, 7 links |
| 2 | div.d-flex.flex-column.flex-sm-row | — | 267px (0.3 vh) | flex, 3 col | 3 img, 3 links |
| 3 | img.img-fluid.lazy.loaded | — | 70px (0.08 vh) | inline | — |
| 4 | div.container | ¡Nuestras ofertas mayoristas destacadas! | 375px (0.42 vh) | block | 4 img, 4 links |
| 5 | div.row.mx-n4 | — | 419px (0.47 vh) | flex, 2 col | 3 img, 3 links |
| 6 | h3.h1.text-center.fw600 | — | 48px (0.05 vh) | block | — |
| 7 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 8 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 9 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 10 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 11 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 12 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 13 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 14 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 15 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 16 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 17 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 18 | figure.flex-column.px-0.aos-init | — | 508px (0.56 vh) | block | 1 img, 3 links, 1 btn |
| 19 | div.container | — | 288px (0.32 vh) | block | 7 links, 1 btn |
| 20 | section.home-atributo-marcas.bg-blue-100.pt-5 | — | 72px (0.08 vh) | block | — |
| 21 | section.home-medios-de-pago.py-4 | — | 160px (0.18 vh) | block | 21 img |

Alto total del home: 5569px (6.2 viewports). 21 bloques de primer nivel.

**Navegación principal**

- 6 ítems de primer nivel, 10 links en total, header `position: relative`.
  - Ofertas
  - Sucursales
  - Nuestras Marcas
  - Nosotros → submenú con 3 links
  - Ventas Corporativas → submenú con 2 links
  - Contacto

**Footer**: 0 columnas, 9 links, 5 redes.

**Capas fijas**: chat (fixed, z-index 100000) · otro (fixed, z-index auto). Definir una escala de z-index documentada.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| links | 85 | links internos con el router, externos con `rel="noopener"` |
| images | 85 | componente de imagen optimizada (AVIF/WebP + sizes) |
| carousels | 69 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| svg | 33 | sprite o componentes de ícono, no SVG inline duplicado |
| inputs | 21 | componente `Input` con label obligatorio |
| buttons | 20 | un solo componente `Button` con variantes |
| modals | 15 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| pagination | 6 | links reales navegables, no solo JS |
| videosEmbeds | 5 | carga diferida con póster; no autoplay con sonido |
| forms | 1 | validación accesible con mensajes asociados al campo |
| badges | 1 | componente `Badge` con variantes semánticas |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 12 | `rgba(0, 0, 0, 0)` | `rgb(248, 249, 250)` | 800px | 4px 24px | 20px | 300 |
| secondary | 1 | `rgb(77, 194, 71)` | `rgb(255, 255, 255)` | 30px | 8px 24px | 16px | 400 |
| ghost | 1 | `rgb(237, 28, 36)` | `rgb(255, 255, 255)` | 800px | 6px 12px | 16px | 500 |
| alt-2 | 1 | `rgb(237, 28, 36)` | `rgb(255, 255, 255)` | 800px | 6px 24px | 16px | 500 |
| alt-3 | 1 | `rgb(237, 28, 36)` | `rgb(255, 255, 255)` | 800px | 4px 32px | 16px | 500 |
| alt-4 | 1 | `rgb(26, 27, 30)` | `rgb(0, 0, 0)` | 50% | 0px | 16px | 400 |

El original tiene 6+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Formularios del original**

- Form 1 — POST → `https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8&orgId=00DDn000002Ey8t`, submit "Suscribirme": captcha_settings (hidden), oid (hidden), retURL (hidden), recordType (hidden), Campaign_ID (hidden), lead_source (hidden), first_name (text), last_name (text), 00NDn00000aYe5l (number), email (email), text (text), 00NUZ000001U20b (hidden), newsletterTelefono (tel), mobile (hidden), 00NUZ000002lKa2 (text), 00NDn00000dbbLf (select), newsletterNotifications_checkbox (checkbox), 00NUZ000004RcIE (hidden), 00NUZ000009iS1q (hidden), g-recaptcha-response (text)

**Carruseles**: 8 en el home (custom/desconocido, Swiper), con 7/7/7/0/0/0/0/0 slides. 

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 576, 767, 768, 992, 1200, 1400, 1800
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 390px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1100px, centrado, con padding lateral 15px / 15px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 10 | 163 | 40px |
| 390px | — | 10 | 163 | 12px |
| 768px | — | 5 | 139 | 40px |
| 1024px | — | 5 | 101 | 40px |
| 1280px | — | 5 | 101 | 40px |
| 1440px | — | 5 | 101 | 40px |
| 1920px | — | 5 | 101 | 40px |

- De 360px a 390px: h1 40px → 12px
- De 390px a 768px: desaparece hamburguesa (menú completo); links de nav visibles 10 → 5; h1 12px → 40px; header 163px → 139px; columnas de grid [1] → [3]; alto de página 13.5 → 4.2 viewports
- De 768px a 1024px: header 139px → 101px; alto de página 4.2 → 5.5 viewports

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.4s, 0.15s, 0.15s, 0.15s, 0.15s, 0.25s · easings: ease, ease-in-out, linear
- Propiedades animadas: opacity, transform, border-color, box-shadow, background-color
- En `:hover` cambian: color, background-color, text-decoration-color, text-decoration-line, text-decoration-style
- 76 elementos con transición y 2 con animación; 11 `@keyframes` declarados.
- Animación al hacer scroll en el original: AOS: 25 elementos · Locomotive/data-scroll · clases de reveal/animate: 18 · 3 elementos con opacity:0 inline (pre-reveal). Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 1570 caracteres de texto visible, 85 imágenes y 85 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: CollectionPage, BreadcrumbList, WebSite, Organization).
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Formularios: 9 de 11 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
2. 2 botones sin nombre accesible. Todo botón de solo ícono lleva `aria-label`.
3. Jerarquía de encabezados con saltos (salto h3 → h6 en "¡Ahorrá y disfrutá!"; salto h2 → h5 en "Medios de pago"). Respetar h1 → h2 → h3 sin saltear niveles.
4. 125 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
5. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
6. Contraste: 2 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
7. 2 iframes sin `title`.
8. Rendimiento: 50 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
9. 16 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
10. 44 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
11. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
12. CLS del original: 0.1525 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
13. El original hace 229 requests (6097 KB) desde 19 dominios de terceros. Reducir terceros y agrupar assets propios.
14. Táctil: 46 de 98 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
15. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/vital.com.ar/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/vital.com.ar/00-home/05-componentes/zone-footer.png)
[Primer formulario](../../shots/vital.com.ar/00-home/05-componentes/zone-form.png)
[Header](../../shots/vital.com.ar/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/vital.com.ar/00-home/05-componentes/zone-hero.png)
[Navegación](../../shots/vital.com.ar/00-home/05-componentes/zone-nav.png)
[Botón variante 1](../../shots/vital.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 3](../../shots/vital.com.ar/00-home/05-componentes/boton-03.png)
[Botón variante 4](../../shots/vital.com.ar/00-home/05-componentes/boton-04.png)
[Botón variante 5](../../shots/vital.com.ar/00-home/05-componentes/boton-05.png)
[Botón variante 6](../../shots/vital.com.ar/00-home/05-componentes/boton-06.png)
[Input variante 1](../../shots/vital.com.ar/00-home/05-componentes/input-01.png)
[Input variante 2](../../shots/vital.com.ar/00-home/05-componentes/input-02.png)
[Input variante 3](../../shots/vital.com.ar/00-home/05-componentes/input-03.png)
[Input variante 4](../../shots/vital.com.ar/00-home/05-componentes/input-04.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.1525 | < 0.1 |
| FCP | 1344 ms | < 1800 ms |
| TTFB | 323 ms | < 800 ms |
| Requests | 229 | < 137 |
| Peso transferido | 6097 KB | < 3658 KB |
| Nodos DOM | 1407 | < 1200 |
| Imágenes sin alt | 0 | 0 |
| Inputs sin label | 9 | 0 |
| Fallos de contraste AA | 2 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil desktop, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 44/100 | ≥ 90 |
| Accesibilidad | 88/100 | ≥ 95 |
| Best practices | 52/100 | ≥ 95 |
| SEO | 92/100 | ≥ 95 |
| LCP | 5.3 s | < 2,5 s |
| TBT | 130 ms | < 200 ms |
| CLS | 0.504 | < 0,1 |
| Speed Index | 3.9 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Reduce unused JavaScript (ahorro estimado 520 ms) (701 KB)
- Initial server response time was short (ahorro estimado 217 ms)
- Eliminate render-blocking resources (ahorro estimado 154 ms)
- Properly size images (ahorro estimado 100 ms) (1126 KB)
- Reduce unused CSS (ahorro estimado 10 ms) (24 KB)
- Enable text compression (23 KB)

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
