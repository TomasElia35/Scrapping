# Prompt de construcción — hergo.com.ar

_Generado a partir del análisis automatizado de https://www.hergo.com.ar/ el 2026-08-17T19:38:33.670Z._

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

Construir una aplicación web equivalente en estructura y propósito a **hergo.com.ar**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: Hergo — sin description

## 2. Stack y decisiones técnicas

Detectado en el original: react, tailwind · Google Tag Manager, Google Analytics

- El original usa React sin framework de SSR: usar **Next.js (App Router)** para ganar SSR/SSG y mejor LCP.
- Estilos: el original ya usa Tailwind. Mantener **Tailwind CSS** con los tokens de este documento cargados en `tailwind.config`.
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#fe0061` | 9 elementos |
| surface-2 | `#0172bc` | 5 elementos |
| surface-3 | `#ffffff` | 4 elementos |
| surface-4 | `#0045e5` | 3 elementos |
| text-1 (texto base) | `#ffffff` | 145 elementos |
| text-2 | `#000000` | 55 elementos |
| text-3 | `#fe0061` | 10 elementos |
| text-4 | `#0045e5` | 1 elementos |
| border-1 | `#ffffff` | 4 elementos |

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: "Plus Jakarta Sans", system-ui, sans-serif, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"
- Escala de tamaños en uso: 14.4px · 16px · 19.2px · 22.4px · 24px · 28.8px · 40px · 48px
- Pesos: 400, 700, 600
- Line-heights: 24px, 26.4px, 33px, 36.4px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 16px | 400 | 24px |
| h1 | 59.2px | 700 | 59.2px |
| h2 | 59.2px | 700 | 59.2px |
| h3 | 59.2px | 700 | 82.88px |
| p | 22.4px | 700 | 22.4px |
| button | 22.4px | 700 | 34.8444px |

Fuentes propias declaradas: PlusJakartaSans-ExtraLight (200, font-display: swap) · PlusJakartaSans-ExtraLightItalic (200, font-display: swap) · PlusJakartaSans-Light (300, font-display: swap) · PlusJakartaSans-LightItalic (300, font-display: swap). Cargarlas con `font-display: swap` y `preload` solo la del hero.

Consistencia del original: 2 familias, 11 tamaños, 3 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 8px · 24px · 3.35544e+07px
- Gaps de grilla/flex: 8px · 16px · 20px · 24px · 32px · 48px
- Paddings más usados: 0px 0px 0px 24px, 12px 24px, 16px 24px, 0px 16px, 8px 24px
- Sombras: `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px` · `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px` · `rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.25) 0px 25px 50px -12px`
- Ancho de contenedor: 1280px, 896px, 1152px · padding lateral: 0px / 0px, 16px / 16px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | section#hero.bg-hergo-red.text-white.pt-12 | Primeras marcas. | 415px (0.46 vh) | block | 2 img, 5 links, 9 btn |
| 2 | div.flex.flex-col.lg:flex-row | Revista Ofertas #3226 | 436px (0.48 vh) | flex, 2 col | 1 img, 1 links |
| 3 | div.flex.flex-col.md:flex-row | — | 64px (0.07 vh) | flex, 4 col | 5 img |
| 4 | section.relative.py-8.md:py-12 | Salón de ventas: | 438px (0.49 vh) | block | 3 img |
| 5 | iframe | — | 400px (0.44 vh) | block | — |
| 6 | section#company.w-full.bg-white | ¿Quiénes somos? | 1451px (1.61 vh) | block | 4 img |
| 7 | section#offers.bg-hergo-red.py-12.md:py-20 | — | 248px (0.28 vh) | block | 1 links |
| 8 | div.grid.lg:grid-cols-2.gap-8 | Trabajar en Hergo | 1435px (1.59 vh) | grid, 2 col | 1 btn |
| 9 | div.w-full.bg-hergo-blue-light.px-6 | MEDIOS DE PAGO: | 369px (0.41 vh) | flex, 1 col | 3 items |
| 10 | div.grid.grid-cols-1.md:grid-cols-3 | › Tarjeta Azul | 940px (1.04 vh) | grid, 3 col | 3 img, 2 btn |
| 11 | footer.bg-hergo-blue.text-white.py-8 | INSTITUCIONAL | 447px (0.5 vh) | block | 1 img, 6 items |

Alto total del home: 7098px (7.9 viewports). 11 bloques de primer nivel.

**Navegación principal**

- 0 ítems de primer nivel, 5 links en total, header `position: fixed`.

**Footer**: 1 columnas, 0 links, 0 redes.

**Capas fijas**: header/nav (fixed, z-index 50). Definir una escala de z-index documentada.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| images | 19 | componente de imagen optimizada (AVIF/WebP + sizes) |
| inputs | 18 | componente `Input` con label obligatorio |
| buttons | 12 | un solo componente `Button` con variantes |
| links | 7 | links internos con el router, externos con `rel="noopener"` |
| svg | 3 | sprite o componentes de ícono, no SVG inline duplicado |
| forms | 1 | validación accesible con mensajes asociados al campo |
| videosEmbeds | 1 | carga diferida con póster; no autoplay con sonido |

**Variantes de botón detectadas** (usar como base del componente `Button`)

| Variante | Usos | Fondo | Texto | Radio | Padding | Tamaño de fuente | Peso |
| --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 4 | `rgba(0, 0, 0, 0)` | `rgb(255, 255, 255)` | 3.35544e+07px | 8px 24px | 22.4px | 700 |
| secondary | 2 | `rgb(254, 0, 97)` | `rgb(255, 255, 255)` | 3.35544e+07px | 12px 24px | 22.4px | 700 |
| ghost | 1 | `rgb(254, 0, 97)` | `rgb(255, 255, 255)` | 3.35544e+07px | 12px 48px | 22.4px | 700 |
| alt-2 | 1 | `rgb(0, 69, 229)` | `rgb(255, 255, 255)` | 3.35544e+07px | 16px 24px | 22.4px | 700 |
| alt-3 | 1 | `rgb(254, 0, 97)` | `rgb(255, 255, 255)` | 3.35544e+07px | 16px 24px | 22.4px | 700 |

El original tiene 5+ firmas de estilo distintas para botones: consolidar en **3-4 variantes** (primary, secondary, ghost, destructive) × tamaños (sm, md, lg).

**Formularios del original**

- Form 1 — GET → `(mismo)`, submit "ENVIAR": nameLastName* (text), birthDate* (date), address* (text), phone* (tel), email* (email), ownMobility (radio), ownMobility (radio), workTime (radio), workTime (radio), checkbox (checkbox), checkbox (checkbox), checkbox (checkbox), checkbox (checkbox), checkbox (checkbox), checkbox (checkbox), checkbox (checkbox), comments* (text), cv-upload (file)

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: —
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 390px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1280px, centrado, con padding lateral 0px / 0px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 0 | 59 | 32px |
| 390px | — | 0 | 59 | 32px |
| 768px | — | 4 | — | 59.2px |
| 1024px | — | 4 | 177 | 59.2px |
| 1280px | — | 4 | 177 | 59.2px |
| 1440px | — | 4 | 177 | 59.2px |
| 1920px | — | 4 | 177 | 59.2px |

- De 390px a 768px: desaparece hamburguesa (menú completo); links de nav visibles 0 → 4; h1 32px → 59.2px; header 59px → nullpx; columnas de grid [1,1,1,1,1] → [1,1,1,3,3]
- De 768px a 1024px: header nullpx → 177px; columnas de grid [1,1,1,3,3] → [1,2,1,3,3]

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.15s, 0.2s · easings: cubic-bezier(0.4
- Propiedades animadas: --tw-gradient-from, --tw-gradient-to, --tw-gradient-via, background-color, border-color
- En `:hover` cambian: —
- 21 elementos con transición y 0 con animación; 1 `@keyframes` declarados.
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 4448 caracteres de texto visible, 19 imágenes y 7 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD.
- Idioma: `lang="en"`. Formatear moneda y fechas con `Intl`.

## 9. Mejoras obligatorias respecto del original

1. Accesibilidad: el original tiene 4 de 19 imágenes sin `alt`. En la nueva app, `alt` es obligatorio (vacío solo si es decorativa).
2. Formularios: 6 de 18 inputs sin label asociado. Usar `<label for>` real, no solo placeholder.
3. El original tiene 2 `h1`. Usar exactamente uno por página.
4. 44 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
5. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
6. Contraste: 5 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
7. Rendimiento: 19 imágenes sin `width`/`height` (causan CLS). Declarar siempre las dimensiones o usar `next/image`.
8. 12 imágenes se descargan a más del doble del tamaño en que se muestran. Servir tamaños responsivos con `srcset`/`sizes`.
9. 19 imágenes sin estrategia de carga: `loading="lazy"` fuera del viewport inicial y `priority` solo para la del hero.
10. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
11. CLS del original: 0.1274 (objetivo < 0.1). Reservar espacio para banners, sliders y fuentes.
12. Táctil: 7 de 12 áreas clicables miden menos de 36px en 360px. Mínimo 44x44px.
13. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
14. SEO: falta meta description.
15. SEO: no hay datos estructurados JSON-LD. Agregar Organization/WebSite y Product o Article según corresponda.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Footer](../../shots/hergo.com.ar/00-home/05-componentes/zone-footer.png)
[Primer formulario](../../shots/hergo.com.ar/00-home/05-componentes/zone-form.png)
[Primera sección / hero](../../shots/hergo.com.ar/00-home/05-componentes/zone-hero.png)
[Navegación](../../shots/hergo.com.ar/00-home/05-componentes/zone-nav.png)
[Botón variante 1](../../shots/hergo.com.ar/00-home/05-componentes/boton-01.png)
[Botón variante 2](../../shots/hergo.com.ar/00-home/05-componentes/boton-02.png)
[Botón variante 3](../../shots/hergo.com.ar/00-home/05-componentes/boton-03.png)
[Botón variante 4](../../shots/hergo.com.ar/00-home/05-componentes/boton-04.png)
[Botón variante 5](../../shots/hergo.com.ar/00-home/05-componentes/boton-05.png)
[Input variante 1](../../shots/hergo.com.ar/00-home/05-componentes/input-01.png)
[Input variante 2](../../shots/hergo.com.ar/00-home/05-componentes/input-02.png)
[Input variante 3](../../shots/hergo.com.ar/00-home/05-componentes/input-03.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.1274 | < 0.1 |
| FCP | 2144 ms | < 1800 ms |
| TTFB | 180 ms | < 800 ms |
| Requests | 81 | < 49 |
| Peso transferido | 6251 KB | < 3751 KB |
| Nodos DOM | 294 | < 1200 |
| Imágenes sin alt | 4 | 0 |
| Inputs sin label | 6 | 0 |
| Fallos de contraste AA | 5 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |


**Línea base de Lighthouse del sitio actual** (perfil desktop, con throttling — estos son los números a superar):

| Categoría / métrica | Original | Objetivo |
| --- | --- | --- |
| Performance | 62/100 | ≥ 90 |
| Accesibilidad | 73/100 | ≥ 95 |
| Best practices | 100/100 | ≥ 95 |
| SEO | 67/100 | ≥ 95 |
| LCP | 2.7 s | < 2,5 s |
| TBT | 190 ms | < 200 ms |
| CLS | 0.125 | < 0,1 |
| Speed Index | 4.2 s | < 3,4 s |

Oportunidades que Lighthouse marca en el original y que la nueva app no debe repetir:

- Serve images in next-gen formats (ahorro estimado 540 ms) (1268 KB)
- Reduce unused JavaScript (ahorro estimado 390 ms) (261 KB)
- Properly size images (ahorro estimado 200 ms) (4430 KB)

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
