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
      "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s",
      "ul", "ol", "li", "blockquote", "a", "hr",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "style", "class", "loading"],
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
      img: {
        width: [/^[0-9]+(?:px|%|em|rem)?$/],
        height: [/^[0-9]+(?:px|%|em|rem)?$/],
        "max-width": [/^[0-9]+(?:px|%|em|rem)?$/],
        "max-height": [/^[0-9]+(?:px|%|em|rem)?$/],
        "aspect-ratio": [/^[0-9/.\s]+$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
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
      img: (_tagName, attributes) => ({
        tagName: "img",
        attribs: {
          ...attributes,
          loading: attributes.loading || "lazy",
        },
      }),
    },
  });
}
