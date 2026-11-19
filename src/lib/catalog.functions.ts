import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Owner-only catalog management (add / edit / delete items, attach uploaded files or links).
// Every write re-checks the caller's admin role on the server.

const localized = z.object({
  en: z.string().max(400),
  am: z.string().max(400),
  om: z.string().max(400),
  ti: z.string().max(400),
  so: z.string().max(400),
});

const saveInput = z.object({
  id: z.string().trim().min(3).max(160),
  action: z.enum(["add", "edit"]),
  category: z.string().trim().min(2).max(40),
  payload: z
    .object({
      title: localized,
      description: localized,
      priceEtb: z.number().int().min(0).max(100000),
      category: z.string().max(40),
      format: z.string().max(80).optional(),
      gradeBand: z.string().max(40).optional(),
      subject: z.string().max(120).optional(),
      regionId: z.string().max(40).optional(),
      instructionLanguage: z.string().max(60).optional(),
      bookRole: z.string().max(40).optional(),
      uniYear: z.string().max(40).optional(),
      department: z.string().max(60).optional(),
      examYear: z.string().max(40).optional(),
      carBrand: z.string().max(60).optional(),
      modelYear: z.string().max(40).optional(),
      hasVideoPreview: z.boolean().optional(),
      coverImage: z.string().max(600).optional(),
    })
    .passthrough(),
  filePath: z.string().max(400).optional(),
  linkUrl: z.string().max(1000).optional(),
});

type Ok = { ok: true } | { ok: false; error: string };

export const saveCatalogItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: z.input<typeof saveInput>) => saveInput.parse(input))
  .handler(async ({ data, context }): Promise<Ok> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { ok: false, error: "Unauthorized" };
    const link = data.linkUrl && /^https:\/\//i.test(data.linkUrl) ? data.linkUrl : "";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("catalog_items")
      .select("action, file_path, link_url")
      .eq("id", data.id)
      .maybeSingle();
    const filePath = data.filePath ?? existing?.file_path ?? "";
    const linkUrl = data.linkUrl !== undefined ? link : existing?.link_url ?? "";
    const hasPdf = Boolean(
      (filePath && filePath.toLowerCase().split("?")[0].endsWith(".pdf")) ||
      (linkUrl && (() => {
        try { return new URL(linkUrl).pathname.toLowerCase().endsWith(".pdf"); }
        catch { return false; }
      })())
    );
    // Editing an owner-added item keeps it an "add" row.
    const action = existing?.action === "add" ? "add" : data.action;
    const { error } = await supabaseAdmin.from("catalog_items").upsert({
      id: data.id,
      action,
      category: data.category,
      payload: {
        ...data.payload,
        hasFile: Boolean(filePath),
        hasLink: Boolean(linkUrl),
        hasPdf,
        ...(linkUrl ? { sourcePdfUrl: hasPdf ? linkUrl : "" } : {}),
      },
      file_path: filePath,
      link_url: linkUrl,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save item." };
    }
    return { ok: true };
  });

export const deleteCatalogItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string; category: string }) =>
    z.object({ id: z.string().min(1).max(160), category: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Ok> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) return { ok: false, error: "Unauthorized" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("catalog_items")
      .select("action, file_path")
      .eq("id", data.id)
      .maybeSingle();
    if (existing?.file_path) {
      await supabaseAdmin.storage.from("vault-files").remove([existing.file_path]);
    }
    const { error } =
      existing?.action === "add"
        ? await supabaseAdmin.from("catalog_items").delete().eq("id", data.id)
        : await supabaseAdmin.from("catalog_items").upsert({
            id: data.id,
            action: "delete",
            category: data.category,
            payload: {},
            file_path: "",
            link_url: "",
            updated_at: new Date().toISOString(),
          });
    if (error) return { ok: false, error: "Could not delete item." };
    return { ok: true };
  });

// Returns a short-lived download link for an owner-uploaded file (or the owner's pasted link).
// Unlocking follows the app's Telebirr/CBE reference flow, which is confirmed in the browser.
export const getVaultFileUrl = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => z.object({ id: z.string().min(1).max(160) }).parse(input))
  .handler(async ({ data }): Promise<{ url: string | null; isPdf: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("catalog_items")
      .select("file_path, link_url")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) return { url: null, isPdf: false };
    if (row.file_path) {
      const isPdf = row.file_path.toLowerCase().split("?")[0].endsWith(".pdf");
      const { data: signed } = await supabaseAdmin.storage.from("vault-files").createSignedUrl(
        row.file_path,
        600,
        isPdf ? { download: true } : undefined,
      );
      return { url: signed?.signedUrl ?? null, isPdf };
    }
    const isPdf = Boolean(row.link_url && (() => {
      try {
        return new URL(row.link_url).pathname.toLowerCase().endsWith(".pdf");
      } catch {
        return false;
      }
    })());
    return { url: row.link_url || null, isPdf };
  });
