# Prompt de síntesis — estética de referencias + estructura del cliente

_Generado el 2026-08-23T14:10:35.377Z a partir de 5 sitio(s) analizado(s)._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación.

## 0. Punto de partida

| Rol | Sitio | Qué aporta al proyecto |
| --- | --- | --- |
| Cliente | hergo.com.ar | Estructura, contenido, funcionalidad y línea base a superar |
| Referencia | yaguar.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | vital.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | makro.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | menorcoste.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |

**Regla de oro:** replicar el *lenguaje visual* de las referencias, no su contenido. Nada de logos, marcas, fotos, textos ni nombres de producto de los sitios analizados. Cualquier coincidencia literal con una referencia es un error.

## 1. Objetivo

Construir una aplicación web con una estética coherente con las 4 referencia(s) analizada(s), replicando la arquitectura de información y las funcionalidades de **hergo.com.ar**, con mejor rendimiento y accesibilidad que todos los sitios analizados.

## 2. Estética en común entre las referencias

Cada valor indica en cuántas referencias aparece. Lo que está en la mayoría define el estilo; lo que aparece en una sola es una opción, no una regla.

### 2.1 Color

**Neutros compartidos** (base de superficies y texto):

| Color | Referencias | Usos totales | Dónde |
| --- | --- | --- | --- |
| `#ffffff` | 4/4 | 341 | yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar |
| `#f5f5f5` | 3/4 | 204 | yaguar.com.ar, vital.com.ar, menorcoste.com.ar |
| `#000000 (0.60)` | 3/4 | 26 | yaguar.com.ar, vital.com.ar, makro.com.ar |

**Acentos de cada referencia** (elegir uno como color de marca, o el que indique el cliente):

| Color | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| `#3ebd4e` | 2/4 | 11 | yaguar.com.ar, vital.com.ar |
| `#02b156` | 1/4 | 96 | menorcoste.com.ar |
| `#d81d14` | 1/4 | 34 | yaguar.com.ar |
| `#134b95` | 1/4 | 8 | vital.com.ar |
| `#08774d` | 1/4 | 6 | menorcoste.com.ar |
| `#003d9e` | 1/4 | 5 | vital.com.ar |
| `#d9272e` | 1/4 | 5 | makro.com.ar |
| `#00bf27` | 1/4 | 4 | yaguar.com.ar |
| `#ed1c24` | 1/4 | 4 | vital.com.ar |
| `#25d366` | 1/4 | 1 | makro.com.ar |

**Colores de texto más usados:**

| Color | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| `#ffffff` | 4/4 | 1145 | yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar |
| `#000000` | 4/4 | 818 | yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar |
| `#333333` | 2/4 | 4077 | yaguar.com.ar, menorcoste.com.ar |
| `#666666` | 2/4 | 693 | makro.com.ar, menorcoste.com.ar |
| `#33373d` | 2/4 | 159 | yaguar.com.ar, vital.com.ar |
| `#f8f9fa` | 2/4 | 12 | vital.com.ar, makro.com.ar |

Definir la paleta como variables CSS con roles (`--surface`, `--surface-alt`, `--text`, `--text-muted`, `--accent`, `--border`), no como colores sueltos. Todo par texto/fondo debe cumplir WCAG AA (4.5:1 en texto normal, 3:1 en texto grande) — ver sección 6.

### 2.2 Tipografía

| Familia | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| Montserrat, sans-serif | 2/4 | 2122 | yaguar.com.ar, vital.com.ar |
| Commissioner, "Helvetica Neue", Helvetica, Arial, sans-serif | 1/4 | 5673 | menorcoste.com.ar |
| Inter, Helvetica, Arial, Lucida, sans-serif | 1/4 | 788 | makro.com.ar |
| Roboto, sans-serif | 1/4 | 614 | vital.com.ar |
| FontAwesome | 1/4 | 175 | menorcoste.com.ar |
| "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif | 1/4 | 91 | menorcoste.com.ar |
| -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | 1/4 | 33 | yaguar.com.ar |
| Inter | 1/4 | 26 | makro.com.ar |

**Escala de tamaños presente en la mayoría:** 12px · 14px · 16px · 20px

**Escala completa observada:** 10px · 11px · 11.05px · 11.2px · 12px · 12.6px · 12.8px · 13px · 13.5px · 14px · 15px · 15.2px · 16px · 16.8px · 17px · 18px · 19px · 19.6px · 20px · 21px · 22px · 24px · 25px · 26px · 28px · 30px · 31.5px · 32px · 40px · 41px · 44px · 50px · 56px

**Pesos:** 400 (4/4) · 700 (4/4) · 600 (4/4) · 500 (3/4) · 900 (2/4)

**Line-heights:** normal · 20px · 24px · 18px

Escala tipográfica de cada referencia, para elegir el carácter (más contraste = más editorial, menos contraste = más utilitario):

| Referencia | body | h1 | h2 | h3 | Familia principal |
| --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | 16px | — | 28px/600 | — | Montserrat, sans-serif |
| vital.com.ar | 16px | 40px/500 | 40px/600 | 40px/600 | Roboto, sans-serif |
| makro.com.ar | 14px | — | 41px/800 | — | Inter, Helvetica, Arial, Lucida, sans-serif |
| menorcoste.com.ar | 14px | — | 56px/700 | 16.8px/400 | Commissioner, "Helvetica Neue", Helvetica, Arial, sans-serif |

### 2.3 Forma, espaciado y elevación

**Radios:** 1px (1/4) · 2px (1/4) · 3px (3/4) · 4.8px (1/4) · 8px (2/4) · 10px (1/4) · 12px (2/4) · 13px (1/4) · 30px (2/4) · 50px (1/4) · 100px (3/4) · 800px (1/4)

Usar una escala de 3 radios como máximo. Los que se repiten entre referencias son: 3px · 8px · 12px.

**Gaps de grilla:** 2px · 4px · 5px · 6px · 7px · 8px · 10px · 15px

**Ancho de contenedor:** 1440px (1/4) · 1100px (1/4) · 1280px (1/4) · 1200px (1/4)

**Sombras más usadas:**

| box-shadow | Referencias | Usos |
| --- | --- | --- |
| `rgba(0, 0, 0, 0.08) 0px 2px 12px 0px` | 1/4 | 25 |
| `rgba(0, 0, 0, 0.15) 0px 2px 10px 0px` | 1/4 | 8 |
| `rgba(0, 0, 0, 0.2) 0px 3px 15px 0px` | 1/4 | 6 |
| `rgba(0, 0, 0, 0.15) 0px 8px 16px 0px` | 1/4 | 6 |
| `rgba(0, 0, 0, 0.1) 0px 2px 5px 0px` | 1/4 | 6 |

Normalizar en 3 niveles de elevación: sutil para cards, media para menús y popovers, fuerte para modales.

### 2.4 Componentes: qué usan las referencias

| Componente | Referencias que lo usan | Promedio por sitio | Conclusión |
| --- | --- | --- | --- |
| badges | 4/4 | 114 | obligatorio: lo usan todas |
| carousels | 4/4 | 95 | obligatorio: lo usan todas |
| buttons | 4/4 | 74 | obligatorio: lo usan todas |
| banners | 4/4 | 56 | obligatorio: lo usan todas |
| social | 4/4 | 11 | obligatorio: lo usan todas |
| modals | 3/4 | 16 | esperable en el rubro |
| pagination | 3/4 | 12 | esperable en el rubro |
| prices | 2/4 | 591 | opcional |
| cards | 2/4 | 13 | opcional |
| ratings | 2/4 | 7 | opcional |
| addToCart | 1/4 | 172 | opcional |
| accordions | 1/4 | 42 | opcional |
| tabs | 1/4 | 9 | opcional |
| search | 1/4 | 1 | opcional |

**Estilo de botón de cada referencia** (para definir el `Button` primario):

| Referencia | Fondo | Texto | Radio | Padding | Tamaño | Peso | Sombra |
| --- | --- | --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | `rgba(0, 0, 0, 0.6)` | `rgb(255, 255, 255)` | 50% | 0px | 18px | 600 | con sombra |
| vital.com.ar | `rgba(0, 0, 0, 0)` | `rgb(248, 249, 250)` | 800px | 4px 24px | 20px | 300 | sin sombra |
| makro.com.ar | `rgb(255, 255, 255)` | `rgb(0, 0, 0)` | 50% | 0px | 0px | 500 | sin sombra |
| menorcoste.com.ar | `rgb(2, 177, 86)` | `rgba(0, 0, 0, 0)` | 0px 4px 4px 0px | 0px | 0px | 600 | sin sombra |

**Estilo de card de cada referencia:**

| Referencia | Fondo | Radio | Sombra | Padding | Tamaño típico |
| --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | `rgb(255, 255, 255)` | 12px | con sombra | 0px | 264x364 |
| makro.com.ar | `rgba(0, 0, 0, 0)` | 0px | sin sombra (borde) | 0px | 1440x3078 |

### 2.5 Layout y densidad

| Referencia | Secciones | Alto del home | Header | Hamburguesa desde | Cards/fila @1440 | grid vs flex | Nodos DOM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | 11 | 5.4 viewports | static | 1920px | 8 | 1 / 758 | 2393 |
| vital.com.ar | 8 | 5.6 viewports | relative | 390px | — | 1 / 78 | 821 |
| makro.com.ar | 7 | 4.7 viewports | static | — | — | 0 / 119 | 966 |
| menorcoste.com.ar | 8 | 4.9 viewports | relative | 1024px | 4 | 1 / 587 | 7095 |

**Breakpoints que comparten las referencias:** 767px (4/4) · 768px (4/4) · 479px (3/4) · 1200px (3/4) · 460px (2/4) · 576px (2/4) · 640px (2/4) · 769px (2/4) · 900px (2/4) · 991px (2/4) · 992px (2/4) · 1024px (2/4)

Implementar con 640 / 768 / 1024 / 1280 / 1536 y verificar además 360px. Sin scroll horizontal en ningún ancho entre 320 y 1920.

### 2.6 Movimiento

**Duraciones:** 0.3s (4/4) · 0.4s (4/4) · 0.3s, 0.3s (2/4) · 0.5s (2/4) · 0.2s (2/4)

**Easings:** ease · ease-in-out · ease-out · ease-in

**Qué cambia en hover:** color · background-color · background-image · background-attachment · background-clip · background-origin

Referencias con animación al scroll: yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar. Respetar siempre `prefers-reduced-motion` (3/4 referencias lo hacen).

## 3. Estructura y funcionalidad

El sitio actual del cliente (**hergo.com.ar**) es mucho más chico que las referencias: 1 página(s) analizada(s), 11 secciones, 0 cards de producto detectadas y 0 precios. No alcanza como base de arquitectura: **la estructura se toma de la referencia más completa (menorcoste.com.ar)** y del consenso del rubro.

Del sitio del cliente se conservan: identidad de marca, contenido institucional, textos propios e integraciones ya en uso (Google Tag Manager, Google Analytics). Lo que hay que construir de cero es todo el catálogo y su flujo.

| Sitio | Rol | Páginas | Secciones | Cards de producto | Precios | Nodos DOM |
| --- | --- | --- | --- | --- | --- | --- |
| hergo.com.ar | cliente | 1 | 11 | 0 | 0 | 296 |
| yaguar.com.ar | referencia | 4 | 11 | 4 | 75 | 2393 |
| vital.com.ar | referencia | 4 | 8 | 0 | 0 | 821 |
| makro.com.ar | referencia | 4 | 7 | 4 | 0 | 966 |
| menorcoste.com.ar | referencia | 4 | 8 | 86 | 1106 | 7095 |

**Páginas a construir:**

| Tipo | Ruta del original | Secciones | Formularios |
| --- | --- | --- | --- |
| Home | `/` | 8 | 88 |
| Listado / categoría | `/catalog/category/view/s/mate/id/25750/` | 2 | 3 |
| Ficha de producto | `/lacteos-y-frescos/productos-de-granja` | 2 | 5 |
| Contacto / sucursales | `/contact` | 2 | 3 |

**Secciones del home, en orden de scroll:**

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.owl-stage | — | 494px | block | 15 img, 6 links |
| 2 | div.botones | Promos bancarias | 126px | flex, 4 col | 4 img, 4 links |
| 3 | div.productos-destacados.imperdibles.boxed-content | IMPERDIBLES WEB | 600px | block | 40 img, 160 links, 41 items |
| 4 | img | — | 294px | inline | — |
| 5 | div.productos-destacados.semana.boxed-content | ¡No te pierdas los destacados de la semana! | 600px | block | 42 img, 168 links, 43 items |
| 6 | div.banners-categorias | — | 451px | grid, 4 col | 4 img, 4 links |
| 7 | div.productos-destacados.combos.boxed-content | ¡Aprovechá los mejores combos! | 600px | block | 4 img, 16 links, 5 items |
| 8 | figure | — | 205px | block | 2 img, 1 links |

**Navegación:** 15 ítems de primer nivel: OFERTAS · ALMACEN · BEBIDAS CON ALCOHOL · BEBIDAS SIN ALCOHOL · LIMPIEZA · PERFUMERIA · BAZAR · PANIFICADOS · ROTISERIA · LACTEOS Y FRESCOS · FIAMBRERIA · CARNICERIA

**Footer:** 2 columnas, 24 links, 3 redes.

**Integraciones que el cliente ya tiene y hay que prever:** Google Tag Manager, Google Analytics.

## 4. Stack

| Sitio | Rol | Stack detectado |
| --- | --- | --- |
| hergo.com.ar | Cliente | react, tailwind |
| yaguar.com.ar | Referencia | jquery, wordpress |
| vital.com.ar | Referencia | jquery, tailwind, bootstrap, wordpress |
| makro.com.ar | Referencia | jquery, wordpress |
| menorcoste.com.ar | Referencia | jquery, bootstrap |

Usar **Next.js (App Router) + TypeScript strict + Tailwind CSS**, con los tokens de la sección 2 en `tailwind.config` y variables CSS. Contenido desde datos (JSON/CMS/API), nunca hardcodeado en el markup.

## 4b. Catálogo: qué muestra cada card de producto

Consenso de los campos que las referencias muestran en sus cards. Esto define el componente `ProductCard` y, sobre todo, el modelo de datos.

| Campo | Referencias que lo muestran | Cards en total | Conclusión |
| --- | --- | --- | --- |
| imagen | 3/3 | 48 | obligatorio |
| marca | 2/3 | 42 | esperable |
| título | 2/3 | 42 | esperable |
| botón de compra | 1/3 | 40 | opcional |
| cuotas | 1/3 | 40 | opcional |
| precio | 1/3 | 40 | opcional |
| precio secundario | 1/3 | 40 | opcional |
| selector de cantidad | 1/3 | 40 | opcional |
| unidad de venta | 1/3 | 7 | opcional |

**Grilla del catálogo en cada referencia**

| Referencia | Cards detectadas | Por fila | Tamaño típico | display | gap |
| --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | 4 | 4 | 240x300 | flex | 20px |
| makro.com.ar | 4 | 4 | 240x160 | flex | normal |
| menorcoste.com.ar | 86 | 4 | 300x470 | block | normal |

**Señales del modelo de negocio (B2B / mayorista)**

| Referencia | Precios visibles sin sesión | Pide login para precios | Solo mayoristas | Unidad de venta | Cantidad mínima | Stock | Selectores de cantidad | CUIT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | 0 card(s) | sí | no | 0 card(s) | 0 card(s) | 0 card(s) | 1 | 1 |
| makro.com.ar | 0 card(s) | sí | no | 0 card(s) | 0 card(s) | 0 card(s) | 0 | 0 |
| menorcoste.com.ar | 40 card(s) | no | no | 7 card(s) | 0 card(s) | 0 card(s) | 86 | 0 |

**Vocabulario del rubro que usan las referencias:** sucursal (3/3) · iva (3/3) · cuit (2/3) · mayorista (1/3)

**Card modelo** — la más completa es la de **menorcoste.com.ar** (8.2 campos por card, 298x468, radio 0px, padding 0px). Orden de los campos:

| Orden | Campo | Ejemplo | size | weight |
| --- | --- | --- | --- | --- |
| 1 | imagen | 240x300 | 14px | 400 |
| 2 | marca | OFERTA | 14px | 900 |
| 3 | título | .product-image-container-21743 { width: 240px; height: auto; aspect-ra | 14px | 400 |
| 4 | precio | $ 1.699,99 | 19.6px | 700 |
| 5 | precio secundario | $ 1.899,99 | 14px | 700 |
| 6 | cuotas | $ 1.888,88 x Lt | 14px | 400 |
| 7 | botón de compra | Agregar | 12px | 600 |
| 8 | selector de cantidad | input numérico | 14px | 400 |

Implementar `ProductCard` con los campos marcados como obligatorios y esperables, y un modelo de datos que los contemple aunque el cliente al principio no los cargue todos.

## 4c. Estados interactivos de las referencias

| Referencia | Hover cambia | Qué cambia en hover | Foco visible | Menú desplegado | Filtros | Carrito | Autocompletado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | 3/3 botones | backgroundColor, color, borderTopColor, outlineColor | sí | no detectado | no detectado | no detectado | — |
| vital.com.ar | 2/2 botones | backgroundColor, color, outlineColor, borderTopColor | sí | no detectado | no detectado | no detectado | — |
| makro.com.ar | 2/2 botones | backgroundColor, color, borderRadius, outlineColor | NO | no detectado | no detectado | no detectado | — |
| menorcoste.com.ar | 1/1 botones | opacity | sí | 800x363, 8 links | no detectado | popover undefined | 42 sugerencias |

**Qué animan en hover, por consenso:** backgroundColor (3/4) · color (3/4) · outlineColor (3/4) · borderTopColor (3/4) · borderRadius (1/4) · opacity (1/4)

**Menú de categorías**: menorcoste.com.ar 800x363 con 8 links. Implementarlo accesible: navegable por teclado, con `aria-expanded` y cierre por Escape.

Atención: makro.com.ar no muestra foco de teclado. **La app nueva debe tener foco visible (:focus-visible) claro en todo elemento interactivo.**

## 4d. Copy, tono y taxonomía

**Llamados a la acción del rubro**

| Texto | Referencias | Veces en total |
| --- | --- | --- |
| Suscribirme | 2/4 | 2 |
| Ver folleto | 1/4 | 8 |
| Acceso Comerciantes | 1/4 | 1 |
| Tu opinión nos interesa | 1/4 | 1 |
| Acceso a comerciantes | 1/4 | 1 |
| Hola, ¿tiene alguna pregunta? Chateemos. | 1/4 | 1 |
| Sumate al canal de WhatsApp | 1/4 | 1 |
| VER TODOS LOS PRODUCTOS | 1/4 | 1 |
| Domingo | 1/4 | 1 |
| Jueves | 1/4 | 1 |
| Lunes | 1/4 | 1 |
| Martes | 1/4 | 1 |

**Promesas que comunica el rubro** (lo que el cliente espera encontrar)

| Promesa | Referencias |
| --- | --- |
| atención al cliente | 4/4 |
| newsletter | 3/4 |
| garantía | 1/4 |
| cobertura nacional | 1/4 |

| Referencia | Registro | Palabras | Palabras por oración | % mayúsculas | Buscador |
| --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | indeterminado | 601 | 24 | 29.5 | no |
| vital.com.ar | formal (usted) | 215 | 15.4 | 2.3 | no |
| makro.com.ar | formal (usted) | 263 | 17.5 | 29.3 | no |
| menorcoste.com.ar | indeterminado | 1955 | 9.7 | 19.7 | sí ("¿Qué estás buscando?") |

**Categorías que aparecen en más de una referencia** (base de la taxonomía)

| Categoría | Referencias |
| --- | --- |
| Marcas Propias | 2/4 |
| Nosotros | 2/4 |

**Del cliente se conserva su voz**: H1 actual "Primeras marcas.", registro informal rioplatense (vos). Los textos nuevos deben sonar a hergo.com.ar, no a las referencias.

## 5. Referencias visuales

Recortes reales de cada sitio. Sirven para calibrar el estilo, no para copiarlos.

**hergo.com.ar** (cliente)

[hergo.com.ar — Navegación](../shots/hergo.com.ar/00-home/05-componentes/zone-nav.png)
[hergo.com.ar — Primera sección / hero](../shots/hergo.com.ar/00-home/05-componentes/zone-hero.png)

**yaguar.com.ar** (referencia)

[yaguar.com.ar — Header](../shots/yaguar.com.ar/00-home/05-componentes/zone-header.png)
[yaguar.com.ar — Navegación](../shots/yaguar.com.ar/00-home/05-componentes/zone-nav.png)
[yaguar.com.ar — Primera sección / hero](../shots/yaguar.com.ar/00-home/05-componentes/zone-hero.png)

**vital.com.ar** (referencia)

[vital.com.ar — Header](../shots/vital.com.ar/00-home/05-componentes/zone-header.png)
[vital.com.ar — Navegación](../shots/vital.com.ar/00-home/05-componentes/zone-nav.png)
[vital.com.ar — Primera sección / hero](../shots/vital.com.ar/00-home/05-componentes/zone-hero.png)

**makro.com.ar** (referencia)

[makro.com.ar — Header](../shots/makro.com.ar/00-home/05-componentes/zone-header.png)
[makro.com.ar — Primera sección / hero](../shots/makro.com.ar/00-home/05-componentes/zone-hero.png)

**menorcoste.com.ar** (referencia)

[menorcoste.com.ar — Header](../shots/menorcoste.com.ar/00-home/05-componentes/zone-header.png)
[menorcoste.com.ar — Primera sección / hero](../shots/menorcoste.com.ar/00-home/05-componentes/zone-hero.png)

## 6. Calidad exigida (mejor que todos los sitios analizados)

| Métrica | Mejor de los sitios analizados | Objetivo de la app nueva |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| Requests | 75 (makro.com.ar) | < 60 |
| Peso transferido | 2122 KB (makro.com.ar) | < 1698 KB |
| Nodos DOM | 296 (hergo.com.ar) | < 1200 |
| Lighthouse Performance | 53/100 (hergo.com.ar) | ≥ 90 |
| Contraste WCAG AA | el mejor tiene 2 fallos | 0 fallos |
| Imágenes sin alt | el mejor tiene 0 | 0 |
| Overflow horizontal | algunos no tienen | ninguno entre 320 y 1920px |

**Errores que cometen los sitios analizados y que esta app no debe repetir:**

1. Imágenes sin `alt` (hergo.com.ar, menorcoste.com.ar)
2. Inputs sin label asociado (hergo.com.ar, vital.com.ar, menorcoste.com.ar)
3. Cantidad de `h1` distinta de uno (hergo.com.ar, yaguar.com.ar, makro.com.ar, menorcoste.com.ar)
4. Saltos en la jerarquía de encabezados (yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
5. Foco visible removido (hergo.com.ar, yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
6. Sin skip link (hergo.com.ar, yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
7. Contraste por debajo de AA (hergo.com.ar, yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
8. Imágenes sin `width`/`height` (causan CLS) (hergo.com.ar, yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
9. Imágenes servidas mucho más grandes de lo que se muestran (hergo.com.ar, yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
10. Sin formatos de imagen modernos (WebP/AVIF) (hergo.com.ar, vital.com.ar, menorcoste.com.ar)
11. Áreas clicables menores a 36px en mobile (hergo.com.ar, yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar)
12. Animaciones que ignoran `prefers-reduced-motion` (makro.com.ar)
13. Errores de consola en el home (vital.com.ar)
14. Demasiados dominios de terceros (yaguar.com.ar, vital.com.ar, makro.com.ar)

- Navegación completa por teclado con foco visible.
- Lighthouse ≥ 90 en Performance, Accessibility, Best Practices y SEO (mobile con throttling).

## 7. Entregables

1. Proyecto que compila y corre con `npm install && npm run dev`.
2. Tokens de diseño centralizados (variables CSS + config de Tailwind) con los valores de la sección 2.
3. Componentes tipados y reutilizables, con las variantes de la sección 2.4.
4. Las páginas y secciones de la sección 3, con datos de ejemplo propios.
5. README con estructura de carpetas, decisiones tomadas y cómo reemplazar el contenido de ejemplo.

**No incluir:** logos, marcas, fotos, textos ni nombres de producto de ninguno de los sitios analizados.

---

_Detalle completo de cada sitio en su reporte individual: `reportes/hergo.com.ar/`, `reportes/yaguar.com.ar/`, `reportes/vital.com.ar/`, `reportes/makro.com.ar/`, `reportes/menorcoste.com.ar/`._
