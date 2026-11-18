export type AiGenerateResult =
  | { content: string; error?: undefined }
  | { content?: undefined; error: string };

export interface AiGenerationParams {
  prompt: string;
  systemInstruction: string;
  lovableKey?: string;
  geminiKey?: string;
  callLovable?: (params: { prompt: string; systemInstruction: string }) => Promise<string>;
  callGemini?: (params: { apiKey: string; prompt: string; systemInstruction: string }) => Promise<string>;
}

function getHttpStatus(err: unknown): number | undefined {
  if (!err || typeof err !== "object") return undefined;
  const rec = err as Record<string, unknown>;
  if (typeof rec.httpStatus === "number") return rec.httpStatus;
  if (typeof rec.status === "number") return rec.status;
  if (typeof rec.code === "number") return rec.code;
  return undefined;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Unknown upstream error";
  }
}

export function formatActionableAiError(err: unknown, context: "lovable" | "gemini" | "both"): string {
  const status = getHttpStatus(err);
  const rawMessage = getErrorMessage(err);
  const lower = rawMessage.toLowerCase();

  if (status === 429 || lower.includes("resource_exhausted") || lower.includes("rate limit")) {
    return "The AI service is temporarily busy (rate limit reached). Please wait a moment and try again.";
  }
  if (status === 402 || lower.includes("credit") || lower.includes("payment required")) {
    return "AI service credits are exhausted right now. Please contact the AddisVault administrator.";
  }
  if (status === 401 || status === 403 || lower.includes("permission_denied") || lower.includes("api_key_invalid")) {
    return "AI service credentials could not be verified on the server. Please ask the administrator to check Settings > Secrets.";
  }
  if (status === 404 || lower.includes("not_found")) {
    return "The configured AI model endpoint was unavailable. Please try again or notify the administrator.";
  }
  if (context === "both") {
    return "Unable to reach the AI generation service right now. Please check your connection and try again shortly.";
  }
  return "AI generation failed temporarily. Please try again in a moment.";
}

async function defaultCallLovable({
  prompt,
  systemInstruction,
}: {
  prompt: string;
  systemInstruction: string;
}): Promise<string> {
  const { generateChatCompletion } = await import("@lovable.dev/ai-gateway");
  const response = await generateChatCompletion({
    model: "google/gemini-4-argon",
    messages: [
      { role: "system", content: systemInstruction },
      { role: "user", content: prompt },
    ],
  });
  const raw = response.choices?.[0]?.message?.content;
  return (typeof raw === "string" ? raw : "").trim();
}

async function defaultCallGemini({
  apiKey,
  prompt,
  systemInstruction,
}: {
  apiKey: string;
  prompt: string;
  systemInstruction: string;
}): Promise<string> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  const response = await ai.models.generateContent({
    model: "gemini-4-hydrogen",
    contents: prompt,
    config: {
      systemInstruction,
    },
  });
  return (response.text ?? "").trim();
}

export async function runAiGenerationWithFallback(params: AiGenerationParams): Promise<AiGenerateResult> {
  const lovableKey = params.lovableKey?.trim() || "";
  const geminiKey = params.geminiKey?.trim() || "";
  const callLovable = params.callLovable ?? defaultCallLovable;
  const callGemini = params.callGemini ?? defaultCallGemini;

  if (!lovableKey && !geminiKey) {
    console.error("[AI] Missing both LOVABLE_API_KEY and GEMINI_API_KEY/GOOGLE_API_KEY in server environment.");
    return {
      error:
        "AI generation is not configured in this environment yet (missing server AI key in Settings > Secrets).",
    };
  }

  let primaryError: unknown = null;

  if (lovableKey) {
    try {
      const output = await callLovable({
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
      });
      if (output) return { content: output };
      primaryError = new Error("Empty response from primary AI gateway");
    } catch (err) {
      primaryError = err;
      console.error("[AI] Primary gateway call failed:", getErrorMessage(err));
    }
  }

  if (geminiKey) {
    try {
      const output = await callGemini({
        apiKey: geminiKey,
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
      });
      if (output) return { content: output };
      console.error("[AI] Gemini fallback returned empty content.");
      return { error: "The AI model returned an empty response. Please try again." };
    } catch (err) {
      console.error("[AI] Gemini fallback call failed:", getErrorMessage(err));
      return { error: formatActionableAiError(err, primaryError ? "both" : "gemini") };
    }
  }

  return { error: formatActionableAiError(primaryError, "lovable") };
}
