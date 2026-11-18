import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { detectCategoryLabel, inferFilename, validatePublicUrl } from "./server-sanitize";

export interface InspectLinkResult {
  url?: string;
  filename?: string;
  detectedTitle?: string;
  contentType?: string;
  fileKind?: string;
  isWebPage?: boolean;
  sizeBytes?: number | null;
  error?: string;
}

const UA = { "User-Agent": "AddisVault-Downloader/2.0" };

// Public link inspector for the Smart Link Downloader (ported from /api/link/inspect).
export const inspectLink = createServerFn({ method: "POST" })
  .validator((input: { url: string }) => z.object({ url: z.string().max(2000) }).parse(input))
  .handler(async ({ data }): Promise<InspectLinkResult> => {
    const parsed = validatePublicUrl(data.url);
    if (!parsed) return { error: "Please enter a valid public http:// or https:// URL." };

    const host = parsed.hostname.toLowerCase();
    const isSocial =
      host.includes("youtube.com") ||
      host === "youtu.be" ||
      host.includes("tiktok.com") ||
      host.includes("facebook.com") ||
      host.includes("fb.watch") ||
      host.includes("instagram.com") ||
      host.includes("twitter.com") ||
      host === "x.com";

    const socialFallback = (): InspectLinkResult => ({
      url: parsed.toString(),
      filename: `${host.replace(/\./g, "-")}-media.mp4`,
      detectedTitle: `Media from ${host}`,
      contentType: "video/mp4",
      fileKind: "Social Media Video",
      isWebPage: false,
      sizeBytes: null,
    });

    if (host.includes("youtube.com") || host === "youtu.be") {
      try {
        const oe = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.toString())}&format=json`,
          { signal: AbortSignal.timeout(6000) },
        );
        if (oe.ok) {
          const meta = (await oe.json()) as { title?: string; author_name?: string };
          const title = meta.title || "YouTube Video";
          return {
            url: parsed.toString(),
            filename: `${title.replace(/[^\w\s-]/g, "").slice(0, 60) || "youtube-video"}.mp4`,
            detectedTitle: meta.author_name ? `${title} — ${meta.author_name}` : title,
            contentType: "video/mp4",
            fileKind: "YouTube Video / Audio",
            isWebPage: false,
            sizeBytes: null,
          };
        }
      } catch {
        // fall through
      }
    }

    if (host.includes("tiktok.com")) {
      try {
        const oe = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.toString())}`, {
          signal: AbortSignal.timeout(6000),
        });
        if (oe.ok) {
          const meta = (await oe.json()) as { title?: string; author_name?: string };
          const title = meta.title || "TikTok HD Video";
          return {
            url: parsed.toString(),
            filename: `${title.replace(/[^\w\s-]/g, "").slice(0, 60) || "tiktok-video"}.mp4`,
            detectedTitle: meta.author_name ? `${title} (@${meta.author_name})` : title,
            contentType: "video/mp4",
            fileKind: "TikTok HD Video",
            isWebPage: false,
            sizeBytes: null,
          };
        }
      } catch {
        // fall through
      }
    }

    try {
      let response = await fetch(parsed.toString(), {
        method: "HEAD",
        redirect: "follow",
        signal: AbortSignal.timeout(9000),
        headers: UA,
      });
      if (response.status === 405 || response.status === 403 || response.status === 501) {
        response = await fetch(parsed.toString(), {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(9000),
          headers: { ...UA, Range: "bytes=0-4095" },
        });
        response.body?.cancel().catch(() => {});
      }
      if (!response.ok && response.status !== 206) {
        if (isSocial) return socialFallback();
        return { error: `Remote server responded with status ${response.status}.` };
      }
      const finalUrl = response.url || parsed.toString();
      if (!validatePublicUrl(finalUrl)) return { error: "This link redirects to a private address." };
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      const contentLengthHeader = response.headers.get("content-length");
      const filename = inferFilename(parsed, response.headers.get("content-disposition"), contentType);
      return {
        url: finalUrl,
        filename,
        detectedTitle: filename,
        contentType,
        fileKind: detectCategoryLabel(contentType, filename),
        isWebPage: contentType.toLowerCase().includes("text/html"),
        sizeBytes: contentLengthHeader ? Number(contentLengthHeader) : null,
      };
    } catch (err) {
      if (isSocial) return socialFallback();
      const msg = err instanceof Error ? err.message : "Unable to reach URL";
      return { error: `Fetch error: ${msg}` };
    }
  });
