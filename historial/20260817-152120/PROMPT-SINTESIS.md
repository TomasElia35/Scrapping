# Prompt de síntesis — estética de referencias + estructura del cliente

_Generado el 2026-08-17T18:21:20.265Z a partir de 3 sitio(s) analizado(s)._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación.

## 0. Punto de partida

| Rol | Sitio | Qué aporta al proyecto |
| --- | --- | --- |
| Cliente | authogar.com | Estructura, contenido, funcionalidad y línea base a superar |
| Referencia | macowens.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | devre.la | Estética: color, tipografía, espaciado, componentes y movimiento |

**Regla de oro:** replicar el *lenguaje visual* de las referencias, no su contenido. Nada de logos, marcas, fotos, textos ni nombres de producto de los sitios analizados. Cualquier coincidencia literal con una referencia es un error.

## 1. Objetivo

Construir una aplicación web con una estética coherente con las 2 referencia(s) analizada(s), replicando la arquitectura de información y las funcionalidades de **authogar.com**, con mejor rendimiento y accesibilidad que todos los sitios analizados.

## 2. Estética en común entre las referencias

Cada valor indica en cuántas referencias aparece. Lo que está en la mayoría define el estilo; lo que aparece en una sola es una opción, no una regla.

### 2.1 Color

**Neutros compartidos** (base de superficies y texto):

| Color | Referencias | Usos totales | Dónde |
| --- | --- | --- | --- |
| `#f0f0f0` | 2/2 | 5348 | macowens.com.ar, devre.la |
| `#ffffff` | 2/2 | 1187 | macowens.com.ar, devre.la |
| `#000000` | 2/2 | 930 | macowens.com.ar, devre.la |
| `#c2c2c2` | 2/2 | 174 | macowens.com.ar, devre.la |

**Acentos de cada referencia** (elegir uno como color de marca, o el que indique el cliente):

| Color | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| `#000080` | 2/2 | 521 | macowens.com.ar, devre.la |
| `#e42621` | 2/2 | 281 | macowens.com.ar, devre.la |
| `#f5f5dc` | 2/2 | 180 | macowens.com.ar, devre.la |
| `#160083` | 2/2 | 105 | macowens.com.ar, devre.la |
| `#b2cbea` | 2/2 | 96 | macowens.com.ar, devre.la |
| `#e6bc99` | 1/2 | 24 | macowens.com.ar |

**Colores de texto más usados:**

| Color | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| `#000000` | 2/2 | 20466 | macowens.com.ar, devre.la |
| `#686868` | 2/2 | 8659 | macowens.com.ar, devre.la |
| `#ffffff` | 2/2 | 1113 | macowens.com.ar, devre.la |
| `#999999` | 2/2 | 249 | macowens.com.ar, devre.la |
| `#707070` | 1/2 | 20 | macowens.com.ar |
| `#ff5700` | 1/2 | 2 | macowens.com.ar |

Definir la paleta como variables CSS con roles (`--surface`, `--surface-alt`, `--text`, `--text-muted`, `--accent`, `--border`), no como colores sueltos. Todo par texto/fondo debe cumplir WCAG AA (4.5:1 en texto normal, 3:1 en texto grande) — ver sección 6.

### 2.2 Tipografía

| Familia | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif | 1/2 | 20539 | devre.la |
| "Hind Siliguri", "Helvetica Neue", Helvetica, Arial, sans-serif | 1/2 | 9900 | macowens.com.ar |
| Roboto, sans-serif | 1/2 | 88 | macowens.com.ar |
| Helvetica | 1/2 | 1 | macowens.com.ar |

**Escala de tamaños presente en la mayoría:** 10px · 12px · 14px · 16px · 18px · 22px · 26px

**Escala completa observada:** 10px · 12px · 13px · 14px · 16px · 18px · 22px · 26px · 30px · 35px

**Pesos:** 400 (2/2) · 700 (2/2) · 500 (1/2) · 600 (1/2) · 200 (1/2)

**Line-heights:** 19.6px · 20px · 16.8px · 14px

Escala tipográfica de cada referencia, para elegir el carácter (más contraste = más editorial, menos contraste = más utilitario):

| Referencia | body | h1 | h2 | h3 | Familia principal |
| --- | --- | --- | --- | --- | --- |
| macowens.com.ar | 14px | — | — | 22px/400 | "Hind Siliguri", "Helvetica Neue", Helvetica, Arial, sans-serif |
| devre.la | 14px | — | — | 22px/400 | "Nunito Sans", "Helvetica Neue", Helvetica, Arial, sans-serif |

### 2.3 Forma, espaciado y elevación

**Radios:** 3px (2/2) · 10px (2/2) · 50px (1/2)

Usar una escala de 3 radios como máximo. Los que se repiten entre referencias son: 3px · 10px.

**Gaps de grilla:** 3px · 5px · 10px · 20px

**Ancho de contenedor:** 1430px (2/2)

**Sombras más usadas:**

| box-shadow | Referencias | Usos |
| --- | --- | --- |
| `rgba(51, 51, 51, 0.2) 0px 0px 10px 0px` | 2/2 | 2 |

Normalizar en 3 niveles de elevación: sutil para cards, media para menús y popovers, fuerte para modales.

### 2.4 Componentes: qué usan las referencias

| Componente | Referencias que lo usan | Promedio por sitio | Conclusión |
| --- | --- | --- | --- |
| prices | 2/2 | 2337 | obligatorio: lo usan todas |
| badges | 2/2 | 1999 | obligatorio: lo usan todas |
| search | 2/2 | 1164 | obligatorio: lo usan todas |
| buttons | 2/2 | 441 | obligatorio: lo usan todas |
| addToCart | 2/2 | 441 | obligatorio: lo usan todas |
| carousels | 2/2 | 288 | obligatorio: lo usan todas |
| banners | 2/2 | 266 | obligatorio: lo usan todas |
| modals | 2/2 | 6 | obligatorio: lo usan todas |
| social | 2/2 | 2 | obligatorio: lo usan todas |

**Estilo de botón de cada referencia** (para definir el `Button` primario):

| Referencia | Fondo | Texto | Radio | Padding | Tamaño | Peso | Sombra |
| --- | --- | --- | --- | --- | --- | --- | --- |
| macowens.com.ar | `rgb(221, 221, 221)` | `rgb(255, 255, 255)` | 10px | 0px | 14px | 400 | sin sombra |
| devre.la | `rgb(221, 221, 221)` | `rgb(255, 255, 255)` | 10px | 0px | 14px | 400 | sin sombra |

**Estilo de card de cada referencia:**

| Referencia | Fondo | Radio | Sombra | Padding | Tamaño típico |
| --- | --- | --- | --- | --- | --- |

### 2.5 Layout y densidad

| Referencia | Secciones | Alto del home | Header | Hamburguesa desde | Cards/fila @1440 | grid vs flex | Nodos DOM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| macowens.com.ar | 12 | 7.3 viewports | static | 390px | 1 | 0 / 3854 | 12331 |
| devre.la | 11 | 8.2 viewports | static | 1920px | 1 | 0 / 8128 | 34779 |

**Breakpoints que comparten las referencias:** 360px (2/2) · 390px (2/2) · 400px (2/2) · 472px (2/2) · 479px (2/2) · 500px (2/2) · 576px (2/2) · 600px (2/2) · 639px (2/2) · 640px (2/2) · 700px (2/2) · 767px (2/2)

Implementar con 640 / 768 / 1024 / 1280 / 1536 y verificar además 360px. Sin scroll horizontal en ningún ancho entre 320 y 1920.

### 2.6 Movimiento

**Duraciones:** 0.3s (2/2) · 0.5s (1/2)

**Easings:** ease · linear

**Qué cambia en hover:** color · background-color · background-position-x · background-position-y · background-attachment · background-clip

Referencias con animación al scroll: macowens.com.ar, devre.la. Respetar siempre `prefers-reduced-motion` (0/2 referencias lo hacen).

## 3. Estructura y funcionalidad

La arquitectura de información sale del sitio del cliente (**authogar.com**). Las referencias definen cómo se ve, no qué secciones hay.

**Secciones del home, en orden de scroll:**

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.vtex-sticky-layout-0-x-container.vtex-sticky-layout-0-x-container--sticky-header.z-999 | — | 137px | block | 3 img, 12 links, 4 items |
| 2 | img.vtex-store-components-3-x-imageElement.vtex-store-components-3-x-imageElement--wssp-fi | — | 57px | inline | — |
| 3 | div.vtex-slider-layout-0-x-sliderTrack.vtex-slider-layout-0-x-sliderTrack--hero.flex | — | 280px | flex, 9 col | 2 img, 2 links |
| 4 | div.authogar-components-0-x-wrapperCategorySliderDesktop | Hogar y Tecnología: | 235px | flex, 2 col | 18 img, 18 links |
| 5 | div.vtex-slider-layout-0-x-sliderTrack.vtex-slider-layout-0-x-sliderTrack--home-brands.fle | — | 67px | flex, 29 col | 11 img, 11 links |
| 6 | div.authogar-components-0-x-wrapperCategorySliderDesktop | Deporte y Moda: | 235px | flex, 2 col | 18 img, 18 links |
| 7 | div.vtex-slider-layout-0-x-sliderTrack.vtex-slider-layout-0-x-sliderTrack--home-brands.fle | — | 67px | flex, 27 col | 11 img, 11 links |
| 8 | div.flex.mt0.mb0 | PS5 PlayStation 5 Slim + Astro Bot y Gran Turismo 7 Digital | 640px | flex, 2 col | 25 img, 5 links, 65 items |
| 9 | div.flex.mt0.mb0 | — | 160px | flex, 3 col | 3 img, 3 links |
| 10 | div.flex.mt0.mb0 | Tablet TCL TAB A1 Plus 12.2" 128GB 6GB Space Blue + Teclado | 639px | flex, 2 col | 28 img, 5 links, 80 items |
| 11 | div.flex.mt0.mb0 | — | 365px | flex, 2 col | 3 img, 6 links |
| 12 | div.flex.mt0.mb0 | Zapatillas Nike Vomero 18 Ver. Hombre | 612px | flex, 2 col | 24 img, 5 links, 80 items |
| 13 | div.flex.mt0.mb0 | — | 365px | flex, 2 col | 3 img, 8 links |
| 14 | div.flex.mt0.mb0 | Zapatillas Vans U Knu Skool Cel. Hombre | 612px | flex, 2 col | 24 img, 5 links, 80 items |
| 15 | section#slider-items-4pudh1k.w-100.flex.items-center | — | 120px | flex, 3 col | 2 img, 2 links |
| 16 | div.flex.mt0.mb0 | Rack Para Colgar Tables 1,80M Tono Olmo Finlandes/Everest 1407-Coe | 641px | flex, 2 col | 26 img, 5 links, 80 items |
| 17 | div.flex.mt0.mb0 | Termotanque Coppens 120L Multigas De Pie | 639px | flex, 2 col | 24 img, 5 links, 62 items |
| 18 | div.flex.mt0.mb0 | — | 223px | flex, 1 col | 2 img, 2 links |
| 19 | div | — | 267px | block | 10 img, 21 links |
| 20 | div.authogar-minicart-0-x-drawer.authogar-minicart-0-x-closed.right-0 | — | 900px | flex, 1 col | — |

**Navegación:** 4 ítems de primer nivel: Revista Authogar · Deporte y Moda · Zapatillas · Promo 12 Sin Interés

**Integraciones que el cliente ya tiene y hay que prever:** VTEX, Google Tag Manager, Google Analytics, Meta Pixel, reCAPTCHA.

## 4. Stack

| Sitio | Rol | Stack detectado |
| --- | --- | --- |
| authogar.com | Cliente | react, tailwind |
| macowens.com.ar | Referencia | jquery, bootstrap |
| devre.la | Referencia | jquery, bootstrap |

Usar **Next.js (App Router) + TypeScript strict + Tailwind CSS**, con los tokens de la sección 2 en `tailwind.config` y variables CSS. Contenido desde datos (JSON/CMS/API), nunca hardcodeado en el markup.

## 5. Referencias visuales

Recortes reales de cada sitio. Sirven para calibrar el estilo, no para copiarlos.

**authogar.com** (cliente)

[authogar.com — Header](../shots/authogar.com/00-home/05-componentes/zone-header.png)
[authogar.com — Navegación](../shots/authogar.com/00-home/05-componentes/zone-nav.png)
[authogar.com — Primera sección / hero](../shots/authogar.com/00-home/05-componentes/zone-hero.png)

**macowens.com.ar** (referencia)

[macowens.com.ar — Header](../shots/macowens.com.ar/00-home/05-componentes/zone-header.png)
[macowens.com.ar — Navegación](../shots/macowens.com.ar/00-home/05-componentes/zone-nav.png)
[macowens.com.ar — Primera sección / hero](../shots/macowens.com.ar/00-home/05-componentes/zone-hero.png)

**devre.la** (referencia)

[devre.la — Header](../shots/devre.la/00-home/05-componentes/zone-header.png)
[devre.la — Primera sección / hero](../shots/devre.la/00-home/05-componentes/zone-hero.png)

## 6. Calidad exigida (mejor que todos los sitios analizados)

| Métrica | Mejor de los sitios analizados | Objetivo de la app nueva |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| Requests | 673 (authogar.com) | < 538 |
| Peso transferido | 7863 KB (authogar.com) | < 6290 KB |
| Nodos DOM | 3080 (authogar.com) | < 2464 |
| Lighthouse Performance | no medido | ≥ 90 |
| Contraste WCAG AA | el mejor tiene 0 fallos | 0 fallos |
| Imágenes sin alt | el mejor tiene 5 | 0 |
| Overflow horizontal | algunos no tienen | ninguno entre 320 y 1920px |

**Errores que cometen los sitios analizados y que esta app no debe repetir:**

1. Imágenes sin `alt` (authogar.com, macowens.com.ar, devre.la)
2. Inputs sin label asociado (authogar.com, macowens.com.ar, devre.la)
3. Cantidad de `h1` distinta de uno (authogar.com, macowens.com.ar, devre.la)
4. Saltos en la jerarquía de encabezados (authogar.com, macowens.com.ar, devre.la)
5. Foco visible removido (authogar.com, macowens.com.ar, devre.la)
6. Sin skip link (authogar.com, macowens.com.ar, devre.la)
7. Contraste por debajo de AA (authogar.com, macowens.com.ar)
8. Imágenes sin `width`/`height` (causan CLS) (authogar.com, macowens.com.ar, devre.la)
9. Imágenes servidas mucho más grandes de lo que se muestran (authogar.com, macowens.com.ar, devre.la)
10. Sin formatos de imagen modernos (WebP/AVIF) (authogar.com, macowens.com.ar, devre.la)
11. Áreas clicables menores a 36px en mobile (authogar.com, macowens.com.ar, devre.la)
12. Animaciones que ignoran `prefers-reduced-motion` (devre.la)
13. Errores de consola en el home (authogar.com, macowens.com.ar, devre.la)
14. Demasiados dominios de terceros (authogar.com, macowens.com.ar, devre.la)

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

_Detalle completo de cada sitio en su reporte individual: `reportes/authogar.com/`, `reportes/macowens.com.ar/`, `reportes/devre.la/`._
