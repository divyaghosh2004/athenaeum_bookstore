import zlib from 'zlib';

/**
 * Escapes characters for PDF literal text strings
 */
function escapePdf(text) {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Escapes XML/HTML entities for EPUB
 */
function escapeXml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Computes standard CRC-32 checksum for ZIP
 */
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte >>>= 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Pure Node.js ZIP archive builder (zero external dependencies)
 */
function createZip(files) {
  const buffers = [];
  const centralDirectory = [];
  let offset = 0;

  for (const file of files) {
    const isMime = file.name === 'mimetype';
    const nameBuf = Buffer.from(file.name, 'utf8');
    const contentBuf = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, 'utf8');
    
    // Mimetype must be uncompressed (method 0), other files Deflated (method 8)
    const method = isMime ? 0 : 8;
    const compressed = isMime ? contentBuf : zlib.deflateRawSync(contentBuf);
    const crc = crc32(contentBuf);

    // Local file header (30 bytes)
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // Signature
    localHeader.writeUInt16LE(20, 4);          // Version needed (2.0)
    localHeader.writeUInt16LE(0, 6);           // Flags
    localHeader.writeUInt16LE(method, 8);      // Compression method
    localHeader.writeUInt16LE(0, 10);          // Mod time
    localHeader.writeUInt16LE(0, 12);          // Mod date
    localHeader.writeUInt32LE(crc, 14);        // CRC32
    localHeader.writeUInt32LE(compressed.length, 18); // Compressed size
    localHeader.writeUInt32LE(contentBuf.length, 22); // Uncompressed size
    localHeader.writeUInt16LE(nameBuf.length, 26);    // File name length
    localHeader.writeUInt16LE(0, 28);                 // Extra field length

    buffers.push(localHeader, nameBuf, compressed);

    // Central directory header (46 bytes)
    const cdHeader = Buffer.alloc(46);
    cdHeader.writeUInt32LE(0x02014b50, 0); // Signature
    cdHeader.writeUInt16LE(20, 4);         // Version made by
    cdHeader.writeUInt16LE(20, 6);         // Version needed
    cdHeader.writeUInt16LE(0, 8);          // Flags
    cdHeader.writeUInt16LE(method, 10);    // Compression
    cdHeader.writeUInt16LE(0, 12);         // Time
    cdHeader.writeUInt16LE(0, 14);         // Date
    cdHeader.writeUInt32LE(crc, 16);       // CRC32
    cdHeader.writeUInt32LE(compressed.length, 20); // Compressed size
    cdHeader.writeUInt32LE(contentBuf.length, 24); // Uncompressed size
    cdHeader.writeUInt16LE(nameBuf.length, 28);    // Name len
    cdHeader.writeUInt16LE(0, 30);                 // Extra len
    cdHeader.writeUInt16LE(0, 32);                 // Comment len
    cdHeader.writeUInt16LE(0, 34);                 // Disk start
    cdHeader.writeUInt16LE(0, 36);                 // Internal attrs
    cdHeader.writeUInt32LE(0, 38);                 // External attrs
    cdHeader.writeUInt32LE(offset, 42);            // Offset to local header

    centralDirectory.push(cdHeader, nameBuf);
    offset += 30 + nameBuf.length + compressed.length;
  }

  const cdBuf = Buffer.concat(centralDirectory);
  
  // End of Central Directory (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // Signature
  eocd.writeUInt16LE(0, 4);          // Disk num
  eocd.writeUInt16LE(0, 6);          // Start disk
  eocd.writeUInt16LE(files.length, 8); // Entries this disk
  eocd.writeUInt16LE(files.length, 10); // Total entries
  eocd.writeUInt32LE(cdBuf.length, 12); // CD size
  eocd.writeUInt32LE(offset, 16);       // CD offset
  eocd.writeUInt16LE(0, 20);            // Comment length

  buffers.push(cdBuf, eocd);
  return Buffer.concat(buffers);
}

/**
 * Word wraps string into an array of lines
 */
function wrapLines(text, maxChars = 70) {
  const lines = [];
  if (!text) return lines;
  const paragraphs = String(text).split('\n');
  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(' ');
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > maxChars) {
        lines.push(line.trim());
        line = w;
      } else {
        line = (line + ' ' + w).trim();
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

/**
 * Generates an authentic, formatted PDF binary Buffer for any book
 */
export function generateBookPDF(book) {
  const title = escapePdf(book.title || 'Untitled Book');
  const author = escapePdf(book.author || 'Athenaeum Author');
  const category = escapePdf(book.category || 'Literature');
  const description = book.description || 'Curated literary volume from the Athenaeum Bookstore.';
  const sampleContent = book.sampleContent || 'Chapter 1: The Beginning\n\nWelcome to this verified digital volume from the Athenaeum Bookstore Collection. This edition has been preserved with classical typography and is fully readable offline on any computer or mobile device.';

  const descLines = wrapLines(description, 68).map(escapePdf);
  const bodyLines = wrapLines(sampleContent, 72).map(escapePdf);

  // Page 1: Elegant Cover & Bibliographic Front Matter
  const p1 = [
    'BT',
    '/F2 12 Tf',
    '72 760 Td',
    '(ATHENAEUM LITERARY EDITIONS -- VERIFIED DIGITAL VOLUME) Tj',
    '/F1 26 Tf',
    '0 -50 Td',
    '(' + title + ') Tj',
    '/F2 15 Tf',
    '0 -32 Td',
    '(By ' + author + ') Tj',
    '/F2 12 Tf',
    '0 -24 Td',
    '(Category: ' + category + ' | Athenaeum Press) Tj',
    '0 -30 Td',
    '(--------------------------------------------------------------------------------) Tj',
    '0 -35 Td',
    '(DIGITAL MASTER EDITION -- FORMATTED FOR OFFLINE E-READERS) Tj',
    '0 -22 Td',
    '(Original Publisher: Athenaeum Bookstore Curated Academic & Trade Catalog) Tj',
    '0 -22 Td',
    '(Standard Indian Edition -- All Rights Reserved) Tj',
    '0 -22 Td',
    '(Preserved with authentic classical typography and structured layout.) Tj',
    '0 -45 Td',
    '(Table of Contents:) Tj',
    '0 -22 Td',
    '(   I. Editorial Overview and Synopsis ............................. Page 2) Tj',
    '0 -20 Td',
    '(   II. Chapter One: Primary Reading Text ........................... Page 3) Tj',
    '0 -20 Td',
    '(   III. Reader Notes and Bibliographic Citation .................... Page 3) Tj',
    'ET'
  ].join('\n');

  // Page 2: Editorial Synopsis & Context
  const p2Ops = [
    'BT',
    '/F1 18 Tf',
    '72 770 Td',
    '(Editorial Synopsis and Background) Tj',
    '/F2 11 Tf',
    '0 -30 Td'
  ];
  for (const l of descLines) {
    p2Ops.push('(' + l + ') Tj', '0 -16 Td');
  }
  p2Ops.push('0 -20 Td', '(--------------------------------------------------------------------------------) Tj', '0 -24 Td');
  p2Ops.push('/F1 13 Tf', '(Athenaeum Editorial Board Evaluation:) Tj', '/F2 11 Tf', '0 -20 Td');
  p2Ops.push('(Selected for literary distinction, cultural resonance, and intellectual depth.) Tj', '0 -18 Td');
  p2Ops.push('(This volume has been verified against canonical print editions.) Tj');
  p2Ops.push('ET');
  const p2 = p2Ops.join('\n');

  // Page 3: Chapter Reading Text
  const p3Ops = [
    'BT',
    '/F1 18 Tf',
    '72 770 Td',
    '(' + title + ' -- Chapter One) Tj',
    '/F2 11 Tf',
    '0 -30 Td'
  ];
  for (const l of bodyLines) {
    p3Ops.push('(' + l + ') Tj', '0 -16 Td');
  }
  p3Ops.push('0 -26 Td', '(--------------------------------------------------------------------------------) Tj', '0 -20 Td');
  p3Ops.push('([End of Excerpt -- Athenaeum Digital Library]) Tj');
  p3Ops.push('ET');
  const p3 = p3Ops.join('\n');

  // Assemble PDF Objects
  const objects = [];
  const add = (str) => { objects.push(str); return objects.length; };

  add('<< /Type /Catalog /Pages 2 0 R >>');
  add('<< /Type /Pages /Kids [ 3 0 R 4 0 R 5 0 R ] /Count 3 >>');
  add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 8 0 R >>');
  add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 9 0 R >>');
  add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 6 0 R /F2 7 0 R >> >> /Contents 10 0 R >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  add('<< /Length ' + Buffer.byteLength(p1) + ' >>\nstream\n' + p1 + '\nendstream');
  add('<< /Length ' + Buffer.byteLength(p2) + ' >>\nstream\n' + p2 + '\nendstream');
  add('<< /Length ' + Buffer.byteLength(p3) + ' >>\nstream\n' + p3 + '\nendstream');

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n';
  }

  const xref = pdf.length;
  pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  for (const o of offsets) {
    pdf += String(o).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n';

  return Buffer.from(pdf, 'utf8');
}

/**
 * Generates an authentic EPUB 3.0 container binary Buffer for any book
 */
export function generateBookEPUB(book) {
  const title = escapeXml(book.title || 'Untitled Book');
  const author = escapeXml(book.author || 'Athenaeum Author');
  const category = escapeXml(book.category || 'Literature');
  const description = escapeXml(book.description || '');
  const sampleContent = book.sampleContent || 'Chapter 1: The Beginning\n\nWelcome to this verified digital volume from the Athenaeum Bookstore Collection.';
  const bookId = 'athenaeum-' + (book._id || 'book-volume-1');

  // Convert content newlines into HTML paragraphs
  const contentParagraphs = sampleContent
    .split('\n')
    .filter(p => p.trim())
    .map(p => '<p>' + escapeXml(p) + '</p>')
    .join('\n');

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  const styleCss = `
body {
  font-family: Georgia, 'Times New Roman', serif;
  margin: 5%;
  line-height: 1.6;
  color: #1a1a1a;
  background-color: #faf9f6;
}
h1, h2, h3 {
  font-family: 'Cinzel', 'Palatino', serif;
  color: #800020;
  text-align: center;
}
.title-page {
  text-align: center;
  padding: 40px 10px;
}
.author {
  font-size: 1.3em;
  font-weight: bold;
  margin: 20px 0;
  color: #444;
}
.metadata {
  font-size: 0.9em;
  color: #666;
  border-top: 1px solid #ddd;
  padding-top: 20px;
  margin-top: 40px;
}
p {
  margin: 1em 0;
  text-align: justify;
}
`;

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>en</dc:language>
    <dc:publisher>Athenaeum Press India</dc:publisher>
    <dc:subject>${category}</dc:subject>
    <dc:description>${description}</dc:description>
    <dc:identifier id="BookId">urn:uuid:${bookId}</dc:identifier>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.[0-9]+Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="style" href="style.css" media-type="text/css"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
  </manifest>
  <spine>
    <itemref idref="titlepage"/>
    <itemref idref="nav"/>
    <itemref idref="chapter1"/>
  </spine>
</package>`;

  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h2>Table of Contents</h2>
    <ol>
      <li><a href="titlepage.xhtml">Title Page</a></li>
      <li><a href="chapter1.xhtml">Chapter 1: Reading Text</a></li>
    </ol>
  </nav>
</body>
</html>`;

  const titlepageXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <div class="title-page">
    <p style="text-transform: uppercase; letter-spacing: 2px; color: #800020; font-size: 0.85em;">Athenaeum Curated Digital Library</p>
    <h1 style="font-size: 2.2em; margin: 20px 0;">${title}</h1>
    <div class="author">By ${author}</div>
    <p style="font-style: italic; color: #555;">Discipline / Genre: ${category}</p>
    <div class="metadata">
      <p>Published by Athenaeum Press India Pvt. Ltd.</p>
      <p>Preserved with original literary structure and offline readability.</p>
      <p style="font-size: 0.85em; color: #888;">All Rights Reserved &copy; Athenaeum Editions</p>
    </div>
  </div>
</body>
</html>`;

  const chapter1Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${title} - Chapter 1</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h2>Chapter 1</h2>
  <div style="margin: 20px 0; border-left: 3px solid #800020; padding-left: 15px; font-style: italic; color: #555;">
    <p><strong>Synopsis:</strong> ${description}</p>
  </div>
  ${contentParagraphs}
  <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;"/>
  <p style="text-align: center; font-size: 0.85em; color: #777;">[End of Excerpt &bull; Athenaeum Digital Reader]</p>
</body>
</html>`;

  return createZip([
    { name: 'mimetype', content: 'application/epub+zip' },
    { name: 'META-INF/container.xml', content: containerXml },
    { name: 'OEBPS/content.opf', content: contentOpf },
    { name: 'OEBPS/style.css', content: styleCss },
    { name: 'OEBPS/nav.xhtml', content: navXhtml },
    { name: 'OEBPS/titlepage.xhtml', content: titlepageXhtml },
    { name: 'OEBPS/chapter1.xhtml', content: chapter1Xhtml }
  ]);
}
