import { describe, expect, it } from "vitest";

import {
  GENERATED_UNIVERSITY_COURSE_OPTIONS,
  UNIVERSITY_COURSE_YEARS,
} from "@/data/universityCourseOptions";
import { PRODUCTS } from "@/data/products";
import { matchesUniversityType } from "@/utils/universityFilters";

const ADDITION_PREFIX = "uni-coursepack-";
const additions = GENERATED_UNIVERSITY_COURSE_OPTIONS;

describe("University Hub course resources", () => {
  it("adds seven courses and three separate purchase options for every department and year", () => {
    const offerings = new Map<string, Map<string, Set<string>>>();

    for (const product of additions) {
      const { department, uniYear, subject, examType } = product;
      if (!department || !uniYear || !subject || !examType) {
        throw new Error(`Incomplete university course entry: ${product.id}`);
      }

      const yearKey = `${department}|${uniYear}`;
      const courses = offerings.get(yearKey) ?? new Map<string, Set<string>>();
      const kinds = courses.get(subject) ?? new Set<string>();
      kinds.add(examType);
      courses.set(subject, kinds);
      offerings.set(yearKey, courses);
    }

    expect(new Set([...offerings.keys()].map((key) => key.split("|")[0])).size).toBe(7);
    expect(UNIVERSITY_COURSE_YEARS).toHaveLength(8);
    expect(offerings.size).toBe(7 * UNIVERSITY_COURSE_YEARS.length);
    for (const [yearKey, courses] of offerings) {
      expect(UNIVERSITY_COURSE_YEARS).toContain(yearKey.split("|")[1]);
      expect(courses.size).toBe(7);
      for (const kinds of courses.values()) {
        expect(kinds).toHaveLength(3);
        expect(kinds.has("Course Exam Bank")).toBe(true);
      }
    }
    expect(additions).toHaveLength(7 * 8 * 7 * 3);
  });

  it("filters standalone exams, modules, and bundles without treating legacy exam bundles as standalone exams", () => {
    const exam = additions.find((product) => product.id.endsWith("-exam"))!;
    const module = additions.find((product) => product.id.endsWith("-module"))!;
    const bundle = additions.find((product) => product.id.endsWith("-bundle"))!;
    const legacyBundle = PRODUCTS.find(
      (product) =>
        product.category === "university" && product.format.includes("Exam + Module Bundle"),
    )!;

    expect(matchesUniversityType(exam, "exams")).toBe(true);
    expect(matchesUniversityType(exam, "modules")).toBe(false);
    expect(matchesUniversityType(module, "modules")).toBe(true);
    expect(matchesUniversityType(module, "exams")).toBe(false);
    expect(matchesUniversityType(bundle, "bundles")).toBe(true);
    expect(matchesUniversityType(legacyBundle, "bundles")).toBe(true);
    expect(matchesUniversityType(legacyBundle, "exams")).toBe(false);
  });

  it("uses unique ids, free previews, and 50–500 ETB prices with bundle pricing above either standalone option", () => {
    expect(new Set(additions.map((product) => product.id)).size).toBe(additions.length);
    for (const product of additions) {
      expect(product.id.startsWith(ADDITION_PREFIX)).toBe(true);
      expect(product.priceEtb).toBeGreaterThanOrEqual(50);
      expect(product.priceEtb).toBeLessThanOrEqual(500);
      expect(product.sampleExcerpt.en).toContain("Free preview:");
    }

    const byCourse = new Map<string, Map<string, number>>();
    for (const product of additions) {
      const courseId = product.id.replace(/-(module|exam|bundle)$/, "");
      const prices = byCourse.get(courseId) ?? new Map<string, number>();
      prices.set(product.id.split("-").at(-1)!, product.priceEtb);
      byCourse.set(courseId, prices);
    }
    for (const prices of byCourse.values()) {
      expect(prices.get("bundle")).toBeGreaterThan(prices.get("module")!);
      expect(prices.get("bundle")).toBeGreaterThan(prices.get("exam")!);
    }
  });

  it("appends new offers without changing legacy University Hub items or their price band", () => {
    const newIds = new Set(additions.map((product) => product.id));
    const legacy = PRODUCTS.filter(
      (product) => product.category === "university" && !newIds.has(product.id),
    );

    expect(PRODUCTS.filter((product) => newIds.has(product.id))).toHaveLength(additions.length);
    expect(legacy.length).toBeGreaterThan(0);
    expect(Math.max(...legacy.map((product) => product.priceEtb))).toBeLessThanOrEqual(85);
  });
});
