import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sanitizeServerText } from "./server-sanitize";
import { directoryTierPrice } from "@/utils/servicePricing";

// Business Location Directory. Searching is free (public SELECT on active rows, safe columns only).
// Registration (100–300 ETB) is written here with the service client after the Telebirr/CBE ref step.

const listingInput = z.object({
  id: z.string().trim().min(6).max(80),
  name: z.string().trim().min(2).max(120),
  category: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(60),
  area: z.string().trim().max(80).default(""),
  address: z.string().trim().max(200).default(""),
  phone: z.string().trim().min(6).max(24),
  description: z.string().trim().max(800).default(""),
  hours: z.string().trim().max(120).default(""),
  mapUrl: z.string().trim().max(400).default(""),
  tier: z.enum(["basic", "standard", "featured"]),
  refNumber: z.string().trim().min(4).max(64),
  paymentMethod: z.enum(["telebirr", "cbe"]),
});

type Ok = { ok: true } | { ok: false; error: string };

export const submitBusinessListing = createServerFn({ method: "POST" })
  .validator((input: z.input<typeof listingInput>) => listingInput.parse(input))
  .handler(async ({ data }): Promise<Ok> => {
    const mapUrl = /^https:\/\//i.test(data.mapUrl) ? sanitizeServerText(data.mapUrl, 400) : "";
    const phone = data.phone.replace(/[^0-9+\-\s()]/g, "").slice(0, 24);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("business_listings").upsert(
      {
        id: sanitizeServerText(data.id, 80),
        name: sanitizeServerText(data.name, 120),
        category: sanitizeServerText(data.category, 60),
        city: sanitizeServerText(data.city, 60),
        area: sanitizeServerText(data.area, 80),
        address: sanitizeServerText(data.address, 200),
        phone,
        description: data.tier === "basic" ? "" : sanitizeServerText(data.description, 800),
        hours: data.tier === "basic" ? "" : sanitizeServerText(data.hours, 120),
        map_url: data.tier === "basic" ? "" : mapUrl,
        tier: data.tier,
        featured: data.tier === "featured",
        ref_number: sanitizeServerText(data.refNumber, 64).toUpperCase(),
        payment_method: data.paymentMethod,
        price_etb: directoryTierPrice(data.tier),
        status: "active",
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save the listing." };
    }
    return { ok: true };
  });


export type OwnerListing = {
  id: string;
  name: string;
  category: string;
  city: string;
  phone: string;
  tier: string;
  status: string;
  ref_number: string;
  payment_method: string;
  price_etb: number;
  created_at: string;
};

export const listDirectoryForOwner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OwnerListing[]> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("business_listings")
      .select("id, name, category, city, phone, tier, status, ref_number, payment_method, price_etb, created_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error("Could not load listings");
    return (data || []) as OwnerListing[];
  });

export const setListingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string; status: "active" | "hidden" }) =>
    z.object({ id: z.string().min(1).max(80), status: z.enum(["active", "hidden"]) }).parse(input),
  )
  .handler(async ({ data, context }): Promise<Ok> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("business_listings").update({ status: data.status }).eq("id", data.id);
    if (error) return { ok: false, error: "Could not update listing." };
    return { ok: true };
  });
