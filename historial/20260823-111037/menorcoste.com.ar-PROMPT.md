# Prompt de construcción — menorcoste.com.ar

_Generado a partir del análisis automatizado de https://menorcoste.com.ar/ el 2026-08-23T14:10:35.377Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **menorcoste.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Menor Coste Online - Supermercado — Aprovechá los descuentos y promociones. ENVÍOS GRATIS DESDE LA WEB. Productos frescos, todos los días. Promociones bancarias. Medios de pago en efectivo, crédito, débito, cuenta DNI y billeteras virtuales.

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, bootstrap · Magento, Slick, Owl Carousel, Font Awesome, Google Fonts, Google Tag Manager, Google Analytics, reCAPTCHA

- El original es HTML/JS clásico: usar **Next.js (App Router)** o **Astro** si el sitio es mayormente estático.
- Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio sobre Bootstrap).
- Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#f5f5f5` | 172 elementos |
| surface-2 | `#ffffff` | 113 elementos |
| surface-3 | `#02b156` | 96 elementos |
| surface-4 | `#08774d` | 6 elementos |
| surface-5 | `#00a82d` | 1 elementos |
| text-1 (texto base) | `#333333` | 2816 elementos |
| text-2 | `#02b156` | 1725 elementos |
| text-3 | `#ffffff` | 611 elementos |
| text-4 | `#666666` | 516 elementos |
| border-1 | `#02b156` | 91 elementos |
| border-2 | `#c2c2c2` | 90 elementos |

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: Commissioner, "Helvetica Neue", Helvetica, Arial, sans-serif, FontAwesome, "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif
- Escala de tamaños en uso: 10px · 11.2px · 12px · 13px · 14px · 19.6px · 32px
- Pesos: 400, 700, 600, 900
- Line-heights: normal, 20px, 18px, 12.32px
- Letter-spacing: -1px, -4.34px, 2px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 14px | 400 | 20px |
| h2 | 56px | 700 | 61.6px |
| h3 | 16.8px | 400 | 18.48px |
| p | 14px | 400 | 20px |
| button | 12px | 600 | 18px |

Fuentes propias declaradas: Open Sans (300, font-display: swap) · Open Sans (400, font-display: swap) · Open Sans (600, font-display: swap) · Open Sans (700, font-display: swap). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 4 familias, 19 tamaños, 4 pesos distintos. **Consolidar** a una escala de 7-9 pasos.

**Espaciado, radios y elevación**

- Radios: 1px · 2px · 3px · 50px · 100px (el original usa 9 valores distintos: **reducir a 3-4**)
- Gaps de grilla/flex: 5px · 10px · 16px · 20px
- Paddings más usados: 0px 8px, 0px 9px, 0px 0px 298px, 0px 10px, 15px 0px 0px
- Sombras: `rgba(0, 0, 0, 0.3) 0px 5px 8px 0px`
- Ancho de contenedor: 1280px, 1290px, 1400px · padding lateral: 15px / 15px, 0px / 0px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Mapa de páginas a construir

| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |
| --- | --- | --- | --- | --- |
| Home | `/` | 8 | 127 carruseles, precios, agregar al carrito | 88 |
| Listado / categoría | `/catalog/category/view/s/mate/id/25750/` | 2 | precios, agregar al carrito | 3 |
| Ficha de producto | `/lacteos-y-frescos/productos-de-granja` | 2 | precios, agregar al carrito | 5 |
| Contacto / sucursales | `/contact` | 2 | — | 3 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Listado / categoría** — secciones en orden: MATE → div.columns

**Ficha de producto** — secciones en orden: PRODUCTOS DE GRANJA → div.columns

**Contacto / sucursales** — secciones en orden: Contáctanos → fieldset.fieldset

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.owl-stage | — | 494px (0.55 vh) | block | 15 img, 6 links |
| 2 | div.botones | Promos bancarias | 126px (0.14 vh) | flex, 4 col | 4 img, 4 links |
| 3 | div.productos-destacados.imperdibles.boxed-content | IMPERDIBLES WEB | 600px (0.67 vh) | block | 40 img, 160 links, 82 btn, 41 items |
| 4 | img | — | 294px (0.33 vh) | inline | — |
| 5 | div.productos-destacados.semana.boxed-content | ¡No te pierdas los destacados de la semana! | 600px (0.67 vh) | block | 42 img, 168 links, 86 btn, 43 items |
| 6 | div.banners-categorias | — | 451px (0.5 vh) | grid, 4 col | 4 img, 4 links |
| 7 | div.productos-destacados.combos.boxed-content | ¡Aprovechá los mejores combos! | 600px (0.67 vh) | block | 4 img, 16 links, 8 btn, 5 items |
| 8 | figure | — | 205px (0.23 vh) | block | 2 img, 1 links |

Alto total del home: 4376px (4.9 viewports). 8 bloques de primer nivel.

**Navegación principal**

- 15 ítems de primer nivel, 546 links en total, header `position: relative`.
  - OFERTAS
  - ALMACEN → submenú con 218 links
  - BEBIDAS CON ALCOHOL → submenú con 45 links
  - BEBIDAS SIN ALCOHOL → submenú con 27 links
  - LIMPIEZA → submenú con 63 links
  - PERFUMERIA → submenú con 51 links
  - BAZAR → submenú con 9 links
  - PANIFICADOS → submenú con 14 links
  - ROTISERIA → submenú con 6 links
  - LACTEOS Y FRESCOS → submenú con 20 links
  - FIAMBRERIA → submenú con 33 links
  - CARNICERIA → submenú con 18 links

**Footer**: 2 columnas, 24 links, 3 redes.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| prices | 1106 | formateo de moneda centralizado (Intl.NumberFormat es-AR) |
| links | 959 | links internos con el router, externos con `rel="noopener"` |
| badges | 436 | componente `Badge` con variantes semánticas |
| inputs | 354 | componente `Input` con label obligatorio |
| buttons | 185 | un solo componente `Button` con variantes |
| addToCart | 172 | estado optimista + feedback accesible al agregar |
| carousels | 127 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| images | 125 | componente de imagen optimizada (AVIF/WebP + sizes) |
| forms | 88 | validación accesible con mensajes asociados al campo |
| tabs | 9 | patrón tablist/tab/tabpanel con navegación por flechas |
| modals | 2 | `<dialog>` nativo o Radix, con foco atrapado y cierre por Escape |
| search | 1 | input tipo search con `role="search"` y resultados accesibles |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 4 | `rgb(2, 177, 86)` | `rgba(0, 0, 0, 0)` | 0px 4px 4px 0px | 0px | 0px | 600 |
| secondary | 1 | `rgba(0, 0, 0, 0)` | `rgb(51, 51, 51)` | 3px | 0px | 12px | 600 |

El original tiene 2+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Formularios del original**

- Form 1 — POST → `(mismo)`, submit "Iniciar sesión": username (email), password (password), captcha_form_id (hidden), context (hidden)
- Form 2 — POST → `https://menorcoste.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly9tZW5vcmNvc3RlLmNvbS5hci8~/product/21743/`, submit "Agregar": product (hidden), uenc (hidden), form_key (hidden), qty (text)
- Form 3 — POST → `https://menorcoste.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly9tZW5vcmNvc3RlLmNvbS5hci8~/product/56115/`, submit "Agregar": product (hidden), uenc (hidden), form_key (hidden), qty (text)
- Form 4 — POST → `https://menorcoste.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly9tZW5vcmNvc3RlLmNvbS5hci8~/product/56129/`, submit "Agregar": product (hidden), uenc (hidden), form_key (hidden), qty (text)

**Carruseles**: 8 en el home (custom/desconocido, Owl), con 69/45/45/1/1/1/1/1 slides. 

## 5b. Catálogo y modelo de datos

El sitio muestra **86** cards de producto con **8.2** campos en promedio, 4 por fila, de 300x470.

| Campo | Cards que lo muestran | Obligatorio en el modelo |
| --- | --- | --- |
| botón de compra | 40 | opcional |
| cuotas | 40 | opcional |
| imagen | 40 | opcional |
| marca | 40 | opcional |
| precio | 40 | opcional |
| precio secundario | 40 | opcional |
| selector de cantidad | 40 | opcional |
| título | 40 | opcional |
| unidad de venta | 7 | opcional |

**Modelo de negocio detectado:**

- Muestra unidad de venta en 7 card(s): el producto necesita unidad (bulto, caja, pack) y factor de conversión.
- Hay 86 selectores de cantidad en la grilla: se puede agregar al carrito desde el listado, sin entrar al producto.
- Vocabulario del rubro presente: sucursal, iva.

**Orden de los campos en la card** (298x468, radio 0px, padding 0px): imagen → marca → título → precio → precio secundario → cuotas → botón de compra → selector de cantidad

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 400, 460, 479, 481, 639, 640, 767, 768, 769, 860, 897, 900, 991, 1024, 1025, 1185, 1200, 1400, 1440, 1500, 1520, 1700
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1024px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1280px, centrado, con padding lateral 15px / 15px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 0 | 171 | 32px |
| 390px | — | 0 | 145 | 32px |
| 768px | — | 0 | 172 | 32px |
| 1024px | — | 0 | 169 | 32px |
| 1280px | — | 0 | 109 | 32px |
| 1440px | 4 | 0 | 109 | 32px |
| 1920px | 4 | 0 | 109 | 32px |

- De 360px a 390px: header 171px → 145px
- De 390px a 768px: header 145px → 172px; alto de página 6.9 → 5.1 viewports
- De 768px a 1024px: header 172px → 169px
- De 1024px a 1280px: desaparece hamburguesa (menú completo); header 169px → 109px
- De 1280px a 1440px: cards por fila null → 4

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.3s, 0.5s, 0.4s · easings: ease, ease-in, ease-in-out
- Propiedades animadas: all, opacity, color, height, margin
- En `:hover` cambian: color, background-color, background-image, border-bottom-color, border-left-color
- 127 elementos con transición y 25 con animación; 32 `@keyframes` declarados.
- Animación al hacer scroll en el original: clases de reveal/animate: 1. Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- En hover, los botones del original cambian: opacity. Replicar ese tipo de respuesta, no necesariamente los valores.
- Foco de teclado del original: visible (sin outline).
- Menú de categorías: panel de 800x363 con 8 links en 1 columnas. Accesible por teclado y con cierre por Escape.
- Carrito: popover de undefined a la undefined.
- Buscador con autocompletado: 42 sugerencias con imágenes y precios. Implementarlo con debounce y navegable por teclado.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 11416 caracteres de texto visible, 125 imágenes y 959 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD.
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.
- Propuestas de valor que ya comunica: "COMPRÁ DESDE TU CASA SIN MOVERTE" · "MI CARRITO" · "BEBIDAS CON ALCOHOL" · "BEBIDAS SIN ALCOHOL" · "LIMPIEZA"
- Promesas que hay que sostener en la app nueva: atención al cliente, cobertura nacional.
- Taxonomía de la navegación: OFERTAS · ALMACEN · BEBIDAS CON ALCOHOL · BEBIDAS SIN ALCOHOL · LIMPIEZA · PERFUMERIA · BAZAR · PANIFICADOS · ROTISERIA · LACTEOS Y FRESCOS · FIAMBRERIA · CARNICERIA · VERDULERIA · CONGELADOS · LIBRERIA
- Tono: indeterminado, 9.7 palabras por oración, 19.7% de mayúsculas sostenidas. Escribir los textos nuevos con ese registro.
- Buscador con placeholder "¿Qué estás buscando?" en el header: mantenerlo prominente.

## 9. Mejoras obligatorias respecto del original

1. Accesibilidad: el original tiene 3 de 125 imágenes sin `alt`. En la nueva app, `alt` es obligatorio (vacío solo si es decorativa).
2. Formularios: 1 de 91 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
3. Jerarquía de encabezados con saltos (el primer heading es h3, no h1). Respetar h1 → h2 → h3 sin saltear niveles.
4. El original tiene 0 `h1`. Usar exactamente uno por página.
5. 800 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
6. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
7. Contraste: 2 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
8. Rendimiento: 39 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
9. 1 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
10. 39 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
11. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
12. CLS del original: 0.546 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
13. El original hace 1157 requests (4080 KB) desde 6 dominios de terceros. Reducir terceros y agrupar assets propios.
14. DOM de 7095 nodos y 29 niveles de profundidad. Apuntar a menos de 1500 nodos por vista y estructura más plana.
15. Táctil: 191 de 366 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
16. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
17. SEO: no hay datos estructurados JSON-LD. Agregar Organization/WebSite y Product o Article según corresponda.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Buscador](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-buscador.png)
[Carrusel](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-footer.png)
[Header](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-hero.png)
[Botón variante 1](../../shots/menorcoste.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/menorcoste.com.ar/00-home/05-componentes/boton-02.png)
[Sugerencias del buscador](../../shots/menorcoste.com.ar/00-home/06-estados/buscador-sugerencias.png)
[Carrito / minicart abierto](../../shots/menorcoste.com.ar/00-home/06-estados/carrito.png)
[Foco de teclado en el botón principal](../../shots/menorcoste.com.ar/00-home/06-estados/foco-teclado.png)
[Botón 1 en hover](../../shots/menorcoste.com.ar/00-home/06-estados/hover-boton-1.png)
[Menú desplegado](../../shots/menorcoste.com.ar/00-home/06-estados/menu-desplegado.png)
[Card de producto 1](../../shots/menorcoste.com.ar/00-home/05-componentes/producto-1.png)
[Card de producto 2](../../shots/menorcoste.com.ar/00-home/05-componentes/producto-2.png)
[Card de producto 3](../../shots/menorcoste.com.ar/00-home/05-componentes/producto-3.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.546 | < 0.1 |
| FCP | 1480 ms | < 1800 ms |
| TTFB | 831 ms | < 800 ms |
| Requests | 1157 | < 694 |
| Peso transferido | 4080 KB | < 2448 KB |
| Nodos DOM | 7095 | < 4257 |
| Imágenes sin alt | 3 | 0 |
| Inputs sin label | 1 | 0 |
| Fallos de contraste AA | 2 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil mobile, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 46/100 | ≥ 90 |
| Accesibilidad | 83/100 | ≥ 95 |
| Best practices | 93/100 | ≥ 95 |
| SEO | 83/100 | ≥ 95 |
| LCP | 37.5 s | < 2,5 s |
| TBT | 550 ms | < 200 ms |
| CLS | 0.049 | < 0,1 |
| Speed Index | 9.3 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Properly size images (ahorro estimado 7070 ms) (1499 KB)
- Serve images in next-gen formats (ahorro estimado 3800 ms) (5004 KB)
- Eliminate render-blocking resources (ahorro estimado 737 ms)
- Reduce unused CSS (ahorro estimado 640 ms) (130 KB)
- Initial server response time was short (ahorro estimado 368 ms)
- Reduce unused JavaScript (ahorro estimado 360 ms) (98 KB)
- Minify JavaScript (ahorro estimado 360 ms) (65 KB)

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
