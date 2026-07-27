import sanitizeHtml from "sanitize-html";

const richTextTagPattern = /<\/?(?:p|br|h[2-4]|strong|b|em|i|u|ul|ol|li|blockquote|a|hr|table|thead|tbody|tfoot|tr|th|td|img)\b/i;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function plainTextToArticleHtml(value: string) {
  return value
    .split(/\n{2,}/)
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`)
    .join("");
}

export function sanitizeArticleHtml(value: string | null | undefined) {
  const content = value?.trim() ?? "";
  if (!content) return "";
  const html = richTextTagPattern.test(content) ? content : plainTextToArticleHtml(content);

  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u",
      "ul", "ol", "li", "blockquote", "a", "hr",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title"],
      th: ["colspan", "rowspan", "style"],
      td: ["colspan", "rowspan", "style"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^(?:left|right|center|justify)$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: {
          ...attributes,
          target: attributes.target === "_blank" ? "_blank" : "_self",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}
