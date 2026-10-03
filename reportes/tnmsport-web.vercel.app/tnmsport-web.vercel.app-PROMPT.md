# Prompt de construcción — tnmsport-web.vercel.app

_Generado a partir del análisis automatizado de https://tnmsport-web.vercel.app/ el 2026-09-07T23:59:14.219Z._

> Copiá todo lo que sigue y pasáselo a la IA que va a construir la aplicación. Los valores son mediciones reales del sitio del cliente, no estimaciones.

## 1. Objetivo

Construir una aplicación web equivalente en estructura y propósito a **tnmsport-web.vercel.app**, con mejor rendimiento, accesibilidad y mantenibilidad. Replicar la arquitectura de información y el tipo de componentes, **no** copiar textos, imágenes, logos ni marcas del original: usar contenido propio o placeholders.

Contexto del original: TnmSport — sin description

## 2. Stack y decisiones técnicas

Detectado en el original: react · Google Fonts, Service Worker

- El original usa React sin framework de SSR: usar **Next.js (App Router)** para ganar SSR/SSG y mejor LCP.
- Estilos: usar **Tailwind CSS** con los tokens de este documento en `tailwind.config` (el original usa CSS propio).
- TypeScript en strict mode. Componentes con props tipadas y variantes explícitas (evitar clases duplicadas).

## 3. Design tokens (medidos por frecuencia de uso real)

**Color**

| Rol | Valor | Uso en el original |
| --- | --- | --- |
| surface-1 (fondo base) | `#19191d` | 9 elementos |
| surface-2 | `#22c55e (0.14)` | 9 elementos |
| surface-3 | `#22c55e` | 6 elementos |
| surface-4 | `#2c2c32 (0.85)` | 1 elementos |
| text-1 (texto base) | `#8e8e99` | 52 elementos |
| text-2 | `#f4f4f5` | 44 elementos |
| text-3 | `#22c55e` | 15 elementos |
| text-4 | `#b8b8c0` | 6 elementos |
| border-1 | `#ffffff (0.14)` | 10 elementos |
| border-2 | `#22c55e` | 9 elementos |

> Ajustar estos colores donde no lleguen a WCAG AA (ver sección 9) manteniendo la identidad.

**Tipografía**

- Familias: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif, "Space Grotesk", Outfit, -apple-system, BlinkMacSystemFont, sans-serif
- Escala de tamaños en uso: 12px · 14px · 16px · 18px · 48px
- Pesos: 400, 600, 700
- Line-heights: 25.6px, 16.8px, 19.2px, 14.4px
- Letter-spacing: -0.16px, -0.36px, 0.96px

| Elemento | font-size | weight | line-height |
| --- | --- | --- | --- |
| body | 16px | 400 | 25.6px |
| h1 | 48px | 700 | 51.84px |
| h2 | 12px | 600 | 14.4px |
| p | 16px | 400 | 24.8px |

Consistencia del original: 2 familias, 5 tamaños, 3 pesos distintos. La escala es acotada: mantenerla.

**Espaciado, radios y elevación**

- Radios: 10px · 14px · 20px · 9999px
- Gaps de grilla/flex: 4px · 8px · 12px · 16px · 24px
- Paddings más usados: 12px 16px, 4px 12px, 0px 8px 0px 0px, 12px 20px, 24px 20px
- Sombras: `rgba(0, 0, 0, 0.55) 0px 12px 28px -8px`
- Ancho de contenedor: 1240px, 640px · padding lateral: 0px / 0px, 16px / 16px

Definir todo esto como variables CSS / `tailwind.config` y prohibir valores mágicos fuera de la escala.

## 4. Mapa de páginas a construir

| Tipo de página | Ruta del original | Secciones | Componentes destacados | Formularios |
| --- | --- | --- | --- | --- |
| Home | `/` | 1 | — | 0 |
| Página interna | `/t/seed-a` | 1 | 1 tablas | 0 |
| Página | `/entrar` | 1 | — | 1 |
| Página interna | `/t/seed-c` | 1 | 1 tablas | 0 |

Construir una ruta por cada tipo de página listado, con su layout propio y componentes compartidos.

**Página interna** — secciones en orden: Liga Seed A

**Página** — secciones en orden: Entrar

**Página interna** — secciones en orden: Liga Seed C (desempate)

## 4b. Estructura del home (orden de scroll del original)

| # | Sección | Encabezado | Alto | Layout | Contenido |
| --- | --- | --- | --- | --- | --- |
| 1 | div.portada | Tablas, fixtures y goleadores de tu torneo | 715px (0.79 vh) | grid, 1 col | 9 links, 9 items |

Alto total del home: 900px (1 viewports). 1 bloques de primer nivel.

**Capas fijas**: header/nav (sticky, z-index 20). Definir una escala de z-index documentada.

## 5. Componentes a construir

| Componente | Cantidad en el original | Nota de implementación |
| --- | --- | --- |
| svg | 13 | sprite o componentes de ícono, no SVG inline duplicado |
| links | 11 | links internos con el router, externos con `rel="noopener"` |

## 6. Comportamiento responsive

- Breakpoints declarados en el CSS original: 400, 460, 480, 560, 900
- Breakpoints a implementar: **640 / 768 / 1024 / 1280 / 1536** (Tailwind por defecto), verificando además 360px.
- Menú: colapsar a hamburguesa por debajo de 1024px, con panel accesible (foco atrapado, cierre por Escape).
- Contenedor: máximo 1240px, centrado, con padding lateral 0px / 0px.

| Ancho | Cards por fila | Links de nav visibles | Alto de header | h1 |
| --- | --- | --- | --- | --- |
| 360px | — | 0 | 62 | 30.4px |
| 390px | — | 0 | 62 | 30.4px |
| 768px | — | 0 | 62 | 46.08px |
| 1024px | — | 0 | 62 | 48px |
| 1280px | — | 0 | 62 | 48px |
| 1440px | — | 0 | 62 | 48px |
| 1920px | — | 0 | 62 | 48px |

- De 390px a 768px: h1 30.4px → 46.08px
- De 768px a 1024px: h1 46.08px → 48px

**Requisito duro:** ningún breakpoint entre 320px y 1920px puede tener scroll horizontal.

## 7. Movimiento e interacción

- Duraciones del original: 0.12s, 0.12s, 0.12s, 0.12s · easings: ease
- Propiedades animadas: border-color, background, transform
- En `:hover` cambian: background-attachment, background-clip, background-color, background-image, background-origin
- 10 elementos con transición y 6 con animación; 5 `@keyframes` declarados.
- En hover, los botones del original cambian: backgroundColor, color, outlineColor. Replicar ese tipo de respuesta, no necesariamente los valores.
- Foco de teclado del original: visible (2px solid rgb(251, 191, 36)).
- Estandarizar en 3 duraciones (150ms micro, 250ms normal, 400ms entrada) y un easing por tipo. Respetar `prefers-reduced-motion`.

## 8. Contenido y datos

- El home del original tiene 675 caracteres de texto visible, 0 imágenes y 11 links.
- Todo el contenido debe venir de datos (JSON/CMS/API), no hardcodeado en el markup.
- SEO: title y meta description por página, canonical, Open Graph, y JSON-LD.
- Idioma: `lang="es"`. Formatear moneda y fechas con `Intl`.
- H1 actual: "Tablas, fixtures y goleadores de tu torneo".
- Propuestas de valor que ya comunica: "TnmSport" · "Tablas, fixtures y goleadores de tu torneo" · "de tu torneo" · "TORNEOS EN JUEGO" · "Liga de Carga 1-3"
- Tono: informal rioplatense (vos), 32.5 palabras por oración, 1.5% de mayúsculas sostenidas. Escribir los textos nuevos con ese registro.

## 9. Mejoras obligatorias respecto del original

1. 11 elementos focusables sin foco visible. Mantener un `:focus-visible` claro.
2. Agregar "saltar al contenido principal" (skip link), que el original no tiene.
3. Contraste: 1 combinaciones por debajo de WCAG AA. Ajustar la paleta para cumplir 4.5:1 en texto normal y 3:1 en texto grande.
4. El original no usa WebP/AVIF. Servir AVIF o WebP con fallback.
5. El original no soporta modo oscuro. Definir los tokens con variables CSS para poder habilitarlo.
6. SEO: falta meta description.
7. SEO: no hay datos estructurados JSON-LD. Agregar Organization/WebSite y Product o Article según corresponda.

## 9b. Referencias visuales del original

Recortes reales de los componentes y zonas descriptos arriba (mismo orden que las tablas de la sección 5):

[Footer](../../shots/tnmsport-web.vercel.app/00-home/05-componentes/zone-footer.png)
[Header](../../shots/tnmsport-web.vercel.app/00-home/05-componentes/zone-header.png)
[Primera sección / hero](../../shots/tnmsport-web.vercel.app/00-home/05-componentes/zone-hero.png)

## 10. Criterios de aceptación

| Métrica | Original | Objetivo |
| --- | --- | --- |
| LCP | sin dato | < 2500 ms |
| CLS | 0.0064 | < 0.1 |
| FCP | 292 ms | < 1800 ms |
| TTFB | 36 ms | < 800 ms |
| Requests | 7 | < 40 |
| Peso transferido | 69 KB | < 500 KB |
| Nodos DOM | 133 | < 1200 |
| Imágenes sin alt | 0 | 0 |
| Inputs sin label | 0 | 0 |
| Fallos de contraste AA | 1 | 0 |
| Overflow horizontal | no | no, en ningún breakpoint |
| Errores de consola | 0 | 0 |

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
