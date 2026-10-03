# Prompt de construcción — vital.com.ar

_Generado a partir del análisis automatizado de https://www.vital.com.ar/ el 2026-08-23T14:10:35.377Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **vital.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Supermayorista Vital - El mayorista de tu ahorro — Encontrá las mejores marcas, productos, promociones y descuentos todas las semanas a precios mayoristas. ¡En Vital todos pueden comprar!

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, tailwind, bootstrap, wordpress · Swiper, AOS, Google Fonts, Google Tag Manager, Google Analytics, Meta Pixel, Hotjar, Clarity

- El original es WordPress: reemplazar por **Next.js (App Router)** consumiendo el contenido vía API/headless, o mantener WP solo como CMS.
- Estilos: el original ya usa Tailwind. Mantener **Tailwind CSS** con los tokens de este documento cargados en `tailwind.config`.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#ffffff` | 15 elementos |
| surface-2 | `#000000 (0.75)` | 8 elementos |
| surface-3 | `#134b95` | 8 elementos |
| surface-4 | `#003d9e` | 5 elementos |
| surface-5 | `#000000` | 4 elementos |
| text-1 (texto base) | `#212529` | 222 elementos |
| text-2 | `#ffffff` | 201 elementos |
| text-3 | `#003d9e` | 189 elementos |
| text-4 | `#343a40` | 41 elementos |
| border-1 | `#adb5bd` | 9 elementos |
| border-2 | `#f8f9fa` | 8 elementos |

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
- Paddings más usados: 0px 2px 1px, 0px 8px, 0px 15px, 8px, 9.5px 5px
- Sombras: `rgba(0, 0, 0, 0.15) 0px 2px 10px 0px` · `rgba(0, 0, 0, 0.15) 0px 8px 16px 0px` · `rgba(0, 0, 0, 0.25) 0px 0px 8px 0px` (8 distintas: **normalizar a 3 niveles de elevación**)
- Ancho de contenedor: 1100px · padding lateral: 15px / 15px, 8px / 8px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Mapa de páginas a construir

| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |
| --- | --- | --- | --- | --- |
| Home | `/` | 8 | 69 carruseles | 1 |
| Contacto / sucursales | `/contactos/` | 2 | — | 1 |
| Institucional | `/empresas/` | 7 | — | 1 |
| Ayuda / legales | `/ayudaresvital/` | 1 | — | 0 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Contacto / sucursales** — secciones en orden: Comunicate con nosotros → div.col-md-6.col-lg-auto.m-3

**Institucional** — secciones en orden: img.img-fluid → img.img-fluid → img.img-fluid → img.img-fluid → img.img-fluid → img.img-fluid → Nuestro propósito

**Ayuda / legales** — secciones en orden: ¡Desafío cumplido!

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div#home-slider.swiper-container.swiper-container-initialized.swiper-container-horizontal | — | 624px (0.69 vh) | block | 7 img, 7 links |
| 2 | div.d-flex.flex-column.flex-sm-row | — | 267px (0.3 vh) | flex, 3 col | 3 img, 3 links |
| 3 | img.img-fluid.lazy.loaded | — | 70px (0.08 vh) | inline | — |
| 4 | div.container | ¡Nuestras ofertas mayoristas destacadas! | 375px (0.42 vh) | block | 4 img, 4 links |
| 5 | div.row.mx-n4 | — | 419px (0.47 vh) | flex, 2 col | 3 img, 3 links |
| 6 | div.container | — | 288px (0.32 vh) | block | 7 links, 1 btn |
| 7 | section.home-atributo-marcas.bg-blue-100.pt-5 | — | 72px (0.08 vh) | block | — |
| 8 | section.home-medios-de-pago.py-4 | — | 160px (0.18 vh) | block | 21 img |

Alto total del home: 5035px (5.6 viewports). 8 bloques de primer nivel.

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
| images | 81 | componente de imagen optimizada (AVIF/WebP + sizes) |
| links | 73 | links internos con el router, externos con `rel="noopener"` |
| carousels | 69 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| svg | 25 | sprite o componentes de ícono, no SVG inline duplicado |
| inputs | 21 | componente `Input` con label obligatorio |
| buttons | 16 | un solo componente `Button` con variantes |
| modals | 11 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| pagination | 6 | links reales navegables, no solo JS |
| videosEmbeds | 5 | carga diferida con póster; no autoplay con sonido |
| forms | 1 | validación accesible con mensajes asociados al campo |
| badges | 1 | componente `Badge` con variantes semánticas |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 8 | `rgba(0, 0, 0, 0)` | `rgb(248, 249, 250)` | 800px | 4px 24px | 20px | 300 |
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
- De 390px a 768px: desaparece hamburguesa (menú completo); links de nav visibles 10 → 5; h1 12px → 40px; header 163px → 139px; columnas de grid [1] → [3]; alto de página 11.3 → 3.9 viewports
- De 768px a 1024px: header 139px → 101px; alto de página 3.9 → 5 viewports

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.4s, 0.25s, 0.15s, 0.15s, 0.15s, 0.15s · easings: ease, ease-in-out, linear
- Propiedades animadas: opacity, transform, border-color, box-shadow, background-color
- En `:hover` cambian: color, background-color, text-decoration-color, text-decoration-line, text-decoration-style
- 64 elementos con transición y 2 con animación; 11 `@keyframes` declarados.
- Animación al hacer scroll en el original: AOS: 21 elementos · Locomotive/data-scroll · clases de reveal/animate: 5 · 3 elementos con opacity:0 inline (pre-reveal). Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- En hover, los botones del original cambian: backgroundColor, color, outlineColor, borderTopColor. Replicar ese tipo de respuesta, no necesariamente los valores.
- Foco de teclado del original: visible (sin outline).
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 1392 caracteres de texto visible, 81 imágenes y 73 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: CollectionPage, BreadcrumbList, WebSite, Organization).
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.
- Propuestas de valor que ya comunica: "¡Nuestras ofertas mayoristas destacadas!"
- CTAs en uso: "Ver folleto" (8) · "Acceso a comerciantes" (1) · "Hola, ¿tiene alguna pregunta? Chateemos." (1) · "Sumate al canal de WhatsApp" (1) · "Suscribirme" (1) · "VER TODOS LOS PRODUCTOS" (1). Mantener el mismo vocabulario para no confundir al usuario.
- Promesas que hay que sostener en la app nueva: atención al cliente, newsletter.
- Taxonomía de la navegación: Ofertas · Nuestras Marcas · Nosotros
- Tono: formal (usted), 15.4 palabras por oración, 2.3% de mayúsculas sostenidas. Escribir los textos nuevos con ese registro.

## 9. Mejoras obligatorias respecto del original

1. Formularios: 9 de 11 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
2. 2 botones sin nombre accesible. Todo botón de solo ícono lleva `aria-label`.
3. Jerarquía de encabezados con saltos (salto h3 → h6 en "Ofertas fin de semana | 21.08 al 23.08"; salto h2 → h5 en "Medios de pago"). Respetar h1 → h2 → h3 sin saltear niveles.
4. 109 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
5. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
6. Contraste: 2 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
7. 2 iframes sin `title`.
8. Rendimiento: 46 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
9. 12 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
10. 44 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
11. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
12. CLS del original: 0.6563 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
13. El original hace 511 requests (16348 KB) desde 19 dominios de terceros. Reducir terceros y agrupar assets propios.
14. Táctil: 42 de 82 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
15. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
16. El original arroja 6 errores de consola en el home. La nueva app debe cargar sin errores.

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
[Foco de teclado en el botón principal](../../shots/vital.com.ar/00-home/06-estados/foco-teclado.png)
[Botón 1 en hover](../../shots/vital.com.ar/00-home/06-estados/hover-boton-1.png)
[Botón 3 en hover](../../shots/vital.com.ar/00-home/06-estados/hover-boton-3.png)
[Input variante 1](../../shots/vital.com.ar/00-home/05-componentes/input-01.png)
[Input variante 2](../../shots/vital.com.ar/00-home/05-componentes/input-02.png)
[Input variante 3](../../shots/vital.com.ar/00-home/05-componentes/input-03.png)
[Input variante 4](../../shots/vital.com.ar/00-home/05-componentes/input-04.png)
[Menú desplegado](../../shots/vital.com.ar/00-home/06-estados/menu-desplegado.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.6563 | < 0.1 |
| FCP | 1072 ms | < 1800 ms |
| TTFB | 301 ms | < 800 ms |
| Requests | 511 | < 307 |
| Peso transferido | 16348 KB | < 9809 KB |
| Nodos DOM | 821 | < 1200 |
| Imágenes sin alt | 0 | 0 |
| Inputs sin label | 9 | 0 |
| Fallos de contraste AA | 2 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 6 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil mobile, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 16/100 | ≥ 90 |
| Accesibilidad | 83/100 | ≥ 95 |
| Best practices | 54/100 | ≥ 95 |
| SEO | 92/100 | ≥ 95 |
| LCP | 22.1 s | < 2,5 s |
| TBT | 1,430 ms | < 200 ms |
| CLS | 0.571 | < 0,1 |
| Speed Index | 11.9 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Reduce unused JavaScript (ahorro estimado 1910 ms) (659 KB)
- Eliminate render-blocking resources (ahorro estimado 665 ms)
- Initial server response time was short (ahorro estimado 210 ms)
- Properly size images (ahorro estimado 160 ms) (78 KB)
- Reduce unused CSS (24 KB)
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
