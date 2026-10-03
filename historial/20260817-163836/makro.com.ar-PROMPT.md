# Prompt de construcción — makro.com.ar

_Generado a partir del análisis automatizado de https://makro.com.ar/ el 2026-08-17T19:38:33.670Z._

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
| surface-1 (fondo base) | `#ffffff` | 87 elementos |
| surface-2 | `#e1e4ed` | 13 elementos |
| surface-3 | `#d9272e` | 5 elementos |
| surface-4 | `#b4b9c9` | 4 elementos |
| surface-5 | `#000000` | 2 elementos |
| text-1 (texto base) | `#000000` | 583 elementos |
| text-2 | `#ffffff` | 73 elementos |
| text-3 | `#6d758f` | 63 elementos |
| text-4 | `#010101` | 10 elementos |
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
| Home | `/` | 7 | 99 carruseles | 0 |
| Listado / categoría | `/tiendas/` | 28 | 1 tablas | 0 |
| Contacto / sucursales | `/contacto/` | 3 | — | 1 |
| Ayuda / legales | `/preguntas-frecuentes/` | 5 | — | 0 |
| Página interna | `/cultura-makro/sustentabilidad/` | 3 | — | 0 |
| Página | `/ofertas/` | 4 | — | 0 |
| Ayuda / legales | `/terminos-condiciones/` | 40 | — | 0 |
| Ayuda / legales | `/terminos-condiciones-registracion/` | 3 | — | 0 |
| Página interna | `/revista/gastronomicos/` | 3 | — | 0 |
| Página interna | `/et_tb_item_type/template/` | 7 | 99 carruseles | 0 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Listado / categoría** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → img.wp-image-9309.lazy.entered → div#wpgmza_map_1.wpgmza_map.wpgmza-auto-left.wpgmza-initialized → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder → div.wpgmza-basic-listing-content-holder

**Contacto / sucursales** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → Contactanos → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Ayuda / legales** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → img.wp-image-1941.lazy.entered → Preguntas Frecuentes → div.et_pb_module.et_pb_accordion.et_pb_accordion_0 → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Página interna** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → La sustentabilidad como un pilar en nuestra estrategia → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Página** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → img.wp-image-9307.lazy.entered → Ofertas semanales del 13/08 al 19/08 → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Ayuda / legales** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → h2 → h3 → p → h3 → p → p → p → h3 → p

**Ayuda / legales** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → Términos y Condiciones de Registración → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Página interna** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → Ofertas Gastronómicas del 13/08 al 26/08 → DESCUBRÍ LO QUE MAKRO TE OFRECE

**Página interna** — secciones en orden: div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header → div#swiper-wrapper-f97f10e76305b6ddd.swiper-wrapper → LAS MEJORES OFERTAS PARA TU AHORRO TOTAL → PROMOCIONES BANCARIAS → div.et_pb_section.et_pb_section_3.df-area → PROBÁ NUESTRAS MARCAS PROPIAS → DESCUBRÍ LO QUE MAKRO TE OFRECE

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div#section-visible-ontop.et_pb_with_border.et_pb_section.et_pb_section_0_tb_header | — | 180px (0.2 vh) | block | 1 img, 58 links, 60 items |
| 2 | div#swiper-wrapper-745cb307e3ae797f.swiper-wrapper | — | 351px (0.39 vh) | flex, 6 col | 6 img |
| 3 | div.et_pb_section.et_pb_section_1.et_section_regular | LAS MEJORES OFERTAS PARA TU AHORRO TOTAL | 771px (0.86 vh) | block | 16 img, 1 links, 10 btn |
| 4 | div.et_pb_section.et_pb_section_2.et_section_regular | PROMOCIONES BANCARIAS | 177px (0.2 vh) | block | 8 links |
| 5 | div.et_pb_section.et_pb_section_3.df-area | — | 809px (0.9 vh) | block | 14 img, 14 links |
| 6 | div.et_pb_section.et_pb_section_4.et_section_regular | PROBÁ NUESTRAS MARCAS PROPIAS | 283px (0.31 vh) | block | 2 img, 2 links |
| 7 | div.et_builder_inner_content.et_pb_gutters3 | DESCUBRÍ LO QUE MAKRO TE OFRECE | 991px (1.1 vh) | block | 5 img, 20 links, 16 items |

Alto total del home: 3596px (4 viewports). 7 bloques de primer nivel.

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
| links | 131 | links internos con el router, externos con `rel="noopener"` |
| carousels | 99 | accesible por teclado, con pausa; considerar scroll-snap en lugar de librería |
| images | 51 | componente de imagen optimizada (AVIF/WebP + sizes) |
| buttons | 34 | un solo componente `Button` con variantes |
| pagination | 19 | links reales navegables, no solo JS |
| badges | 2 | componente `Badge` con variantes semánticas |
| cards | 1 | componente `Card` con variantes |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 12 | `rgb(255, 255, 255)` | `rgb(0, 0, 0)` | 50% | 0px | 0px | 500 |
| secondary | 7 | `rgba(0, 0, 0, 0)` | `rgb(0, 0, 0)` | 0px | 4.8px 16px | 16px | 500 |
| ghost | 2 | `rgb(216, 216, 216)` | `rgb(0, 0, 0)` | 100px | 20px | 14px | 500 |
| alt-2 | 1 | `rgb(37, 211, 102)` | `rgb(255, 255, 255)` | 24px | 4.8px 32px 4.8px 11.2px | 16px | 500 |
| alt-3 | 1 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 8px | 14px 40px | 18px | 500 |
| alt-4 | 1 | `rgb(0, 0, 0)` | `rgb(255, 255, 255)` | 5px 5px 0px 0px | 4.8px 16px | 16px | 500 |

El original tiene 7+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Variantes de card**

| Variante | Usos | Fondo | Radio | Sombra | Padding | Tamaño típico |
| --- | --- | --- | --- | --- | --- | --- |
| card-1 | 1 | `rgba(0, 0, 0, 0)` | 0px | sin sombra | 0px | 1425x2425 |

**Carruseles**: 8 en el home (custom/desconocido, Swiper), con 8/6/6/0/0/0/0/0 slides. Alguno tiene autoplay: en la nueva app el autoplay debe poder pausarse y respetar `prefers-reduced-motion`.

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
| 1024px | — | 0 | 150 | 41px |
| 1280px | — | 0 | 173 | 41px |
| 1440px | — | 0 | 180 | 41px |
| 1920px | — | 0 | 180 | 41px |

- De 390px a 768px: h1 22px → 30px; header 74px → 80px; alto de página 5.3 → 3.5 viewports
- De 768px a 1024px: h1 30px → 41px; header 80px → 150px
- De 1024px a 1280px: header 150px → 173px
- De 1280px a 1440px: header 173px → 180px

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.2s, 0.2s, 0.3s, 0.4s · easings: ease-in-out, ease
- Propiedades animadas: opacity, background-color, all, color, transform
- En `:hover` cambian: color, background-color, padding-left, padding-right, opacity
- 116 elementos con transición y 5 con animación; 30 `@keyframes` declarados.
- Animación al hacer scroll en el original: clases de reveal/animate: 5. Reimplementar con `IntersectionObserver` liviano, animando solo `transform` y `opacity`.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 1831 caracteres de texto visible, 51 imágenes y 131 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD (el original usa: WebPage, BreadcrumbList, WebSite, Organization).
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Jerarquía de encabezados con saltos (el primer heading es h4, no h1; salto h2 → h4 en "Marcas exclusivas de calidad"). Respetar h1 → h2 → h3 sin saltear niveles.
2. El original tiene 0 `h1`. Usar exactamente uno por página.
3. 159 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
4. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
5. Contraste: 2 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
6. Rendimiento: 28 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
7. 28 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
8. 51 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
9. CLS del original: 0.3468 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
10. Táctil: 32 de 55 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
11. Animaciones: el original ignora `prefers-reduced-motion`. Respetarlo y desactivar movimiento no esencial.
12. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.

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

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.3468 | < 0.1 |
| FCP | 2116 ms | < 1800 ms |
| TTFB | 150 ms | < 800 ms |
| Requests | 75 | < 45 |
| Peso transferido | 2316 KB | < 1390 KB |
| Nodos DOM | 886 | < 1200 |
| Imágenes sin alt | 0 | 0 |
| Inputs sin label | 0 | 0 |
| Fallos de contraste AA | 2 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil desktop, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 21/100 | ≥ 90 |
| Accesibilidad | 81/100 | ≥ 95 |
| Best practices | 78/100 | ≥ 95 |
| SEO | 85/100 | ≥ 95 |
| LCP | 4.4 s | < 2,5 s |
| TBT | 550 ms | < 200 ms |
| CLS | 0.346 | < 0,1 |
| Speed Index | 4.1 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Eliminate render-blocking resources (ahorro estimado 1247 ms)
- Reduce unused JavaScript (ahorro estimado 70 ms) (252 KB)
- Properly size images (362 KB)

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
