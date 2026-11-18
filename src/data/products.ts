import { DigitalProduct } from "../types";
import { CATALOG_EDUCATION_EXAMS } from "./catalogEducationExams";
import { CATALOG_REGIONAL_TEXTBOOKS } from "./catalogRegionalTextbooks";
import { CATALOG_LAW_ACADEMY } from "./catalogLawAcademy";
import { CATALOG_SPECIALIZED } from "./catalogSpecialized";
import { CATALOG_SUPER_APP } from "./catalogSuperApp";
import { GENERATED_EXAMS, GENERATED_TEXTBOOKS, GENERATED_UNIVERSITY } from "./generatedCatalog";
import { GENERATED_LIBRARY } from "./generatedLibrary";
import { SPECIALIZED_VAULT_EXPANSION } from "./specializedVaultExpansion";
import { CATALOG_PRACTICAL_RESOURCES } from "./catalogPracticalResources";
import {
  createMissingUniversityExamOptions,
  GENERATED_UNIVERSITY_COURSE_OPTIONS,
} from "./universityCourseOptions";

export const HERO_IMAGE =
  "/__l5e/assets-v1/3aaf06a1-2f16-483f-a55a-b2c7a5b7d658/hero_marketplace_studio_1794711378120.jpg";

const textbookKey = (p: DigitalProduct) =>
  `${p.regionId}|${p.gradeBand}|${p.subject}|${p.bookRole}|${p.instructionLanguage}|${p.curriculumEdition || "New Curriculum"}`;

const handwrittenKeys = new Set(CATALOG_REGIONAL_TEXTBOOKS.map(textbookKey));

/** University content lives in its own hub, at student micro-prices (20–85 ETB). */
function toUniversity(p: DigitalProduct): DigitalProduct {
  if (p.gradeBand !== "University") return p;
  return {
    ...p,
    category: "university",
    uniYear: p.uniYear || "Freshman (1st Year)",
    department:
      p.department ||
      (p.subject === "Economics"
        ? "Business"
        : p.subject === "Physics" || p.subject === "Math"
          ? "Natural Sciences"
          : "Engineering"),
    priceEtb: Math.min(85, Math.max(20, p.priceEtb)),
  };
}

const catalogProducts: DigitalProduct[] = [
  ...CATALOG_REGIONAL_TEXTBOOKS,
  ...GENERATED_TEXTBOOKS.filter((p) => !handwrittenKeys.has(textbookKey(p))),
  ...CATALOG_EDUCATION_EXAMS,
  ...GENERATED_EXAMS,
  ...GENERATED_UNIVERSITY,
  ...CATALOG_SPECIALIZED,
  ...CATALOG_SUPER_APP,
  ...GENERATED_LIBRARY,
  ...SPECIALIZED_VAULT_EXPANSION,
  ...CATALOG_PRACTICAL_RESOURCES,
  ...CATALOG_LAW_ACADEMY,
]
  .map(toUniversity)
  .concat(GENERATED_UNIVERSITY_COURSE_OPTIONS);

export const PRODUCTS: DigitalProduct[] = [
  ...catalogProducts,
  ...createMissingUniversityExamOptions(catalogProducts),
];
