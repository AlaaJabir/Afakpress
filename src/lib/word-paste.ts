/**
 * Utilities for Microsoft Word and rich text clipboard processing.
 * Extracts embedded images from Word RTF, cleans Word-specific MSO HTML markup,
 * normalizes headings, lists, tables, and typography, and persists images.
 */

export interface ExtractedImage {
  mimeType: string;
  dataUrl: string;
}

/**
 * Converts a hex string (from RTF pict) to a base64 data URL.
 */
export function hexToDataUrl(hex: string, mimeType: string): string {
  const byteLength = Math.floor(hex.length / 2);
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }

  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

/**
 * Extracts all embedded images from RTF clipboard data.
 * Microsoft Word embeds document images as hex data inside {\pict ...} groups.
 */
export function extractRtfImages(rtf: string): ExtractedImage[] {
  if (!rtf) return [];
  const results: ExtractedImage[] = [];

  let startIndex = 0;
  while ((startIndex = rtf.indexOf("{\\pict", startIndex)) !== -1) {
    let depth = 0;
    let endIndex = startIndex;
    for (let i = startIndex; i < rtf.length; i++) {
      if (rtf[i] === "{") depth++;
      else if (rtf[i] === "}") {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex <= startIndex) {
      startIndex += 6;
      continue;
    }

    const pictBlock = rtf.substring(startIndex, endIndex + 1);
    startIndex = endIndex + 1;

    let mimeType = "image/png";
    if (pictBlock.includes("\\jpegblip")) {
      mimeType = "image/jpeg";
    } else if (pictBlock.includes("\\pngblip")) {
      mimeType = "image/png";
    }

    // Strip RTF control words (\word), binary counts, braces, and newlines
    const cleanHex = pictBlock
      .replace(/\\bin\d+\s*/g, "")
      .replace(/\\[a-zA-Z0-9-]+\s*/g, "")
      .replace(/[{}\r\n\s]/g, "");

    if (cleanHex.length >= 32 && /^[0-9a-fA-F]+$/.test(cleanHex)) {
      const lowerHex = cleanHex.toLowerCase();
      if (lowerHex.startsWith("ffd8ff")) {
        mimeType = "image/jpeg";
      } else if (lowerHex.startsWith("89504e47")) {
        mimeType = "image/png";
      } else if (lowerHex.startsWith("47494638")) {
        mimeType = "image/gif";
      } else if (lowerHex.startsWith("52494646")) {
        mimeType = "image/webp";
      }

      try {
        const dataUrl = hexToDataUrl(cleanHex, mimeType);
        if (dataUrl) {
          results.push({ mimeType, dataUrl });
        }
      } catch (err) {
        console.warn("[extractRtfImages] Failed to parse image hex:", err);
      }
    }
  }

  return results;
}

/**
 * Checks if the HTML contains Microsoft Word or Office specific signatures.
 */
export function isWordHtml(html: string): boolean {
  if (!html) return false;
  return (
    /xmlns:o="urn:schemas-microsoft-com:office/i.test(html) ||
    /xmlns:w="urn:schemas-microsoft-com:office:word/i.test(html) ||
    /progid="Word\.Document"/i.test(html) ||
    /class="?Mso/i.test(html) ||
    /style="[^"]*mso-/i.test(html) ||
    /<!--\[if\s+gte\s+mso/i.test(html) ||
    /<!--\[if\s+gte\s+vml/i.test(html)
  );
}

/**
 * Cleans and normalizes HTML pasted from Microsoft Word or other rich text sources.
 * Replaces broken local image paths with RTF extracted images, normalizes headings,
 * reconstructs proper HTML lists, cleans tables, and strips bloated MSO tags and styles.
 */
export function cleanWordHtml(rawHtml: string, rtf?: string): string {
  if (!rawHtml) return "";

  let html = rawHtml;

  // 1. Remove MSO conditional comments, VML markup, and office tags
  html = html.replace(/<!--\[if\s+gte\s+vml\s+1\][\s\S]*?<!\[endif\]-->/gi, "");
  html = html.replace(/<!--\[if\s+gte\s+mso[\s\S]*?<!\[endif\]-->/gi, "");
  html = html.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "");
  html = html.replace(/<!\[if\s+!vml\]>/gi, "");
  html = html.replace(/<!\[if\s+!supportLists\]>/gi, "");
  html = html.replace(/<!\[endif\]>/gi, "");
  html = html.replace(/<o:p>[\s\S]*?<\/o:p>/gi, "");
  html = html.replace(/<xml>[\s\S]*?<\/xml>/gi, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Extract RTF images if RTF was provided
  const rtfImages = rtf ? extractRtfImages(rtf) : [];
  let rtfImageIndex = 0;

  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  if (!body) return html;

  // 2. Process all images
  const images = Array.from(body.querySelectorAll("img"));
  images.forEach((img) => {
    let src = img.getAttribute("src") || "";

    // Replace file:/// or broken local paths with RTF images
    if (src.startsWith("file://") || src.includes("clip_image") || !src) {
      if (rtfImageIndex < rtfImages.length) {
        src = rtfImages[rtfImageIndex].dataUrl;
        img.setAttribute("src", src);
        rtfImageIndex++;
      }
    }

    // Preserve dimensions
    let width = img.getAttribute("width");
    let height = img.getAttribute("height");
    const style = img.getAttribute("style") || "";

    if (!width) {
      const widthMatch = style.match(/(?:^|;)\s*width:\s*([\d.]+)(pt|in|px|cm)?/i);
      if (widthMatch) {
        const val = parseFloat(widthMatch[1]);
        const unit = (widthMatch[2] || "px").toLowerCase();
        const px = unit === "pt" ? Math.round(val * 1.333) : unit === "in" ? Math.round(val * 96) : unit === "cm" ? Math.round(val * 37.8) : Math.round(val);
        width = String(px);
      }
    }

    if (!height) {
      const heightMatch = style.match(/(?:^|;)\s*height:\s*([\d.]+)(pt|in|px|cm)?/i);
      if (heightMatch) {
        const val = parseFloat(heightMatch[1]);
        const unit = (heightMatch[2] || "px").toLowerCase();
        const px = unit === "pt" ? Math.round(val * 1.333) : unit === "in" ? Math.round(val * 96) : unit === "cm" ? Math.round(val * 37.8) : Math.round(val);
        height = String(px);
      }
    }

    if (width) img.setAttribute("width", width);
    if (height) img.setAttribute("height", height);

    img.removeAttribute("class");
    img.removeAttribute("style");
    let imgStyle = "max-width: 100%; height: auto;";
    if (width) {
      imgStyle += ` width: ${width}px;`;
    }
    img.setAttribute("style", imgStyle);
  });

  // 3. Normalize Headings
  const allElements = Array.from(body.querySelectorAll("*"));
  allElements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    const className = el.className || "";
    const style = el.getAttribute("style") || "";

    let headingLevel = 0;
    if (tagName === "h1" || /MsoHeading1|Heading1/i.test(className) || /mso-outline-level:\s*1/i.test(style)) {
      headingLevel = 2; // Map H1 / MsoHeading1 to H2 for article content hierarchy
    } else if (tagName === "h2" || /MsoHeading2|Heading2/i.test(className) || /mso-outline-level:\s*2/i.test(style)) {
      headingLevel = 3;
    } else if (tagName === "h3" || /MsoHeading3|Heading3/i.test(className) || /mso-outline-level:\s*3/i.test(style)) {
      headingLevel = 4;
    } else if (tagName === "h4" || /MsoHeading4|Heading4/i.test(className) || /mso-outline-level:\s*4/i.test(style)) {
      headingLevel = 4;
    }

    if (headingLevel > 0 && tagName !== `h${headingLevel}`) {
      const h = doc.createElement(`h${headingLevel}`);
      h.innerHTML = el.innerHTML;
      const textAlignMatch = style.match(/text-align:\s*(left|center|right|justify)/i);
      if (textAlignMatch) {
        h.setAttribute("style", `text-align: ${textAlignMatch[1].toLowerCase()};`);
      }
      el.parentNode?.replaceChild(h, el);
    }
  });

  // 4. Normalize Lists (Word MsoListParagraph -> proper <ul> / <ol>)
  const children = Array.from(body.children);
  let idx = 0;
  while (idx < children.length) {
    const child = children[idx];
    const isListPara =
      child.tagName.toLowerCase() === "p" &&
      (/MsoListParagraph/i.test(child.className) ||
        /mso-list:/i.test(child.getAttribute("style") || "") ||
        Boolean(child.querySelector("span[style*='mso-list:Ignore']")) ||
        /^\s*([·•\-*]|\d+[\.\)])\s+/.test(child.textContent || ""));

    if (isListPara) {
      const listGroup: Element[] = [];
      let isOrdered = false;

      while (idx < children.length) {
        const itemChild = children[idx];
        const isCurrentListPara =
          itemChild.tagName.toLowerCase() === "p" &&
          (/MsoListParagraph/i.test(itemChild.className) ||
            /mso-list:/i.test(itemChild.getAttribute("style") || "") ||
            Boolean(itemChild.querySelector("span[style*='mso-list:Ignore']")) ||
            /^\s*([·•\-*]|\d+[\.\)])\s+/.test(itemChild.textContent || ""));

        if (!isCurrentListPara) break;

        const ignoreSpan = itemChild.querySelector("span[style*='mso-list:Ignore']");
        const markerText = (ignoreSpan?.textContent || itemChild.textContent || "").trim();
        if (/^\d+[\.\)]/.test(markerText)) {
          isOrdered = true;
        }

        listGroup.push(itemChild);
        idx++;
      }

      if (listGroup.length > 0) {
        const listEl = doc.createElement(isOrdered ? "ol" : "ul");
        listGroup.forEach((p) => {
          const li = doc.createElement("li");
          const ignoreSpan = p.querySelector("span[style*='mso-list:Ignore']");
          if (ignoreSpan) {
            ignoreSpan.remove();
          }

          let inner = p.innerHTML.trim();
          inner = inner.replace(/^\s*(?:[·•\-*]|\d+[\.\)])\s*(&nbsp;|\s)*/i, "");
          li.innerHTML = inner || p.innerHTML;
          listEl.appendChild(li);
        });

        const firstChild = listGroup[0];
        firstChild.parentNode?.insertBefore(listEl, firstChild);
        listGroup.forEach((p) => p.remove());
      }
    } else {
      idx++;
    }
  }

  // 5. Clean Inline Formatting & Styles
  const formattingElements = Array.from(body.querySelectorAll("span, font, p, div"));
  formattingElements.forEach((el) => {
    const style = el.getAttribute("style") || "";

    if (/font-weight:\s*(?:bold|[7-9]00)/i.test(style) && el.tagName.toLowerCase() !== "strong" && el.tagName.toLowerCase() !== "b") {
      const strong = doc.createElement("strong");
      strong.innerHTML = el.innerHTML;
      el.innerHTML = "";
      el.appendChild(strong);
    }

    if (/font-style:\s*italic/i.test(style) && el.tagName.toLowerCase() !== "em" && el.tagName.toLowerCase() !== "i") {
      const em = doc.createElement("em");
      em.innerHTML = el.innerHTML;
      el.innerHTML = "";
      el.appendChild(em);
    }

    if (/text-decoration:\s*underline/i.test(style) && el.tagName.toLowerCase() !== "u") {
      const u = doc.createElement("u");
      u.innerHTML = el.innerHTML;
      el.innerHTML = "";
      el.appendChild(u);
    }

    const textAlignMatch = style.match(/text-align:\s*(left|center|right|justify)/i);
    const align = textAlignMatch ? textAlignMatch[1].toLowerCase() : null;

    el.removeAttribute("class");
    el.removeAttribute("lang");

    if (align && (el.tagName.toLowerCase() === "p" || el.tagName.toLowerCase().startsWith("h"))) {
      el.setAttribute("style", `text-align: ${align};`);
    } else {
      el.removeAttribute("style");
    }
  });

  // 6. Clean Tables
  const tables = Array.from(body.querySelectorAll("table"));
  tables.forEach((table) => {
    table.removeAttribute("class");
    table.removeAttribute("style");
    table.removeAttribute("border");
    table.removeAttribute("cellspacing");
    table.removeAttribute("cellpadding");

    const cells = Array.from(table.querySelectorAll("td, th"));
    cells.forEach((cell) => {
      cell.removeAttribute("class");
      cell.removeAttribute("style");
      cell.removeAttribute("width");
      cell.removeAttribute("height");
      if (!cell.querySelector("p")) {
        const p = doc.createElement("p");
        p.innerHTML = cell.innerHTML.trim() || "<br>";
        cell.innerHTML = "";
        cell.appendChild(p);
      }
    });
  });

  // 7. Remove Excessive Consecutive Empty Paragraphs
  const paragraphs = Array.from(body.querySelectorAll("p"));
  let prevWasEmpty = false;
  paragraphs.forEach((p) => {
    const text = (p.textContent || "").replace(/\u00a0/g, " ").trim();
    const hasMedia = p.querySelector("img, table, iframe, video");
    if (!text && !hasMedia) {
      if (prevWasEmpty) {
        p.remove();
      } else {
        prevWasEmpty = true;
      }
    } else {
      prevWasEmpty = false;
    }
  });

  return body.innerHTML;
}

/**
 * Attempts to upload a base64 data URL to the existing /api/admin/upload storage endpoint.
 * Returns the hosted public HTTPS URL if storage is configured and successful,
 * or safely returns the original data URL if storage is offline or fails.
 */
export async function uploadDataUrlImage(dataUrl: string): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith("data:")) {
    return dataUrl;
  }

  try {
    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return dataUrl;

    const mimeType = match[1];
    const base64Data = match[2];

    if (!["image/png", "image/jpeg"].includes(mimeType)) {
      return dataUrl;
    }

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const ext = mimeType === "image/png" ? "png" : "jpg";
    const file = new File([byteArray], `word-image-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`, {
      type: mimeType,
    });

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const payload = await response.json();
      if (typeof payload.url === "string" && /^https?:\/\//i.test(payload.url)) {
        return payload.url;
      }
    }
  } catch (err) {
    console.warn("[uploadDataUrlImage] Background image upload skipped:", err);
  }

  return dataUrl;
}
