// Browser-side reads for AddisVault's community data (Lovable Cloud, protected by access rules).
import { supabase } from "@/integrations/supabase/client";
import type {
  CommunityChatMessage,
  ExpediterRequest,
  ExpediterStatus,
  JobListing,
  LegalConsultationBooking,
  MemberProfile,
  MemberRole,
  WorkerProfile,
} from "@/types";

export interface CommunityBoard {
  workers: WorkerProfile[];
  jobs: JobListing[];
  chatMessages: CommunityChatMessage[];
  expediterRequests: ExpediterRequest[];
  consultations: LegalConsultationBooking[];
}

export async function loadCommunityBoard(isAdmin: boolean): Promise<CommunityBoard> {
  const [workersRes, jobsRes, chatRes] = await Promise.all([
    supabase.from("worker_profiles").select("payload").order("created_at", { ascending: false }).limit(500),
    supabase.from("job_listings").select("payload").order("created_at", { ascending: false }).limit(500),
    supabase
      .from("chat_messages")
      .select(
        "id, member_code, author_name, author_region, author_role, verified_buyer, room, message, optional_phone, helpful_count, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const board: CommunityBoard = {
    workers: (workersRes.data ?? []).map((r) => r.payload as unknown as WorkerProfile),
    jobs: (jobsRes.data ?? []).map((r) => r.payload as unknown as JobListing),
    chatMessages: (chatRes.data ?? []).map((m) => ({
      id: m.id,
      memberId: m.member_code,
      authorName: m.author_name,
      authorRegion: m.author_region,
      authorRole: m.author_role as MemberRole,
      verifiedBuyer: m.verified_buyer,
      room: m.room as CommunityChatMessage["room"],
      message: m.message,
      optionalPhone: m.optional_phone ?? undefined,
      helpfulCount: m.helpful_count,
      createdAt: m.created_at,
    })),
    expediterRequests: [],
    consultations: [],
  };

  if (isAdmin) {
    const [expRes, consultRes] = await Promise.all([
      supabase.from("expediter_requests").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("legal_consultations").select("payload").order("created_at", { ascending: false }).limit(500),
    ]);
    board.expediterRequests = (expRes.data ?? []).map((r) => ({
      ...(r.payload as unknown as ExpediterRequest),
      id: r.id,
      trackingCode: r.tracking_code,
      status: r.status as ExpediterStatus,
      ownerReply: r.owner_reply ?? undefined,
      quoteEtb: r.quote_etb === null ? undefined : Number(r.quote_etb),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    board.consultations = (consultRes.data ?? []).map((r) => r.payload as unknown as LegalConsultationBooking);
  }

  return board;
}

export interface AccountState {
  userId: string;
  email: string | null;
  isAdmin: boolean;
  member: MemberProfile | null;
}

export async function loadAccount(): Promise<AccountState | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const [profileRes, adminRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
  ]);
  const p = profileRes.data;
  const member: MemberProfile | null = p
    ? {
        id: p.member_code,
        fullName: p.full_name,
        contact: p.phone || p.email || user.email || "",
        region: p.region,
        role: p.member_role as MemberRole,
        sharePhone: p.share_phone,
        verifiedBuyer: p.verified_buyer,
        points: p.points,
        downloadsCount: p.downloads_count,
        purchasesCount: p.purchases_count,
        referralsCount: p.referrals_count,
        helpfulChatsCount: p.helpful_chats_count,
        joinedAt: p.joined_at,
      }
    : null;
  return { userId: user.id, email: user.email ?? null, isAdmin: adminRes.data === true, member };
}

export interface PublicBusinessListing {
  id: string;
  name: string;
  category: string;
  city: string;
  area: string;
  address: string;
  phone: string;
  description: string;
  hours: string;
  map_url: string;
  tier: string;
  featured: boolean;
  created_at: string;
}

export async function loadPublicBusinessDirectory(): Promise<PublicBusinessListing[]> {
  const { data, error } = await supabase
    .from("business_listings")
    .select("id, name, category, city, area, address, phone, description, hours, map_url, tier, featured, created_at")
    .eq("status", "active")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Could not load public business directory:", error);
    return [];
  }
  return (data ?? []) as PublicBusinessListing[];
}
