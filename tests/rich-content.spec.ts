import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { plainTextToArticleHtml, sanitizeArticleHtml } from "../src/lib/article-html";

const root = process.cwd();

test("sanitizer preserves rich tables and safe formatting", () => {
  const html = sanitizeArticleHtml(`
    <h2>Regional figures</h2>
    <p style="text-align: right"><strong>Summary</strong></p>
    <table>
      <thead><tr><th>Region</th><th>Population</th></tr></thead>
      <tbody><tr><td>Rabat-Salé-Kénitra</td><td><em>Example</em></td></tr></tbody>
    </table>
  `);

  expect(html).toContain("<h2>Regional figures</h2>");
  expect(html).toContain("<table>");
  expect(html).toContain("<thead>");
  expect(html).toContain("<th>Region</th>");
  expect(html).toContain("<strong>Summary</strong>");
  expect(html).toContain("text-align:right");
});

test("sanitizer removes executable and unsafe article HTML", () => {
  const html = sanitizeArticleHtml(`
    <p onclick="alert(1)">Safe text</p>
    <script>window.__unsafe = true</script>
    <iframe src="https://example.com"></iframe>
    <a href="javascript:alert(1)">Unsafe link</a>
    <img src="javascript:alert(1)" onerror="alert(1)">
  `);

  expect(html).toContain("Safe text");
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<iframe");
  expect(html).not.toContain("onclick");
  expect(html).not.toContain("onerror");
  expect(html).not.toContain("javascript:");
});

test("legacy plain text becomes paragraphs with preserved line breaks", () => {
  expect(plainTextToArticleHtml("First line\nsecond line\n\nNext paragraph")).toBe(
    "<p>First line<br>second line</p><p>Next paragraph</p>",
  );
  expect(sanitizeArticleHtml("<script>alert(1)</script>\n\nVisible")).toContain("&lt;script&gt;");
});

test("admin editor includes controlled table editing commands", async () => {
  const source = await readFile(path.join(root, "src/components/admin/RichTextEditor.tsx"), "utf8");
  const adminSource = await readFile(path.join(root, "src/components/AdminCMS.tsx"), "utf8");
  const apiSource = await readFile(path.join(root, "src/app/api/admin/[resource]/route.ts"), "utf8");

  expect(source).toContain("immediatelyRender: false");
  expect(source).toContain("insertTable({ rows: 3, cols: 3, withHeaderRow: true })");
  expect(source).toContain("addRowAfter()");
  expect(source).toContain("deleteRow()");
  expect(source).toContain("addColumnAfter()");
  expect(source).toContain("deleteColumn()");
  expect(source).toContain("toggleHeaderRow()");
  expect(source).toContain("mergeCells()");
  expect(source).toContain("editor.commands.setContent(nextContent, { emitUpdate: false })");
  expect(adminSource).toContain("<RichTextEditor value={draft.content}");
  expect(apiSource).toContain("payload.content = sanitizeArticleHtml(payload.content)");
});

test("public rich tables have responsive overflow styling", async () => {
  const css = await readFile(path.join(root, "src/app/globals.css"), "utf8");
  expect(css).toContain(".article-content table");
  expect(css).toContain("overflow-x: auto");
  expect(css).toContain("max-width: 100%");
  expect(css).toContain(".article-content th");
  expect(css).toContain(".article-content td");
});
