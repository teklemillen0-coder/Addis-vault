import { createFileRoute } from "@tanstack/react-router";
import {
  buildCleanReaderHtml,
  escapeHtml,
  inferFilename,
  sanitizeServerText,
  validatePublicUrl,
} from "@/lib/server-sanitize";

// Browser download link used by the Smart Link Downloader (ported from the original /api/link/download).
export const Route = createFileRoute("/api/link/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const rawUrl = params.get("url") || "";
        const modeParam = params.get("mode");
        const mode = modeParam === "reader" ? "reader" : modeParam === "media" ? "media" : "raw";
        const formatLabel = sanitizeServerText(params.get("formatLabel") || "HD Media Export", 80);
        const titleHint = sanitizeServerText(params.get("title") || "AddisVault Media Package", 120);

        const parsed = validatePublicUrl(rawUrl);
        if (!parsed) return new Response("Invalid public URL.", { status: 400 });

        try {
          const response = await fetch(parsed.toString(), {
            method: "GET",
            redirect: "follow",
            signal: AbortSignal.timeout(25000),
            headers: { "User-Agent": "AddisVault-Downloader/2.0" },
          });
          if (response.url && !validatePublicUrl(response.url)) {
            return new Response("This link redirects to a private address.", { status: 400 });
          }

          const contentType = response.headers.get("content-type") || "application/octet-stream";
          const filename = inferFilename(parsed, response.headers.get("content-disposition"), contentType);
          const lowerType = contentType.toLowerCase();
          const isBinaryMedia = lowerType.startsWith("video/") || lowerType.startsWith("audio/");

          if (mode === "media" && (!response.ok || !isBinaryMedia)) {
            const htmlContent = response.ok && lowerType.includes("text/html") ? await response.text() : "";
            const ogTitleMatch = htmlContent.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
            const resolvedTitle = sanitizeServerText(ogTitleMatch?.[1] || titleHint, 160) || titleHint;
            const safeFileBase =
              resolvedTitle.replace(/[^\w\s-]/g, "").trim().slice(0, 50) || "addisvault-media";
            const t = escapeHtml(resolvedTitle);
            const src = escapeHtml(parsed.toString());
            const packHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${t} — AddisVault Universal Downloader</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 760px; margin: 40px auto; padding: 24px; color: #1c1917; background: #fafaf9; line-height: 1.6; }
    .card { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; padding: 24px; }
    .badge { font-family: monospace; font-size: 12px; color: #047857; font-weight: 700; }
    h1 { font-size: 20px; margin: 8px 0 12px; }
    a.btn { display: inline-block; margin-top: 16px; background: #047857; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">AddisVault Universal Downloader · ${escapeHtml(formatLabel)}</div>
    <h1>${t}</h1>
    <p><strong>Verified Source URL:</strong> <a href="${src}">${src}</a></p>
    <p>Prepared for offline reference and direct media access via AddisVault Ethiopia.</p>
    <a class="btn" href="${src}" target="_blank" rel="noopener noreferrer">Open Original Source Media</a>
  </div>
</body>
</html>`;
            return new Response(packHtml, {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `attachment; filename="${safeFileBase}-media-pack.html"`,
              },
            });
          }

          if (!response.ok) {
            return new Response(`Remote server returned HTTP ${response.status}`, { status: 502 });
          }

          if (mode === "reader" && lowerType.includes("text/html")) {
            const htmlText = await response.text();
            const readerDoc = buildCleanReaderHtml(htmlText, parsed.toString(), filename);
            const readerName = filename.replace(/\.html?$/i, "") + "-offline-reader.html";
            return new Response(readerDoc, {
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Content-Disposition": `attachment; filename="${readerName}"`,
              },
            });
          }

          const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${filename}"`,
            "X-Content-Type-Options": "nosniff",
          };
          const len = response.headers.get("content-length");
          if (len) headers["Content-Length"] = len;
          return new Response(response.body, { headers });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Download failed";
          return new Response(`Download failed: ${msg}`, { status: 502 });
        }
      },
    },
  },
});
