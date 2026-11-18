import { describe, expect, it } from "vitest";
import { AI_TOOLS_LIST } from "@/constants/aiTools";
import { DEFAULT_AD_CONFIG } from "@/constants/ads";
import { ALL_CV_COUNTRIES } from "@/constants/cvCountries";
import { VIP_PLANS } from "@/constants/growth";
import { adStudioPriceEtb, DIRECTORY_TIERS, videoStudioPriceEtb } from "@/utils/servicePricing";
import { PRODUCTS } from "@/data/products";

describe("VIP pass pricing", () => {
  it("monthly is 1,000 ETB with 1,500 crossed out", () => {
    const monthly = VIP_PLANS.find((p) => p.id === "monthly")!;
    expect(monthly.priceEtb).toBe(1000);
    expect(monthly.originalPriceEtb).toBe(1500);
  });
  it("yearly is 2,500 ETB for 365 days", () => {
    const annual = VIP_PLANS.find((p) => p.id === "annual")!;
    expect(annual.priceEtb).toBe(2500);
    expect(annual.durationDays).toBe(365);
  });
});

describe("AI Video Studio pricing (pay after preview)", () => {
  it("charges 50 ETB up to one minute", () => {
    expect(videoStudioPriceEtb(30)).toBe(50);
    expect(videoStudioPriceEtb(60)).toBe(50);
  });
  it("charges at least 120 ETB above one minute and rises past 500 ETB for long videos", () => {
    expect(videoStudioPriceEtb(61)).toBe(120);
    expect(videoStudioPriceEtb(9 * 60)).toBeGreaterThanOrEqual(500);
  });
});

describe("AI Video Ad Studio pricing", () => {
  it("stays between 150 and 500 ETB", () => {
    expect(adStudioPriceEtb(1, 15)).toBe(150);
    expect(adStudioPriceEtb(3, 60)).toBe(400);
    expect(adStudioPriceEtb(5, 60)).toBe(500);
  });
});

describe("Business directory listing", () => {
  it("costs 100–300 ETB", () => {
    const prices = DIRECTORY_TIERS.map((t) => t.priceEtb);
    expect(Math.min(...prices)).toBe(100);
    expect(Math.max(...prices)).toBe(300);
  });
});

describe("Catalog price bands", () => {
  it("regional textbooks and teacher's guides cost 20–60 ETB", () => {
    const prices = PRODUCTS.filter((p) => p.id.startsWith("gt-")).map((p) => p.priceEtb);
    expect(Math.min(...prices)).toBe(20);
    expect(Math.max(...prices)).toBe(60);
  });
  it("university hub items cost 20–85 ETB", () => {
    const prices = PRODUCTS.filter(
      (p) => p.category === "university" && !p.id.startsWith("uni-coursepack-"),
    ).map((p) => p.priceEtb);
    expect(Math.min(...prices)).toBeGreaterThanOrEqual(20);
    expect(Math.max(...prices)).toBeLessThanOrEqual(85);
  });
  it("covers all 14 regions with grades 1–12 student books and teacher's guides", () => {
    const tb = PRODUCTS.filter((p) => p.id.startsWith("gt-"));
    expect(new Set(tb.map((p) => p.regionId)).size).toBe(14);
    expect(new Set(tb.map((p) => p.gradeBand)).size).toBe(12);
    expect(new Set(tb.map((p) => p.bookRole)).size).toBe(2);
  });
  it("has national exams for grades 6, 8 and 12 up to 2018 E.C.", () => {
    const ex = PRODUCTS.filter((p) => p.id.startsWith("nx-"));
    expect(new Set(ex.map((p) => p.gradeBand))).toEqual(
      new Set(["Grade 6", "Grade 8", "Grade 12"]),
    );
    expect(ex.some((p) => p.examYear?.startsWith("2018"))).toBe(true);
  });
});

describe("AI suite & Global CV standards", () => {
  it("provides all 12 AI mini-apps", () => {
    expect(AI_TOOLS_LIST.length).toBe(12);
    expect(new Set(AI_TOOLS_LIST.map((t) => t.id)).size).toBe(12);
  });

  it("covers 190+ sovereign countries with tiered 50–300 ETB pricing", () => {
    expect(ALL_CV_COUNTRIES.length).toBeGreaterThanOrEqual(190);
    const prices = ALL_CV_COUNTRIES.map((c) => c.priceEtb);
    expect(Math.min(...prices)).toBe(50);
    expect(Math.max(...prices)).toBe(300);
  });
});

describe("Security & clean production ad defaults", () => {
  it("starts with ads and demo sponsor banners disabled", () => {
    expect(DEFAULT_AD_CONFIG.adsEnabled).toBe(false);
    expect(DEFAULT_AD_CONFIG.showDefaultBanners).toBe(false);
    expect(DEFAULT_AD_CONFIG.directSponsors).toEqual([]);
  });
});
