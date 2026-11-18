import { Fragment, lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { reloadCatalogChanges } from "@/lib/catalog-data";
import { deleteCatalogItem } from "@/lib/catalog.functions";
import { loadAccount, loadCommunityBoard } from "@/lib/community-data";
import {
  getExpediterUpdates,
  postChatMessage,
  submitExpediterRequest,
  submitJobListing,
  submitLegalConsultation,
  submitWorkerProfile,
  updateExpediterRequest,
} from "@/lib/community.functions";
import { verifyOwnerPin } from "@/lib/owner.functions";
import {
  ArrowDown,
  Crown,
  Download,
  FileQuestion,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
} from "lucide-react";
import { HERO_IMAGE } from "./data/products";
import { useCatalog } from "./data/catalogStore";
import { DEFAULT_AD_CONFIG } from "./constants/ads";
import { getPromoDiscountPercent } from "./constants/payment";
import { OWNER_SUPPORT_CONTACTS } from "./constants/support";
import { AI_TOOLS_LIST } from "./constants/aiTools";
import { OWNER_DEFAULT_PROFILE } from "./constants/pdfAndCommunity";
import { EXTRA_T, fmt } from "./i18n/extraTranslations";
import { LANGUAGE_OPTIONS, UI_TRANSLATIONS } from "./i18n/translations";
import { usePWAInstall } from "./hooks/usePWAInstall";
import {
  ALL_INSTRUCTION_LANGUAGES,
  ETHIOPIAN_REGIONS,
  REGION_NAME_BY_ID,
} from "./constants/educationRegions";
import {
  AdConfig,
  AiToolDefinition,
  AppFontScale,
  BundleDeal,
  CartItem,
  CategoryId,
  CommunityChatMessage,
  CvCountryStandard,
  DigitalProduct,
  EthiopianRegionId,
  ExpediterRequest,
  ExpediterStatus,
  JobListing,
  Language,
  LegalConsultTier,
  LegalConsultationBooking,
  LegalDocTemplate,
  MemberProfile,
  OwnerTrustProfile,
  PaymentMethod,
  PendingLinkDownload,
  PendingPdfExport,
  PendingService,
  PurchaseOrder,
  VaultAccessToken,
  ViewTab,
  VipPlan,
  VipSubscription,
  WorkerProfile,
} from "./types";
import { downloadProductFile } from "./utils/fileGenerator";
import {
  computeIntegritySig,
  readEncryptedStorage,
  sanitizeUserInput,
  sealEncryptedStorage,
  verifyCheckoutAmount,
} from "./utils/appSecurity";
import { enqueueOfflineAction, flushOfflineQueue } from "./utils/offlineQueue";
import {
  generateUserReferralCode,
  getOrCreateDeviceId,
  isOrderBoundToCurrentDevice,
  isVipActiveOnCurrentDevice,
  mintSingleUseVaultToken,
  validateAndConsumeVaultToken,
} from "./utils/vaultSecurity";
import { AdSlot } from "./components/AdSlot";
import { MobileBottomNav, Navbar } from "./components/Navbar";
import { ProductCard } from "./components/ProductCard";
import { ProductModal } from "./components/ProductModal";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { OwnerActionBar, OwnerItemEditor } from "./components/OwnerControls";
import { PWAInstallModal } from "./components/PWAInstallModal";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { SupportWidget } from "./components/SupportWidget";
import { MissingFileModal } from "./components/MissingFileModal";
import { SecureVaultReaderModal } from "./components/SecureVaultReaderModal";
import { MemberAuthModal } from "./components/MemberAuthModal";
import { VerifiedOwnerModal } from "./components/VerifiedOwnerModal";

const DownloadsView = lazy(() =>
  import("./components/DownloadsView").then((module) => ({ default: module.DownloadsView })),
);
const OwnerDashboardView = lazy(() =>
  import("./components/OwnerDashboardView").then((module) => ({
    default: module.OwnerDashboardView,
  })),
);
const SmartLinkDownloaderView = lazy(() =>
  import("./components/SmartLinkDownloaderView").then((module) => ({
    default: module.SmartLinkDownloaderView,
  })),
);
const AiToolsSuiteView = lazy(() =>
  import("./components/AiToolsSuiteView").then((module) => ({ default: module.AiToolsSuiteView })),
);
const JobsMarketplaceView = lazy(() =>
  import("./components/JobsMarketplaceView").then((module) => ({
    default: module.JobsMarketplaceView,
  })),
);
const ExpediterView = lazy(() =>
  import("./components/ExpediterView").then((module) => ({ default: module.ExpediterView })),
);
const CvBuilderView = lazy(() =>
  import("./components/CvBuilderView").then((module) => ({ default: module.CvBuilderView })),
);
const LegalSuiteView = lazy(() =>
  import("./components/LegalSuiteView").then((module) => ({ default: module.LegalSuiteView })),
);
const LawyersHubView = lazy(() =>
  import("./components/LawyersHubView").then((module) => ({ default: module.LawyersHubView })),
);
const UniversityHubView = lazy(() =>
  import("./components/UniversityHubView").then((module) => ({
    default: module.UniversityHubView,
  })),
);
const ExamArchivePanel = lazy(() =>
  import("./components/ExamArchivePanel").then((module) => ({ default: module.ExamArchivePanel })),
);
const BusinessDirectoryView = lazy(() =>
  import("./components/BusinessDirectoryView").then((module) => ({
    default: module.BusinessDirectoryView,
  })),
);
const VideoStudioView = lazy(() =>
  import("./components/VideoStudioView").then((module) => ({ default: module.VideoStudioView })),
);
const SettingsView = lazy(() =>
  import("./components/SettingsView").then((module) => ({ default: module.SettingsView })),
);
const PdfEditorView = lazy(() =>
  import("./components/PdfEditorView").then((module) => ({ default: module.PdfEditorView })),
);
const CommunityTrustView = lazy(() =>
  import("./components/CommunityTrustView").then((module) => ({
    default: module.CommunityTrustView,
  })),
);

const AppBuilderView = lazy(() =>
  import("./components/AppBuilderView").then((module) => ({ default: module.AppBuilderView })),
);

const CATEGORY_LIST: CategoryId[] = [
  "education",
  "national_exams",
  "law_academy",
  "video_arts",
  "culinary",
  "medical",
  "research_history",
  "business_diaspora",
  "childrens_books",
  "gov_manuals",
  "repair_kits",
  "livestock",
  "business_ideas",
  "taxpayer_ed",
  "electronics_manuals",
  "architecture_plans",
  "auto_mechanic",
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readCommunityStorage<T extends { id: string }>(key: string, sampleIds: Set<string>): T[] {
  return readStorage<T[]>(key, []).filter((item) => !sampleIds.has(item.id));
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("addisvault_lang") as Language | null;
      return saved && UI_TRANSLATIONS[saved] ? saved : "en";
    } catch {
      return "en";
    }
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
      return "dark";
    }
    return "light";
  });

  const [fontScale, setFontScale] = useState<AppFontScale>(() =>
    readStorage<AppFontScale>("addisvault_font_scale", "base"),
  );

  const [deviceId] = useState<string>(() => getOrCreateDeviceId());
  const [activeTab, setActiveTab] = useState<ViewTab>("app_builder");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedExamYear, setSelectedExamYear] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedContentLang, setSelectedContentLang] = useState<Language | "all">("all");
  const [selectedCarBrand, setSelectedCarBrand] = useState<string>("all");
  const [selectedModelYear, setSelectedModelYear] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedInstructionLang, setSelectedInstructionLang] = useState<string>("all");
  const [selectedBookRole, setSelectedBookRole] = useState<string>("all");
  const [selectedEdition, setSelectedEdition] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc">("featured");

  const handleSelectCategory = (next: CategoryId | "all") => {
    setSelectedCategory(next);
    setSelectedGrade("all");
    setSelectedSubject("all");
    setSelectedExamYear("all");
    setSelectedAudience("all");
    setSelectedTrack("all");
    setSelectedCarBrand("all");
    setSelectedModelYear("all");
    setSelectedRegion("all");
    setSelectedInstructionLang("all");
    setSelectedBookRole("all");
    setSelectedEdition("all");
  };

  const handleSelectRegion = (nextRegion: string) => {
    setSelectedRegion(nextRegion);
    if (nextRegion !== "all") {
      if (selectedCategory !== "education") {
        setSelectedCategory("education");
      }
      const allowedLangs =
        REGION_NAME_BY_ID[nextRegion as EthiopianRegionId]?.primaryLanguages || [];
      if (selectedInstructionLang !== "all" && !allowedLangs.includes(selectedInstructionLang)) {
        setSelectedInstructionLang("all");
      }
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => readStorage("addisvault_cart", []));
  const [orders, setOrders] = useState<PurchaseOrder[]>(() =>
    readEncryptedStorage("addisvault_orders", []),
  );
  const [adConfig, setAdConfig] = useState<AdConfig>(() => {
    const raw = readStorage<
      Partial<AdConfig> & {
        showDemoBanners?: boolean;
        directSponsors?: Array<AdConfig["directSponsors"][number] & { isDemo?: boolean }>;
      }
    >("addisvault_ad_config", DEFAULT_AD_CONFIG);
    return {
      ...DEFAULT_AD_CONFIG,
      ...raw,
      showDefaultBanners: false,
      directSponsors: Array.isArray(raw.directSponsors)
        ? raw.directSponsors
            .map((b) => {
              const { isDemo, ...rest } = b as AdConfig["directSponsors"][number] & {
                isDemo?: boolean;
              };
              return {
                ...rest,
                isDefault: rest.isDefault ?? isDemo,
              };
            })
            .filter((banner) => !banner.isDefault)
        : DEFAULT_AD_CONFIG.directSponsors,
    };
  });
  const [vipSubscription, setVipSubscription] = useState<VipSubscription | null>(() =>
    readEncryptedStorage("addisvault_vip", null),
  );
  const [workers, setWorkers] = useState<WorkerProfile[]>(() =>
    readCommunityStorage("addisvault_workers", new Set(["wk-1", "wk-2", "wk-3", "wk-4"])),
  );
  const [jobs, setJobs] = useState<JobListing[]>(() =>
    readCommunityStorage("addisvault_jobs", new Set(["jb-1", "jb-2", "jb-3"])),
  );
  const [expediterRequests, setExpediterRequests] = useState<ExpediterRequest[]>(() =>
    readCommunityStorage("addisvault_expediter", new Set(["exp-1"])),
  );
  const [consultBookings, setConsultBookings] = useState<LegalConsultationBooking[]>(() =>
    readEncryptedStorage("addisvault_consults", []),
  );
  const [currentMember, setCurrentMember] = useState<MemberProfile | null>(() =>
    readEncryptedStorage<MemberProfile | null>("addisvault_member", null),
  );
  const [account, setAccount] = useState<{
    userId: string;
    email: string | null;
    isAdmin: boolean;
  } | null>(null);
  const [chatMessages, setChatMessages] = useState<CommunityChatMessage[]>(() =>
    readCommunityStorage(
      "addisvault_chat_msgs",
      new Set(["msg-seed-01", "msg-seed-02", "msg-seed-03", "msg-seed-04", "msg-seed-05"]),
    ),
  );
  const [blockedMemberIds, setBlockedMemberIds] = useState<string[]>(() =>
    readStorage("addisvault_blocked_members", []),
  );
  const [reportedMessageIds, setReportedMessageIds] = useState<string[]>(() =>
    readStorage("addisvault_reported_msgs", []),
  );
  const [ownerProfile, setOwnerProfile] = useState<OwnerTrustProfile>(() =>
    readStorage("addisvault_owner_profile", OWNER_DEFAULT_PROFILE),
  );
  const [referralCode] = useState<string>(() => {
    const existing = readStorage<string>("addisvault_ref_code", "");
    if (existing) return existing;
    const created = generateUserReferralCode();
    try {
      localStorage.setItem("addisvault_ref_code", JSON.stringify(created));
    } catch {
      // Ignore
    }
    return created;
  });
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [referralBannerVisible, setReferralBannerVisible] = useState(false);
  const [tokenSecurityError, setTokenSecurityError] = useState(false);

  const [previewProduct, setPreviewProduct] = useState<DigitalProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingVipPlan, setPendingVipPlan] = useState<VipPlan | null>(null);
  const [pendingAiTool, setPendingAiTool] = useState<AiToolDefinition | null>(null);
  const [pendingCvStandard, setPendingCvStandard] = useState<CvCountryStandard | null>(null);
  const [pendingLegalDoc, setPendingLegalDoc] = useState<LegalDocTemplate | null>(null);
  const [pendingLegalConsult, setPendingLegalConsult] = useState<{
    tier: LegalConsultTier;
    intake: { clientName: string; phone: string; branch: string; caseSummary: string };
  } | null>(null);
  const [pendingLinkDownload, setPendingLinkDownload] = useState<PendingLinkDownload | null>(null);
  const [lastConfirmedLinkDownload, setLastConfirmedLinkDownload] =
    useState<PendingLinkDownload | null>(null);
  const [pendingPdfExport, setPendingPdfExport] = useState<PendingPdfExport | null>(null);
  const [lastConfirmedPdfExport, setLastConfirmedPdfExport] = useState<PendingPdfExport | null>(
    null,
  );
  const [pendingService, setPendingService] = useState<PendingService | null>(null);
  const [lastConfirmedService, setLastConfirmedService] = useState<{
    service: PendingService;
    refNumber: string;
    paymentMethod: PaymentMethod;
  } | null>(null);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);
  const [isMissingFileOpen, setIsMissingFileOpen] = useState(false);
  const [isMemberAuthOpen, setIsMemberAuthOpen] = useState(false);
  const [isVerifiedOwnerOpen, setIsVerifiedOwnerOpen] = useState(false);
  const [activeVaultSession, setActiveVaultSession] = useState<{
    product: DigitalProduct;
    order: PurchaseOrder | null;
    token: VaultAccessToken;
    initialLang?: Language;
  } | null>(null);

  // Pagination & Bilingual 3-step Welcome Guide
  const [visibleCount, setVisibleCount] = useState(12);
  const [welcomeDismissed, setWelcomeDismissed] = useState<boolean>(() =>
    readStorage("addisvault_welcome_dismissed", false),
  );

  // Hidden Owner Mode + Catalog Editor State
  const [ownerMode, setOwnerMode] = useState(false);
  const [isOwnerGateOpen, setIsOwnerGateOpen] = useState(false);
  const [ownerPinInput, setOwnerPinInput] = useState("");
  const [ownerGateBusy, setOwnerGateBusy] = useState(false);
  const [ownerGateError, setOwnerGateError] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<{
    open: boolean;
    item: DigitalProduct | null;
    defaults: Partial<DigitalProduct>;
  }>({ open: false, item: null, defaults: {} });

  const { canPromptNatively, isInstalled, isIOS, install } = usePWAInstall();

  const t = UI_TRANSLATIONS[lang];
  const x = EXTRA_T[lang];
  const catalog = useCatalog();

  const productsById = useMemo(() => {
    const map: Record<string, DigitalProduct> = {};
    for (const p of catalog) {
      map[p.id] = p;
    }
    return map;
  }, [catalog]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_lang", lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage failures in private browsing
    }
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("addisvault_theme", theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  useEffect(() => {
    const pxMap: Record<AppFontScale, string> = {
      sm: "14px",
      base: "16px",
      lg: "18px",
      xl: "20px",
    };
    document.documentElement.style.fontSize = pxMap[fontScale] || "16px";
    try {
      localStorage.setItem("addisvault_font_scale", JSON.stringify(fontScale));
    } catch {
      // Ignore
    }
  }, [fontScale]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_cart", JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  useEffect(() => {
    sealEncryptedStorage("addisvault_orders", orders);
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_ad_config", JSON.stringify(adConfig));
    } catch {
      // Ignore
    }
  }, [adConfig]);

  useEffect(() => {
    sealEncryptedStorage("addisvault_vip", vipSubscription);
  }, [vipSubscription]);

  useEffect(() => {
    sealEncryptedStorage("addisvault_consults", consultBookings);
  }, [consultBookings]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_workers", JSON.stringify(workers));
    } catch {
      // Ignore
    }
  }, [workers]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_jobs", JSON.stringify(jobs));
    } catch {
      // Ignore
    }
  }, [jobs]);

  useEffect(() => {
    sealEncryptedStorage("addisvault_member", currentMember);
  }, [currentMember]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_chat_msgs", JSON.stringify(chatMessages));
    } catch {
      // Ignore
    }
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_blocked_members", JSON.stringify(blockedMemberIds));
    } catch {
      // Ignore
    }
  }, [blockedMemberIds]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_reported_msgs", JSON.stringify(reportedMessageIds));
    } catch {
      // Ignore
    }
  }, [reportedMessageIds]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_owner_profile", JSON.stringify(ownerProfile));
    } catch {
      // Ignore
    }
  }, [ownerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("addisvault_expediter", JSON.stringify(expediterRequests));
    } catch {
      // Ignore
    }
  }, [expediterRequests]);

  // Register PWA Service Worker & load owner catalog overrides on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        console.error("Addis-Vault service worker registration failed.", error);
      });
    }
    void reloadCatalogChanges();
  }, []);

  // Reset pagination whenever filters/search change
  useEffect(() => {
    setVisibleCount(12);
  }, [
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedInstructionLang,
    selectedBookRole,
    selectedEdition,
    selectedGrade,
    selectedSubject,
    selectedExamYear,
    selectedAudience,
    selectedTrack,
    selectedCarBrand,
    selectedModelYear,
    selectedContentLang,
    sortBy,
  ]);

  const dismissWelcomeGuide = () => {
    setWelcomeDismissed(true);
    try {
      localStorage.setItem("addisvault_welcome_dismissed", "true");
    } catch {
      // Ignore
    }
  };

  // Sync community job board, chat messages, and expediter inbox from server store on mount
  useEffect(() => {
    let cancelled = false;
    loadCommunityBoard(Boolean(account?.isAdmin))
      .then(
        (
          data: {
            workers?: WorkerProfile[];
            jobs?: JobListing[];
            expediterRequests?: ExpediterRequest[];
            consultations?: LegalConsultationBooking[];
            chatMessages?: CommunityChatMessage[];
          } | null,
        ) => {
          if (cancelled || !data) return;
          if (Array.isArray(data.workers) && data.workers.length > 0) {
            setWorkers((prev) => {
              const ids = new Set(data.workers!.map((w) => w.id));
              return [...data.workers!, ...prev.filter((p) => !ids.has(p.id))];
            });
          }
          if (Array.isArray(data.jobs) && data.jobs.length > 0) {
            setJobs((prev) => {
              const ids = new Set(data.jobs!.map((j) => j.id));
              return [...data.jobs!, ...prev.filter((p) => !ids.has(p.id))];
            });
          }
          if (Array.isArray(data.expediterRequests) && data.expediterRequests.length > 0) {
            setExpediterRequests((prev) => {
              const serverById = new Map(data.expediterRequests!.map((r) => [r.id, r]));
              const merged = [...data.expediterRequests!];
              for (const p of prev) {
                if (!serverById.has(p.id)) merged.push(p);
              }
              return merged;
            });
          }
          if (Array.isArray(data.consultations) && data.consultations.length > 0) {
            setConsultBookings((prev) => {
              const ids = new Set(data.consultations!.map((c) => c.id));
              return [...data.consultations!, ...prev.filter((p) => !ids.has(p.id))];
            });
          }
          if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
            setChatMessages((prev) => {
              const ids = new Set(data.chatMessages!.map((m) => m.id));
              return [...data.chatMessages!, ...prev.filter((p) => !ids.has(p.id))];
            });
          }
        },
      )
      .catch(() => {
        // Offline / fallback to localStorage + seed
      });
    return () => {
      cancelled = true;
    };
  }, [account?.isAdmin]);

  // Flush queued offline free community actions when back online
  useEffect(() => {
    const syncQueue = async () => {
      const { synced } = await flushOfflineQueue();
      if (synced > 0) {
        const board = await loadCommunityBoard(Boolean(account?.isAdmin)).catch(() => null);
        if (board?.workers?.length) setWorkers(board.workers);
        if (board?.jobs?.length) setJobs(board.jobs);
        if (board?.chatMessages?.length) setChatMessages(board.chatMessages);
      }
    };
    if (typeof window === "undefined") return undefined;
    if (navigator.onLine) {
      void syncQueue();
    }
    const onOnline = () => {
      void syncQueue();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [account?.isAdmin]);

  // Keep the signed-in member (Supabase account + profile) in sync
  useEffect(() => {
    let active = true;
    const sync = async () => {
      const acct = await loadAccount().catch(() => null);
      if (!active) return;
      setAccount(acct ? { userId: acct.userId, email: acct.email, isAdmin: acct.isAdmin } : null);
      setCurrentMember((prev) => {
        const m = acct?.member;
        if (!m) return null;
        if (prev && prev.id === m.id) {
          return {
            ...prev,
            ...m,
            points: Math.max(prev.points, m.points),
            downloadsCount: Math.max(prev.downloadsCount, m.downloadsCount),
            purchasesCount: Math.max(prev.purchasesCount, m.purchasesCount),
            referralsCount: Math.max(prev.referralsCount, m.referralsCount),
            helpfulChatsCount: Math.max(prev.helpfulChatsCount, m.helpfulChatsCount),
            verifiedBuyer: prev.verifiedBuyer || m.verifiedBuyer,
            monthlyRewardClaimed: prev.monthlyRewardClaimed,
          };
        }
        const localOrders = readEncryptedStorage<PurchaseOrder[]>("addisvault_orders", []);
        return {
          ...m,
          verifiedBuyer: m.verifiedBuyer || localOrders.length > 0,
          purchasesCount: Math.max(m.purchasesCount, localOrders.length),
        };
      });
    };
    void sync();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setTimeout(() => {
        void sync();
      }, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Pull owner replies for expediter requests submitted from this device
  useEffect(() => {
    const mine = readStorage<ExpediterRequest[]>("addisvault_expediter", [])
      .filter((r) => r && typeof r.id === "string" && r.id.startsWith("exp-") && r.trackingCode)
      .slice(0, 50)
      .map((r) => ({ id: r.id, trackingCode: r.trackingCode }));
    if (mine.length === 0) return;
    let cancelled = false;
    getExpediterUpdates({ data: { items: mine } })
      .then((updates) => {
        if (cancelled || updates.length === 0) return;
        const byId = new Map(updates.map((u) => [u.id, u]));
        setExpediterRequests((prev) =>
          prev.map((r) => {
            const u = byId.get(r.id);
            if (!u) return r;
            return {
              ...r,
              status: u.status as ExpediterStatus,
              ownerReply: u.ownerReply ?? r.ownerReply,
              quoteEtb: u.quoteEtb ?? r.quoteEtb,
              updatedAt: u.updatedAt,
            };
          }),
        );
      })
      .catch(() => {
        // Offline: keep local copy
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle ?ref= and ?vaultToken= URL parameters securely on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    let urlChanged = false;

    const refParam = params.get("ref");
    if (refParam && getPromoDiscountPercent(refParam) > 0) {
      setAppliedPromo(refParam.trim().toUpperCase());
      setReferralBannerVisible(true);
      params.delete("ref");
      urlChanged = true;
    }

    const tokenParam = params.get("vaultToken");
    if (tokenParam) {
      const check = validateAndConsumeVaultToken(tokenParam, deviceId);
      if (check.valid) {
        const targetProduct = productsById[check.token.productId];
        if (targetProduct) {
          const matchedOrder =
            orders.find(
              (o) => o.id === check.token.orderId && isOrderBoundToCurrentDevice(o, deviceId),
            ) || null;
          setActiveVaultSession({
            product: targetProduct,
            order: matchedOrder,
            token: check.token,
          });
        } else {
          setTokenSecurityError(true);
        }
      } else {
        setTokenSecurityError(true);
      }
      params.delete("vaultToken");
      urlChanged = true;
    }

    if (urlChanged) {
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${
        window.location.hash
      }`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, [orders, productsById, deviceId]);

  const handleTrackAdImpression = useCallback(() => {
    setAdConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, impressions: prev.stats.impressions + 1 },
    }));
  }, []);

  const handleTrackAdClick = useCallback(() => {
    setAdConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, clicks: prev.stats.clicks + 1 },
    }));
  }, []);

  const vipActive = isVipActiveOnCurrentDevice(vipSubscription, deviceId);

  const unlockedIds = useMemo(() => {
    return new Set(catalog.map((product) => product.id));
  }, [catalog]);
  const unlockedAiToolIds = useMemo(() => new Set(AI_TOOLS_LIST.map((tool) => tool.id)), []);

  const awardMemberActivity = useCallback((kind: "download" | "purchase" | "chat" | "referral") => {
    setCurrentMember((prev) => {
      if (!prev) return prev;
      if (kind === "download") {
        return {
          ...prev,
          points: prev.points + 25,
          downloadsCount: prev.downloadsCount + 1,
        };
      }
      if (kind === "purchase") {
        return {
          ...prev,
          verifiedBuyer: true,
          points: prev.points + 100,
          purchasesCount: prev.purchasesCount + 1,
        };
      }
      if (kind === "chat") {
        return {
          ...prev,
          points: prev.points + 15,
          helpfulChatsCount: prev.helpfulChatsCount + 1,
        };
      }
      return {
        ...prev,
        points: prev.points + 75,
        referralsCount: prev.referralsCount + 1,
      };
    });
  }, []);

  const lawAcademyProducts = useMemo(
    () => catalog.filter((p) => p.category === "law_academy"),
    [catalog],
  );

  const universityProducts = useMemo(
    () => catalog.filter((p) => p.category === "university"),
    [catalog],
  );

  const handleOpenInVault = useCallback(
    (product: DigitalProduct, explicitOrder?: PurchaseOrder | null, initialLang?: Language) => {
      const matchedOrder =
        explicitOrder !== undefined
          ? explicitOrder
          : orders.find(
              (o) =>
                isOrderBoundToCurrentDevice(o, deviceId) &&
                o.items.some((item) => item.productId === product.id),
            ) || null;
      const buyerLabel =
        matchedOrder?.buyerContact ||
        vipSubscription?.buyerContact ||
        matchedOrder?.refNumber ||
        vipSubscription?.refNumber ||
        "AddisVault Buyer";
      const token = mintSingleUseVaultToken({
        productId: product.id,
        orderId: matchedOrder?.id || vipSubscription?.orderId || "VIP-PASS",
        buyerLabel,
      });
      setPreviewProduct(null);
      setActiveVaultSession({ product, order: matchedOrder, token, initialLang });
      awardMemberActivity("download");
    },
    [orders, deviceId, vipSubscription, awardMemberActivity],
  );

  const cartIds = useMemo(() => new Set(cart.map((c) => c.productId)), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.quantity, 0), [cart]);

  const subFilterOptions = useMemo(() => {
    const base =
      selectedCategory === "all" ? catalog : catalog.filter((p) => p.category === selectedCategory);

    const regionScoped =
      selectedRegion === "all" ? base : base.filter((p) => p.regionId === selectedRegion);

    const grades = Array.from(
      new Set(regionScoped.map((p) => p.gradeBand).filter(Boolean)),
    ) as string[];
    const subjects = Array.from(
      new Set(regionScoped.map((p) => p.subject).filter(Boolean)),
    ) as string[];
    const years = Array.from(new Set(base.map((p) => p.examYear).filter(Boolean))) as string[];
    const audiences = Array.from(new Set(base.map((p) => p.audience).filter(Boolean))) as string[];
    const tracks = Array.from(new Set(base.map((p) => p.track).filter(Boolean))) as string[];
    const carBrands = Array.from(new Set(base.map((p) => p.carBrand).filter(Boolean))) as string[];
    const modelYears = Array.from(
      new Set(base.map((p) => p.modelYear).filter(Boolean)),
    ) as string[];

    const regionLangList =
      selectedRegion !== "all"
        ? REGION_NAME_BY_ID[selectedRegion as EthiopianRegionId]?.primaryLanguages ||
          ALL_INSTRUCTION_LANGUAGES
        : ALL_INSTRUCTION_LANGUAGES;
    const productLangs = new Set(
      regionScoped.map((p) => p.instructionLanguage).filter(Boolean) as string[],
    );
    const instructionLanguages = Array.from(
      new Set([...regionLangList, ...Array.from(productLangs)]),
    );

    const bookRoles = Array.from(
      new Set(regionScoped.map((p) => p.bookRole).filter(Boolean)),
    ) as string[];
    const editions = Array.from(
      new Set(regionScoped.map((p) => p.curriculumEdition).filter(Boolean)),
    ) as string[];

    return {
      grades,
      subjects,
      years,
      audiences,
      tracks,
      carBrands,
      modelYears,
      instructionLanguages,
      bookRoles,
      editions,
    };
  }, [catalog, selectedCategory, selectedRegion]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = catalog.filter((product) => {
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }
      if (selectedRegion !== "all" && product.regionId !== selectedRegion) {
        return false;
      }
      if (
        selectedInstructionLang !== "all" &&
        product.instructionLanguage !== selectedInstructionLang
      ) {
        return false;
      }
      if (selectedBookRole !== "all" && product.bookRole !== selectedBookRole) {
        return false;
      }
      if (selectedEdition !== "all" && product.curriculumEdition !== selectedEdition) {
        return false;
      }
      if (selectedGrade !== "all" && product.gradeBand !== selectedGrade) {
        return false;
      }
      if (selectedSubject !== "all" && product.subject !== selectedSubject) {
        return false;
      }
      if (selectedExamYear !== "all" && product.examYear !== selectedExamYear) {
        return false;
      }
      if (selectedAudience !== "all" && product.audience !== selectedAudience) {
        return false;
      }
      if (selectedTrack !== "all" && product.track !== selectedTrack) {
        return false;
      }
      if (selectedCarBrand !== "all" && product.carBrand !== selectedCarBrand) {
        return false;
      }
      if (selectedModelYear !== "all" && product.modelYear !== selectedModelYear) {
        return false;
      }
      if (
        selectedContentLang !== "all" &&
        product.availableLanguages &&
        !product.availableLanguages.includes(selectedContentLang)
      ) {
        return false;
      }
      if (!q) return true;
      const regionName = product.regionId
        ? REGION_NAME_BY_ID[product.regionId]?.name[lang] || ""
        : "";
      return (
        product.title[lang].toLowerCase().includes(q) ||
        product.title.en.toLowerCase().includes(q) ||
        product.description[lang].toLowerCase().includes(q) ||
        product.description.en.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.format.toLowerCase().includes(q) ||
        regionName.toLowerCase().includes(q) ||
        (product.regionId?.toLowerCase().includes(q) ?? false) ||
        (product.instructionLanguage?.toLowerCase().includes(q) ?? false) ||
        (product.curriculumYearLabel?.toLowerCase().includes(q) ?? false) ||
        (product.gradeBand?.toLowerCase().includes(q) ?? false) ||
        (product.subject?.toLowerCase().includes(q) ?? false) ||
        (product.examYear?.toLowerCase().includes(q) ?? false) ||
        (product.carBrand?.toLowerCase().includes(q) ?? false) ||
        (product.modelYear?.toLowerCase().includes(q) ?? false) ||
        (product.track?.toLowerCase().includes(q) ?? false)
      );
    });

    if (sortBy === "price_asc") {
      return [...list].sort((a, b) => a.priceEtb - b.priceEtb);
    }
    if (sortBy === "price_desc") {
      return [...list].sort((a, b) => b.priceEtb - a.priceEtb);
    }
    return list;
  }, [
    catalog,
    lang,
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedInstructionLang,
    selectedBookRole,
    selectedEdition,
    selectedGrade,
    selectedSubject,
    selectedExamYear,
    selectedAudience,
    selectedTrack,
    selectedCarBrand,
    selectedModelYear,
    selectedContentLang,
    sortBy,
  ]);

  const resolvedCartItems = useMemo(
    () =>
      cart
        .map((c) => ({ product: productsById[c.productId], quantity: c.quantity }))
        .filter((item) => Boolean(item.product)),
    [cart, productsById],
  );

  const subtotalEtb = useMemo(
    () => resolvedCartItems.reduce((sum, item) => sum + item.product.priceEtb * item.quantity, 0),
    [resolvedCartItems],
  );

  const discountPercent = getPromoDiscountPercent(appliedPromo);
  const discountEtb = Math.round((subtotalEtb * discountPercent) / 100);
  const totalEtb = Math.max(0, subtotalEtb - discountEtb);

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev;
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleAddBundleToCart = (bundle: BundleDeal) => {
    setCart((prev) => {
      const next = [...prev];
      for (const pid of bundle.productIds) {
        if (!next.some((i) => i.productId === pid) && productsById[pid]) {
          next.push({ productId: pid, quantity: 1 });
        }
      }
      return next;
    });
    setAppliedPromo(bundle.discountPercent === 35 ? "BUNDLE35" : "BUNDLE30");
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleConfirmOrder = ({
    paymentMethod,
    refNumber,
    buyerContact,
    vipPlan,
    aiTool,
    cvStandard,
    legalDoc,
    legalConsult,
    linkDownload,
    pdfExport,
    service,
  }: {
    paymentMethod: PaymentMethod;
    refNumber: string;
    buyerContact?: string;
    vipPlan?: VipPlan | null;
    aiTool?: AiToolDefinition | null;
    cvStandard?: CvCountryStandard | null;
    legalDoc?: LegalDocTemplate | null;
    legalConsult?: {
      tier: LegalConsultTier;
      intake: { clientName: string; phone: string; branch: string; caseSummary: string };
    } | null;
    linkDownload?: PendingLinkDownload | null;
    pdfExport?: PendingPdfExport | null;
    service?: PendingService | null;
  }): PurchaseOrder => {
    const cleanRef = sanitizeUserInput(refNumber, 64);
    const cleanContact = buyerContact ? sanitizeUserInput(buyerContact, 80) : undefined;

    if (service) {
      const svcOrderId = `AV-SVC-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({ cartItems: [], promoCode: null, service });
      const svcOrder: PurchaseOrder = {
        id: svcOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: service.id,
            sku: service.kind.toUpperCase(),
            titleSnapshot: service.title,
            category: "business_ideas",
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        serviceId: service.id,
        serviceKind: service.kind,
        servicePriceEtb: verified.totalEtb,
        integritySig: computeIntegritySig(`${svcOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [svcOrder, ...prev]);
      setLastConfirmedService({
        service,
        refNumber: svcOrder.refNumber,
        paymentMethod: svcOrder.paymentMethod,
      });
      awardMemberActivity("purchase");
      return svcOrder;
    }

    if (vipPlan) {
      const vipOrderId = `AV-VIP-${Date.now().toString().slice(-6)}`;
      const expiresAt = new Date(
        Date.now() + vipPlan.durationDays * 24 * 60 * 60 * 1000,
      ).toISOString();
      const newVip: VipSubscription = {
        active: true,
        planId: vipPlan.id,
        orderId: vipOrderId,
        activatedAt: new Date().toISOString(),
        expiresAt,
        deviceId,
        refNumber: cleanRef,
        buyerContact: cleanContact,
      };
      setVipSubscription(newVip);

      const vipOrder: PurchaseOrder = {
        id: vipOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: vipPlan.id,
            sku: vipPlan.id.toUpperCase(),
            titleSnapshot: vipPlan.title[lang],
            category: "education",
            priceEtb: vipPlan.priceEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: vipPlan.priceEtb,
        discountEtb: 0,
        totalEtb: vipPlan.priceEtb,
        buyerContact: cleanContact,
        deviceId,
        isVipOrder: true,
        vipPlanId: vipPlan.id,
        integritySig: computeIntegritySig(`${vipOrderId}:${vipPlan.priceEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [vipOrder, ...prev]);
      awardMemberActivity("purchase");
      return vipOrder;
    }

    if (aiTool) {
      const aiOrderId = `AV-AI-${Date.now().toString().slice(-6)}`;
      const aiOrder: PurchaseOrder = {
        id: aiOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: aiTool.id,
            sku: aiTool.id.toUpperCase(),
            titleSnapshot: aiTool.title[lang],
            category: "business_ideas",
            priceEtb: aiTool.priceEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: aiTool.priceEtb,
        discountEtb: 0,
        totalEtb: aiTool.priceEtb,
        buyerContact: cleanContact,
        deviceId,
        aiToolId: aiTool.id,
        integritySig: computeIntegritySig(`${aiOrderId}:${aiTool.priceEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [aiOrder, ...prev]);
      awardMemberActivity("purchase");
      return aiOrder;
    }

    if (cvStandard) {
      const cvOrderId = `AV-CV-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        cvCountryId: cvStandard.id,
      });
      const cvOrder: PurchaseOrder = {
        id: cvOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: `cv-${cvStandard.id}`,
            sku: `CV-${cvStandard.id.toUpperCase()}`,
            titleSnapshot: `${cvStandard.countryName[lang]} — ${cvStandard.formatLabel[lang]}`,
            category: "business_diaspora",
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        cvCountryId: cvStandard.id,
        integritySig: computeIntegritySig(`${cvOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [cvOrder, ...prev]);
      awardMemberActivity("purchase");
      return cvOrder;
    }

    if (legalDoc) {
      const legalOrderId = `AV-LAW-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        legalDocId: legalDoc.id,
      });
      const legalOrder: PurchaseOrder = {
        id: legalOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: legalDoc.id,
            sku: legalDoc.id.toUpperCase(),
            titleSnapshot: legalDoc.title[lang],
            category: "law_academy",
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        legalDocId: legalDoc.id,
        integritySig: computeIntegritySig(`${legalOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [legalOrder, ...prev]);
      awardMemberActivity("purchase");
      return legalOrder;
    }

    if (legalConsult) {
      const consultOrderId = `AV-CONS-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        legalConsultTierId: legalConsult.tier.id,
      });
      const consultOrder: PurchaseOrder = {
        id: consultOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: legalConsult.tier.id,
            sku: legalConsult.tier.id.toUpperCase(),
            titleSnapshot: legalConsult.tier.title[lang],
            category: "law_academy",
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact || legalConsult.intake.phone,
        deviceId,
        legalConsultTierId: legalConsult.tier.id,
        integritySig: computeIntegritySig(`${consultOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [consultOrder, ...prev]);

      const booking: LegalConsultationBooking = {
        id: consultOrderId,
        bookingCode: `AVLAW-${consultOrderId.slice(-6)}`,
        tierId: legalConsult.tier.id,
        tierTitle: legalConsult.tier.title[lang],
        priceEtb: verified.totalEtb,
        branch: legalConsult.intake.branch === "criminal" ? "criminal" : "civil",
        clientName: sanitizeUserInput(legalConsult.intake.clientName, 80),
        phone: sanitizeUserInput(legalConsult.intake.phone, 24),
        caseSummary: sanitizeUserInput(legalConsult.intake.caseSummary, 1000),
        refNumber: cleanRef,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };
      setConsultBookings((prev) => [booking, ...prev]);
      submitLegalConsultation({ data: { ...booking } }).catch(() => {
        // Saved locally in encrypted storage
      });
      awardMemberActivity("purchase");
      return consultOrder;
    }

    if (linkDownload) {
      const linkOrderId = `AV-LINK-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        linkFormatId: linkDownload.formatOption.id,
      });
      const linkOrder: PurchaseOrder = {
        id: linkOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: linkDownload.id,
            sku: linkDownload.formatOption.id.toUpperCase(),
            titleSnapshot: `${linkDownload.title} — ${linkDownload.formatOption.label[lang]}`,
            category: "education",
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        linkDownloadId: linkDownload.id,
        linkDownloadPriceEtb: verified.totalEtb,
        integritySig: computeIntegritySig(`${linkOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [linkOrder, ...prev]);
      awardMemberActivity("purchase");
      return linkOrder;
    }

    if (pdfExport) {
      const pdfOrderId = `AV-PDF-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        pdfFormatId: pdfExport.formatOption.id,
      });
      const pdfOrder: PurchaseOrder = {
        id: pdfOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: pdfExport.id,
            sku: pdfExport.formatOption.id.toUpperCase(),
            titleSnapshot: `${pdfExport.documentTitle} — ${pdfExport.formatOption.label[lang]}`,
            category: "education",
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        pdfExportId: pdfExport.id,
        pdfExportPriceEtb: verified.totalEtb,
        integritySig: computeIntegritySig(`${pdfOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [pdfOrder, ...prev]);
      awardMemberActivity("purchase");
      return pdfOrder;
    }

    const verifiedCart = verifyCheckoutAmount({
      cartItems: cart,
      promoCode: appliedPromo,
    });
    const orderId = `AV-${Date.now().toString().slice(-6)}`;
    const newOrder: PurchaseOrder = {
      id: orderId,
      refNumber: cleanRef,
      paymentMethod,
      items: resolvedCartItems.map(({ product, quantity }) => ({
        productId: product.id,
        sku: product.sku,
        titleSnapshot: product.title[lang],
        category: product.category,
        priceEtb: product.priceEtb,
        quantity,
      })),
      subtotalEtb: verifiedCart.subtotalEtb,
      discountEtb: verifiedCart.discountEtb,
      totalEtb: verifiedCart.totalEtb,
      promoCode: appliedPromo || undefined,
      buyerContact: cleanContact,
      deviceId,
      integritySig: computeIntegritySig(`${orderId}:${verifiedCart.totalEtb}:${cleanRef}`),
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedPromo(null);
    awardMemberActivity("purchase");
    return newOrder;
  };

  const handleInstallClick = async () => {
    if (canPromptNatively) {
      const result = await install();
      if (result === "accepted") return;
    }
    setIsPWAModalOpen(true);
  };

  // Snapshot items shown in CheckoutModal even after cart clears upon confirmation
  const [checkoutSnapshotItems, setCheckoutSnapshotItems] = useState<
    { product: DigitalProduct; quantity: number }[]
  >([]);

  const clearPendingNonCartCheckout = () => {
    setPendingVipPlan(null);
    setPendingAiTool(null);
    setPendingCvStandard(null);
    setPendingLegalDoc(null);
    setPendingLegalConsult(null);
    setPendingLinkDownload(null);
    setPendingPdfExport(null);
    setPendingService(null);
  };

  const openCheckout = () => {
    clearPendingNonCartCheckout();
    setCheckoutSnapshotItems(resolvedCartItems);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleRequestAiToolCheckout = (tool: AiToolDefinition) => {
    clearPendingNonCartCheckout();
    setPendingAiTool(tool);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestCvCheckout = (standard: CvCountryStandard) => {
    clearPendingNonCartCheckout();
    setPendingCvStandard(standard);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestLegalDocCheckout = (doc: LegalDocTemplate) => {
    clearPendingNonCartCheckout();
    setPendingLegalDoc(doc);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestConsultCheckout = (
    tier: LegalConsultTier,
    intake: { clientName: string; phone: string; branch: string; caseSummary: string },
  ) => {
    const now = new Date().toISOString();
    const bookingId = `AVLAW-${Date.now()}`;
    const booking: LegalConsultationBooking = {
      id: bookingId,
      bookingCode: bookingId,
      tierId: tier.id,
      tierTitle: tier.title[lang],
      priceEtb: 0,
      branch: sanitizeUserInput(intake.branch, 100),
      clientName: sanitizeUserInput(intake.clientName, 80),
      phone: sanitizeUserInput(intake.phone, 24),
      caseSummary: sanitizeUserInput(intake.caseSummary, 1000),
      refNumber: "FREE",
      paymentMethod: "free",
      createdAt: now,
    };
    return submitLegalConsultation({ data: { ...booking } }).then((result) => {
      if (!result.ok) throw new Error(result.error);
      setConsultBookings((prev) => [booking, ...prev]);
    });
  };

  const handleRequestLinkCheckout = (item: PendingLinkDownload) => {
    clearPendingNonCartCheckout();
    setPendingLinkDownload(item);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestPdfCheckout = (item: PendingPdfExport) => {
    clearPendingNonCartCheckout();
    setPendingPdfExport(item);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestServiceCheckout = (item: PendingService) => {
    clearPendingNonCartCheckout();
    setPendingService(item);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handlePostCommunityMessage = async (msg: CommunityChatMessage) => {
    setChatMessages((prev) => [msg, ...prev]);
    awardMemberActivity("chat");
    const chatPayload = {
      id: msg.id,
      room: msg.room,
      message: msg.message,
      includePhone: Boolean(msg.optionalPhone),
    };
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineAction({
        id: msg.id,
        kind: "chat",
        payload: {
          id: msg.id,
          room: msg.room,
          message: msg.message,
          optionalPhone: msg.optionalPhone,
        },
      });
      return;
    }
    try {
      const res = await postChatMessage({ data: chatPayload });
      if (!res?.ok) {
        enqueueOfflineAction({
          id: msg.id,
          kind: "chat",
          payload: {
            id: msg.id,
            room: msg.room,
            message: msg.message,
            optionalPhone: msg.optionalPhone,
          },
        });
      }
    } catch {
      enqueueOfflineAction({
        id: msg.id,
        kind: "chat",
        payload: {
          id: msg.id,
          room: msg.room,
          message: msg.message,
          optionalPhone: msg.optionalPhone,
        },
      });
    }
  };

  const handleHelpfulCommunityMessage = (msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, helpfulCount: m.helpfulCount + 1 } : m)),
    );
    awardMemberActivity("chat");
  };

  const handleReportCommunityMessage = (msgId: string) => {
    setReportedMessageIds((prev) => (prev.includes(msgId) ? prev : [...prev, msgId]));
  };

  const handleBlockCommunityMember = (memberId: string) => {
    setBlockedMemberIds((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]));
  };

  const handleClearSessionData = () => {
    setCart([]);
    setSearchQuery("");
    handleSelectCategory("all");
    setAppliedPromo(null);
    try {
      localStorage.removeItem("addisvault_vault_tokens");
    } catch {
      // Ignore
    }
  };

  const handleRegisterWorker = async (worker: WorkerProfile) => {
    setWorkers((prev) => [worker, ...prev]);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineAction({ id: worker.id, kind: "worker", payload: worker });
      return;
    }
    try {
      const res = await submitWorkerProfile({ data: { ...worker } });
      if (!res?.ok) enqueueOfflineAction({ id: worker.id, kind: "worker", payload: worker });
    } catch {
      enqueueOfflineAction({ id: worker.id, kind: "worker", payload: worker });
    }
  };

  const handlePostJob = async (job: JobListing) => {
    setJobs((prev) => [job, ...prev]);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineAction({ id: job.id, kind: "job", payload: job });
      return;
    }
    try {
      const res = await submitJobListing({ data: { ...job } });
      if (!res?.ok) enqueueOfflineAction({ id: job.id, kind: "job", payload: job });
    } catch {
      enqueueOfflineAction({ id: job.id, kind: "job", payload: job });
    }
  };

  const handleSubmitExpediterRequest = async (req: ExpediterRequest) => {
    setExpediterRequests((prev) => [req, ...prev]);
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineAction({ id: req.id, kind: "expediter", payload: req });
      return;
    }
    try {
      const res = await submitExpediterRequest({ data: { ...req } });
      if (!res?.ok) enqueueOfflineAction({ id: req.id, kind: "expediter", payload: req });
    } catch {
      enqueueOfflineAction({ id: req.id, kind: "expediter", payload: req });
    }
  };

  const handleOwnerGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      setOwnerGateError(x.ownerGateSignIn);
      return;
    }
    setOwnerGateBusy(true);
    setOwnerGateError(null);
    try {
      const res = await verifyOwnerPin({ data: { pin: ownerPinInput } });
      if (res.ok) {
        setOwnerMode(true);
        setOwnerPinInput("");
        setIsOwnerGateOpen(false);
        setActiveTab("dashboard");
      } else {
        setOwnerGateError(x.ownerGateDenied);
      }
    } catch {
      setOwnerGateError(x.ownerGateDenied);
    } finally {
      setOwnerGateBusy(false);
    }
  };

  const handleDeleteCatalogItem = async (item: DigitalProduct) => {
    if (!ownerMode || !account?.isAdmin) return;
    const res = await deleteCatalogItem({ data: { id: item.id, category: item.category } });
    if (res.ok) {
      void reloadCatalogChanges();
    }
  };

  const handleUpdateExpediterRequest = async (
    id: string,
    patch: { status: ExpediterStatus; ownerReply?: string; quoteEtb?: number },
  ) => {
    setExpediterRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: patch.status,
              ownerReply: patch.ownerReply !== undefined ? patch.ownerReply : r.ownerReply,
              quoteEtb: patch.quoteEtb !== undefined ? patch.quoteEtb : r.quoteEtb,
              updatedAt: new Date().toISOString(),
            }
          : r,
      ),
    );
    try {
      await updateExpediterRequest({ data: { id, ...patch } });
    } catch {
      // Persisted locally
    }
  };

  const handleBuyNowWithSnapshot = (productId: string) => {
    const product = productsById[productId];
    if (!product) return;
    const nextCart = cart.some((c) => c.productId === productId)
      ? cart
      : [...cart, { productId, quantity: 1 }];
    setCart(nextCart);
    clearPendingNonCartCheckout();
    setCheckoutSnapshotItems(
      nextCart
        .map((c) => ({ product: productsById[c.productId], quantity: c.quantity }))
        .filter((item) => Boolean(item.product)),
    );
    setPreviewProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="av-app-shell min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-stone-100">
      <Navbar
        lang={lang}
        onChangeLang={setLang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        downloadsCount={unlockedIds.size}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
        isInstalled={isInstalled}
        onInstallClick={handleInstallClick}
        currentMember={currentMember}
        onOpenMemberAuth={() => setIsMemberAuthOpen(true)}
        ownerMode={ownerMode && Boolean(account?.isAdmin)}
        onTriggerOwnerGate={() => {
          setOwnerGateError(null);
          setIsOwnerGateOpen(true);
        }}
        onExitOwnerMode={() => {
          setOwnerMode(false);
          if (activeTab === "dashboard") setActiveTab("marketplace");
        }}
      />

      <Suspense
        fallback={
          <div className="flex min-h-[50vh] flex-1 items-center justify-center text-sm text-stone-600 dark:text-stone-300">
            Loading…
          </div>
        }
      >
        <main className="flex-1 pb-20 lg:pb-12">
          {/* Global Token Security Alert Banner */}
          {tokenSecurityError && (
            <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>{t.vaultTokenErrorBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTokenSecurityError(false)}
                  aria-label={t.closeBtn}
                  className="p-1 text-rose-700 hover:text-rose-900 dark:text-rose-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Friend Referral Applied Notification Banner */}
          {referralBannerVisible && appliedPromo && (
            <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                <span>
                  {t.referralAutoAppliedBanner} ({appliedPromo})
                </span>
                <button
                  type="button"
                  onClick={() => setReferralBannerVisible(false)}
                  aria-label={t.closeBtn}
                  className="p-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "app_builder" && (
            <Suspense
              fallback={
                <div className="mx-auto max-w-7xl px-4 py-12 text-center text-sm text-stone-500">
                  Loading App Builder…
                </div>
              }
            >
              <AppBuilderView ownerAdmin={ownerMode && Boolean(account?.isAdmin)} />
            </Suspense>
          )}

          {activeTab === "marketplace" && (
            <>
              {/* Editorial Storefront Hero */}
              <section className="border-b border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
                <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-12 lg:gap-10 lg:py-14">
                  <div className="flex flex-col justify-center lg:col-span-7">
                    <p className="text-xs font-semibold tracking-wide text-emerald-800 dark:text-emerald-400">
                      {t.heroPaymentNote}
                    </p>
                    <h1
                      className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] dark:text-stone-50"
                      style={{ textWrap: "balance" }}
                    >
                      {t.heroTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300">
                      {t.heroSubtitle}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <a
                        href="#catalog"
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                      >
                        <span>{t.heroBrowseCta}</span>
                        <ArrowDown className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setActiveTab("link_downloader")}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <Link2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                        <span>{t.heroLinkToolCta}</span>
                      </button>
                      {!isInstalled && (
                        <button
                          type="button"
                          onClick={handleInstallClick}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <Download className="h-4 w-4" />
                          <span>{t.installAppBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="relative h-56 sm:h-72 lg:h-full min-h-[240px] w-full overflow-hidden rounded-2xl border border-stone-200 bg-zinc-900 dark:border-zinc-800">
                      <img
                        src={HERO_IMAGE}
                        alt={t.brandName}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-100">
                        <span className="font-mono font-semibold text-amber-300">
                          Free public access
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Top Banner Ad Slot (below Hero section) */}
              <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
                <AdSlot
                  slot="top_banner"
                  adConfig={adConfig}
                  lang={lang}
                  onTrackImpression={handleTrackAdImpression}
                  onTrackClick={handleTrackAdClick}
                />
              </div>

              {/* Dismissible Bilingual 3-Step Welcome Guide */}
              {!welcomeDismissed && (
                <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                        <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span>የአዲስቫውልት የ3 እርምጃ መመሪያ · AddisVault Quick Start Guide</span>
                      </div>
                      <button
                        type="button"
                        onClick={dismissWelcomeGuide}
                        aria-label={t.closeBtn}
                        className="rounded-lg p-1 text-stone-500 hover:bg-white hover:text-stone-900 dark:text-stone-400 dark:hover:bg-zinc-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
                      <div className="rounded-xl bg-white/90 p-3 dark:bg-zinc-900/80">
                        <div className="font-bold text-emerald-800 dark:text-emerald-400">
                          1. ይምረጡ · Choose
                        </div>
                        <p className="mt-0.5 text-stone-600 dark:text-stone-300">
                          መጽሐፍት፣ ብሔራዊ ፈተናዎች፣ የዩኒቨርሲቲ ሞጁሎች ወይም የAI/CV መሣሪያዎችን በ5 ቋንቋ ይፈልጉ።
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/90 p-3 dark:bg-zinc-900/80">
                        <div className="font-bold text-emerald-800 dark:text-emerald-400">
                          2. ይገንቡ · Build
                        </div>
                        <p className="mt-0.5 text-stone-600 dark:text-stone-300">
                          የAI መተግበሪያ ገንቢውን ይጠቀሙ ወይም የሚፈልጉትን ይዘት ያስሱ።
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/90 p-3 dark:bg-zinc-900/80">
                        <div className="font-bold text-emerald-800 dark:text-emerald-400">
                          3. ያውርዱ · Download
                        </div>
                        <p className="mt-0.5 text-stone-600 dark:text-stone-300">
                          የሚያዘጋጁትን ፕሮጀክት በነፃ ያውርዱ ወይም ያጋሩ።
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Catalog Search, Category Filter Tabs & Product Grid */}
              <section id="catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Search Input */}
                  <div className="relative w-full lg:max-w-sm">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(sanitizeUserInput(e.target.value, 120))}
                      placeholder={t.searchPlaceholder}
                      aria-label={t.searchPlaceholder}
                      className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label={t.clearFilters}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Results count + Request Missing File Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs font-medium text-stone-500 tabular-nums dark:text-stone-400">
                      <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        {filteredProducts.length}
                      </span>{" "}
                      {t.resultsCount}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMissingFileOpen(true)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-700/30 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                    >
                      <FileQuestion className="h-3.5 w-3.5 shrink-0" />
                      <span>{t.requestMissingBtn}</span>
                    </button>
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div
                  className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2"
                  role="tablist"
                  aria-label="Product Categories"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === "all"}
                    onClick={() => handleSelectCategory("all")}
                    className={`min-h-[40px] rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === "all"
                        ? "bg-emerald-700 text-white dark:bg-emerald-600"
                        : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {t.allCategories}
                  </button>
                  {CATEGORY_LIST.map((catId) => (
                    <button
                      key={catId}
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === catId}
                      onClick={() => handleSelectCategory(catId)}
                      className={`min-h-[40px] rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === catId
                          ? "bg-emerald-700 text-white dark:bg-emerald-600"
                          : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {t.categories[catId]}
                    </button>
                  ))}
                </div>

                {/* Multi-Regional Grades 1–12 Ethiopian Textbook Cascading Filter Bar */}
                {(selectedCategory === "education" || selectedRegion !== "all") && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-xs font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-300">
                        {t.regionalLibraryHeading}
                      </h2>
                      {(selectedRegion !== "all" ||
                        selectedInstructionLang !== "all" ||
                        selectedGrade !== "all" ||
                        selectedBookRole !== "all" ||
                        selectedSubject !== "all" ||
                        selectedEdition !== "all") && (
                        <button
                          type="button"
                          onClick={() => handleSelectCategory("education")}
                          className="text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-300"
                        >
                          {t.clearFilters}
                        </button>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        <span>{t.filterRegionLabel}</span>
                        <select
                          value={selectedRegion}
                          onChange={(e) => handleSelectRegion(e.target.value)}
                          className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <option value="all">{t.allOption}</option>
                          {ETHIOPIAN_REGIONS.map((reg) => (
                            <option key={reg.id} value={reg.id}>
                              {reg.name[lang]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        <span>{t.filterInstructionLangLabel}</span>
                        <select
                          value={selectedInstructionLang}
                          onChange={(e) => setSelectedInstructionLang(e.target.value)}
                          className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <option value="all">{t.allOption}</option>
                          {subFilterOptions.instructionLanguages.map((langName) => (
                            <option key={langName} value={langName}>
                              {langName}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        <span>{t.filterGradeLabel}</span>
                        <select
                          value={selectedGrade}
                          onChange={(e) => setSelectedGrade(e.target.value)}
                          className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <option value="all">{t.allOption}</option>
                          {subFilterOptions.grades.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        <span>{t.filterBookRoleLabel}</span>
                        <select
                          value={selectedBookRole}
                          onChange={(e) => setSelectedBookRole(e.target.value)}
                          className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <option value="all">{t.allOption}</option>
                          <option value="student_textbook">{t.studentBookOption}</option>
                          <option value="teachers_guide">{t.teachersGuideOption}</option>
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        <span>{t.filterSubjectLabel}</span>
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <option value="all">{t.allOption}</option>
                          {subFilterOptions.subjects.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                        <span>{t.filterEditionLabel}</span>
                        <select
                          value={selectedEdition}
                          onChange={(e) => setSelectedEdition(e.target.value)}
                          className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          <option value="all">{t.allOption}</option>
                          <option value="new_curriculum">{t.newCurriculumOption}</option>
                          <option value="previous_edition">{t.previousEditionOption}</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {/* Nested Sub-Filters (Grade, Subject, Exam Year, Track, Audience, Region Quick-Jump) + Price Sort */}
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {selectedCategory === "all" && selectedRegion === "all" && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterRegionLabel}:</span>
                      <select
                        value={selectedRegion}
                        onChange={(e) => handleSelectRegion(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {ETHIOPIAN_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name[lang]}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {selectedCategory !== "education" && subFilterOptions.grades.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterGradeLabel}:</span>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {selectedCategory !== "education" && subFilterOptions.subjects.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterSubjectLabel}:</span>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {subFilterOptions.years.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterYearLabel}:</span>
                      <select
                        value={selectedExamYear}
                        onChange={(e) => setSelectedExamYear(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {subFilterOptions.tracks.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterTrackLabel}:</span>
                      <select
                        value={selectedTrack}
                        onChange={(e) => setSelectedTrack(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.tracks.map((tr) => (
                          <option key={tr} value={tr}>
                            {tr}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {subFilterOptions.audiences.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterAudienceLabel}:</span>
                      <select
                        value={selectedAudience}
                        onChange={(e) => setSelectedAudience(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.audiences.map((aud) => (
                          <option key={aud} value={aud}>
                            {aud}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {subFilterOptions.carBrands.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterCarBrandLabel}:</span>
                      <select
                        value={selectedCarBrand}
                        onChange={(e) => setSelectedCarBrand(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.carBrands.map((brand) => (
                          <option key={brand} value={brand}>
                            {brand}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {subFilterOptions.modelYears.length > 0 && (
                    <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                      <span>{t.filterModelYearLabel}:</span>
                      <select
                        value={selectedModelYear}
                        onChange={(e) => setSelectedModelYear(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.modelYears.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterLanguageLabel}:</span>
                    <select
                      value={selectedContentLang}
                      onChange={(e) => setSelectedContentLang(e.target.value as Language | "all")}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.nativeName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 sm:ml-auto dark:text-stone-400">
                    <span>{t.sortLabel}:</span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "featured" | "price_asc" | "price_desc")
                      }
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="featured">{t.sortFeatured}</option>
                      <option value="price_asc">{t.sortPriceLow}</option>
                      <option value="price_desc">{t.sortPriceHigh}</option>
                    </select>
                  </label>
                </div>

                {/* Owner Mode Action Bar */}
                {ownerMode && account?.isAdmin && (
                  <OwnerActionBar
                    label={`Owner Mode Active · Managing ${selectedCategory === "all" ? "Full Catalog" : t.categories[selectedCategory]}`}
                    onAdd={() =>
                      setEditorState({
                        open: true,
                        item: null,
                        defaults: {
                          category: selectedCategory === "all" ? "education" : selectedCategory,
                        },
                      })
                    }
                  />
                )}

                {/* Structured Grade -> Year -> Subject National Exam Archive */}
                {selectedCategory === "national_exams" && (
                  <ExamArchivePanel
                    lang={lang}
                    products={catalog}
                    cartIds={cartIds}
                    unlockedIds={unlockedIds}
                    onAddToCart={handleAddToCart}
                    onPreview={setPreviewProduct}
                    onOpenVault={(prod) => handleOpenInVault(prod)}
                    ownerMode={ownerMode && Boolean(account?.isAdmin)}
                    onEditItem={(item) => setEditorState({ open: true, item, defaults: {} })}
                    onDeleteItem={handleDeleteCatalogItem}
                  />
                )}

                {/* Product Grid (12-per-page paginated) */}
                {filteredProducts.length === 0 ? (
                  <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
                    <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                      {t.noResultsTitle}
                    </h2>
                    <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">
                      {t.noResultsBody}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          handleSelectCategory("all");
                        }}
                        className="inline-flex min-h-[42px] items-center rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                      >
                        {t.clearFilters}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMissingFileOpen(true)}
                        className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                      >
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span>{t.requestMissingBtn}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredProducts.slice(0, visibleCount).map((product, index) => (
                        <Fragment key={product.id}>
                          <ProductCard
                            product={product}
                            lang={lang}
                            inCart={cartIds.has(product.id)}
                            isUnlocked={unlockedIds.has(product.id)}
                            onAddToCart={handleAddToCart}
                            onPreview={setPreviewProduct}
                            onDownloadFull={(prod) => handleOpenInVault(prod)}
                            ownerMode={ownerMode && Boolean(account?.isAdmin)}
                            onEdit={(item) => setEditorState({ open: true, item, defaults: {} })}
                            onDelete={handleDeleteCatalogItem}
                          />
                          {(index + 1) % 6 === 0 && (
                            <div className="col-span-full">
                              <AdSlot
                                slot="in_feed"
                                adConfig={adConfig}
                                lang={lang}
                                variantIndex={Math.floor((index + 1) / 6) - 1}
                                onTrackImpression={handleTrackAdImpression}
                                onTrackClick={handleTrackAdClick}
                              />
                            </div>
                          )}
                        </Fragment>
                      ))}
                    </div>

                    {visibleCount < filteredProducts.length && (
                      <div className="mt-8 flex flex-col items-center gap-2">
                        <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                          {fmt(x.showingOf, {
                            shown: Math.min(visibleCount, filteredProducts.length),
                            total: filteredProducts.length,
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => setVisibleCount((c) => c + 12)}
                          className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-800 hover:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                        >
                          {x.loadMore}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}

          {activeTab === "ai_tools" && (
            <AiToolsSuiteView
              lang={lang}
              unlockedToolIds={unlockedAiToolIds}
              vipActive={vipActive}
              onRequestCheckout={handleRequestAiToolCheckout}
              adConfig={adConfig}
              onTrackAdImpression={handleTrackAdImpression}
              onTrackAdClick={handleTrackAdClick}
            />
          )}

          {activeTab === "jobs" && (
            <JobsMarketplaceView
              lang={lang}
              workers={workers}
              jobs={jobs}
              onRegisterWorker={handleRegisterWorker}
              onPostJob={handlePostJob}
            />
          )}

          {activeTab === "expediter" && (
            <ExpediterView
              lang={lang}
              requests={expediterRequests}
              onSubmitRequest={handleSubmitExpediterRequest}
            />
          )}

          {activeTab === "link_downloader" && (
            <SmartLinkDownloaderView
              lang={lang}
              adConfig={adConfig}
              lastConfirmedLinkDownload={lastConfirmedLinkDownload}
              onConsumeConfirmedLinkDownload={() => setLastConfirmedLinkDownload(null)}
              onRequestCheckout={handleRequestLinkCheckout}
              onTrackAdImpression={handleTrackAdImpression}
              onTrackAdClick={handleTrackAdClick}
            />
          )}

          {activeTab === "downloads" && (
            <DownloadsView
              lang={lang}
              allProducts={catalog}
              onOpenInVault={(prod, ord) => handleOpenInVault(prod, ord)}
              onBrowseMarketplace={() => setActiveTab("marketplace")}
              adConfig={adConfig}
              onTrackAdImpression={handleTrackAdImpression}
              onTrackAdClick={handleTrackAdClick}
            />
          )}

          {activeTab === "cv_studio" && (
            <CvBuilderView lang={lang} onRequestCheckout={handleRequestCvCheckout} />
          )}

          {activeTab === "pdf_editor" && (
            <PdfEditorView
              lang={lang}
              lastConfirmedPdfExport={lastConfirmedPdfExport}
              onConsumeConfirmedPdfExport={() => setLastConfirmedPdfExport(null)}
              onRequestCheckout={handleRequestPdfCheckout}
              onActivityPoint={(action) => awardMemberActivity(action)}
            />
          )}

          {activeTab === "community" && (
            <CommunityTrustView
              lang={lang}
              currentMember={currentMember}
              chatMessages={chatMessages}
              blockedMemberIds={blockedMemberIds}
              reportedMessageIds={reportedMessageIds}
              onOpenAuthModal={() => setIsMemberAuthOpen(true)}
              onPostMessage={handlePostCommunityMessage}
              onHelpfulMessage={handleHelpfulCommunityMessage}
              onReportMessage={handleReportCommunityMessage}
              onBlockMember={handleBlockCommunityMember}
            />
          )}

          {activeTab === "legal_suite" && (
            <LegalSuiteView
              lang={lang}
              consultBookings={consultBookings}
              onRequestDocCheckout={handleRequestLegalDocCheckout}
              onRequestConsultCheckout={handleRequestConsultCheckout}
            />
          )}

          {activeTab === "lawyers_hub" && (
            <>
              {ownerMode && account?.isAdmin && (
                <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
                  <OwnerActionBar
                    label="Owner Mode · Lawyers' Academy"
                    onAdd={() =>
                      setEditorState({
                        open: true,
                        item: null,
                        defaults: { category: "law_academy" },
                      })
                    }
                  />
                </div>
              )}
              <LawyersHubView
                lang={lang}
                lawProducts={lawAcademyProducts}
                cartIds={cartIds}
                unlockedIds={unlockedIds}
                onAddToCart={handleAddToCart}
                onPreview={setPreviewProduct}
                onOpenVault={(prod) => handleOpenInVault(prod)}
                ownerMode={ownerMode && Boolean(account?.isAdmin)}
                onEditItem={(item) => setEditorState({ open: true, item, defaults: {} })}
                onDeleteItem={handleDeleteCatalogItem}
              />
            </>
          )}

          {activeTab === "university" && (
            <>
              {ownerMode && account?.isAdmin && (
                <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
                  <OwnerActionBar
                    label="Owner Mode · University Hub"
                    onAdd={() =>
                      setEditorState({
                        open: true,
                        item: null,
                        defaults: { category: "university" },
                      })
                    }
                  />
                </div>
              )}
              <UniversityHubView
                lang={lang}
                products={universityProducts}
                cartIds={cartIds}
                unlockedIds={unlockedIds}
                onAddToCart={handleAddToCart}
                onPreview={setPreviewProduct}
                onOpenVault={(prod) => handleOpenInVault(prod)}
                ownerMode={ownerMode && Boolean(account?.isAdmin)}
                onEditItem={(item) => setEditorState({ open: true, item, defaults: {} })}
                onDeleteItem={handleDeleteCatalogItem}
              />
            </>
          )}

          {activeTab === "directory" && (
            <BusinessDirectoryView
              lang={lang}
              adConfig={adConfig}
              vipActive={vipActive}
              lastConfirmedService={lastConfirmedService}
              onConsumeConfirmedService={() => setLastConfirmedService(null)}
              onRequestServiceCheckout={handleRequestServiceCheckout}
              onTrackAdImpression={handleTrackAdImpression}
              onTrackAdClick={handleTrackAdClick}
            />
          )}

          {activeTab === "video_studio" && (
            <VideoStudioView
              lang={lang}
              adConfig={adConfig}
              onTrackAdImpression={handleTrackAdImpression}
              onTrackAdClick={handleTrackAdClick}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              lang={lang}
              onChangeLang={setLang}
              theme={theme}
              onToggleTheme={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
              fontScale={fontScale}
              onChangeFontScale={setFontScale}
              unlockedCount={unlockedIds.size}
              cartCount={cartCount}
              onClearSessionData={handleClearSessionData}
            />
          )}

          {activeTab === "dashboard" && ownerMode && account?.isAdmin && (
            <OwnerDashboardView
              lang={lang}
              orders={orders}
              adConfig={adConfig}
              onUpdateAdConfig={setAdConfig}
              expediterRequests={expediterRequests}
              consultBookings={consultBookings}
              onUpdateExpediterRequest={handleUpdateExpediterRequest}
              ownerProfile={ownerProfile}
              onUpdateOwnerProfile={setOwnerProfile}
              isOwner={Boolean(account?.isAdmin)}
              isSignedIn={Boolean(account)}
              onOpenSignIn={() => setIsMemberAuthOpen(true)}
            />
          )}

          {activeTab === "dashboard" && (!ownerMode || !account?.isAdmin) && (
            <section className="mx-auto max-w-xl px-4 py-16 text-center space-y-4">
              <h1 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">
                {x.ownerGateTitle}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {account ? x.ownerGateDenied : x.ownerGateSignIn}
              </p>
              <div className="flex justify-center gap-3">
                {!account && (
                  <button
                    type="button"
                    onClick={() => setIsMemberAuthOpen(true)}
                    className="min-h-[42px] rounded-xl bg-emerald-700 px-5 text-xs font-bold text-white"
                  >
                    {t.memberSignUpLoginBtn}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setOwnerGateError(null);
                    setIsOwnerGateOpen(true);
                  }}
                  className="min-h-[42px] rounded-xl border border-stone-300 bg-white px-5 text-xs font-bold text-stone-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                >
                  {x.ownerGateSubmit}
                </button>
              </div>
            </section>
          )}

          {/* Footer Banner Slot (above footer & mobile bottom navigation bar) */}
          {activeTab !== "dashboard" && (
            <div className="mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6">
              <AdSlot
                slot="footer_banner"
                adConfig={adConfig}
                lang={lang}
                onTrackImpression={handleTrackAdImpression}
                onTrackClick={handleTrackAdClick}
              />
            </div>
          )}
        </main>
      </Suspense>

      {/* Footer with Direct 24/7 Owner Support Contacts */}
      <footer className="border-t border-stone-200 bg-white pb-20 lg:pb-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-stone-500 sm:px-6 dark:text-stone-400">
          <p>© 2026 Addis-Vault. Exclusive Property. Unauthorized Copying Prohibited.</p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t.footerCopyright}</span>
            <span className="font-mono">{t.footerTrust}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-zinc-900">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                {t.footerSupportLabel}
              </span>
              <a
                href={OWNER_SUPPORT_CONTACTS.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Telegram ({OWNER_SUPPORT_CONTACTS.telegramUsername})</span>
              </a>
              <a
                href={OWNER_SUPPORT_CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp ({OWNER_SUPPORT_CONTACTS.whatsappDisplay})</span>
              </a>
              <a
                href={OWNER_SUPPORT_CONTACTS.emailUrl}
                className="inline-flex items-center gap-1.5 font-medium text-amber-800 hover:underline dark:text-amber-400"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{OWNER_SUPPORT_CONTACTS.email}</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsVerifiedOwnerOpen(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.verifiedOwnerNavLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMissingFileOpen(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
              >
                <FileQuestion className="h-3.5 w-3.5" />
                <span>{t.requestMissingBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        lang={lang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        downloadsCount={unlockedIds.size}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={previewProduct}
        lang={lang}
        isUnlocked={previewProduct ? unlockedIds.has(previewProduct.id) : false}
        inCart={previewProduct ? cartIds.has(previewProduct.id) : false}
        onClose={() => setPreviewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNowWithSnapshot}
        onDownloadSample={(prod, contentLang) => downloadProductFile(prod, "sample", contentLang)}
        onDownloadFull={(prod, contentLang) => handleOpenInVault(prod, undefined, contentLang)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        lang={lang}
        cartItems={cart}
        productsById={productsById}
        appliedPromo={appliedPromo}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onApplyPromo={setAppliedPromo}
        onProceedCheckout={openCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        lang={lang}
        items={checkoutSnapshotItems}
        pendingVipPlan={pendingVipPlan}
        pendingAiTool={pendingAiTool}
        pendingCvStandard={pendingCvStandard}
        pendingLegalDoc={pendingLegalDoc}
        pendingLegalConsult={pendingLegalConsult}
        pendingLinkDownload={pendingLinkDownload}
        pendingPdfExport={pendingPdfExport}
        pendingService={pendingService}
        subtotalEtb={subtotalEtb}
        discountEtb={discountEtb}
        totalEtb={totalEtb}
        promoCode={appliedPromo}
        onClose={() => {
          setIsCheckoutOpen(false);
          clearPendingNonCartCheckout();
        }}
        onConfirmOrder={handleConfirmOrder}
        onOpenInVault={(prod, ord) => {
          setIsCheckoutOpen(false);
          clearPendingNonCartCheckout();
          handleOpenInVault(prod, ord);
        }}
        onGoToDownloads={() => setActiveTab("downloads")}
        onReturnToAiTool={() => setActiveTab("ai_tools")}
        onReturnToCvStudio={() => setActiveTab("cv_studio")}
        onReturnToLegalSuite={() => setActiveTab("legal_suite")}
        onReturnToLinkDownloader={(item) => {
          setLastConfirmedLinkDownload(item);
          setActiveTab("link_downloader");
        }}
        onReturnToPdfEditor={(item) => {
          setLastConfirmedPdfExport(item);
          setActiveTab("pdf_editor");
        }}
        onReturnToService={(item) => {
          setLastConfirmedService((prev) =>
            prev && prev.service.id === item.id
              ? prev
              : {
                  service: item,
                  refNumber: orders.find((o) => o.serviceId === item.id)?.refNumber || "CONFIRMED",
                  paymentMethod:
                    orders.find((o) => o.serviceId === item.id)?.paymentMethod || "telebirr",
                },
          );
          setActiveTab(item.kind === "directory_listing" ? "directory" : "video_studio");
        }}
        adConfig={adConfig}
        onTrackAdImpression={handleTrackAdImpression}
        onTrackAdClick={handleTrackAdClick}
      />

      <MissingFileModal
        isOpen={isMissingFileOpen}
        lang={lang}
        onClose={() => setIsMissingFileOpen(false)}
      />

      <MemberAuthModal
        isOpen={isMemberAuthOpen}
        lang={lang}
        currentMember={currentMember}
        ordersCount={orders.length}
        onClose={() => setIsMemberAuthOpen(false)}
        onLogout={() => {
          void supabase.auth.signOut();
          setCurrentMember(null);
          setAccount(null);
          setOwnerMode(false);
        }}
      />

      <VerifiedOwnerModal
        isOpen={isVerifiedOwnerOpen}
        lang={lang}
        ownerProfile={ownerProfile}
        onClose={() => setIsVerifiedOwnerOpen(false)}
      />

      <SecureVaultReaderModal
        product={activeVaultSession?.product || null}
        order={activeVaultSession?.order || null}
        token={activeVaultSession?.token || null}
        lang={lang}
        initialLang={activeVaultSession?.initialLang}
        onClose={() => setActiveVaultSession(null)}
        onRenewSession={(prod) =>
          handleOpenInVault(prod, undefined, activeVaultSession?.initialLang)
        }
      />

      <OwnerItemEditor
        lang={lang}
        open={editorState.open}
        item={editorState.item}
        defaults={editorState.defaults}
        onClose={() => setEditorState({ open: false, item: null, defaults: {} })}
        onSaved={() => {
          void reloadCatalogChanges();
        }}
      />

      {/* Hidden Owner Security Gate Modal (5 quick taps on AddisVault brand mark) */}
      {isOwnerGateOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="owner-gate-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <KeyRound className="h-4 w-4" />
                <h2
                  id="owner-gate-title"
                  className="font-display text-base font-bold text-stone-900 dark:text-stone-100"
                >
                  {x.ownerGateTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOwnerGateOpen(false)}
                aria-label={t.closeBtn}
                className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!account ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-stone-600 dark:text-stone-300">{x.ownerGateSignIn}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOwnerGateOpen(false);
                    setIsMemberAuthOpen(true);
                  }}
                  className="h-11 w-full rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  {t.memberSignUpLoginBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleOwnerGateSubmit} className="mt-4 space-y-3">
                <input
                  type="password"
                  value={ownerPinInput}
                  onChange={(e) => {
                    setOwnerPinInput(e.target.value);
                    setOwnerGateError(null);
                  }}
                  placeholder="Enter Owner Security PIN"
                  required
                  className="h-11 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 text-sm font-mono text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                />
                {ownerGateError && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {ownerGateError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={ownerGateBusy}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {ownerGateBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <span>{x.ownerGateSubmit}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <PWAInstallModal
        isOpen={isPWAModalOpen}
        lang={lang}
        canPromptNatively={canPromptNatively}
        isIOS={isIOS}
        onPromptNative={handleInstallClick}
        onClose={() => setIsPWAModalOpen(false)}
      />

      <SupportWidget
        lang={lang}
        isHidden={isCheckoutOpen || Boolean(activeVaultSession)}
        onOpenMissingFile={() => setIsMissingFileOpen(true)}
        onOpenVerifiedOwner={() => setIsVerifiedOwnerOpen(true)}
      />

      <OfflineIndicator lang={lang} />
    </div>
  );
}
