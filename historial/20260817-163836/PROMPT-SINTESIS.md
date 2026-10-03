# Prompt de síntesis — estética de referencias + estructura del cliente

_Generado el 2026-08-17T19:38:33.670Z a partir de 5 sitio(s) analizado(s)._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación.

## 0. Punto de partida

| Rol | Sitio | Qué aporta al proyecto |
| --- | --- | --- |
| Cliente | hergo.com.ar | Estructura, contenido, funcionalidad y línea base a superar |
| Referencia | yaguar.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | vital.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | makro.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |
| Referencia | menorcoste.com.ar | Estética: color, tipografía, espaciado, componentes y movimiento |

### Pedido del cliente (tiene prioridad sobre todo lo demás)

_Fuente: brief.example.md_

**Briefing del cliente

Copiá este archivo como `brief.md` (o el nombre que quieras) y completalo con lo que
pidió el cliente. Se inyecta como **sección 0 del prompt**, con prioridad sobre todo
lo que se infiere del sitio actual.

    node analyze.js --file links.txt --brief brief.md

Borrá las secciones que no apliquen. El texto va tal cual al prompt, así que escribí
en imperativo y sin ambigüedades.

**Cliente y proyecto

- Cliente:
- Rubro:
- Sitio actual que se analizó:
- Tipo de trabajo: rediseño / migración / sitio nuevo desde cero

**Qué pidió textualmente

-

**Qué le molesta del sitio actual

-

**Qué hay que conservar sí o sí

- Marca / identidad visual:
- Colores institucionales:
- Estructura o secciones que no se tocan:
- Integraciones que deben seguir funcionando (ERP, pasarela de pago, CRM, chat):

**Alcance

- Páginas o vistas incluidas:
- Páginas explícitamente fuera de alcance:
- Idiomas:
- Necesita CMS para que el cliente edite contenido: sí / no — cuál:
- Necesita panel de administración: sí / no

**Restricciones técnicas

- Stack impuesto por el cliente (si hay):
- Hosting / infraestructura:
- Navegadores o dispositivos mínimos a soportar:
- Requisitos legales (cookies, datos personales, accesibilidad obligatoria):

**Prioridades

Ordenar de mayor a menor: rendimiento, accesibilidad, fidelidad visual al original,
velocidad de entrega, facilidad de mantenimiento.

1.
2.
3.

**Plazos y presupuesto

- Fecha objetivo:
- Etapas o entregas parciales:

**Notas adicionales

-

**Regla de oro:** replicar el *lenguaje visual* de las referencias, no su contenido. Nada de logos, marcas, fotos, textos ni nombres de producto de los sitios analizados. Cualquier coincidencia literal con una referencia es un error.

## 1. Objetivo

Construir una aplicación web con una estética coherente con las 4 referencia(s) analizada(s), replicando la arquitectura de información y las funcionalidades de **hergo.com.ar**, con mejor rendimiento y accesibilidad que todos los sitios analizados.

## 2. Estética en común entre las referencias

Cada valor indica en cuántas referencias aparece. Lo que está en la mayoría define el estilo; lo que aparece en una sola es una opción, no una regla.

### 2.1 Color

**Neutros compartidos** (base de superficies y texto):

| Color | Referencias | Usos totales | Dónde |
| --- | --- | --- | --- |
| `#ffffff` | 4/4 | 291 | yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar |
| `#f5f5f5` | 3/4 | 183 | yaguar.com.ar, vital.com.ar, menorcoste.com.ar |
| `#000000 (0.75)` | 3/4 | 31 | yaguar.com.ar, vital.com.ar, makro.com.ar |

**Acentos de cada referencia** (elegir uno como color de marca, o el que indique el cliente):

| Color | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| `#3ebd4e` | 2/4 | 11 | yaguar.com.ar, vital.com.ar |
| `#02b156` | 1/4 | 88 | menorcoste.com.ar |
| `#d81d14` | 1/4 | 34 | yaguar.com.ar |
| `#134b95` | 1/4 | 12 | vital.com.ar |
| `#08774d` | 1/4 | 6 | menorcoste.com.ar |
| `#003d9e` | 1/4 | 5 | vital.com.ar |
| `#d9272e` | 1/4 | 5 | makro.com.ar |
| `#00bf27` | 1/4 | 4 | yaguar.com.ar |
| `#ed1c24` | 1/4 | 4 | vital.com.ar |
| `#25d366` | 1/4 | 1 | makro.com.ar |

**Colores de texto más usados:**

| Color | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| `#ffffff` | 4/4 | 1253 | yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar |
| `#000000` | 3/4 | 683 | vital.com.ar, makro.com.ar, menorcoste.com.ar |
| `#333333` | 2/4 | 3853 | yaguar.com.ar, menorcoste.com.ar |
| `#666666` | 2/4 | 629 | makro.com.ar, menorcoste.com.ar |
| `#33373d` | 2/4 | 159 | yaguar.com.ar, vital.com.ar |
| `#f8f9fa` | 2/4 | 16 | vital.com.ar, makro.com.ar |

Definir la paleta como variables CSS con roles (`--surface`, `--surface-alt`, `--text`, `--text-muted`, `--accent`, `--border`), no como colores sueltos. Todo par texto/fondo debe cumplir WCAG AA (4.5:1 en texto normal, 3:1 en texto grande) — ver sección 6.

### 2.2 Tipografía

| Familia | Referencias | Usos | Dónde |
| --- | --- | --- | --- |
| Montserrat, sans-serif | 2/4 | 2097 | yaguar.com.ar, vital.com.ar |
| Commissioner, "Helvetica Neue", Helvetica, Arial, sans-serif | 1/4 | 5306 | menorcoste.com.ar |
| Roboto, sans-serif | 1/4 | 720 | vital.com.ar |
| Inter, Helvetica, Arial, Lucida, sans-serif | 1/4 | 702 | makro.com.ar |
| FontAwesome | 1/4 | 159 | menorcoste.com.ar |
| "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif | 1/4 | 83 | menorcoste.com.ar |
| -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif | 1/4 | 33 | yaguar.com.ar |
| Inter | 1/4 | 32 | makro.com.ar |

**Escala de tamaños presente en la mayoría:** 12px · 14px · 16px · 20px

**Escala completa observada:** 10px · 11px · 11.05px · 11.2px · 12px · 12.6px · 12.8px · 13px · 13.5px · 14px · 15px · 15.2px · 16px · 16.8px · 17px · 18px · 19px · 19.6px · 20px · 21px · 22px · 24px · 25px · 26px · 28px · 30px · 31.5px · 32px · 40px · 41px · 44px · 50px · 56px

**Pesos:** 400 (4/4) · 700 (4/4) · 600 (4/4) · 500 (3/4) · 900 (2/4)

**Line-heights:** normal · 20px · 24px · 23.8px

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
| `rgba(0, 0, 0, 0.08) 0px 2px 12px 0px` | 1/4 | 20 |
| `rgba(0, 0, 0, 0.15) 0px 2px 10px 0px` | 1/4 | 12 |
| `rgba(0, 0, 0, 0.2) 0px 3px 15px 0px` | 1/4 | 6 |
| `rgba(0, 0, 0, 0.15) 0px 8px 16px 0px` | 1/4 | 6 |
| `rgba(0, 0, 0, 0.1) 0px 2px 5px 0px` | 1/4 | 6 |

Normalizar en 3 niveles de elevación: sutil para cards, media para menús y popovers, fuerte para modales.

### 2.4 Componentes: qué usan las referencias

| Componente | Referencias que lo usan | Promedio por sitio | Conclusión |
| --- | --- | --- | --- |
| badges | 4/4 | 103 | obligatorio: lo usan todas |
| carousels | 4/4 | 83 | obligatorio: lo usan todas |
| buttons | 4/4 | 70 | obligatorio: lo usan todas |
| banners | 4/4 | 51 | obligatorio: lo usan todas |
| social | 4/4 | 12 | obligatorio: lo usan todas |
| modals | 3/4 | 19 | esperable en el rubro |
| pagination | 3/4 | 10 | esperable en el rubro |
| prices | 2/4 | 531 | opcional |
| cards | 2/4 | 11 | opcional |
| ratings | 2/4 | 7 | opcional |
| addToCart | 1/4 | 156 | opcional |
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
| yaguar.com.ar | `rgb(255, 255, 255)` | 12px | con sombra | 0px | 261x362 |
| makro.com.ar | `rgba(0, 0, 0, 0)` | 0px | sin sombra (borde) | 0px | 1425x2425 |

### 2.5 Layout y densidad

| Referencia | Secciones | Alto del home | Header | Hamburguesa desde | Cards/fila @1440 | grid vs flex | Nodos DOM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| yaguar.com.ar | 11 | 5.2 viewports | static | 1920px | 12 | 1 / 751 | 2362 |
| vital.com.ar | 21 | 6.2 viewports | relative | 390px | — | 1 / 89 | 1407 |
| makro.com.ar | 7 | 4 viewports | static | — | — | 0 / 101 | 886 |
| menorcoste.com.ar | 8 | 4.8 viewports | relative | 1024px | 4 | 1 / 539 | 6631 |

**Breakpoints que comparten las referencias:** 767px (4/4) · 768px (4/4) · 479px (3/4) · 1200px (3/4) · 460px (2/4) · 576px (2/4) · 640px (2/4) · 769px (2/4) · 900px (2/4) · 991px (2/4) · 992px (2/4) · 1024px (2/4)

Implementar con 640 / 768 / 1024 / 1280 / 1536 y verificar además 360px. Sin scroll horizontal en ningún ancho entre 320 y 1920.

### 2.6 Movimiento

**Duraciones:** 0.3s (4/4) · 0.4s (4/4) · 0.3s, 0.3s (2/4) · 0.5s (2/4) · 0.2s (2/4)

**Easings:** ease · ease-in-out · ease-out · ease-in

**Qué cambia en hover:** color · background-color · background-image · background-attachment · background-clip · background-origin

Referencias con animación al scroll: yaguar.com.ar, vital.com.ar, makro.com.ar, menorcoste.com.ar. Respetar siempre `prefers-reduced-motion` (3/4 referencias lo hacen).

## 3. Estructura y funcionalidad

La arquitectura de información sale del sitio del cliente (**hergo.com.ar**). Las referencias definen cómo se ve, no qué secciones hay.

**Secciones del home, en orden de scroll:**

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | section#hero.bg-hergo-red.text-white.pt-12 | Primeras marcas. | 415px | block | 2 img, 5 links |
| 2 | div.flex.flex-col.lg:flex-row | Revista Ofertas #3226 | 436px | flex, 2 col | 1 img, 1 links |
| 3 | div.flex.flex-col.md:flex-row | — | 64px | flex, 4 col | 5 img |
| 4 | section.relative.py-8.md:py-12 | Salón de ventas: | 438px | block | 3 img |
| 5 | iframe | — | 400px | block | — |
| 6 | section#company.w-full.bg-white | ¿Quiénes somos? | 1451px | block | 4 img |
| 7 | section#offers.bg-hergo-red.py-12.md:py-20 | — | 248px | block | 1 links |
| 8 | div.grid.lg:grid-cols-2.gap-8 | Trabajar en Hergo | 1435px | grid, 2 col | — |
| 9 | div.w-full.bg-hergo-blue-light.px-6 | MEDIOS DE PAGO: | 369px | flex, 1 col | 3 items |
| 10 | div.grid.grid-cols-1.md:grid-cols-3 | › Tarjeta Azul | 940px | grid, 3 col | 3 img |
| 11 | footer.bg-hergo-blue.text-white.py-8 | INSTITUCIONAL | 447px | block | 1 img, 6 items |

**Navegación:** 0 ítems de primer nivel: 

**Footer:** 1 columnas, 0 links, 0 redes.

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
| Peso transferido | 1314 KB (menorcoste.com.ar) | < 1051 KB |
| Nodos DOM | 294 (hergo.com.ar) | < 1200 |
| Lighthouse Performance | 67/100 (menorcoste.com.ar) | ≥ 90 |
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
13. Demasiados dominios de terceros (yaguar.com.ar, vital.com.ar, makro.com.ar)

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
