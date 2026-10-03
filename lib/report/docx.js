'use strict';

/**
 * Convierte el markdown del reporte en un .docx valido (OOXML minimo, sin dependencias).
 * Soporta headings, parrafos con negrita/cursiva/codigo/links, listas, tablas y bloques de codigo.
 * Los <details> se aplanan: el resumen queda como subtitulo.
 */

const fs = require('fs');
const path = require('path');
const { parseMarkdown, parseInline } = require('./mdparse');
const { createZip } = require('../zip');

const EMU_PER_PX = 9525;
const MAX_WIDTH_EMU = Math.round(6.2 * 914400); // 6,2 pulgadas de ancho util (hoja apaisada)
const MAX_IMAGE_BYTES = 1600 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 12 * 1024 * 1024;

/** Dimensiones de un PNG desde el chunk IHDR. */
function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

/** Estado de las imagenes embebidas de un documento. */
function imageCollector(baseDir, enabled) {
  const media = [];
  let totalBytes = 0;
  return {
    media,
    /** @returns {{rid: string, cx: number, cy: number}|null} */
    add(relPath) {
      if (!enabled || !baseDir) return null;
      if (!/\.png$/i.test(relPath)) return null;
      const abs = path.resolve(baseDir, relPath);
      let buf;
      try {
        buf = fs.readFileSync(abs);
      } catch (e) {
        return null;
      }
      if (buf.length > MAX_IMAGE_BYTES || totalBytes + buf.length > MAX_TOTAL_IMAGE_BYTES) return null;
      const size = pngSize(buf);
      if (!size) return null;
      totalBytes += buf.length;
      const idx = media.length + 1;
      media.push({ name: `word/media/image${idx}.png`, data: buf });
      let cx = size.w * EMU_PER_PX;
      let cy = size.h * EMU_PER_PX;
      if (cx > MAX_WIDTH_EMU) {
        cy = Math.round((cy * MAX_WIDTH_EMU) / cx);
        cx = MAX_WIDTH_EMU;
      }
      return { rid: `rIdImg${idx}`, id: idx, cx, cy };
    },
  };
}

function drawingXml(img, alt) {
  return (
    `<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:drawing>` +
    `<wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">` +
    `<wp:extent cx="${img.cx}" cy="${img.cy}"/><wp:docPr id="${img.id}" name="Imagen ${img.id}" descr="${xml(alt || '')}"/>` +
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr>` +
    `<pic:cNvPr id="${img.id}" name="Imagen ${img.id}"/><pic:cNvPicPr/></pic:nvPicPr>` +
    `<pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="${img.rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${img.cx}" cy="${img.cy}"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>` +
    `</a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`
  );
}

const xml = (s) =>
  String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // caracteres de control no validos en XML
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

const HEADING_STYLE = { 1: 'Title', 2: 'Heading1', 3: 'Heading2', 4: 'Heading3', 5: 'Heading4', 6: 'Heading5' };

function runXml(r) {
  const props = [];
  if (r.bold) props.push('<w:b/>');
  if (r.italic) props.push('<w:i/>');
  if (r.code) props.push('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="17"/>');
  if (r.link) props.push('<w:color w:val="0B62D6"/><w:u w:val="single"/>');
  const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
  const text = xml(r.text).replace(/\n/g, '</w:t><w:br/><w:t xml:space="preserve">');
  return `<w:r>${rPr}<w:t xml:space="preserve">${text}</w:t></w:r>`;
}

function paragraph(text, opts) {
  const o = opts || {};
  const pPr = [];
  if (o.style) pPr.push(`<w:pStyle w:val="${o.style}"/>`);
  if (o.list) pPr.push(`<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${o.ordered ? 2 : 1}"/></w:numPr>`);
  if (o.code) pPr.push('<w:shd w:val="clear" w:fill="F4F6F8"/><w:spacing w:before="60" w:after="60"/>');
  if (o.keepNext) pPr.push('<w:keepNext/>');
  const runs = (o.runs || parseInline(String(text))).map(runXml).join('');
  return `<w:p>${pPr.length ? `<w:pPr>${pPr.join('')}</w:pPr>` : ''}${runs}</w:p>`;
}

function cell(text, opts) {
  const o = opts || {};
  const shd = o.header ? '<w:shd w:val="clear" w:fill="F1F4F8"/>' : '';
  const runs = parseInline(String(text === '' ? '—' : text)).map((r) => Object.assign({}, r, { bold: o.header || r.bold }));
  return (
    `<w:tc><w:tcPr>${shd}<w:tcMar><w:top w:w="40" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/>` +
    `<w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tcMar></w:tcPr>` +
    `<w:p><w:pPr><w:spacing w:after="0"/><w:rPr><w:sz w:val="15"/></w:rPr></w:pPr>` +
    runs.map((r) => runXml(Object.assign({}, r, { size: 15 }))).join('') +
    `</w:p></w:tc>`
  );
}

function tableXml(headers, rows) {
  const borders =
    '<w:tblBorders>' +
    ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
      .map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="D8DEE6"/>`)
      .join('') +
    '</w:tblBorders>';
  const tblPr = `<w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblLayout w:type="autofit"/>${borders}</w:tblPr>`;
  const head = `<w:tr><w:trPr><w:tblHeader/></w:trPr>${headers.map((h) => cell(h, { header: true })).join('')}</w:tr>`;
  const body = rows
    .map((r) => {
      const cells = headers.map((_, i) => cell(r[i] === undefined ? '' : r[i]));
      return `<w:tr>${cells.join('')}</w:tr>`;
    })
    .join('');
  return `<w:tbl>${tblPr}${head}${body}</w:tbl><w:p><w:pPr><w:spacing w:after="80"/></w:pPr></w:p>`;
}

function blocksToDocx(blocks, depth, images) {
  const out = [];
  blocks.forEach((b) => {
    switch (b.type) {
      case 'heading':
        out.push(paragraph(b.text, { style: HEADING_STYLE[Math.min(6, b.level)] || 'Heading5', keepNext: true }));
        break;
      case 'paragraph': {
        out.push(paragraph(b.text));
        if (images) {
          parseInline(b.text).forEach((r) => {
            if (!r.link || !/\.png$/i.test(r.link)) return;
            const img = images.add(r.link);
            if (img) out.push(drawingXml(img, r.text));
          });
        }
        break;
      }
      case 'list':
        b.items.forEach((it) => out.push(paragraph(it, { list: true, ordered: b.ordered })));
        break;
      case 'table':
        out.push(tableXml(b.headers, b.rows));
        break;
      case 'code':
        b.text.split(/\r?\n/).forEach((line) => out.push(paragraph(line || ' ', { code: true, runs: [{ text: line || ' ', code: true }] })));
        break;
      case 'details':
        out.push(paragraph(b.summary, { style: 'Heading4', keepNext: true }));
        out.push.apply(out, blocksToDocx(b.blocks, (depth || 0) + 1, images));
        break;
      case 'hr':
        out.push('<w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" w:color="D8DEE6"/></w:pBdr></w:pPr></w:p>');
        break;
      default:
        break;
    }
  });
  return out;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const DOC_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>`;

const styleDef = (id, name, size, color, bold, before) =>
  `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="${name}"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>` +
  `<w:pPr><w:keepNext/><w:spacing w:before="${before}" w:after="80"/><w:outlineLvl w:val="0"/></w:pPr>` +
  `<w:rPr>${bold ? '<w:b/>' : ''}<w:color w:val="${color}"/><w:sz w:val="${size}"/></w:rPr></w:style>`;

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:styleId="Normal" w:default="1"><w:name w:val="Normal"/></w:style>
${styleDef('Title', 'Title', 40, '11161C', true, 0)}
${styleDef('Heading1', 'heading 1', 30, '11161C', true, 320)}
${styleDef('Heading2', 'heading 2', 24, '0B62D6', true, 260)}
${styleDef('Heading3', 'heading 3', 21, '11161C', true, 220)}
${styleDef('Heading4', 'heading 4', 19, '46505C', true, 180)}
${styleDef('Heading5', 'heading 5', 18, '46505C', true, 160)}
</w:styles>`;

const NUMBERING = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/>
<w:pPr><w:ind w:left="420" w:hanging="220"/></w:pPr></w:lvl></w:abstractNum>
<w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/>
<w:pPr><w:ind w:left="420" w:hanging="220"/></w:pPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
<w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>`;

/**
 * @param {string} md markdown fuente
 * @param {{title?: string, isoDate?: string}} opts
 * @returns {Buffer} contenido del .docx
 */
module.exports = function buildDocx(md, opts) {
  const o = opts || {};
  const title = o.title || 'Reporte';
  const date = o.isoDate || '1980-01-01T00:00:00Z';
  const images = imageCollector(o.baseDir, o.embedImages !== false);
  const body = blocksToDocx(parseMarkdown(md), 0, images).join('\n');
  const imageRels = images.media
    .map((m, i) => `<Relationship Id="rIdImg${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image${i + 1}.png"/>`)
    .join('');

  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>
${body}
<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="360" w:footer="360" w:gutter="0"/></w:sectPr>
</w:body>
</w:document>`;

  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<dc:title>${xml(title)}</dc:title>
<dc:creator>analyze.js</dc:creator>
<cp:lastModifiedBy>analyze.js</cp:lastModifiedBy>
<dcterms:created xsi:type="dcterms:W3CDTF">${xml(date)}</dcterms:created>
<dcterms:modified xsi:type="dcterms:W3CDTF">${xml(date)}</dcterms:modified>
</cp:coreProperties>`;

  const app = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>analyze.js</Application></Properties>`;

  const docRels = DOC_RELS.replace('</Relationships>', `${imageRels}</Relationships>`);
  const contentTypes = images.media.length
    ? CONTENT_TYPES.replace('<Default Extension="xml"', '<Default Extension="png" ContentType="image/png"/><Default Extension="xml"')
    : CONTENT_TYPES;

  return createZip(
    [
      { name: '[Content_Types].xml', data: contentTypes },
      { name: '_rels/.rels', data: RELS },
      { name: 'word/document.xml', data: document },
      { name: 'word/_rels/document.xml.rels', data: docRels },
      { name: 'word/styles.xml', data: STYLES },
      { name: 'word/numbering.xml', data: NUMBERING },
      { name: 'docProps/core.xml', data: core },
      { name: 'docProps/app.xml', data: app },
    ].concat(images.media)
  );
};
