# Analizador de sitios web

Herramienta de línea de comandos, con interfaz gráfica local opcional, que analiza sitios web y produce prompts de construcción listos para pasarle a una IA que genere una aplicación equivalente y mejor.

## 1. Para qué sirve

El caso de uso principal es este: el cliente muestra **sitios de la competencia que le gustaron** y quiere algo con esa estética. La herramienta los mide y traduce ese "me gusta cómo se ve" en una especificación concreta.

Cada sitio se carga con un **rol**:

- **Referencia** (`@referencia`): un sitio de la competencia que le gustó al cliente. Aporta la **estética** a replicar: color, tipografía, espaciado, forma de los componentes, densidad y movimiento.
- **Sitio del cliente** (`@cliente`): su sitio actual. Aporta la **estructura**, el contenido, las funcionalidades y las integraciones, y es la línea base de rendimiento a superar.

Con eso se generan tres tipos de entregable:

| Entregable | Archivo | Para qué |
| --- | --- | --- |
| Reporte técnico por sitio | `reportes/<sitio>/<sitio>.*` | Entender y documentar cada sitio en detalle |
| Prompt por sitio | `reportes/<sitio>/<sitio>-PROMPT.*` | Replicar y mejorar **ese** sitio puntual |
| **Prompt de síntesis** | `reportes/PROMPT-SINTESIS.*` | **El principal:** cruza la estética de todas las referencias con la estructura del cliente |

El flujo completo:

1. Se cargan los sitios con su rol (por la interfaz o editando `links.txt`).
2. La herramienta los recorre, los mide y los documenta: estructura, design tokens, componentes, responsive, animaciones, accesibilidad y rendimiento.
3. Se genera el prompt de síntesis, que extrae lo que las referencias tienen **en común** (eso es el estilo del rubro, no la casualidad de un sitio), lo cruza con la arquitectura de información del cliente, y suma los problemas medidos que la app nueva no debe repetir.
4. Ese prompt se le pasa a una IA para que construya la aplicación.

Analizar solo el sitio del cliente sigue funcionando igual: si no hay referencias marcadas, cada sitio recibe su reporte y su prompt individual.

Todo lo que aparece en los reportes son **mediciones reales**, no estimaciones: se leen los estilos computados del navegador, no el CSS declarado.

## 2. Requisitos e instalación

- Node.js 18 o superior.
- Chromium, que se instala con Playwright.

```
npm install
npx playwright install chromium
```

Lighthouse queda como dependencia opcional. Si no está instalado, la herramienta avisa y sigue sin él.

## 3. Uso rápido

### Interfaz gráfica

```
node ui.js
```

Abre `http://127.0.0.1:4599`. Desde ahí se cargan los sitios con su nombre y su rol (referencia o sitio del cliente), se elige la configuración, se dispara el análisis con el progreso en vivo y se abren los reportes generados, con el prompt de síntesis destacado arriba.

### Línea de comandos

```
node analyze.js --file links.txt --pages 5 --brief brief.md --lighthouse
node analyze.js --cliente "https://sitio-del-cliente.com" "https://competencia1.com" "https://competencia2.com"
node analyze.js --file links.txt --pages 4 --concurrency 3 --cache
node analyze.js --from-json
```

En PowerShell las URLs que contienen `&` **deben** ir entre comillas dobles, porque `&` es un operador reservado del shell. Usar `--file links.txt` evita el problema por completo.

## 4. Archivos de entrada

### links.txt

Una URL por línea. Después de la URL, detrás de un `#`, van el nombre y el rol. Las líneas vacías y las que empiezan con `#` se ignoran. El `https://` es opcional.

```
https://www.authogar.com/     # Authogar @cliente
https://www.macowens.com.ar/  # Macowens @referencia
https://www.devre.la/         # Devre @referencia
```

Sin rol explícito se asume `@referencia`. Se aceptan también `@propio` como sinónimo de cliente y `@competencia` como sinónimo de referencia.

Lo administra la interfaz gráfica, pero se puede editar a mano. Desde la línea de comandos, `--cliente <url>` marca esa URL como sitio del cliente y el resto quedan como referencias.

### brief.md (opcional)

Briefing del cliente. Se inyecta como **sección 0 del prompt**, con prioridad explícita sobre todo lo que se infiere del sitio actual: donde el pedido del cliente contradiga lo medido, gana el pedido del cliente.

Hay una plantilla en `brief.example.md` con las secciones a completar: qué pidió textualmente, qué le molesta del sitio actual, qué se conserva sí o sí, alcance, restricciones técnicas, prioridades y plazos.

## 5. Opciones de línea de comandos

| Flag | Default | Qué hace |
| --- | --- | --- |
| `--file`, `-f` | — | Lee las URLs de un archivo, una por línea |
| `--limit`, `-l` | — | Procesa solo las primeras N URLs de la lista |
| `--pages`, `-p` | 4 | Páginas por sitio: home más las más representativas |
| `--full-pages` | off | Mide todos los breakpoints en todas las páginas, no solo en el home |
| `--no-sitemap` | off | No lee sitemap.xml; descubre solo por los links del home |
| `--cliente <url>` | — | Marca esa URL como sitio del cliente; el resto quedan como referencias |
| `--brief` | — | Archivo de briefing del cliente |
| `--lighthouse` | off | Corre Lighthouse mobile con throttling |
| `--lh-desktop` | off | Igual pero con perfil desktop |
| `--breakpoints` | 360,390,768,1024,1280,1440,1920 | Anchos a medir |
| `--concurrency`, `-c` | 1 | Sitios analizados en paralelo |
| `--retries` | 1 | Reintentos por página que falla |
| `--cache` | off | Saltea sitios que ya tengan su JSON generado |
| `--keep-popups` | off | No cierra popups ni banners de cookies |
| `--headed` | off | Muestra el navegador trabajando |
| `--slow` | 0 | Milisegundos de demora entre acciones, para poder seguirlo a ojo |
| `--no-shots` | off | Sin capturas de ningún tipo |
| `--no-bp-shots` | off | Sin capturas por breakpoint |
| `--no-crops` | off | Sin recortes de componentes |
| `--no-interactions` | off | No capturar estados interactivos (hover, menú, filtros, carrito) |
| `--no-history` | off | No registra la corrida en el historial |
| `--from-json` | — | Regenera los reportes desde un análisis previo, sin volver a navegar |

`--from-json` es útil para iterar el formato de los reportes o del prompt sin esperar la corrida completa.

## 6. Archivos que genera

```
reportes/
  PROMPT-SINTESIS.md · .html · .docx            el prompt principal: estética de las
                                                referencias + estructura del cliente
  resumen.md · resumen.html · resumen.docx      índice y comparativas entre sitios
  datos-completos.json                          todos los datos crudos
  <sitio>/
    <sitio>.md · .html · .docx · .json          reporte técnico
    <sitio>-PROMPT.md · .html · .docx           prompt de construcción de ese sitio solo

shots/
  <sitio>/<NN-tipo-pagina>/
    01-desktop/       captura fullPage a 1440
    02-mobile/        captura fullPage a 390x844 con touch emulado
    03-breakpoints/   una captura por ancho medido
    04-popups/        el estado inicial con el popup, antes de cerrarlo
    05-componentes/   recortes de cada variante de botón, card e input, y de las zonas
    06-estados/       hover, foco, menú desplegado, filtros, carrito y buscador

historial/
  historial.md · .html · .docx                  todas las corridas con su evolución
  historial.json                                índice de corridas y métricas
  <corrida>/                                    snapshot de los reportes de esa corrida
```

`reportes/` siempre tiene la **última** corrida; `historial/` conserva las anteriores.

Los tres formatos tienen el mismo contenido:

- **HTML**: el más cómodo de leer. Tema claro y oscuro, tablas con encabezado fijo, muestras de color junto a cada valor hexadecimal y las capturas embebidas.
- **DOCX**: para mandarle al cliente. Hoja apaisada, con las imágenes embebidas.
- **MD**: para versionar o para pegar en otra herramienta.

## 7. Qué contiene el reporte técnico

| Sección | Contenido |
| --- | --- |
| Páginas analizadas | Tabla de las páginas descubiertas, con tipo, origen y métricas básicas |
| 0. Recorrido y popups | Overlays detectados al entrar, cómo se cerraron, y la traza paso a paso del análisis |
| 1. Meta y SEO | title, description, viewport, canonical, robots, Open Graph, Twitter, JSON-LD, hreflang, resource hints |
| 2. Stack | React, Next, Vue, Angular, jQuery, Tailwind, Bootstrap, WordPress, más 40 detecciones extra (e-commerce, analítica, animación, iconos) |
| 3. Estructura y layout | Landmarks, anatomía sección por sección en orden de scroll, contenedores, capas sticky/fixed, grillas, profundidad del DOM |
| 4. Tipografía | Familias, tamaños, pesos, line-heights y letter-spacing por frecuencia de uso real, escala por elemento, fuentes cargadas |
| 5. Paleta | Colores de texto, fondo y borde por frecuencia, gradientes, amplitud de la paleta |
| 6. Espaciado | Radios, sombras, gaps, paddings, márgenes y anchos de borde |
| 7. Componentes | Inventario de 26 tipos, variantes de botón, card e input agrupadas por firma de estilo, links, imágenes, formularios campo por campo, carruseles, tablas, navegación, footer, embeds, y los recortes |
| 8. Accesibilidad | Alt, jerarquía de encabezados, labels, nombres accesibles, foco, ARIA, landmarks, y contraste WCAG AA calculado sobre el fondo efectivo |
| 9. Animaciones | Transiciones, animaciones, keyframes, transforms, filtros, propiedades que cambian en hover, scroll reveal, prefers-reduced-motion |
| 10. Responsive | Una medición por breakpoint, transiciones de layout entre anchos, overflow horizontal con culpables, tap targets chicos |
| 11. CSS | Hojas, reglas por tipo, `!important`, media queries, breakpoints inferidos, `@font-face`, `@supports`, dark mode |
| 12. Performance y red | Navigation timing, paint, LCP, CLS, recursos por tipo y host, terceros, requests fallidos |
| 13. Lighthouse | Puntajes por categoría, métricas, oportunidades y auditorías de accesibilidad falladas |
| 15. Catálogo | Anatomía de la card de producto: campos que muestra en orden, grilla, y señales del modelo de negocio B2B (precios detrás de login, unidad de venta, cantidad mínima, stock, CUIT) |
| 16. Estados interactivos | Hover real con las propiedades que cambian, foco de teclado, menú desplegado, filtros, carrito y autocompletado del buscador |
| 17. Copy y tono | Titulares, propuestas de valor, CTAs, promesas del rubro, taxonomía de la navegación y registro (vos / usted / tú) |
| 18. Páginas adicionales | Resumen de cada página secundaria: estructura, componentes, formularios y responsive |

## 8. Qué contiene el prompt de síntesis

Es el entregable principal cuando hay referencias cargadas. Vive en `reportes/PROMPT-SINTESIS.*`.

| Sección | Contenido |
| --- | --- |
| 0. Punto de partida | Quién es quién (cliente y referencias), el briefing si se pasó, y la regla de oro: replicar el lenguaje visual, nunca el contenido |
| 1. Objetivo | Qué construir, combinando estética de las referencias con estructura del cliente |
| 2. Estética en común | Consenso entre referencias: color (neutros compartidos y acentos por sitio), tipografía, forma y espaciado, componentes, layout y densidad, movimiento. Cada valor indica en cuántas referencias aparece |
| 3. Estructura y funcionalidad | Páginas, secciones en orden de scroll, navegación, footer e integraciones, tomadas del sitio del cliente |
| 4. Stack | Lo detectado en cada sitio y la recomendación |
| 5. Referencias visuales | Recortes de header, nav y hero de cada sitio |
| 6. Calidad exigida | Tabla con el mejor valor entre todos los sitios analizados y el objetivo a superar, más la lista de errores que comete cada sitio y no hay que repetir |
| 7. Entregables | Qué se espera recibir, y qué no incluir |

La lógica del consenso es la parte que aporta valor real: un valor que aparece en 3 de 4 referencias es el estilo del rubro; uno que aparece en 1 de 4 es la decisión particular de un sitio. El prompt lo dice explícitamente en cada tabla, con la columna "Referencias" en formato `n/total`, para que la IA sepa qué es regla y qué es opción.

## 9. Qué contiene el prompt por sitio

Es el entregable central. Traduce las mediciones a una especificación accionable, en secciones numeradas:

| Sección | Contenido |
| --- | --- |
| 0. Pedido del cliente | El briefing, con prioridad sobre el resto (solo si se pasó `--brief`) |
| 1. Objetivo | Qué construir, con la aclaración de no copiar marcas ni contenido del original |
| 2. Stack | Recomendación derivada de lo detectado, más si es e-commerce y qué prever |
| 3. Design tokens | Colores con roles asignados, escala tipográfica, espaciado, radios y sombras, con avisos de consolidación cuando hay dispersión |
| 4. Mapa de páginas | Una fila por tipo de página con sus secciones y componentes destacados |
| 4b. Estructura del home | Las secciones en orden de scroll con su contenido |
| 5. Componentes | Qué construir, con las variantes mapeadas a primary/secondary/ghost y una nota de implementación accesible por componente |
| 6. Responsive | Breakpoints a implementar, umbral de hamburguesa, cards por fila, y el requisito duro de no tener scroll horizontal |
| 7. Movimiento | Duraciones, easings, qué cambia en hover, y estandarización propuesta |
| 8. Contenido y datos | Volumen de contenido, exigencia de datos externos, SEO e internacionalización |
| 9. Mejoras obligatorias | Lista numerada de los problemas medidos en el original que la app nueva debe corregir |
| 9b. Referencias visuales | Los recortes de los componentes y zonas del original |
| 10. Criterios de aceptación | Tabla original contra objetivo, con la línea base de Lighthouse si se corrió |
| 11. Entregables | Qué se espera recibir, y qué no incluir |

## 10. Historial de corridas

Cada corrida se registra automáticamente. No hace falta hacer nada; para desactivarlo está `--no-history`.

Qué guarda:

- **Un snapshot de los reportes** en `historial/<corrida>/`: los `.md`, `.html`, `.docx` y `.json` de cada sitio, sus prompts, el prompt de síntesis y el resumen. Así una corrida nueva no pisa lo anterior.
- **Un índice con métricas** en `historial/historial.json`: fecha, duración, opciones usadas, y por sitio su rol, estado y 22 métricas (Lighthouse, LCP, CLS, requests, peso, nodos DOM, fallos de contraste, imágenes sin alt, inputs sin label, breakpoints con overflow, errores de consola, cantidad de secciones, botones, cards, tokens distintos, overlays).
- **Una vista legible** en `historial/historial.md`, `.html` y `.docx`, con tres partes: el índice de corridas, el detalle de cada una con el **cambio de cada métrica respecto de la corrida anterior**, y una tabla de evolución por sitio a lo largo del tiempo.

Los deltas vienen marcados según si el cambio es una mejora o un empeoramiento: `✔` mejoró, `✖` empeoró, `=` sin cambios. La dirección depende de la métrica: en LCP o requests menos es mejor, en los puntajes de Lighthouse más es mejor, y las de estructura (secciones, botones, cards) se muestran sin juicio porque no son ni buenas ni malas.

Para qué sirve en la práctica:

- Demostrarle al cliente la mejora: se mide su sitio actual hoy, y cuando la app nueva esté lista se la mide con la misma herramienta. El historial muestra el antes y el después con los mismos criterios.
- Detectar que un sitio de referencia cambió entre corridas.
- Recuperar el prompt exacto que se usó en una entrega anterior.

Una limitación a tener en cuenta: los snapshots incluyen los reportes, pero **no las capturas de pantalla**, que viven en `shots/` y siempre corresponden a la última corrida de cada sitio. Un reporte archivado abierto hoy muestra las imágenes actuales, no las de su fecha. Se hizo así porque cada corrida genera decenas de megabytes de imágenes.

En la interfaz gráfica el historial aparece al pie, con una fila por sitio y los deltas coloreados en verde o rojo.

## 11. Arquitectura

```
analyze.js              CLI y orquestación
ui.js                   servidor HTTP local de la interfaz
ui/index.html           interfaz gráfica

lib/
  browserHelpers.js     utilidades inyectadas en la página (window.__A)
  discovery.js          descubrimiento y clasificación de páginas
  popups.js             detección y cierre de overlays
  network.js            intercepción de red
  lighthouse.js         corrida de Lighthouse
  zip.js                escritor de ZIP para el DOCX
  extractors/           lo que corre dentro del navegador
    meta.js  stack.js  styles.js  layout.js  components.js
    a11y.js  animations.js  cssom.js  perf.js  probe.js
    catalog.js          anatomía de la card de producto y señales B2B
    content.js          copy, tono, promesas y taxonomía
  report/
    markdown.js         reportes en markdown
    mdparse.js          parser del markdown generado
    html.js             markdown a HTML
    docx.js             markdown a DOCX (OOXML)
  history.js            historial de corridas y su comparación
  interactions.js       captura de estados interactivos
    prompt.js           el prompt de construcción por sitio
    synthesis.js        el prompt de síntesis entre referencias y cliente
```

### Cómo corre el análisis de una página

1. Se crea un contexto de navegador nuevo, viewport 1440x900, con los helpers y el observador de CLS/LCP inyectados antes de cualquier script de la página.
2. Se navega con `networkidle` y timeout de 60 segundos. Si no llega, se reintenta con `domcontentloaded`.
3. Se captura el estado inicial con el popup visible, y después se cierra.
4. Se hace un scroll completo para disparar el lazy-load y las animaciones de scroll.
5. Corren los nueve extractores, cada uno en su propio `page.evaluate()`.
6. Se recortan los componentes y zonas que los extractores marcaron.
7. Se captura el desktop fullPage.
8. Se mide cada breakpoint: se cambia el viewport, se vuelve a cerrar lo que aparezca, y se corre la sonda.
9. Se abre un contexto mobile aparte, con touch emulado, para la captura fullPage y su propia medición.

### Los extractores

Corren dentro del navegador, así que no pueden usar `require` ni cerrar sobre variables de Node. Comparten utilidades a través de `window.__A`, que `browserHelpers.js` instala con `addInitScript` en cada documento.

`styles.js` hace un solo recorrido de `getComputedStyle` sobre todos los elementos del body y de ahí saca tipografía, paleta, espaciado, estadísticas de display y contraste. Los demás consultan el DOM de forma dirigida.

Las variantes de componentes se agrupan por **firma de estilo**: se toman las propiedades relevantes del estilo computado, se concatenan y se agrupan por esa clave. Eso revela el design system tal como se usa, no como está declarado. Al agrupar, se marca un elemento representativo con `data-shot` para poder recortarlo después.

### El DOCX

Se genera sin dependencias externas. `zip.js` escribe el contenedor ZIP con deflate y CRC32 propios, y `docx.js` arma el OOXML mínimo: `document.xml`, `styles.xml`, `numbering.xml`, relaciones y content types. Soporta encabezados, párrafos con negrita, cursiva, código y links, listas, tablas con encabezado repetido, y PNG embebidos leyendo las dimensiones del chunk IHDR.

Los `<details>` del markdown se aplanan: el resumen queda como subtítulo.

## 12. La interfaz gráfica

`node ui.js` levanta un servidor HTTP nativo que escucha **solo en 127.0.0.1**. No tiene dependencias.

| Endpoint | Qué hace |
| --- | --- |
| `GET /api/links` | Lee links.txt |
| `PUT /api/links` | Lo reescribe, normalizando URLs y descartando inválidas y repetidas |
| `POST /api/run` | Arranca el análisis |
| `POST /api/stop` | Lo detiene |
| `GET /api/status` | Estado y últimas líneas del log |
| `GET /api/stream` | Server-sent events con el progreso en vivo |
| `GET /api/reports` | Lista los reportes generados |
| `GET /api/briefs` | Lista los archivos de briefing disponibles |
| `GET /api/history` | Historial de corridas con sus métricas y deltas |

### Diseño de la interfaz

La consola es una sola página servida por `ui.js`, sin framework ni build step: la herramienta no tiene dependencias de frontend y no vale la pena perder eso por una pantalla. Los criterios que sí se aplican son los de una interfaz moderna:

- **Tokens de diseño** como variables CSS, con un único color de acento (verde terminal) para todo lo interactivo. Ámbar y rojo aparecen solo para estados. Tema oscuro por defecto y claro por `prefers-color-scheme`.
- **Cinco pestañas** con patrón ARIA `tablist`/`tab`/`tabpanel`, navegables con flechas, Home y End, con la pestaña activa recordada entre sesiones. Al arrancar un análisis salta sola a Progreso.
- **Barra de acción fija** abajo: los botones de analizar y detener, más la última línea del log, siempre visibles sin importar en qué pestaña estés.
- **Responsive real**: la tabla de sitios se convierte en tarjetas apiladas por debajo de 860px y las pestañas scrollean en horizontal. Verificado con la propia herramienta a 1440, 768 y 390px: sin overflow horizontal.
- **WCAG 2.2 AA**: foco visible de 2px con offset (2.4.11), todos los elementos interactivos de 32px o más (2.5.8 pide 24), cada input con su `label`, `aria-live` en los estados y `prefers-reduced-motion` respetado.
- **Log tipo terminal** con filtro en vivo, autoscroll conmutable, copiar al portapapeles y coloreado por tipo de línea (éxito, error, advertencia).

### Cómo mantiene la conexión

El progreso llega por server-sent events, que es una conexión HTTP que queda abierta durante toda la corrida. Eso puede cortarse por motivos ajenos a la herramienta: el equipo se suspende, el navegador tira la conexión por inactividad, o el servidor se reinicia. Para que la interfaz nunca quede mostrando datos viejos sin avisar:

- El servidor manda un `ping` cada 15 segundos y desarma los timeouts del socket (`server.timeout`, `requestTimeout` y `headersTimeout` en 0), así una corrida de 20 minutos no se corta sola.
- La interfaz tiene un indicador de conexión en la barra superior: **conectado**, **reconectando…** o **servidor caído**.
- Además del stream, sondea `/api/status` cada 5 segundos. Si el stream quedó mudo más de 45 segundos, lo reabre; y si se perdieron líneas de log mientras estuvo cortado, las recupera del sondeo.
- Al volver de una suspensión o al cambiar de pestaña, revisa el estado enseguida.

Las capturas se sirven con `ETag` y `Cache-Control: max-age=3600`, y responden `304` si el navegador ya las tiene. Sin eso, abrir varias pestañas de reportes con imágenes de varios MB agotaba el límite de seis conexiones por origen del navegador y la interfaz parecía trabada.

Los argumentos del CLI se construyen como array y se pasan a `spawn` sin shell, y los valores numéricos se validan por rango, así que no hay forma de inyectar comandos desde el navegador. El servidor sirve archivos solo de `reportes/` y `shots/`, verificando que la ruta resuelta no se escape de esas carpetas.

## 13. Heurísticas y sus límites

Conviene saber qué partes son medición exacta y qué partes son inferencia:

- **Medición exacta**: estilos computados, conteos de elementos, timing de red, contraste, dimensiones, media queries del CSSOM.
- **Inferencia con margen de error**:
  - *Detección de stack*: se basa en marcadores en el DOM, variables globales y nombres de clases. Un sitio puede usar una tecnología sin dejar rastro visible.
  - *Menú hamburguesa*: primero se buscan selectores conocidos; si no hay, se marca un candidato por heurística y el reporte lo señala como "verificar a mano". Un sitio puede tener un botón de menú que no matchee ningún patrón típico.
  - *Cards por fila*: es una moda geométrica sobre elementos de ancho similar alineados en la misma fila. En homes cargadas de carruseles conviene mirarla junto a la captura del breakpoint.
  - *Tipo de página*: se clasifica por la URL. Una ruta poco convencional puede caer en "página interna".
  - *Overflow horizontal*: se descartan los elementos recortados por un ancestro con `overflow` distinto de visible, para no reportar los carruseles como roturas de layout.
  - *Consenso entre referencias*: los colores se agrupan por proximidad (se cuantiza cada canal), así que `#ffffff` y `#fefefe` cuentan como el mismo. Eso hace que el consenso sea legible, pero significa que un "2/2" puede corresponder a tonos apenas distintos.
  - *Secciones de la página*: en SPAs con wrappers anidados se desciende automáticamente hasta encontrar bloques de altura razonable. En sitios con estructura muy plana o muy anidada, el corte puede no coincidir con lo que un diseñador llamaría "sección".
  - *Muestra de elementos*: el recorrido de estilos tiene un tope de 25.000 elementos. Cuando se alcanza, el reporte lo dice explícitamente y las frecuencias corresponden a esa muestra, no al total.
- **Deliberadamente fuera de alcance**: checkout y login no se analizan, porque son flujos con datos personales.

Además, las métricas de la sección 12 se miden **sin throttling**, así que son optimistas: representan una conexión y una CPU buenas. Para números defendibles ante el cliente hay que usar `--lighthouse`, que sí aplica throttling de red y CPU. La diferencia es grande: un sitio que en la sección 12 parece rápido puede dar 27 de performance en Lighthouse.

## 14. Tiempos

Con 4 páginas por sitio y Lighthouse, calcular entre 4 y 6 minutos por sitio. Sin Lighthouse y solo el home, entre 35 y 60 segundos. Los sitios que nunca alcanzan `networkidle` son los más lentos, porque agotan el timeout de 60 segundos antes de caer al reintento.

Para listas largas conviene `--concurrency 3` y `--cache`.

## 15. Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| `No se permite usar el carácter de Y comercial (&)` | PowerShell interpretando el `&` de la URL. Encerrar la URL entre comillas dobles, o usar `--file links.txt` |
| `networkidle no llegó` en el log | Normal en sitios con polling o analítica constante. Cae solo a `domcontentloaded` y sigue |
| Lighthouse no corre | Falta instalarlo: `npm install lighthouse`. Es dependencia opcional |
| Un sitio da timeout siempre | Puede estar bloqueando automatización. Probar con `--headed` para ver qué pasa |
| El DOCX pesa mucho | Son las capturas embebidas. Usar `--no-crops` o `--no-bp-shots`, o quedarse con el HTML |
| Faltan recortes de componentes | El elemento estaba tapado, animado o fuera de flujo cuando se intentó capturarlo. El log dice cuántos se guardaron sobre cuántos se intentaron |
| La interfaz se traba después de unos minutos | Mirá el indicador de conexión arriba a la derecha. Si dice **servidor caído**, el proceso `node ui.js` se cerró: tiene que quedar corriendo en una terminal propia mientras se usa la interfaz. Si dice **reconectando…**, se cortó el stream y la interfaz sigue funcionando por sondeo |
| La terminal se congela sola en Windows | Si hiciste clic dentro de la ventana de la consola, el modo de selección rápida de Windows pausa el proceso hasta que presiones Escape o Enter. No es un cuelgue de la herramienta |
| `EADDRINUSE` al levantar la interfaz | Ya hay otra instancia en el puerto 4599. Cerrala, o usá otro puerto: `set PORT=4600 && node ui.js` |
| El análisis sigue pero la interfaz no muestra nada | El análisis corre en un proceso aparte, así que sigue aunque la interfaz se caiga. Al volver a abrirla recupera el estado y el log desde `/api/status` |

## 16. Cómo extenderlo

**Agregar una detección de tecnología**: en `lib/extractors/stack.js`, sumar una entrada al objeto `probes` con una función que devuelva booleano. Se ejecuta dentro de un try, así que no hace falta defender cada acceso.

**Agregar una métrica nueva**: si necesita recorrer todos los elementos, sumarla al recorrido único de `styles.js` en lugar de hacer otro `page.evaluate` con su propio loop. Si es puntual, agregarla al extractor que corresponda.

**Agregar un tipo de componente**: sumar el selector al objeto `SEL` de `components.js`. El conteo sale automático. Si además querés variantes y recorte, usar `A.variants()` con un prefijo de tag.

**Cambiar el prompt**: todo el texto está en `lib/report/prompt.js`, que recibe el resultado del análisis y devuelve markdown. Los tres formatos se generan a partir de ese markdown, así que un cambio ahí se propaga a MD, HTML y DOCX.

**Cambiar un reporte**: `lib/report/markdown.js` es la fuente única. `html.js` y `docx.js` solo convierten.
