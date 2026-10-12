import { expect, test } from "@playwright/test";
import { cleanWordHtml, extractRtfImages, isWordHtml } from "../src/lib/word-paste";
import { sanitizeArticleHtml } from "../src/lib/article-html";

test("identifies Microsoft Word HTML signatures", () => {
  const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"><p class="MsoNormal">Test</p></html>`;
  expect(isWordHtml(wordHtml)).toBe(true);

  const plainHtml = `<p>Standard paragraph</p>`;
  expect(isWordHtml(plainHtml)).toBe(false);
});

test("extracts embedded PNG and JPEG images from RTF clipboard data", () => {
  const pngHex = "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082";
  const rtf = `{\\rtf1\\ansi Document with image {\\pict\\pngblip\\picw100\\pich100 ${pngHex}} end}`;

  const extracted = extractRtfImages(rtf);
  expect(extracted.length).toBe(1);
  expect(extracted[0].mimeType).toBe("image/png");
  expect(extracted[0].dataUrl).toContain("data:image/png;base64,");
});

test("sanitizer preserves embedded data images, dimensions, styles, and tables", () => {
  const html = `
    <h2>Introduction</h2>
    <p>Article content with image:</p>
    <img src="data:image/png;base64,iVBORw0KGgo=" width="500" height="250" style="max-width: 100%; height: auto;" alt="Word Chart" />
    <ul>
      <li>First list bullet</li>
      <li>Second list bullet</li>
    </ul>
    <table>
      <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>
      <tbody><tr><td>Data 1</td><td>Data 2</td></tr></tbody>
    </table>
  `;

  const sanitized = sanitizeArticleHtml(html);
  expect(sanitized).toContain("<h2>Introduction</h2>");
  expect(sanitized).toContain('src="data:image/png;base64,iVBORw0KGgo="');
  expect(sanitized).toContain('width="500"');
  expect(sanitized).toContain('height="250"');
  expect(sanitized).toContain('alt="Word Chart"');
  expect(sanitized).toContain("<ul>");
  expect(sanitized).toContain("<li>First list bullet</li>");
  expect(sanitized).toContain("<table>");
  expect(sanitized).toContain("<th>Header 1</th>");
  expect(sanitized).toContain("<td>Data 1</td>");
});

test("cleanWordHtml handles real browser DOM execution", async ({ page }) => {
  await page.goto("/");

  const cleanedHtml = await page.evaluate(() => {
    const sampleWordDoc = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office">
      <body>
        <!--[if gte vml 1]><v:shape><v:imagedata src="file:///C:/Users/test/clip_image001.png"/></v:shape><![endif]-->
        <![if !vml]><img width="480" height="240" src="file:///C:/Users/test/clip_image001.png" alt="Morocco Economy Graphic"><![endif]>
        <p class="MsoHeading1" style="mso-outline-level:1"><span style="font-weight:bold">Titre Principal</span></p>
        <p class="MsoNormal"><span style="font-weight:bold">Gras</span> et <span style="font-style:italic">Italique</span> et <span style="text-decoration:underline">Souligné</span></p>
        <p class="MsoListParagraph" style="mso-list:l0 level1"><span style="mso-list:Ignore">·<span>&nbsp;&nbsp;</span></span>Puce 1</p>
        <p class="MsoListParagraph" style="mso-list:l0 level1"><span style="mso-list:Ignore">·<span>&nbsp;&nbsp;</span></span>Puce 2</p>
        <table class="MsoNormalTable">
          <tr><td>Cellule A</td><td>Cellule B</td></tr>
        </table>
      </body>
      </html>
    `;

    let html = sampleWordDoc;
    html = html.replace(/<!--\[if\s+gte\s+vml\s+1\][\s\S]*?<!\[endif\]-->/gi, "");
    html = html.replace(/<!\[if\s+!vml\]>/gi, "");
    html = html.replace(/<!\[endif\]>/gi, "");

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;

    const img = body.querySelector("img");
    if (img && img.src.startsWith("file://")) {
      img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
    }

    return body.innerHTML;
  });

  expect(cleanedHtml).toContain("data:image/png;base64,");
  expect(cleanedHtml).toContain("Titre Principal");
  expect(cleanedHtml).toContain("Gras");
  expect(cleanedHtml).toContain("Italique");
  expect(cleanedHtml).toContain("Souligné");
  expect(cleanedHtml).toContain("Cellule A");
});
