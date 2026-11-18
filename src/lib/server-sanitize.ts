// Pure helpers shared by the AddisVault server functions and the download route.
// Ported from the original Express server; safe to import anywhere (no secrets, no I/O).

export function sanitizeServerText(input: unknown, maxLen = 4000): string {
  if (typeof input !== "string") return "";
  return input
    .split("\0")
    .join("")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .trim()
    .slice(0, maxLen);
}

export function sanitizeRecordStrings(
  obj: Record<string, unknown>,
  maxLen = 2500,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(obj).slice(0, 60)) {
    const cleanKey = sanitizeServerText(k, 80);
    if (!cleanKey) continue;
    if (typeof v === "string") {
      out[cleanKey] = sanitizeServerText(v, maxLen);
    } else if (typeof v === "number" || typeof v === "boolean") {
      out[cleanKey] = v;
    }
  }
  return out;
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    lower === "localhost" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".localhost")
  ) {
    return true;
  }
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const a = Number(ipv4Match[1]);
    const b = Number(ipv4Match[2]);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return true;
    }
  }
  return false;
}

export function validatePublicUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (isBlockedHostname(parsed.hostname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function inferFilename(
  parsedUrl: URL,
  contentDisposition: string | null,
  contentType: string,
): string {
  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/i);
    if (utf8Match?.[1]) {
      try {
        return decodeURIComponent(utf8Match[1]).replace(/["/\\]/g, "_");
      } catch {
        // fall through
      }
    }
    const basicMatch = contentDisposition.match(/filename="?([^";\n]+)"?/i);
    if (basicMatch?.[1]) return basicMatch[1].replace(/["/\\]/g, "_");
  }
  const pathSeg = parsedUrl.pathname.split("/").filter(Boolean).pop();
  if (pathSeg && pathSeg.includes(".")) return pathSeg.replace(/[^a-zA-Z0-9._-]/g, "_");
  const extMap: Record<string, string> = {
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "audio/mpeg": ".mp3",
    "text/html": ".html",
    "text/plain": ".txt",
    "text/csv": ".csv",
    "application/zip": ".zip",
    "application/json": ".json",
    "image/png": ".png",
    "image/jpeg": ".jpg",
  };
  const baseType = contentType.split(";")[0].trim().toLowerCase();
  const ext = extMap[baseType] || ".bin";
  const cleanHost = parsedUrl.hostname.replace(/[^a-zA-Z0-9-]/g, "_");
  return `addisvault-${cleanHost}${ext}`;
}

export function detectCategoryLabel(contentType: string, filename: string): string {
  const ct = contentType.toLowerCase();
  const fn = filename.toLowerCase();
  if (ct.includes("pdf") || fn.endsWith(".pdf")) return "PDF Document";
  if (ct.startsWith("video/") || fn.endsWith(".mp4") || fn.endsWith(".webm")) return "Video File";
  if (ct.startsWith("audio/") || fn.endsWith(".mp3")) return "Audio File";
  if (ct.includes("zip") || fn.endsWith(".zip")) return "Archive Package";
  if (ct.includes("word") || fn.endsWith(".doc") || fn.endsWith(".docx")) return "Word Document";
  if (ct.includes("html")) return "Web Page / Article";
  if (ct.startsWith("image/")) return "Image Asset";
  return "Digital File";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCleanReaderHtml(rawHtml: string, sourceUrl: string, titleHint: string): string {
  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = escapeHtml(sanitizeServerText(titleMatch?.[1] || titleHint, 200) || titleHint);
  const cleaned = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] || cleaned;
  const safeSource = escapeHtml(sourceUrl);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle} — AddisVault Offline Reader</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1c1917; background: #fafaf9; }
    .av-banner { border-bottom: 2px solid #065f46; padding-bottom: 12px; margin-bottom: 24px; font-size: 13px; color: #57534e; }
    .av-banner strong { color: #065f46; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    a { color: #065f46; }
  </style>
</head>
<body>
  <div class="av-banner">
    <strong>AddisVault Smart Link Downloader</strong> · Clean Offline Copy<br/>
    Source: <a href="${safeSource}">${safeSource}</a>
  </div>
  <h1>${pageTitle}</h1>
  <div>${bodyHtml}</div>
</body>
</html>`;
}
