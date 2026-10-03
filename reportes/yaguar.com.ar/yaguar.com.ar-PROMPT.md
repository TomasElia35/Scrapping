# Prompt de construcción — yaguar.com.ar

_Generado a partir del análisis automatizado de https://yaguar.com.ar/ el 2026-08-23T14:21:02.058Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **yaguar.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Supermercado Mayorista Yaguar – Parque Chacabuco — Supermercado mayorista con sucursales en todo el país.

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, wordpress · WooCommerce, Elementor, Swiper, Font Awesome, Google Tag Manager, Google Analytics, Meta Pixel, reCAPTCHA

- El original es WordPress: reemplazar por **Next.js (App Router)** consumiendo el contenido vía API/headless, o mantener WP solo como CMS.
- Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio).
- Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#ffffff` | 91 elementos |
| surface-2 | `#d81d14` | 34 elementos |
| surface-3 | `#f8f8f8` | 25 elementos |
| surface-4 | `#000000 (0.60)` | 9 elementos |
| surface-5 | `#3ebd4e` | 8 elementos |
| text-1 (texto base) | `#333333` | 1085 elementos |
| text-2 | `#ffffff` | 266 elementos |
| text-3 | `#cc3366` | 199 elementos |
| text-4 | `#2c2c2c` | 176 elementos |
| border-1 | `#2c2c2c` | 6 elementos |
| border-2 | `#e1e1e1` | 6 elementos |

Gradientes en uso: `conic-gradient(rgb(254, 211, 52) 0deg, rgb(254, 211, 52) 40deg, rgb(196, 230, 62) 40deg, rgb(196, 230, 62) 80deg, rgb(52` · `linear-gradient(rgb(250, 96, 96) 0%, rgb(181, 23, 15) 100%)`

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: Montserrat, sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif, "Font Awesome 5 Brands"
- Escala de tamaños en uso: 11px · 11.05px · 13px · 14px · 15px · 16px · 18px · 20px
- Pesos: 400, 600, 500, 700, 900
- Line-heights: 24px, normal, 20px, 21px
- Letter-spacing: 0.15px, 0.3px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 16px | 400 | 24px |
| h2 | 28px | 600 | 33.6px |
| h4 | 14px | 600 | 19.6px |
| p | 22px | 700 | 22px |
| button | 15px | 600 | 15px |

Fuentes propias declaradas: dashicons (400, font-display: (no declarado)) · Font Awesome 6 Brands (400, font-display: block) · Font Awesome 6 Free (400, font-display: block) · Font Awesome 6 Free (900, font-display: block). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 5 familias, 23 tamaños, 5 pesos distintos. **Consolidar** a una escala de 7-9 pasos.

**Espaciado, radios y elevación**

- Radios: 3px · 8px · 12px · 30px · 50% · 100px (el original usa 18 valores distintos: **reducir a 3-4**)
- Gaps de grilla/flex: 2px · 5px · 7px · 10px · 15px · 20px
- Paddings más usados: 10px 20px, 5px 12px, 15px, 10px, 224.391px 0px 0px
- Sombras: `rgba(0, 0, 0, 0.08) 0px 2px 12px 0px` · `rgba(0, 0, 0, 0.2) 0px 3px 15px 0px` · `rgba(0, 0, 0, 0.08) 0px 2px 8px 0px` (11 distintas: **normalizar a 3 niveles de elevación**)
- Ancho de contenedor: 1200px, 1005px · padding lateral: 0px / 0px, 20px / 20px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Mapa de páginas a construir

| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |
| --- | --- | --- | --- | --- |
| Home | `/` | 11 | 25 cards, 45 carruseles, precios | 5 |
| Listado / categoría | `/catalogos-y-ofertas/` | 3 | 2 carruseles | 4 |
| Ficha de producto | `/producto/whisky-jb-750cc/` | 3 | 2 carruseles | 4 |
| Contacto / sucursales | `/sucursales/` | 3 | 2 carruseles | 4 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Listado / categoría** — secciones en orden: div.elementor-element.elementor-element-a2a24d6.e-con-full → ¡Ahorra YA en tus productos favoritos! → div.e-con-inner

**Ficha de producto** — secciones en orden: div.elementor-element.elementor-element-a2a24d6.e-con-full → Alta Graduación > Bodega → div.e-con-inner

**Contacto / sucursales** — secciones en orden: div.elementor-element.elementor-element-a2a24d6.e-con-full → div.elementor.elementor-1257 → div.e-con-inner

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.elementor-element.elementor-element-a2a24d6.e-con-full | — | 132px (0.15 vh) | flex, 2 col | 2 img, 65 links, 1 btn, 62 items |
| 2 | div.yaguar-slider | — | 478px (0.53 vh) | block | 5 img, 2 links, 7 btn |
| 3 | div#yaguar-carrusel-586.yaguar-carrusel-wrapper.sin-tapa | MÁS PRODUCTOS. MÁS AHORRO. | 550px (0.61 vh) | block | 8 img, 4 btn, 8 items |
| 4 | div#yaguar-carrusel-600.yaguar-carrusel-wrapper.sin-tapa | Los infaltables 🔥 | 550px (0.61 vh) | block | 9 img, 4 btn, 9 items |
| 5 | div#yaguar-carrusel-599.yaguar-carrusel-wrapper.sin-tapa | Todo lo que buscás, al mejor precio | 550px (0.61 vh) | block | 8 img, 4 btn, 8 items |
| 6 | div.e-con-inner | — | 434px (0.48 vh) | flex, 2 col | 10 img, 7 links, 2 btn |
| 7 | div.yaguar-ofertas-grid | — | 772px (0.86 vh) | grid, 3 col | 3 img, 3 links |
| 8 | div.e-con-inner | — | 334px (0.37 vh) | flex, 2 col | 1 img, 1 btn |
| 9 | div.e-con-inner | — | 331px (0.37 vh) | flex, 4 col | 4 img, 4 links |
| 10 | div.e-con-inner | — | 227px (0.25 vh) | flex, 1 col | — |
| 11 | div.e-con-inner | — | 375px (0.42 vh) | flex, 4 col | 2 img, 21 links, 1 btn, 13 items |

Alto total del home: 4878px (5.4 viewports). 11 bloques de primer nivel.

**Navegación principal**

- 1 ítems de primer nivel, 22 links en total, header `position: static`.
  - Sucursal Parque Chacabuco

**Footer**: 0 columnas, 21 links, 6 redes, con formulario de newsletter.

**Capas fijas**: otro (fixed, z-index 99). Definir una escala de z-index documentada.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| links | 319 | links internos con el router, externos con `rel="noopener"` |
| prices | 75 | formateo de moneda centralizado (Intl.NumberFormat es-AR) |
| images | 72 | componente de imagen optimizada (AVIF/WebP + sizes) |
| buttons | 54 | un solo componente `Button` con variantes |
| svg | 54 | sprite o componentes de ícono, no SVG inline duplicado |
| carousels | 45 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| accordions | 42 | `<details>` o accordion accesible con `aria-expanded` |
| modals | 35 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| inputs | 34 | componente `Input` con label obligatorio |
| cards | 25 | componente `Card` con variantes |
| badges | 18 | componente `Badge` con variantes semánticas |
| pagination | 6 | links reales navegables, no solo JS |
| forms | 5 | validación accesible con mensajes asociados al campo |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 6 | `rgba(0, 0, 0, 0.6)` | `rgb(255, 255, 255)` | 50% | 0px | 18px | 600 |
| secondary | 4 | `rgba(255, 255, 255, 0.5)` | `rgb(204, 51, 102)` | 50% | 0px | 16px | 600 |
| ghost | 3 | `rgb(216, 29, 20)` | `rgb(204, 51, 102)` | 50% | 0px | 16px | 600 |
| alt-2 | 3 | `rgb(221, 221, 221)` | `rgb(204, 51, 102)` | 50% | 0px | 16px | 600 |
| alt-3 | 2 | `rgba(255, 255, 255, 0.9)` | `rgb(51, 51, 51)` | 50% | 8px 16px | 16px | 600 |
| alt-4 | 1 | `rgb(216, 29, 20)` | `rgb(255, 255, 255)` | 100px | 10px | 15px | 600 |

El original tiene 10+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Variantes de card**

| Variante | Usos | Fondo | Radio | Sombra | Padding | Tamaño típico |
| --- | --- | --- | --- | --- | --- | --- |
| card-1 | 25 | `rgb(255, 255, 255)` | 12px | `rgba(0, 0, 0, 0.08) 0px 2px 12px 0px` | 0px | 264x364 |

**Formularios del original**

- Form 1 — POST → `(mismo)`, submit "Suscribirme": post_id (hidden), form_id (hidden), referer_title (hidden), queried_id (hidden), form_fields[name]* (text), form_fields[field_9b80a37]* (text), form_fields[field_98c54cd]* (number), form_fields[email]* (email), form_fields[field_bfa18aa]* (tel), form_fields[field_5284703]* (select), form_fields[field_ddad85e]* (checkbox)
- Form 2 — POST → `(mismo)`, submit "Enviar": post_id (hidden), form_id (hidden), referer_title (hidden), queried_id (hidden), form_fields[email]* (text)
- Form 3 — POST → `(mismo)`, submit "Ingresá": username (text), password (password), user-registration-login-nonce (hidden), _wp_http_referer (hidden), redirect (hidden), previous_page (hidden)
- Form 4 — POST → `(mismo)`, submit "Ingresá": username (text), password (password), user-registration-login-nonce (hidden), _wp_http_referer (hidden), redirect (hidden), previous_page (hidden)

**Carruseles**: 8 en el home (custom/desconocido, Swiper), con 508/0/17/16/7/9/9/9 slides. Alguno tiene autoplay: en la nueva app el autoplay debe poder pausarse y respetar `prefers-reduced-motion`.

## 5b. Estructura del listado y de la card

El sitio muestra **4** cards de producto con **2** campos en promedio, 4 por fila, de 240x300.

| Bloque de la card | Cards que lo muestran | Obligatorio en la estructura |
| --- | --- | --- |
| imagen | 4 | sí |
| marca | 2 | opcional |
| título | 2 | opcional |

**Notas de estructura:**

- Parte del contenido aparece solo con sesión iniciada: la card debe soportar un estado "sin precio" sin romperse.
- Hay 1 selectores de cantidad en la grilla: se puede agregar al carrito desde el listado, sin entrar al producto.
- El registro pide CUIT: el formulario de alta es de empresas, no de consumidores.
- Vocabulario del rubro presente: cuit, sucursal, iva.

**Orden de los campos en la card** (243x299, radio 0px, padding 10px): imagen → marca

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 320, 360, 440, 460, 479, 480, 575, 576, 600, 620, 640, 650, 662, 673, 710, 767, 768, 769, 782, 900, 910, 955, 968, 991, 992, 1024, 1025, 1040, 1110, 1168, 1200, 1218
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1920px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1200px, centrado, con padding lateral 0px / 0px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | 1 | 0 | 172 | 22px |
| 390px | 1 | 0 | 172 | 22px |
| 768px | 8 | 0 | 159 | 22px |
| 1024px | 8 | 0 | 159 | 28px |
| 1280px | 8 | 1 | 162 | 28px |
| 1440px | 8 | 1 | 162 | 28px |
| 1920px | 8 | 1 | 162 | 28px |

- De 390px a 768px: cards por fila 1 → 8; header 172px → 159px
- De 768px a 1024px: h1 22px → 28px; columnas de grid [1] → [3]; alto de página 8.7 → 6.2 viewports
- De 1024px a 1280px: links de nav visibles 0 → 1; header 159px → 162px

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.3s, 0.3s, 0.3s, 0.3s, 0.3s, 0.4s, 0.3s, 0.3s, 0.3s, 0.4s · easings: ease, ease-out, ease-in-out
- Propiedades animadas: transform, box-shadow, background, border, all
- En `:hover` cambian: background-color, color, background-image, background-attachment, background-clip
- 579 elementos con transición y 3 con animación; 37 `@keyframes` declarados.
- Animación al hacer scroll en el original: clases de reveal/animate: 2. Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- En hover, los botones del original cambian: backgroundColor, color, borderTopColor, outlineColor. Replicar ese tipo de respuesta, no necesariamente los valores.
- Foco de teclado del original: visible (1px auto rgb(16, 16, 16)).
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 3511 caracteres de texto visible, 72 imágenes y 319 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD.
- Idioma: `lang="es-AR"`. Formatear moneda y fechas con `Intl`.
- Propuestas de valor que ya comunica: "Ir al contenido" · "EN YAGUAR, AGOSTO RINDE MÁ$ 😎" · "EN YAGUAR, AGOSTO RINDE MÁ$ 💲" · "Sucursal Parque Chacabuco" · "WhatsApp Oficial"
- CTAs en uso: "Acceso Comerciantes" (1) · "Suscribirme" (1) · "Tu opinión nos interesa" (1). Mantener el mismo vocabulario para no confundir al usuario.
- Promesas que hay que sostener en la app nueva: atención al cliente, newsletter.
- Taxonomía de la navegación: Catálogos y Ofertas · Marcas Propias · Promociones Bancarias · Gift Cards · Recetas · Nosotros
- Tono: indeterminado, 24 palabras por oración, 29.5% de mayúsculas sostenidas. Escribir los textos nuevos con ese registro.

## 9. Mejoras obligatorias respecto del original

1. 6 botones sin nombre accesible. Todo botón de solo ícono lleva `aria-label`.
2. Jerarquía de encabezados con saltos (el primer heading es h2, no h1; salto h2 → h4 en "LECHE UAT SAN REMO ENTERA/DESCREMADA x 1"). Respetar h1 → h2 → h3 sin saltear niveles.
3. El original tiene 0 `h1`. Usar exactamente uno por página.
4. 396 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
5. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
6. Contraste: 8 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
7. Rendimiento: 37 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
8. 41 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
9. 12 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
10. CLS del original: 0.3337 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
11. El original hace 207 requests (6350 KB) desde 11 dominios de terceros. Reducir terceros y agrupar assets propios.
12. Táctil: 63 de 85 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
13. SEO: no hay datos estructurados JSON-LD. Agregar Organization/WebSite y Product o Article según corresponda.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/yaguar.com.ar/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/yaguar.com.ar/00-home/05-componentes/zone-footer.png)
[Primer formulario](../../shots/yaguar.com.ar/00-home/05-componentes/zone-form.png)
[Header](../../shots/yaguar.com.ar/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/yaguar.com.ar/00-home/05-componentes/zone-hero.png)
[Navegación](../../shots/yaguar.com.ar/00-home/05-componentes/zone-nav.png)
[Botón variante 1](../../shots/yaguar.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 10](../../shots/yaguar.com.ar/00-home/05-componentes/boton-10.png)
[Botón variante 2](../../shots/yaguar.com.ar/00-home/05-componentes/boton-02.png)
[Botón variante 3](../../shots/yaguar.com.ar/00-home/05-componentes/boton-03.png)
[Botón variante 4](../../shots/yaguar.com.ar/00-home/05-componentes/boton-04.png)
[Botón variante 5](../../shots/yaguar.com.ar/00-home/05-componentes/boton-05.png)
[Botón variante 6](../../shots/yaguar.com.ar/00-home/05-componentes/boton-06.png)
[Botón variante 7](../../shots/yaguar.com.ar/00-home/05-componentes/boton-07.png)
[Botón variante 8](../../shots/yaguar.com.ar/00-home/05-componentes/boton-08.png)
[Botón variante 9](../../shots/yaguar.com.ar/00-home/05-componentes/boton-09.png)
[Card variante 1](../../shots/yaguar.com.ar/00-home/05-componentes/card-01.png)
[Foco de teclado en el botón principal](../../shots/yaguar.com.ar/00-home/06-estados/foco-teclado.png)
[Botón 1 en hover](../../shots/yaguar.com.ar/00-home/06-estados/hover-boton-1.png)
[Botón 2 en hover](../../shots/yaguar.com.ar/00-home/06-estados/hover-boton-2.png)
[Botón 3 en hover](../../shots/yaguar.com.ar/00-home/06-estados/hover-boton-3.png)
[Input variante 1](../../shots/yaguar.com.ar/00-home/05-componentes/input-01.png)
[Input variante 2](../../shots/yaguar.com.ar/00-home/05-componentes/input-02.png)
[Input variante 3](../../shots/yaguar.com.ar/00-home/05-componentes/input-03.png)
[Card de producto 1](../../shots/yaguar.com.ar/00-home/05-componentes/producto-1.png)
[Card de producto 2](../../shots/yaguar.com.ar/00-home/05-componentes/producto-2.png)
[Card de producto 3](../../shots/yaguar.com.ar/00-home/05-componentes/producto-3.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.3337 | < 0.1 |
| FCP | 640 ms | < 1800 ms |
| TTFB | 70 ms | < 800 ms |
| Requests | 207 | < 124 |
| Peso transferido | 6350 KB | < 3810 KB |
| Nodos DOM | 2393 | < 1436 |
| Imágenes sin alt | 0 | 0 |
| Inputs sin label | 0 | 0 |
| Fallos de contraste AA | 8 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil mobile, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 37/100 | ≥ 90 |
| Accesibilidad | 83/100 | ≥ 95 |
| Best practices | 79/100 | ≥ 95 |
| SEO | 85/100 | ≥ 95 |
| LCP | 6.7 s | < 2,5 s |
| TBT | 2,230 ms | < 200 ms |
| CLS | 0 | < 0,1 |
| Speed Index | 5.7 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Eliminate render-blocking resources (ahorro estimado 1897 ms)
- Reduce unused JavaScript (ahorro estimado 190 ms) (274 KB)
- Serve images in next-gen formats (ahorro estimado 190 ms) (202 KB)
- Properly size images (ahorro estimado 190 ms) (2372 KB)
- Reduce unused CSS (39 KB)

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
