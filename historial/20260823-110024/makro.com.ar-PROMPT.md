# Prompt de construcción — makro.com.ar

_Generado a partir del análisis automatizado de https://makro.com.ar/ el 2026-08-23T14:00:22.376Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **makro.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Home - Makro > Tu mejor aliado — Makro. Tu mejor aliado. Las mejores ofertas para tu ahorro total. Promociones bancarias. Probá nuestras marcas propias.

## 2. Stack y decisiones técnicas

Detectado en el original: jquery, wordpress · WooCommerce, Divi, Swiper, Google Fonts, Google Tag Manager, Google Analytics, Meta Pixel

- El original es WordPress: reemplazar por **Next.js (App Router)** consumiendo el contenido vía API/headless, o mantener WP solo como CMS.
- Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio).
- Es un e-commerce: prever catálogo, ficha de producto, carrito y checkout. Datos vía API; no hardcodear productos.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#ffffff` | 118 elementos |
| surface-2 | `#e1e4ed` | 13 elementos |
| surface-3 | `#d9272e` | 5 elementos |
| surface-4 | `#b4b9c9` | 4 elementos |
| surface-5 | `#d8d8d8` | 4 elementos |
| text-1 (texto base) | `#000000` | 671 elementos |
| text-2 | `#ffffff` | 67 elementos |
| text-3 | `#6d758f` | 63 elementos |
| text-4 | `#010101` | 11 elementos |
| border-1 | `#e1e4ed` | 4 elementos |
| border-2 | `#f1f3f7` | 3 elementos |

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: Inter, Helvetica, Arial, Lucida, sans-serif, Inter, Sora, Helvetica, Arial, Lucida, sans-serif
- Escala de tamaños en uso: 12px · 14px · 16px · 18px · 20px · 24px · 41px
- Pesos: 500, 700, 600, 800, 400
- Line-heights: 23.8px, 26px, 0px, 16px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 14px | 500 | 23.8px |
| h2 | 41px | 800 | 41px |
| h4 | 16px | 800 | 16px |
| p | 16px | 500 | normal |

Fuentes propias declaradas: ETmodules (400, font-display: block) · FontAwesome (400, font-display: block) · FontAwesome (900, font-display: block) · FontAwesome (400, font-display: block). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 4 familias, 9 tamaños, 6 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 3px · 8px · 10px · 13px · 50% · 100px
- Gaps de grilla/flex: —
- Paddings más usados: 10px 5%, 0px 5px, 14px, 14px 20px, 14px 5%
- Sombras: `rgba(0, 0, 0, 0.1) 0px 2px 5px 0px` · `rgba(0, 0, 0, 0.3) 0px 2px 18px 0px` · `rgba(25, 33, 61, 0.12) 0px 1px 10px 0px`
- Ancho de contenedor: 1440px, 3000px · padding lateral: 0px / 0px, 106px / 106px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Mapa de páginas a construir

| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |
| --- | --- | --- | --- | --- |
| Home | `/` | 7 | 139 carruseles | 0 |
| Listado / categoría | `/tiendas/` | 28 | 1 tablas | 0 |
| Contacto / sucursales | `/contacto/` | 3 | — | 1 |
| Ayuda / legales | `/preguntas-frecuentes/` | 5 | — | 0 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Listado / categoría** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → img.wp-image-9309.lazy.entered → div#wpgmza_map_1.wpgmza_map.wpgmza-auto-left.wpgmza-initialized → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder

**Contacto / sucursales** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → Contactanos → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Ayuda / legales** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → img.wp-image-1941.lazy.entered → Preguntas Frecuentes → div.et_pb_module.et_pb_accordion.et_pb_accordion_0 → DESCUBRÍ LO QUE MAKRO TE OFRECE

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header | — | 180px (0.2 vh) | block | 1 img, 58 links, 60 items |
| 2 | div#swiper-wrapper-3a7f2ebde4ad0d44.swiper-wrapper | — | 355px (0.39 vh) | flex, 8 col | 8 img |
| 3 | div.et_pb_section.et_pb_section_1.et_section_regular | LAS MEJORES OFERTAS PARA TU AHORRO TOTAL | 777px (0.86 vh) | block | 13 img, 1 links, 7 btn |
| 4 | div.et_pb_section.et_pb_section_2.et_section_regular | PROMOCIONES BANCARIAS | 178px (0.2 vh) | block | 8 links |
| 5 | div.et_pb_section.et_pb_section_3.df-area | — | 817px (0.91 vh) | block | 14 img, 14 links |
| 6 | div.et_pb_section.et_pb_section_4.et_section_regular | PROBÁ NUESTRAS MARCAS PROPIAS | 917px (1.02 vh) | block | 14 img, 2 links, 6 btn |
| 7 | div.et_builder_inner_content.et_pb_gutters3 | DESCUBRÍ LO QUE MAKRO TE OFRECE | 993px (1.1 vh) | block | 5 img, 20 links, 16 items |

Alto total del home: 4251px (4.7 viewports). 7 bloques de primer nivel.

**Navegación principal**

- 8 ítems de primer nivel, 13 links en total, header `position: static`.
  - Ofertas → submenú con 4 links
  - Cómo comprar
  - Sucursales
  - Marcas Propias
  - Ventas Corporativas
  - Somos Makro → submenú con 2 links
  - Suscribite
  - Contactanos

**Footer**: 1 columnas, 20 links, 4 redes.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| carousels | 139 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| links | 131 | links internos con el router, externos con `rel="noopener"` |
| images | 64 | componente de imagen optimizada (AVIF/WebP + sizes) |
| buttons | 41 | un solo componente `Button` con variantes |
| pagination | 25 | links reales navegables, no solo JS |
| badges | 2 | componente `Badge` con variantes semánticas |
| cards | 1 | componente `Card` con variantes |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 15 | `rgb(255, 255, 255)` | `rgb(0, 0, 0)` | 50% | 0px | 0px | 500 |
| secondary | 7 | `rgba(0, 0, 0, 0)` | `rgb(0, 0, 0)` | 0px | 4.8px 16px | 16px | 500 |
| ghost | 4 | `rgb(216, 216, 216)` | `rgb(0, 0, 0)` | 100px | 20px | 14px | 500 |
| alt-2 | 1 | `rgb(37, 211, 102)` | `rgb(255, 255, 255)` | 24px | 4.8px 32px 4.8px 11.2px | 16px | 500 |
| alt-3 | 1 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 8px | 14px 40px | 18px | 500 |
| alt-4 | 1 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 5px 5px 0px 0px | 4.8px 16px | 16px | 500 |

El original tiene 7+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Variantes de card**

| Variante | Usos | Fondo | Radio | Sombra | Padding | Tamaño típico |
| --- | --- | --- | --- | --- | --- | --- |
| card-1 | 1 | `rgba(0, 0, 0, 0)` | 0px | sin sombra | 0px | 1440x3078 |

**Carruseles**: 8 en el home (custom/desconocido, Swiper), con 10/8/8/0/0/0/0/0 slides. Alguno tiene autoplay: en la nueva app el autoplay debe poder pausarse y respetar `prefers-reduced-motion`.

## 5b. Catálogo y modelo de datos

El sitio muestra **4** cards de producto con **1** campos en promedio, 4 por fila, de 240x160.

| Campo | Cards que lo muestran | Obligatorio en el modelo |
| --- | --- | --- |
| imagen | 4 | sí |

**Modelo de negocio detectado:**

- Los precios están detrás de login: prever precios por cliente y contenido condicionado a la sesión.
- Vocabulario del rubro presente: mayorista, cuit, sucursal, iva.

**Orden de los campos en la card** (240x156, radio 0px, padding 0px): imagen

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 479, 767, 768, 980, 981, 1800
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1024px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1440px, centrado, con padding lateral 0px / 0px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 0 | 74 | 22px |
| 390px | — | 0 | 74 | 22px |
| 768px | — | 0 | 80 | 30px |
| 1024px | — | 0 | 152 | 41px |
| 1280px | — | 0 | 174 | 41px |
| 1440px | — | 0 | 180 | 41px |
| 1920px | — | 0 | 180 | 41px |

- De 390px a 768px: h1 22px → 30px; header 74px → 80px; alto de página 5.2 → 3.7 viewports
- De 768px a 1024px: h1 30px → 41px; header 80px → 152px
- De 1024px a 1280px: header 152px → 174px
- De 1280px a 1440px: header 174px → 180px

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.2s, 0.2s, 0.3s, 0.4s · easings: ease-in-out, ease
- Propiedades animadas: opacity, background-color, all, color, transform
- En `:hover` cambian: color, background-color, padding-left, padding-right, opacity
- 117 elementos con transición y 5 con animación; 30 `@keyframes` declarados.
- Animación al hacer scroll en el original: clases de reveal/animate: 5. Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- En hover, los botones del original cambian: backgroundColor, color, borderRadius, outlineColor, borderTopColor. Replicar ese tipo de respuesta, no necesariamente los valores.
- Foco de teclado del original: **inexistente**, hay que agregarlo.
- Filtros: panel que se abre con un botón, undefined checkboxes.
- Carrito: popover de undefined a la undefined.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 1849 caracteres de texto visible, 64 imágenes y 131 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: WebPage, BreadcrumbList, WebSite, Organization).
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.
- Propuestas de valor que ya comunica: "Contactanos" · "LAS MEJORES OFERTAS PARA TU AHORRO TOTAL" · "VER MÁS PRODUCTOS" · "PROMOCIONES BANCARIAS"
- CTAs en uso: "Go to slide 1" (3) · "Go to slide 2" (3) · "Go to slide 3" (3) · "Go to slide 4" (3) · "Go to slide 5" (2) · "Domingo" (1) · "Go to slide 6" (1) · "Jueves" (1). Mantener el mismo vocabulario para no confundir al usuario.
- Promesas que hay que sostener en la app nueva: atención al cliente, garantía, newsletter.
- Taxonomía de la navegación: Cómo comprar · Marcas Propias · Ventas Corporativas · Somos Makro · Suscribite
- Tono: formal (usted), 17.5 palabras por oración, 29.3% de mayúsculas sostenidas. Escribir los textos nuevos con ese registro.

## 9. Mejoras obligatorias respecto del original

1. Jerarquía de encabezados con saltos (el primer heading es h4, no h1; salto h2 → h4 en "Marcas exclusivas de calidad"). Respetar h1 → h2 → h3 sin saltear niveles.
2. El original tiene 0 `h1`. Usar exactamente uno por página.
3. 166 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
4. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
5. Contraste: 2 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
6. Rendimiento: 41 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
7. 30 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
8. 64 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
9. CLS del original: 0.4415 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
10. El original hace 123 requests (3430 KB) desde 14 dominios de terceros. Reducir terceros y agrupar assets propios.
11. Táctil: 32 de 60 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
12. Animaciones: el original ignora `prefers-reduced-motion`. Respetarlo y desactivar movimiento no esencial.
13. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Carrusel](../../shots/makro.com.ar/00-home/05-componentes/zone-carousel.png)
[Footer](../../shots/makro.com.ar/00-home/05-componentes/zone-footer.png)
[Header](../../shots/makro.com.ar/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/makro.com.ar/00-home/05-componentes/zone-hero.png)
[Botón variante 1](../../shots/makro.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/makro.com.ar/00-home/05-componentes/boton-02.png)
[Botón variante 3](../../shots/makro.com.ar/00-home/05-componentes/boton-03.png)
[Botón variante 4](../../shots/makro.com.ar/00-home/05-componentes/boton-04.png)
[Botón variante 5](../../shots/makro.com.ar/00-home/05-componentes/boton-05.png)
[Botón variante 6](../../shots/makro.com.ar/00-home/05-componentes/boton-06.png)
[Botón variante 7](../../shots/makro.com.ar/00-home/05-componentes/boton-07.png)
[Card variante 1](../../shots/makro.com.ar/00-home/05-componentes/card-01.png)
[Foco de teclado en el botón principal](../../shots/makro.com.ar/00-home/06-estados/foco-teclado.png)
[Botón 2 en hover](../../shots/makro.com.ar/00-home/06-estados/hover-boton-2.png)
[Botón 3 en hover](../../shots/makro.com.ar/00-home/06-estados/hover-boton-3.png)
[Menú de categorías desplegado](../../shots/makro.com.ar/00-home/06-estados/menu-desplegado.png)
[Card de producto 1](../../shots/makro.com.ar/00-home/05-componentes/producto-1.png)
[Card de producto 2](../../shots/makro.com.ar/00-home/05-componentes/producto-2.png)
[Card de producto 3](../../shots/makro.com.ar/00-home/05-componentes/producto-3.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.4415 | < 0.1 |
| FCP | 1424 ms | < 1800 ms |
| TTFB | 150 ms | < 800 ms |
| Requests | 123 | < 74 |
| Peso transferido | 3430 KB | < 2058 KB |
| Nodos DOM | 966 | < 1200 |
| Imágenes sin alt | 0 | 0 |
| Inputs sin label | 0 | 0 |
| Fallos de contraste AA | 2 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil mobile, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 36/100 | ≥ 90 |
| Accesibilidad | 81/100 | ≥ 95 |
| Best practices | 79/100 | ≥ 95 |
| SEO | 85/100 | ≥ 95 |
| LCP | 12.9 s | < 2,5 s |
| TBT | 1,270 ms | < 200 ms |
| CLS | 0.022 | < 0,1 |
| Speed Index | 6.6 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Eliminate render-blocking resources (ahorro estimado 2801 ms)
- Reduce unused JavaScript (ahorro estimado 1190 ms) (267 KB)
- Properly size images (ahorro estimado 150 ms) (164 KB)
- Reduce unused CSS (25 KB)

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
