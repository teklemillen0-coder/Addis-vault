import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sanitizeRecordStrings, sanitizeServerText } from "./server-sanitize";
import { runAiGenerationWithFallback, type AiGenerateResult } from "./ai-fallback";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  am: "Amharic (አማርኛ) with clear headings and clean English technical/financial terms where helpful",
  om: "Afaan Oromoo",
  ti: "Tigrinya (ትግርኛ)",
  so: "Somali (Soomaali)",
};

const aiInput = z.object({
  toolTitle: z.string().max(400).optional(),
  systemInstruction: z.string().max(6000).optional(),
  inputs: z.record(z.unknown()).optional(),
  uploadedText: z.string().max(40000).optional(),
  language: z.string().max(10).optional(),
});

export type { AiGenerateResult };

// Public, like the original /api/ai/generate endpoint: AI work tools, CV builder, legal suite, PDF editor.
export const generateAiDocument = createServerFn({ method: "POST" })
  .validator((input: z.input<typeof aiInput>) => aiInput.parse(input))
  .handler(async ({ data }): Promise<AiGenerateResult> => {
    const safeLang = sanitizeServerText(data.language || "en", 10);
    const targetLang = LANG_NAMES[safeLang] || "English";
    const cleanInputs = sanitizeRecordStrings(data.inputs || {}, 3000);
    const inputSummary = Object.entries(cleanInputs)
      .map(([k, v]) => `- ${k}: ${String(v ?? "").trim()}`)
      .join("\n");
    const safeToolTitle = sanitizeServerText(data.toolTitle || "Ethiopian Productivity Document", 200);
    const safeSystemInstruction = sanitizeServerText(
      data.systemInstruction ||
        "You are a senior Ethiopian business, university, financial, legal, and HR specialist. Provide precise, practical, ready-to-use output formatted cleanly.",
      2000,
    );
    const safeUploadedText = data.uploadedText ? sanitizeServerText(data.uploadedText, 8000) : "";

    const prompt = [
      `Tool: ${safeToolTitle}`,
      `Target Output Language: ${targetLang}`,
      "",
      "User Provided Parameters:",
      inputSummary || "(Default template)",
      safeUploadedText ? `\nAttached Document Excerpt (User Upload):\n${safeUploadedText}` : "",
      "",
      "Generate a comprehensive, well-structured deliverable with clear sections ready for professional review and export to PDF, Word, or Excel.",
    ].join("\n");

    return runAiGenerationWithFallback({
      prompt,
      systemInstruction: safeSystemInstruction,
      lovableKey: process.env.LOVABLE_API_KEY,
      geminiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });
  });
