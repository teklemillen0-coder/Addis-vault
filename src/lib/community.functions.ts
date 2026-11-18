import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sanitizeRecordStrings, sanitizeServerText } from "./server-sanitize";
import { getChatModerationReason } from "@/utils/chatModeration";

// Community job board, expediter inbox, legal consultations and chat.
// Public submissions are validated here and written with the service client;
// visitors cannot write to these tables directly.

const idSchema = z.string().trim().min(1).max(120);
const recordInput = (input: Record<string, unknown>) =>
  z.record(z.unknown()).refine((r) => typeof r.id === "string").parse(input);

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type Ok = { ok: true } | { ok: false; error: string };

export const submitWorkerProfile = createServerFn({ method: "POST" })
  .validator(recordInput)
  .handler(async ({ data }): Promise<Ok> => {
    const worker = sanitizeRecordStrings(data, 1200);
    const id = idSchema.safeParse(worker.id);
    if (!id.success || !worker.fullName || !worker.phone) return { ok: false, error: "Name and phone are required." };
    const db = await adminClient();
    const { error } = await db
      .from("worker_profiles")
      .upsert({ id: id.data, payload: worker }, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save worker profile." };
    }
    return { ok: true };
  });

export const submitJobListing = createServerFn({ method: "POST" })
  .validator(recordInput)
  .handler(async ({ data }): Promise<Ok> => {
    const job = sanitizeRecordStrings(data, 1200);
    const id = idSchema.safeParse(job.id);
    if (!id.success || !job.title || !job.contactPhone) return { ok: false, error: "Job title and phone are required." };
    const db = await adminClient();
    const { error } = await db
      .from("job_listings")
      .upsert({ id: id.data, payload: job }, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save job listing." };
    }
    return { ok: true };
  });

export const submitExpediterRequest = createServerFn({ method: "POST" })
  .validator(recordInput)
  .handler(async ({ data }): Promise<Ok> => {
    const item = sanitizeRecordStrings(data, 1500);
    const id = idSchema.safeParse(item.id);
    const trackingCode = sanitizeServerText(String(item.trackingCode ?? ""), 40);
    if (!id.success || !trackingCode || !item.clientName || !item.phone || !item.serviceNeeded) {
      return { ok: false, error: "Client name, phone, and service are required." };
    }
    const now = new Date().toISOString();
    const payload = { ...item, status: "Pending", createdAt: now, updatedAt: now };
    delete (payload as Record<string, unknown>).ownerReply;
    delete (payload as Record<string, unknown>).quoteEtb;
    const db = await adminClient();
    const { error } = await db
      .from("expediter_requests")
      .upsert(
        { id: id.data, tracking_code: trackingCode, payload, status: "Pending" },
        { onConflict: "id", ignoreDuplicates: true },
      );
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save request." };
    }
    return { ok: true };
  });

export const submitLegalConsultation = createServerFn({ method: "POST" })
  .validator(recordInput)
  .handler(async ({ data }): Promise<Ok> => {
    const booking = sanitizeRecordStrings(data, 2000);
    const id = idSchema.safeParse(booking.id);
    if (!id.success || !booking.clientName || !booking.phone || !booking.tierId) {
      return { ok: false, error: "Client name, phone, and package tier are required." };
    }
    const db = await adminClient();
    const { error } = await db
      .from("legal_consultations")
      .upsert({ id: id.data, payload: booking }, { onConflict: "id", ignoreDuplicates: true });
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not save booking." };
    }
    return { ok: true };
  });

export interface ExpediterUpdate {
  id: string;
  status: string;
  ownerReply: string | null;
  quoteEtb: number | null;
  updatedAt: string;
}

// Lets a visitor see owner replies for requests they submitted from this device.
// Both the request id and its tracking code must match.
export const getExpediterUpdates = createServerFn({ method: "POST" })
  .validator((input: { items: { id: string; trackingCode: string }[] }) =>
    z
      .object({
        items: z.array(z.object({ id: idSchema, trackingCode: z.string().trim().min(1).max(40) })).max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<ExpediterUpdate[]> => {
    if (data.items.length === 0) return [];
    const db = await adminClient();
    const { data: rows, error } = await db
      .from("expediter_requests")
      .select("id, tracking_code, status, owner_reply, quote_etb, updated_at")
      .in(
        "id",
        data.items.map((i) => i.id),
      );
    if (error || !rows) return [];
    const codes = new Map(data.items.map((i) => [i.id, i.trackingCode]));
    return rows
      .filter((r) => codes.get(r.id) === r.tracking_code)
      .map((r) => ({
        id: r.id,
        status: r.status,
        ownerReply: r.owner_reply,
        quoteEtb: r.quote_etb === null ? null : Number(r.quote_etb),
        updatedAt: r.updated_at,
      }));
  });

// Owner-only: update an expediter request's status, reply and quote.
export const updateExpediterRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string; status: string; ownerReply?: string; quoteEtb?: number }) =>
    z
      .object({
        id: idSchema,
        status: z.enum(["Pending", "In Progress", "Quoted", "Completed"]),
        ownerReply: z.string().max(1500).optional(),
        quoteEtb: z.number().finite().min(0).max(100_000_000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Ok> => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { ok: false, error: "Only the store owner can update requests." };
    const patch: {
      status: string;
      updated_at: string;
      owner_reply?: string;
      quote_etb?: number;
    } = { status: data.status, updated_at: new Date().toISOString() };
    if (data.ownerReply !== undefined) patch.owner_reply = sanitizeServerText(data.ownerReply, 1500);
    if (data.quoteEtb !== undefined) patch.quote_etb = data.quoteEtb;
    const { error } = await context.supabase.from("expediter_requests").update(patch).eq("id", data.id);
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not update request." };
    }
    return { ok: true };
  });

// Signed-in members post to the community chat; author details come from their profile.
export const postChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { id: string; room: string; message: string; includePhone?: boolean }) =>
    z
      .object({
        id: z.string().trim().regex(/^[A-Za-z0-9_-]{3,80}$/),
        room: z.enum(["trust", "exams", "careers"]),
        message: z.string().max(2000),
        includePhone: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<Ok> => {
    const message = sanitizeServerText(data.message, 800);
    if (message.length < 3) return { ok: false, error: "Message is too short." };
    if (getChatModerationReason(message)) {
      return { ok: false, error: "Message blocked by safety moderation." };
    }
    const { data: profile, error: pErr } = await context.supabase
      .from("profiles")
      .select("member_code, full_name, region, member_role, verified_buyer, phone")
      .eq("id", context.userId)
      .maybeSingle();
    if (pErr || !profile) return { ok: false, error: "Member profile not found." };
    const db = await adminClient();
    const { error } = await db.from("chat_messages").upsert(
      {
        id: data.id,
        user_id: context.userId,
        member_code: profile.member_code,
        author_name: profile.full_name || "Member",
        author_region: profile.region || "Ethiopia",
        author_role: profile.member_role || "Student",
        verified_buyer: profile.verified_buyer,
        room: data.room,
        message,
        optional_phone: data.includePhone && profile.phone ? profile.phone : null,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    if (error) {
      console.error(error);
      return { ok: false, error: "Could not post message." };
    }
    return { ok: true };
  });
