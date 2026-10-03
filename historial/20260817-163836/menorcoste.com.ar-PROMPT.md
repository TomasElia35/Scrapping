# Prompt de construcción — menorcoste.com.ar

_Generado a partir del análisis automatizado de https://menorcoste.com.ar/ el 2026-08-17T19:38:33.670Z._

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
| surface-1 (fondo base) | `#f5f5f5` | 156 elementos |
| surface-2 | `#ffffff` | 105 elementos |
| surface-3 | `#02b156` | 88 elementos |
| surface-4 | `#08774d` | 6 elementos |
| surface-5 | `#00a82d` | 1 elementos |
| text-1 (texto base) | `#333333` | 2643 elementos |
| text-2 | `#02b156` | 1620 elementos |
| text-3 | `#ffffff` | 570 elementos |
| text-4 | `#666666` | 468 elementos |
| border-1 | `#02b156` | 83 elementos |
| border-2 | `#c2c2c2` | 82 elementos |

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
| Home | `/` | 8 | 119 carruseles, precios, agregar al carrito | 80 |
| Listado / categoría | `/catalog/category/view/s/mate/id/25750/` | 2 | precios, agregar al carrito | 3 |
| Ficha de producto | `/lacteos-y-frescos/productos-de-granja` | 2 | precios, agregar al carrito | 5 |
| Contacto / sucursales | `/contact` | 2 | — | 3 |
| Ayuda / legales | `/terminos-y-condiciones` | 13 | — | 2 |
| Carrito | `/carrousel-3` | 3 | precios, agregar al carrito | 19 |
| Página interna | `/almacen/te` | 3 | precios, agregar al carrito | 50 |
| Página | `/qr` | 1 | — | 3 |
| Listado / categoría | `/catalog/category/view/s/bazar/id/427/` | 4 | precios, agregar al carrito | 32 |
| Listado / categoría | `/catalog/category/view/s/deli/id/26658/` | 3 | precios, agregar al carrito | 43 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Listado / categoría** — secciones en orden: MATE → div.columns

**Ficha de producto** — secciones en orden: PRODUCTOS DE GRANJA → div.columns

**Contacto / sucursales** — secciones en orden: Contáctanos → fieldset.fieldset

**Ayuda / legales** — secciones en orden: h1 → p → p → p → p → p → p → p → p → p

**Carrito** — secciones en orden: Carrousel 3 → ol.products.list.items → div#narrow-by-list.filter-options.mage-accordion-disabled

**Página interna** — secciones en orden: TE → ol.products.list.items → div#narrow-by-list.filter-options.mage-accordion-disabled

**Página** — secciones en orden: Ver mi credencial virtual

**Listado / categoría** — secciones en orden: BAZAR → img.image → ol.products.list.items → div#narrow-by-list.filter-options.mage-accordion-disabled

**Listado / categoría** — secciones en orden: DELI → ol.products.list.items → div#narrow-by-list.filter-options.mage-accordion-disabled

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.owl-stage | — | 488px (0.54 vh) | block | 15 img, 6 links |
| 2 | div.botones | Promos bancarias | 126px (0.14 vh) | flex, 4 col | 4 img, 4 links |
| 3 | div.productos-destacados.imperdibles.boxed-content | IMPERDIBLES WEB | 600px (0.67 vh) | block | 38 img, 152 links, 78 btn, 39 items |
| 4 | img | — | 291px (0.32 vh) | inline | — |
| 5 | div.productos-destacados.semana.boxed-content | ¡No te pierdas los destacados de la semana! | 600px (0.67 vh) | block | 36 img, 144 links, 74 btn, 37 items |
| 6 | div.banners-categorias | — | 446px (0.5 vh) | grid, 4 col | 4 img, 4 links |
| 7 | div.productos-destacados.combos.boxed-content | ¡Aprovechá los mejores combos! | 600px (0.67 vh) | block | 4 img, 16 links, 8 btn, 5 items |
| 8 | figure | — | 205px (0.23 vh) | block | 2 img, 1 links |

Alto total del home: 4364px (4.8 viewports). 8 bloques de primer nivel.

**Navegación principal**

- 15 ítems de primer nivel, 545 links en total, header `position: relative`.
  - OFERTAS
  - ALMACEN → submenú con 218 links
  - BEBIDAS CON ALCOHOL → submenú con 45 links
  - BEBIDAS SIN ALCOHOL → submenú con 25 links
  - LIMPIEZA → submenú con 63 links
  - PERFUMERIA → submenú con 50 links
  - BAZAR → submenú con 10 links
  - PANIFICADOS → submenú con 14 links
  - ROTISERIA → submenú con 6 links
  - LACTEOS Y FRESCOS → submenú con 20 links
  - FIAMBRERIA → submenú con 34 links
  - CARNICERIA → submenú con 18 links

**Footer**: 2 columnas, 24 links, 3 redes.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| prices | 1002 | formateo de moneda centralizado (Intl.NumberFormat es-AR) |
| links | 926 | links internos con el router, externos con `rel="noopener"` |
| badges | 396 | componente `Badge` con variantes semánticas |
| inputs | 322 | componente `Input` con label obligatorio |
| buttons | 169 | un solo componente `Button` con variantes |
| addToCart | 156 | estado optimista + feedback accesible al agregar |
| carousels | 119 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| images | 117 | componente de imagen optimizada (AVIF/WebP + sizes) |
| forms | 80 | validación accesible con mensajes asociados al campo |
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
- Form 2 — POST → `https://menorcoste.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly9tZW5vcmNvc3RlLmNvbS5hci8~/product/55932/`, submit "Agregar": product (hidden), uenc (hidden), form_key (hidden), qty (text)
- Form 3 — POST → `https://menorcoste.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly9tZW5vcmNvc3RlLmNvbS5hci8~/product/55955/`, submit "Agregar": product (hidden), uenc (hidden), form_key (hidden), qty (text)
- Form 4 — POST → `https://menorcoste.com.ar/checkout/cart/add/uenc/aHR0cHM6Ly9tZW5vcmNvc3RlLmNvbS5hci8~/product/56001/`, submit "Agregar": product (hidden), uenc (hidden), form_key (hidden), qty (text)

**Carruseles**: 8 en el home (custom/desconocido, Owl), con 69/45/45/1/1/1/1/1 slides. 

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 400, 460, 479, 481, 639, 640, 767, 768, 769, 860, 897, 900, 991, 1024, 1025, 1185, 1200, 1400, 1440, 1500, 1520, 1700
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1024px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1280px, centrado, con padding lateral 15px / 15px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | 4 | 0 | 171 | 32px |
| 390px | 4 | 0 | 145 | 32px |
| 768px | — | 0 | 172 | 32px |
| 1024px | — | 0 | 169 | 32px |
| 1280px | — | 0 | 109 | 32px |
| 1440px | 4 | 0 | 109 | 32px |
| 1920px | 4 | 0 | 109 | 32px |

- De 360px a 390px: header 171px → 145px
- De 390px a 768px: cards por fila 4 → null; header 145px → 172px; alto de página 6.1 → 4.3 viewports
- De 768px a 1024px: header 172px → 169px
- De 1024px a 1280px: desaparece hamburguesa (menú completo); header 169px → 109px
- De 1280px a 1440px: cards por fila null → 4

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.3s, 0.5s, 0.4s · easings: ease, ease-in, ease-in-out
- Propiedades animadas: all, opacity, color, height, margin
- En `:hover` cambian: color, background-color, background-image, border-bottom-color, border-left-color
- 119 elementos con transición y 26 con animación; 32 `@keyframes` declarados.
- Animación al hacer scroll en el original: clases de reveal/animate: 2. Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 10354 caracteres de texto visible, 117 imágenes y 926 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD.
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Accesibilidad: el original tiene 3 de 117 imágenes sin `alt`. En la nueva app, `alt` es obligatorio (vacío solo si es decorativa).
2. Formularios: 1 de 83 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
3. Jerarquía de encabezados con saltos (el primer heading es h3, no h1). Respetar h1 → h2 → h3 sin saltear niveles.
4. El original tiene 0 `h1`. Usar exactamente uno por página.
5. 800 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
6. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
7. Contraste: 2 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
8. Rendimiento: 39 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
9. 1 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
10. 39 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
11. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
12. CLS del original: 0.5577 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
13. El original hace 418 requests (1314 KB) desde 6 dominios de terceros. Reducir terceros y agrupar assets propios.
14. DOM de 6631 nodos y 29 niveles de profundidad. Apuntar a menos de 1500 nodos por vista y estructura más plana.
15. Táctil: 191 de 356 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
16. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
17. SEO: no hay datos estructurados JSON-LD. Agregar Organization/WebSite y Product o Article según corresponda.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-footer.png)
[Header](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/menorcoste.com.ar/00-home/05-componentes/zone-hero.png)
[Botón variante 1](../../shots/menorcoste.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/menorcoste.com.ar/00-home/05-componentes/boton-02.png)
[Input variante 1](../../shots/menorcoste.com.ar/00-home/05-componentes/input-01.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.5577 | < 0.1 |
| FCP | 1884 ms | < 1800 ms |
| TTFB | 265 ms | < 800 ms |
| Requests | 418 | < 251 |
| Peso transferido | 1314 KB | < 788 KB |
| Nodos DOM | 6631 | < 3979 |
| Imágenes sin alt | 3 | 0 |
| Inputs sin label | 1 | 0 |
| Fallos de contraste AA | 2 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil desktop, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 67/100 | ≥ 90 |
| Accesibilidad | 85/100 | ≥ 95 |
| Best practices | 96/100 | ≥ 95 |
| SEO | 83/100 | ≥ 95 |
| LCP | 5.9 s | < 2,5 s |
| TBT | 10 ms | < 200 ms |
| CLS | 0.005 | < 0,1 |
| Speed Index | 2.9 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Serve images in next-gen formats (ahorro estimado 730 ms) (5155 KB)
- Initial server response time was short (ahorro estimado 341 ms)
- Reduce unused CSS (ahorro estimado 180 ms) (123 KB)
- Eliminate render-blocking resources (ahorro estimado 133 ms)
- Properly size images (ahorro estimado 70 ms) (841 KB)
- Reduce unused JavaScript (ahorro estimado 20 ms) (37 KB)

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
