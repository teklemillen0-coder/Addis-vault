import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import LZString from "lz-string";
import QRCode from "qrcode";
import {
  ArrowDownToLine,
  Bot,
  Check,
  CircleAlert,
  CloudDownload,
  CloudUpload,
  Code2,
  Copy,
  Download,
  FilePlus2,
  FolderUp,
  Github,
  Globe,
  KeyRound,
  Plus,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type Provider = "openrouter" | "gemini" | "groq" | "custom";
type ProjectFile = { content: string; encoding?: "base64" };
type ProjectFiles = Record<string, ProjectFile>;
type Dialog = "ai" | "github-import" | "github-push" | "new-file" | "owner" | "deploy" | null;
type ProviderSettings = { apiKey: string; model: string; endpoint: string };
type BuilderProps = { ownerAdmin: boolean };
class GithubApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const STORAGE_KEY = "addisvault_builder_files";
const PROVIDER_KEY = "addisvault_builder_ai";
const GITHUB_KEY = "addisvault_builder_github_token";
const SETTINGS_KEY = "addisvault_builder_owner_settings";
const PROVIDER_DEFAULTS: Record<Provider, ProviderSettings> = {
  openrouter: { apiKey: "", model: "meta-llama/llama-3.3-70b-instruct:free", endpoint: "" },
  gemini: { apiKey: "", model: "gemini-2.5-flash", endpoint: "" },
  groq: { apiKey: "", model: "llama-3.3-70b-versatile", endpoint: "" },
  custom: { apiKey: "", model: "", endpoint: "" },
};
const ACCEPTED_TEXT = /\.(?:html?|js|jsx|mjs|cjs|css|json|ts|tsx|md|txt|svg|xml|ya?ml|toml)$/i;
const MAX_PROJECT_FILES = 400;
const MAX_IMPORT_BYTES = 30 * 1024 * 1024;
const GENERATION_TIMEOUT_MS = 45_000;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readString(key: string): string {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function validateProjectFiles(saved: unknown): ProjectFiles {
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
  const result: ProjectFiles = {};
  for (const [path, candidate] of Object.entries(saved)) {
    if (
      normalizePath(path) !== path ||
      !candidate ||
      typeof candidate !== "object" ||
      typeof (candidate as ProjectFile).content !== "string"
    )
      continue;
    const file = candidate as ProjectFile;
    result[path] = {
      content: file.content,
      ...(file.encoding === "base64" ? { encoding: "base64" as const } : {}),
    };
    if (Object.keys(result).length >= MAX_PROJECT_FILES) break;
  }
  return result;
}

function loadProjectFiles(): ProjectFiles {
  return validateProjectFiles(readJson<unknown>(STORAGE_KEY, null));
}

function readProjectDatabase(): Promise<ProjectFiles | null> {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("addisvault-app-builder", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("projects");
    request.onerror = () => reject(request.error || new Error("Could not open project storage."));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("projects", "readonly");
      const lookup = transaction.objectStore("projects").get("workspace");
      lookup.onsuccess = () => {
        database.close();
        resolve(lookup.result ? validateProjectFiles(lookup.result) : null);
      };
      lookup.onerror = () => {
        database.close();
        reject(lookup.error || new Error("Could not load the saved project."));
      };
    };
  });
}

function writeProjectDatabase(files: ProjectFiles): Promise<void> {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB is unavailable."));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("addisvault-app-builder", 1);
    request.onerror = () => reject(request.error || new Error("Could not open project storage."));
    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("projects", "readwrite");
      transaction.objectStore("projects").put(files, "workspace");
      transaction.oncomplete = () => {
        database.close();
        resolve();
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error || new Error("Could not save the project."));
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error || new Error("Project storage was interrupted."));
      };
    };
  });
}

function loadProviderSettings(): Record<Provider, ProviderSettings> {
  const saved = readJson<unknown>(PROVIDER_KEY, null);
  const result = { ...PROVIDER_DEFAULTS };
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return result;
  for (const provider of Object.keys(PROVIDER_DEFAULTS) as Provider[]) {
    const candidate = (saved as Record<string, unknown>)[provider];
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const settings = candidate as Partial<ProviderSettings>;
    result[provider] = {
      apiKey: typeof settings.apiKey === "string" ? settings.apiKey : "",
      model:
        typeof settings.model === "string" ? settings.model : PROVIDER_DEFAULTS[provider].model,
      endpoint: typeof settings.endpoint === "string" ? settings.endpoint : "",
    };
  }
  return result;
}

function loadOwnerSettings() {
  const saved = readJson<unknown>(SETTINGS_KEY, null);
  const value =
    saved && typeof saved === "object" && !Array.isArray(saved)
      ? (saved as { announcement?: unknown; defaultModel?: unknown })
      : {};
  return {
    announcement: typeof value.announcement === "string" ? value.announcement : "",
    defaultModel:
      typeof value.defaultModel === "string"
        ? value.defaultModel
        : PROVIDER_DEFAULTS.openrouter.model,
  };
}

function normalizePath(path: string): string | null {
  const parts = path
    .replaceAll("\\", "/")
    .split("/")
    .filter((part) => part && part !== ".");
  if (!parts.length || parts.some((part) => part === "..")) return null;
  return parts.join("/");
}

function decodeBase64(value: string): string {
  const bytes = Uint8Array.from(atob(value.replace(/\s/g, "")), (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function textFromFileName(path: string): boolean {
  return ACCEPTED_TEXT.test(path) || /(^|\/)(?:package|tsconfig|vite\.config)\.json$/i.test(path);
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function resolveProjectPath(basePath: string, requestedPath: string): string | null {
  const parts = requestedPath.startsWith("/") ? [] : basePath.split("/").filter(Boolean);
  for (const part of requestedPath.replaceAll("\\", "/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      if (!parts.length) return null;
      parts.pop();
    } else {
      parts.push(part);
    }
  }
  return parts.join("/") || null;
}

function makeStandalone(files: ProjectFiles): string {
  const entryPath = Object.keys(files).find((path) => /(^|\/)index\.html$/i.test(path));
  const entryDirectory = entryPath?.includes("/")
    ? entryPath.slice(0, entryPath.lastIndexOf("/") + 1)
    : "";
  const dataUrlFor = (path: string): string | null => {
    const file = files[path];
    if (!file) return null;
    const extension = path.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      avif: "image/avif",
      gif: "image/gif",
      ico: "image/x-icon",
      jpeg: "image/jpeg",
      jpg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      webp: "image/webp",
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      otf: "font/otf",
    };
    const mime = mimeTypes[extension];
    if (!mime) return null;
    return file.encoding === "base64"
      ? `data:${mime};base64,${file.content}`
      : `data:${mime};charset=utf-8,${encodeURIComponent(file.content)}`;
  };
  const inlineCssAssets = (css: string, basePath: string) =>
    css.replace(/url\((["']?)([^)"']+)\1\)/gi, (whole, _quote: string, value: string) => {
      if (/^(?:data:|https?:|\/\/|#)/i.test(value)) return whole;
      const path = resolveProjectPath(basePath, value.split(/[?#]/, 1)[0]);
      const dataUrl = path ? dataUrlFor(path) : null;
      return dataUrl ? `url("${dataUrl}")` : whole;
    });
  const entry = (entryPath && files[entryPath]?.content) || "";
  let html =
    entry ||
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Addis-Vault App</title></head><body></body></html>';

  html = html.replace(
    /<link\b[^>]*href=["']([^"']+\.css(?:\?[^"']*)?)["'][^>]*>/gi,
    (tag, src: string) => {
      if (/^(?:https?:|\/\/)/i.test(src)) return tag;
      const path = resolveProjectPath(entryDirectory, src.split(/[?#]/, 1)[0]);
      const css = path ? files[path]?.content : undefined;
      const cssDirectory = path?.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
      return css !== undefined
        ? `<style>${inlineCssAssets(css, cssDirectory).replace(/<\/style/gi, "<\\/style")}</style>`
        : tag;
    },
  );
  html = html.replace(
    /<script\b([^>]*?)src=["']([^"']+\.m?js(?:\?[^"']*)?)["']([^>]*)>\s*<\/script>/gi,
    (tag, before: string, src: string, after: string) => {
      if (/^(?:https?:|\/\/)/i.test(src)) return tag;
      const path = resolveProjectPath(entryDirectory, src.split(/[?#]/, 1)[0]);
      const js = path ? files[path]?.content : undefined;
      return js !== undefined
        ? `<script${before}${after}>${js.replace(/<\/script/gi, "<\\/script")}</script>`
        : tag;
    },
  );

  const css = Object.entries(files)
    .filter(([path, file]) => /\.css$/i.test(path) && file.encoding !== "base64")
    .map(([path, file]) => {
      const directory = path.includes("/") ? path.slice(0, path.lastIndexOf("/") + 1) : "";
      return inlineCssAssets(file.content, directory);
    })
    .join("\n");
  const scripts = Object.entries(files)
    .filter(([path, file]) => /\.(?:m?js|cjs)$/i.test(path) && file.encoding !== "base64")
    .map(([, file]) => file.content)
    .join("\n;\n");
  if (css)
    html = html.replace(
      "</head>",
      `<style>${css.replace(/<\/style/gi, "<\\/style")}</style></head>`,
    );
  html = html.replace(
    /\b(src|poster)=("([^"]+)"|'([^']+)')/gi,
    (whole, attribute: string, _quoted: string, doubleValue: string, singleValue: string) => {
      const value = doubleValue || singleValue;
      if (/^(?:data:|https?:|\/\/|#)/i.test(value)) return whole;
      const path = resolveProjectPath(entryDirectory, value.split(/[?#]/, 1)[0]);
      const dataUrl = path ? dataUrlFor(path) : null;
      return dataUrl ? `${attribute}="${dataUrl}"` : whole;
    },
  );
  html = html.replace(
    /<style\b([^>]*)>([\s\S]*?)<\/style>/gi,
    (_whole, attributes: string, content: string) =>
      `<style${attributes}>${inlineCssAssets(content, entryDirectory).replace(/<\/style/gi, "<\\/style")}</style>`,
  );
  if (scripts && !/<script\b/i.test(html)) {
    html = html.replace(
      "</body>",
      `<script>${scripts.replace(/<\/script/gi, "<\\/script")}</script></body>`,
    );
  }
  return html;
}

function getPublicFiles(): ProjectFiles | null {
  const hash = location.hash.slice(1);
  const value = hash.startsWith("public=") ? hash.slice("public=".length) : null;
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(LZString.decompressFromEncodedURIComponent(value) || "");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return parsed as ProjectFiles;
  } catch {
    return null;
  }
}

function SettingField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      <input
        className="w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function AppBuilderView({ ownerAdmin }: BuilderProps) {
  const [files, setFiles] = useState<ProjectFiles>(loadProjectFiles);
  const [projectLoaded, setProjectLoaded] = useState(false);
  const [activeFile, setActiveFile] = useState("");
  const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [providerSettings, setProviderSettings] = useState<Record<Provider, ProviderSettings>>(
    () => {
      const ownerDefaults = loadOwnerSettings();
      const saved = loadProviderSettings();
      const rawSaved = readJson<unknown>(PROVIDER_KEY, null);
      const hasSavedOpenRouterModel =
        rawSaved !== null &&
        typeof rawSaved === "object" &&
        typeof (rawSaved as Record<string, unknown>).openrouter === "object" &&
        typeof (rawSaved as Record<string, { model?: unknown }>).openrouter?.model === "string";
      return {
        ...saved,
        openrouter: {
          ...saved.openrouter,
          model: hasSavedOpenRouterModel ? saved.openrouter.model : ownerDefaults.defaultModel,
        },
      };
    },
  );
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [busyLabel, setBusyLabel] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [fileName, setFileName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [githubToken, setGithubToken] = useState(() => readString(GITHUB_KEY));
  const [repoName, setRepoName] = useState("");
  const [branchName, setBranchName] = useState("main");
  const [copied, setCopied] = useState(false);
  const [publicFiles, setPublicFiles] = useState<ProjectFiles | null>(() => getPublicFiles());
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [adminSettings, setAdminSettings] = useState(loadOwnerSettings);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [frameError, setFrameError] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    void readProjectDatabase()
      .then((saved) => {
        if (!active) return;
        if (saved) setFiles(saved);
        setProjectLoaded(true);
      })
      .catch((storageError) => {
        if (!active) return;
        console.error("[Addis-Vault Builder] IndexedDB project load failed:", storageError);
        setProjectLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!projectLoaded) return;
    let active = true;
    void writeProjectDatabase(files).catch((storageError) => {
      if (!active) return;
      console.error("[Addis-Vault Builder] IndexedDB project save failed:", storageError);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
      } catch {
        setError("Could not save this project in browser storage. Export a ZIP before continuing.");
      }
    });
    return () => {
      active = false;
    };
  }, [files, projectLoaded]);

  useEffect(() => {
    try {
      localStorage.setItem(PROVIDER_KEY, JSON.stringify(providerSettings));
    } catch (storageError) {
      console.error("[Addis-Vault Builder] Provider settings save failed:", storageError);
      setError("Could not save AI settings in browser storage.");
    }
  }, [providerSettings]);

  useEffect(() => {
    const change = () => setPublicFiles(getPublicFiles());
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);

  const paths = useMemo(() => Object.keys(files).sort((a, b) => a.localeCompare(b)), [files]);
  const currentFile = activeFile ? files[activeFile] : undefined;
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.source !== previewRef.current?.contentWindow) return;
      if (event.data?.type === "builder-preview-error" && typeof event.data.message === "string") {
        setFrameError(event.data.message.slice(0, 1000));
      }
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);

  const updateProvider = (key: keyof ProviderSettings, value: string) => {
    setProviderSettings((current) => ({
      ...current,
      [provider]: { ...current[provider], [key]: value },
    }));
  };

  const importFiles = useCallback(
    async (selected: FileList | File[]) => {
      const incoming: ProjectFiles = {};
      let totalBytes = 0;
      for (const file of Array.from(selected)) {
        const path = normalizePath(file.webkitRelativePath || file.name);
        if (!path) continue;
        totalBytes += file.size;
        if (totalBytes > MAX_IMPORT_BYTES) throw new Error("Import exceeds the 30 MB size limit.");
        if (/\.zip$/i.test(path)) {
          const zip = await JSZip.loadAsync(file);
          const entries = Object.values(zip.files).filter((entry) => !entry.dir);
          if (entries.length + Object.keys(files).length > MAX_PROJECT_FILES) {
            throw new Error(`Projects are limited to ${MAX_PROJECT_FILES} files.`);
          }
          for (const entry of entries) {
            const safePath = normalizePath(entry.name);
            if (!safePath) continue;
            if (textFromFileName(safePath)) {
              const content = await entry.async("string");
              totalBytes += content.length;
              incoming[safePath] = { content };
            } else {
              const content = await entry.async("base64");
              totalBytes += Math.floor(content.length * 0.75);
              incoming[safePath] = { content, encoding: "base64" };
            }
            if (totalBytes > MAX_IMPORT_BYTES)
              throw new Error("Uncompressed archive exceeds the 30 MB size limit.");
          }
        } else {
          const extension = path.split(".").pop()?.toLowerCase();
          if (!["html", "htm", "js", "jsx", "css", "json"].includes(extension || "")) continue;
          incoming[path] = { content: await file.text() };
        }
        if (Object.keys(incoming).length + Object.keys(files).length > MAX_PROJECT_FILES) {
          throw new Error(`Projects are limited to ${MAX_PROJECT_FILES} files.`);
        }
      }
      if (!Object.keys(incoming).length) throw new Error("No supported project files were found.");
      setFiles((current) => ({ ...current, ...incoming }));
      setActiveFile(
        Object.keys(incoming).find((path) => path === "index.html") || Object.keys(incoming)[0],
      );
      setFrameError("");
      setError("");
    },
    [files],
  );

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected?.length) return;
    try {
      await importFiles(selected);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Unable to import those files.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const callModel = async (userPrompt: string, signal: AbortSignal): Promise<string> => {
    const config = providerSettings[provider];
    if (!config.apiKey.trim()) throw new Error("Add an API key to connect this AI provider.");
    const projectContext = Object.entries(files)
      .filter(([, file]) => file.encoding !== "base64")
      .map(([path, file]) => `\n--- ${path} ---\n${file.content}`)
      .join("\n");
    const systemInstruction = [
      "You are an expert coding assistant. Return either a JSON object mapping project file paths to complete file contents, or complete source code for the active file.",
      "Do not include explanations outside the code or JSON. Never add mock/sample/demo data unless explicitly requested.",
      `Current file: ${activeFile || "index.html"}.`,
      "Existing project files:",
      projectContext || "(No files yet)",
    ].join("\n");
    const model = config.model.trim();
    if (!model) throw new Error("Choose a model before generating.");

    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(config.apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          }),
          signal,
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error?.message || `Gemini returned HTTP ${response.status}.`);
      const text = data?.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text || "")
        .join("");
      if (!text) throw new Error("Gemini returned an empty response.");
      return text;
    }

    const defaultEndpoints: Record<Exclude<Provider, "gemini">, string> = {
      openrouter: "https://openrouter.ai/api/v1/chat/completions",
      groq: "https://api.groq.com/openai/v1/chat/completions",
      custom: config.endpoint.trim(),
    };
    const endpoint = provider === "custom" ? config.endpoint.trim() : defaultEndpoints[provider];
    let parsedEndpoint: URL;
    try {
      parsedEndpoint = new URL(endpoint);
    } catch {
      throw new Error("Enter a valid OpenAI-compatible endpoint URL.");
    }
    if (parsedEndpoint.protocol !== "https:")
      throw new Error(
        "Use an HTTPS endpoint so your API key is not sent over an unencrypted connection.",
      );
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    };
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = location.origin;
      headers["X-Title"] = "Addis-Vault";
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userPrompt },
        ],
      }),
      signal,
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data?.error?.message || `AI provider returned HTTP ${response.status}.`);
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim())
      throw new Error("AI provider returned an empty response.");
    return text;
  };

  const generate = async (requestText = prompt, isFix = false) => {
    if (!requestText.trim()) {
      setError("Describe the change you want the AI to make.");
      return;
    }
    if (!providerSettings[provider].apiKey.trim()) {
      setDialog("ai");
      setError("");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const timer = window.setTimeout(
      () => controller.abort(new Error("Generation timed out after 45 seconds.")),
      GENERATION_TIMEOUT_MS,
    );
    setIsGenerating(true);
    setBusyLabel(isFix ? "Fixing code…" : "Generating…");
    setError("");
    setFrameError("");
    try {
      const output = await callModel(requestText, controller.signal);
      let updates: Record<string, string> | null = null;
      const fenced = output.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
      for (const candidate of [output.trim(), fenced?.trim()].filter((item): item is string =>
        Boolean(item),
      )) {
        try {
          const parsed: unknown = JSON.parse(candidate);
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            updates = Object.fromEntries(
              Object.entries(parsed).filter(
                (entry): entry is [string, string] => typeof entry[1] === "string",
              ),
            );
            break;
          }
        } catch {
          // A plain source response is also a supported provider response.
        }
      }
      if (updates && Object.keys(updates).length) {
        const safeUpdates: ProjectFiles = {};
        for (const [path, content] of Object.entries(updates)) {
          const safePath = normalizePath(path);
          if (safePath) safeUpdates[safePath] = { content };
        }
        setFiles((current) => ({ ...current, ...safeUpdates }));
        const first = Object.keys(safeUpdates)[0];
        if (first) setActiveFile(first);
      } else {
        const code = fenced || output;
        const path = activeFile || "index.html";
        setFiles((current) => ({ ...current, [path]: { content: code.trim() } }));
        setActiveFile(path);
      }
    } catch (generationError) {
      if (controller.signal.aborted) {
        setError(controller.signal.reason?.message || "Generation was cancelled.");
      } else {
        setError(
          generationError instanceof Error ? generationError.message : "AI generation failed.",
        );
      }
    } finally {
      window.clearTimeout(timer);
      if (abortRef.current === controller) abortRef.current = null;
      setIsGenerating(false);
      setBusyLabel("");
    }
  };

  const cancelGeneration = () => abortRef.current?.abort(new Error("Generation was cancelled."));

  const importGithub = async () => {
    setBusyLabel("Loading GitHub files…");
    setError("");
    try {
      const url = new URL(githubUrl);
      if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
        throw new Error("Enter an HTTPS public GitHub repository URL.");
      }
      const [owner, repoWithSuffix, ...remainder] = url.pathname
        .split("/")
        .filter(Boolean)
        .map((part) => decodeURIComponent(part));
      const repo = repoWithSuffix?.replace(/\.git$/i, "");
      if (!owner || !repo || (remainder.length && remainder[0] !== "tree")) {
        throw new Error("Use a repository URL such as https://github.com/owner/repo.");
      }
      const requestedBranch = remainder[0] === "tree" ? remainder[1] : undefined;
      const requestedFolder = remainder[0] === "tree" ? remainder.slice(2).join("/") : "";
      const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      );
      const metadata = await response.json();
      if (!response.ok)
        throw new Error(metadata?.message || `GitHub returned HTTP ${response.status}.`);
      const treeResponse = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(requestedBranch || metadata.default_branch)}?recursive=1`,
      );
      const tree = await treeResponse.json();
      if (!treeResponse.ok)
        throw new Error(
          tree?.message || `Unable to read repository tree (HTTP ${treeResponse.status}).`,
        );
      if (tree.truncated)
        throw new Error("This repository is too large for a complete browser import.");
      const candidates = (tree.tree || []).filter(
        (entry: { type: string; path: string }) =>
          entry.type === "blob" &&
          (!requestedFolder || entry.path.startsWith(`${requestedFolder}/`)),
      );
      if (candidates.length > MAX_PROJECT_FILES)
        throw new Error(
          `This repository has more than ${MAX_PROJECT_FILES} files; import a smaller subfolder.`,
        );
      const blobs = candidates;
      if (!blobs.length) throw new Error("This public repository has no supported source files.");
      const expandedSize = blobs.reduce(
        (sum: number, entry: { size?: number }) => sum + (entry.size || 0),
        0,
      );
      if (expandedSize > MAX_IMPORT_BYTES)
        throw new Error("Repository import exceeds the 30 MB size limit.");
      if (
        paths.length &&
        !window.confirm("Importing this repository will replace your current workspace. Continue?")
      )
        return;
      const imported: ProjectFiles = {};
      for (let index = 0; index < blobs.length; index += 10) {
        const batch = blobs.slice(index, index + 10);
        const results = await Promise.all(
          batch.map(async (entry: { path: string; url: string }) => {
            const blobResponse = await fetch(entry.url);
            const blob = await blobResponse.json();
            if (!blobResponse.ok) throw new Error(`Unable to download ${entry.path}.`);
            const path = requestedFolder
              ? entry.path.slice(requestedFolder.length + 1)
              : entry.path;
            return [
              path,
              textFromFileName(path)
                ? { content: decodeBase64(blob.content) }
                : { content: blob.content.replace(/\s/g, ""), encoding: "base64" as const },
            ] as const;
          }),
        );
        for (const [path, file] of results) imported[path] = file;
      }
      setFiles(imported);
      setActiveFile(
        Object.keys(imported).find((path) => /(^|\/)index\.html$/i.test(path)) ||
          Object.keys(imported)[0],
      );
      setDialog(null);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "GitHub import failed.");
    } finally {
      setBusyLabel("");
    }
  };

  const uploadToGithub = async () => {
    if (!githubToken.trim()) {
      setError("Enter a GitHub Personal Access Token with repository content permissions.");
      return;
    }
    if (!paths.length) {
      setError("Add at least one project file before pushing.");
      return;
    }
    setBusyLabel("Pushing to GitHub…");
    setError("");
    const headers = {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };
    const api = async (path: string, init?: RequestInit) => {
      const response = await fetch(`https://api.github.com${path}`, { ...init, headers });
      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new GithubApiError(
          data?.message || `GitHub returned HTTP ${response.status}.`,
          response.status,
        );
      return data;
    };
    try {
      localStorage.setItem(GITHUB_KEY, githubToken);
      const user = await api("/user");
      let repo: { full_name: string; default_branch: string };
      try {
        repo = await api(
          `/repos/${encodeURIComponent(user.login)}/${encodeURIComponent(repoName)}`,
        );
      } catch (repoError) {
        if (!(repoError instanceof GithubApiError) || repoError.status !== 404) throw repoError;
        repo = await api("/user/repos", {
          method: "POST",
          body: JSON.stringify({
            name: repoName,
            private: true,
            description: "Created with Addis-Vault App Builder",
            auto_init: true,
          }),
        });
      }
      const branch = branchName.trim() || repo.default_branch || "main";
      let baseSha: string | null = null;
      let baseTreeSha: string | undefined;
      try {
        const ref = await api(
          `/repos/${repo.full_name}/git/ref/heads/${encodeURIComponent(branch)}`,
        );
        baseSha = ref.object.sha;
      } catch (branchError) {
        if (!(branchError instanceof GithubApiError) || branchError.status !== 404)
          throw branchError;
        baseSha = null;
      }
      const treeEntries: Array<{ path: string; mode: "100644"; type: "blob"; sha: string | null }> =
        await Promise.all(
          paths.map(async (path) => {
            const file = files[path];
            const body =
              file.encoding === "base64"
                ? { content: file.content, encoding: "base64" }
                : { content: file.content, encoding: "utf-8" };
            const blob = await api(`/repos/${repo.full_name}/git/blobs`, {
              method: "POST",
              body: JSON.stringify(body),
            });
            return { path, sha: blob.sha, mode: "100644", type: "blob" };
          }),
        );
      if (baseSha) {
        const baseCommit = await api(`/repos/${repo.full_name}/git/commits/${baseSha}`);
        baseTreeSha = baseCommit.tree.sha;
        const baseTree = await api(`/repos/${repo.full_name}/git/trees/${baseTreeSha}?recursive=1`);
        if (baseTree.truncated)
          throw new Error("The target GitHub repository is too large for a safe full sync.");
        const localPaths = new Set(paths);
        const removedPaths = (baseTree.tree as Array<{ path: string; type: string }>)
          .filter((entry) => entry.type === "blob" && !localPaths.has(entry.path))
          .map((entry) => entry.path);
        if (
          removedPaths.length &&
          !window.confirm(
            `This sync will delete ${removedPaths.length} remote file(s) missing from the workspace. Continue?`,
          )
        )
          return;
        treeEntries.push(
          ...removedPaths.map((path) => ({
            path,
            mode: "100644" as const,
            type: "blob" as const,
            sha: null,
          })),
        );
      }
      const tree = await api(`/repos/${repo.full_name}/git/trees`, {
        method: "POST",
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: treeEntries,
        }),
      });
      const commit = await api(`/repos/${repo.full_name}/git/commits`, {
        method: "POST",
        body: JSON.stringify({
          message: "Update project with Addis-Vault App Builder",
          tree: tree.sha,
          parents: baseSha ? [baseSha] : [],
        }),
      });
      if (baseSha) {
        await api(`/repos/${repo.full_name}/git/refs/heads/${encodeURIComponent(branch)}`, {
          method: "PATCH",
          body: JSON.stringify({ sha: commit.sha, force: false }),
        });
      } else {
        await api(`/repos/${repo.full_name}/git/refs`, {
          method: "POST",
          body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
        });
      }
      setDialog(null);
      window.open(
        `https://github.com/${repo.full_name}/tree/${encodeURIComponent(branch)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (pushError) {
      setError(pushError instanceof Error ? pushError.message : "GitHub push failed.");
    } finally {
      setBusyLabel("");
    }
  };

  const exportZip = async (pwa = false) => {
    try {
      const zip = new JSZip();
      for (const [path, file] of Object.entries(files)) {
        zip.file(path, file.content, file.encoding === "base64" ? { base64: true } : undefined);
      }
      if (pwa) {
        const standaloneHtml = makeStandalone(files);
        const withManifest = /rel=["']manifest["']/i.test(standaloneHtml)
          ? standaloneHtml
          : standaloneHtml.replace(
              "</head>",
              '<link rel="manifest" href="./manifest.json"></head>',
            );
        const indexHtml = /serviceWorker\.register/i.test(withManifest)
          ? withManifest
          : withManifest.replace(
              "</body>",
              '<script>if("serviceWorker" in navigator)navigator.serviceWorker.register("./sw.js")</script></body>',
            );
        zip.file("index.html", indexHtml);
        zip.file(
          "manifest.json",
          JSON.stringify(
            {
              name: "My App",
              short_name: "My App",
              start_url: "./index.html",
              scope: "./",
              display: "standalone",
              background_color: "#ffffff",
              theme_color: "#065f46",
              icons: [
                { src: "./icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
              ],
            },
            null,
            2,
          ),
        );
        zip.file(
          "icon.svg",
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#065f46"/><path d="M256 64 448 256 256 448 64 256Z" fill="none" stroke="#fff" stroke-width="24"/><circle cx="256" cy="256" r="52" fill="#fbbf24"/></svg>',
        );
        const precache = ["./", "./index.html", "./manifest.json", "./icon.svg"];
        zip.file(
          "sw.js",
          `const CACHE='app-cache-v1';const FILES=${JSON.stringify(precache)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(v=>{if(v.ok){const c=v.clone();caches.open(CACHE).then(a=>a.put(e.request,c))}return v}).catch(()=>caches.match('./index.html'))))});`,
        );
      }
      downloadBlob(
        await zip.generateAsync({ type: "blob" }),
        pwa ? "addis-vault-pwa.zip" : "addis-vault-source.zip",
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error ? exportError.message : "Unable to create the ZIP archive.",
      );
    }
  };

  const publish = async () => {
    if (!paths.length) {
      setError("Add project files before publishing.");
      return;
    }
    if (
      !window.confirm(
        "This link contains your complete project source code and is readable by anyone who receives it. Continue?",
      )
    )
      return;
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(files));
    if (!compressed) {
      setError("Could not compress this project for publishing.");
      return;
    }
    const url = `${location.origin}${location.pathname}#public=${compressed}`;
    if (url.length > 2_200) {
      setError(
        "This project is too large for a shareable QR link. Download the PWA or ZIP package instead.",
      );
      return;
    }
    window.location.hash = `public=${compressed}`;
    setPublicFiles(files);
    setDialog("deploy");
    try {
      setQrDataUrl(
        await QRCode.toDataURL(url, { width: 240, margin: 2, errorCorrectionLevel: "M" }),
      );
    } catch (qrError) {
      setError(
        qrError instanceof Error
          ? `QR code generation failed: ${qrError.message}`
          : "QR code generation failed.",
      );
    }
  };

  const copyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (copyError) {
      setError(
        copyError instanceof Error
          ? `Could not copy public link: ${copyError.message}`
          : "Could not copy public link.",
      );
    }
  };

  const saveOwnerSettings = () => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(adminSettings));
      setProviderSettings((current) => ({
        ...current,
        openrouter: { ...current.openrouter, model: adminSettings.defaultModel },
      }));
      setDialog(null);
    } catch (storageError) {
      setError(
        storageError instanceof Error
          ? `Could not save admin settings: ${storageError.message}`
          : "Could not save admin settings.",
      );
    }
  };

  const previewDocument = (source: ProjectFiles) => {
    const html = makeStandalone(source);
    const monitor =
      "<script>addEventListener('error',function(e){parent.postMessage({type:'builder-preview-error',message:e.message||'Script error'},'*')});addEventListener('unhandledrejection',function(e){parent.postMessage({type:'builder-preview-error',message:String(e.reason)},'*')});</" +
      "script>";
    return html.replace(/<head([^>]*)>/i, `<head$1>${monitor}`);
  };

  if (publicFiles) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-white text-stone-900">
        <div className="flex items-center justify-between border-b px-4 py-2 text-xs">
          <strong>Addis-Vault Public App</strong>
          <a href={location.pathname} className="rounded border px-3 py-1.5">
            Open Builder
          </a>
        </div>
        <iframe
          title="Public app"
          srcDoc={previewDocument(publicFiles)}
          sandbox="allow-scripts allow-forms allow-modals allow-downloads"
          className="h-full w-full flex-1 border-0"
        />
      </div>
    );
  }

  if (!projectLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-stone-500">
        Loading saved project…
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" /> Addis-Vault Studio
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">AI App Builder</h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Bring a project, build with your chosen AI, and export or publish it.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => uploadRef.current?.click()}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold dark:bg-zinc-900"
          >
            <FolderUp className="h-4 w-4" /> Import files
          </button>
          <button
            onClick={() => setDialog("github-import")}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold dark:bg-zinc-900"
          >
            <Github className="h-4 w-4" /> Import GitHub
          </button>
          <button
            type="button"
            aria-expanded={showAdvancedEditor}
            onClick={() => setShowAdvancedEditor((visible) => !visible)}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-semibold dark:bg-zinc-900"
          >
            <Code2 className="h-4 w-4" />
            {showAdvancedEditor ? "Hide project files" : "Project files"}
          </button>
          <input
            ref={uploadRef}
            type="file"
            multiple
            accept=".html,.htm,.js,.jsx,.css,.json,.zip"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      </div>

      {adminSettings.announcement && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-200">
          {adminSettings.announcement}
        </div>
      )}

      <div className="mb-4 rounded-xl border bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-4">
        <label htmlFor="app-builder-prompt" className="mb-2 block text-sm font-semibold">
          What would you like to build?
        </label>
        <textarea
          id="app-builder-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the app or change you want…"
          className="min-h-24 w-full resize-y rounded-lg border bg-white p-3 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            disabled={isGenerating}
            onClick={() => void generate()}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Bot className="h-4 w-4" /> {isGenerating ? busyLabel : "Generate"}
          </button>
          {isGenerating && (
            <button
              onClick={cancelGeneration}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium"
            >
              <X className="h-4 w-4" /> Cancel Generation
            </button>
          )}
          <button
            onClick={() => setDialog("ai")}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium"
          >
            <KeyRound className="h-4 w-4" /> AI settings
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-3 flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}
      </div>

      <div
        className={`grid min-w-0 gap-4 ${
          showAdvancedEditor ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" : "grid-cols-1"
        }`}
      >
        {showAdvancedEditor && (
          <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 dark:border-zinc-800">
              <div className="flex min-w-0 items-center gap-2">
                <Code2 className="h-4 w-4 shrink-0 text-emerald-700" />
                <select
                  aria-label="Project file"
                  value={activeFile}
                  onChange={(event) => setActiveFile(event.target.value)}
                  className="max-w-[54vw] bg-transparent text-sm font-semibold sm:max-w-64"
                >
                  {!paths.length && <option value="">No files yet</option>}
                  {paths.map((path) => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>
                <button
                  title="Add file"
                  onClick={() => setDialog("new-file")}
                  className="rounded p-1 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  <FilePlus2 className="h-4 w-4" />
                </button>
                {activeFile && (
                  <button
                    title="Delete selected file"
                    onClick={() => {
                      setFiles((current) => {
                        const next = { ...current };
                        delete next[activeFile];
                        return next;
                      });
                      setActiveFile(paths.find((path) => path !== activeFile) || "");
                    }}
                    className="rounded p-1 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <span className="text-xs text-stone-500">{paths.length} files</span>
            </div>
            <textarea
              aria-label="Source code editor"
              spellCheck={false}
              value={
                currentFile?.encoding === "base64"
                  ? "(Binary asset; import or replace this file to edit it.)"
                  : currentFile?.content || ""
              }
              readOnly={currentFile?.encoding === "base64"}
              onChange={(event) => {
                const path = activeFile;
                if (!path) return;
                const content = event.target.value;
                setFiles((current) => ({ ...current, [path]: { content } }));
              }}
              placeholder="Import a project or add a source file to start building. Nothing is preloaded."
              className="min-h-[320px] w-full resize-y bg-stone-950 p-4 font-mono text-xs leading-6 text-emerald-100 outline-none sm:min-h-[450px] sm:text-sm"
            />
          </div>
        )}

        <div className="min-w-0 overflow-hidden rounded-xl border bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2 dark:border-zinc-800">
            <strong className="text-sm">Live Preview</strong>
            <button
              title="Reload preview"
              onClick={() => {
                setFrameError("");
                if (previewRef.current) previewRef.current.srcdoc = previewDocument(files);
              }}
              className="rounded p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          {frameError && (
            <div
              role="alert"
              className="m-3 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
            >
              <p className="font-semibold">Preview error</p>
              <p className="mt-1 break-words">{frameError}</p>
              <button
                onClick={() =>
                  void generate(
                    `Fix this runtime error in the project: ${frameError}. Preserve existing behavior and return the complete corrected file(s).`,
                    true,
                  )
                }
                disabled={isGenerating}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-3 py-2 text-xs font-semibold text-white"
              >
                <Sparkles className="h-4 w-4" /> Auto-Fix Error with AI
              </button>
            </div>
          )}
          <iframe
            ref={previewRef}
            title="Application preview"
            srcDoc={previewDocument(files)}
            sandbox="allow-scripts allow-forms allow-modals allow-downloads"
            className="h-[400px] w-full border-0 bg-white sm:h-[500px]"
            onError={() => setFrameError("The preview could not be loaded.")}
          />
          <div className="flex flex-wrap gap-2 border-t p-3 dark:border-zinc-800">
            <button
              onClick={() =>
                downloadBlob(
                  new Blob([makeStandalone(files)], { type: "text/html;charset=utf-8" }),
                  "addis-vault-app.html",
                )
              }
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
            >
              <Download className="h-4 w-4" /> Standalone HTML
            </button>
            <button
              onClick={() => void exportZip(true)}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
            >
              <ArrowDownToLine className="h-4 w-4" /> Installable PWA
            </button>
            <button
              onClick={() => void exportZip()}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
            >
              <Download className="h-4 w-4" /> Full Source ZIP
            </button>
            <button
              onClick={() => void publish()}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white"
            >
              <Globe className="h-4 w-4" /> Publish to Public
            </button>
            <button
              onClick={() => setDialog("github-push")}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
            >
              <CloudUpload className="h-4 w-4" /> Push to GitHub
            </button>
          </div>
        </div>
      </div>

      {ownerAdmin && (
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => {
              setAdminUnlocked(false);
              setDialog("owner");
            }}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold"
          >
            <ShieldCheck className="h-4 w-4" /> Owner Admin Panel
          </button>
        </div>
      )}

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/55 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialog(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">
                {dialog === "ai"
                  ? "Connect an AI provider"
                  : dialog === "github-import"
                    ? "Import from GitHub"
                    : dialog === "github-push"
                      ? "Push / Export to GitHub"
                      : dialog === "new-file"
                        ? "Add project file"
                        : dialog === "owner"
                          ? "Owner Admin Panel"
                          : "Publish and deploy"}
              </h2>
              <button
                aria-label="Close dialog"
                onClick={() => {
                  setDialog(null);
                  setError("");
                }}
                className="rounded-lg p-2 hover:bg-stone-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dialog === "ai" && (
              <div className="space-y-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Provider keys are saved only in this browser and sent directly to the provider you
                  select. Never use a key you cannot safely store on this device.
                </p>
                <label className="block space-y-1.5 text-sm font-medium">
                  Provider
                  <select
                    value={provider}
                    onChange={(event) => setProvider(event.target.value as Provider)}
                    className="w-full rounded-lg border bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {(["openrouter", "gemini", "groq", "custom"] as Provider[]).map((item) => (
                      <option value={item} key={item}>
                        {item === "openrouter"
                          ? "OpenRouter"
                          : item === "gemini"
                            ? "Google Gemini"
                            : item === "groq"
                              ? "Groq"
                              : "Custom OpenAI-compatible"}
                      </option>
                    ))}
                  </select>
                </label>
                <SettingField
                  label="API key"
                  type="password"
                  value={providerSettings[provider].apiKey}
                  onChange={(value) => updateProvider("apiKey", value)}
                  placeholder="Paste your provider key"
                />
                <SettingField
                  label="Model"
                  value={providerSettings[provider].model}
                  onChange={(value) => updateProvider("model", value)}
                />
                {provider === "custom" && (
                  <SettingField
                    label="Chat completions endpoint"
                    value={providerSettings.custom.endpoint}
                    onChange={(value) => updateProvider("endpoint", value)}
                    placeholder="https://your-provider.example/v1/chat/completions"
                  />
                )}
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    className="text-emerald-700 underline"
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get a free Gemini key
                  </a>
                  <a
                    className="text-emerald-700 underline"
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get an OpenRouter key
                  </a>
                  <a
                    className="text-emerald-700 underline"
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get a Groq key
                  </a>
                </div>
                <button
                  onClick={() => setDialog(null)}
                  className="min-h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white"
                >
                  Save AI settings
                </button>
              </div>
            )}

            {dialog === "github-import" && (
              <div className="space-y-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Imports supported source and config files from a public repository using the
                  GitHub API.
                </p>
                <SettingField
                  label="Public repository URL"
                  value={githubUrl}
                  onChange={setGithubUrl}
                  placeholder="https://github.com/owner/repo"
                />
                {busyLabel && <p className="text-sm">{busyLabel}</p>}
                <button
                  disabled={Boolean(busyLabel)}
                  onClick={() => void importGithub()}
                  className="min-h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <CloudDownload className="mr-2 inline h-4 w-4" />
                  Import repository
                </button>
              </div>
            )}

            {dialog === "github-push" && (
              <div className="space-y-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  The token is stored in this browser and sent only to api.github.com. A new private
                  repository is created if the requested name does not exist.
                </p>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Sync mirrors this workspace and deletes repository files that are not in it. Back
                  up the target repository first.
                </p>
                <SettingField
                  label="GitHub Personal Access Token"
                  type="password"
                  value={githubToken}
                  onChange={setGithubToken}
                  placeholder="github_pat_…"
                />
                <SettingField
                  label="Repository name"
                  value={repoName}
                  onChange={setRepoName}
                  placeholder="my-app"
                />
                <SettingField label="Branch" value={branchName} onChange={setBranchName} />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      try {
                        localStorage.setItem(GITHUB_KEY, githubToken);
                        setDialog(null);
                      } catch (storageError) {
                        setError(
                          storageError instanceof Error
                            ? `Could not save GitHub token: ${storageError.message}`
                            : "Could not save GitHub token.",
                        );
                      }
                    }}
                    className="min-h-10 rounded-lg border px-4 text-sm font-semibold"
                  >
                    Save token
                  </button>
                  <button
                    disabled={Boolean(busyLabel)}
                    onClick={() => void uploadToGithub()}
                    className="min-h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {busyLabel || "Create / push repository"}
                  </button>
                  <a
                    className="text-sm text-emerald-700 underline"
                    href="https://github.com/settings/personal-access-tokens/new"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Create a GitHub token
                  </a>
                </div>
              </div>
            )}

            {dialog === "new-file" && (
              <div className="space-y-4">
                <SettingField
                  label="File path"
                  value={fileName}
                  onChange={setFileName}
                  placeholder="index.html"
                />
                <button
                  onClick={() => {
                    const path = normalizePath(fileName);
                    if (!path) {
                      setError("Enter a valid relative file path.");
                      return;
                    }
                    setFiles((current) => ({
                      ...current,
                      [path]: current[path] || { content: "" },
                    }));
                    setActiveFile(path);
                    setFileName("");
                    setDialog(null);
                    setError("");
                  }}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Create file
                </button>
              </div>
            )}

            {dialog === "owner" && !adminUnlocked && (
              <div className="space-y-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  This panel is available only in the authenticated server-verified admin session.
                  It does not accept or store a client-side owner password.
                </p>
                <button
                  onClick={() => {
                    if (ownerAdmin) {
                      setAdminUnlocked(true);
                      setError("");
                    } else setError("Admin verification is required.");
                  }}
                  className="min-h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white"
                >
                  Continue as verified admin
                </button>
              </div>
            )}

            {dialog === "owner" && adminUnlocked && ownerAdmin && (
              <div className="space-y-4">
                <label className="block space-y-1.5 text-sm font-medium">
                  Announcement
                  <textarea
                    value={adminSettings.announcement}
                    onChange={(event) =>
                      setAdminSettings((current) => ({
                        ...current,
                        announcement: event.target.value,
                      }))
                    }
                    className="min-h-24 w-full rounded-lg border bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950"
                    placeholder="Announcement shown in this browser's builder"
                  />
                </label>
                <SettingField
                  label="Default OpenRouter free model"
                  value={adminSettings.defaultModel}
                  onChange={(value) =>
                    setAdminSettings((current) => ({ ...current, defaultModel: value }))
                  }
                />
                <p className="text-xs text-stone-500">
                  These settings are stored on this device. Use your existing admin backend to
                  publish settings platform-wide.
                </p>
                <button
                  onClick={saveOwnerSettings}
                  className="min-h-10 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white"
                >
                  Save admin settings
                </button>
              </div>
            )}

            {dialog === "deploy" && (
              <div className="space-y-4">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  The public link is compressed into its URL hash; the project source stays in the
                  link and is not uploaded to a hosting service.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => void copyPublicLink()}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Public Link"}
                  </button>
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt="QR code for public app"
                      className="h-36 w-36 border p-1"
                    />
                  )}
                  <QrCode className="h-5 w-5" />
                </div>
                <div className="space-y-2 rounded-lg bg-stone-50 p-3 text-sm dark:bg-zinc-950">
                  <p className="font-semibold">Deploy guide</p>
                  <p>
                    <a
                      className="text-emerald-700 underline"
                      href="https://app.netlify.com/drop"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Netlify Drop
                    </a>
                    : Download the PWA package, unzip it, then drop the folder.
                  </p>
                  <p>
                    <a
                      className="text-emerald-700 underline"
                      href="https://vercel.com/new"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Vercel
                    </a>
                    : Import the GitHub repository and deploy its static files.
                  </p>
                  <p>
                    <a
                      className="text-emerald-700 underline"
                      href="https://pages.github.com/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub Pages
                    </a>
                    : Push the source ZIP contents to a repository and enable Pages.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
              >
                {error}
              </p>
            )}
          </section>
        </div>
      )}
      <p className="mt-8 text-center text-xs text-stone-500">
        © 2026 Addis-Vault. All Rights Reserved.
      </p>
    </section>
  );
}
