import { REGION_NAME_BY_ID } from '../constants/educationRegions';
import { CategoryId, DigitalProduct, Language } from '../types';

export interface CatalogFilterState {
  selectedCategory: CategoryId | 'all';
  selectedRegion: string;
  selectedInstructionLang: string;
  selectedGrade: string;
  selectedBookRole: string;
  selectedSubject: string;
  selectedEdition: string;
  selectedExamYear: string;
  selectedAudience: string;
  selectedTrack: string;
  selectedCarBrand: string;
  selectedModelYear: string;
  selectedContentLang: Language | 'all';
  searchQuery?: string;
  sortBy?: 'featured' | 'price_asc' | 'price_desc';
  lang?: Language;
}

export interface SubFilterOptions {
  grades: string[];
  subjects: string[];
  years: string[];
  audiences: string[];
  tracks: string[];
  carBrands: string[];
  modelYears: string[];
  instructionLanguages: string[];
  bookRoles: string[];
  editions: string[];
  contentLanguages: Language[];
}

const GRADE_ORDER: Record<string, number> = {
  'Grade 1': 1,
  'Grade 2': 2,
  'Grade 3': 3,
  'Grade 4': 4,
  'Grade 5': 5,
  'Grade 6': 6,
  'Grade 7': 7,
  'Grade 8': 8,
  'Grade 9': 9,
  'Grade 10': 10,
  'Grade 11': 11,
  'Grade 12': 12,
  'G1-4': 13,
  'G5-6': 14,
  'G7-8': 15,
  'G9-10': 16,
  'G11-12': 17,
  University: 18,
};

function sortGrades(values: string[]): string[] {
  return [...values].sort((a, b) => (GRADE_ORDER[a] ?? 99) - (GRADE_ORDER[b] ?? 99) || a.localeCompare(b));
}

export function computeSubFilterOptions(
  catalog: DigitalProduct[],
  state: Pick<
    CatalogFilterState,
    | 'selectedCategory'
    | 'selectedRegion'
    | 'selectedInstructionLang'
    | 'selectedGrade'
    | 'selectedBookRole'
    | 'selectedSubject'
    | 'selectedEdition'
    | 'selectedCarBrand'
  >
): SubFilterOptions {
  const base =
    state.selectedCategory === 'all'
      ? catalog
      : catalog.filter((p) => p.category === state.selectedCategory);

  const regionScoped =
    state.selectedRegion === 'all'
      ? base
      : base.filter((p) => p.regionId === state.selectedRegion);

  const instructionLanguages = Array.from(
    new Set(regionScoped.map((p) => p.instructionLanguage).filter(Boolean) as string[])
  );

  const instLangScoped =
    state.selectedInstructionLang === 'all'
      ? regionScoped
      : regionScoped.filter((p) => p.instructionLanguage === state.selectedInstructionLang);

  const grades = sortGrades(
    Array.from(new Set(instLangScoped.map((p) => p.gradeBand).filter(Boolean) as string[]))
  );

  const gradeScoped =
    state.selectedGrade === 'all'
      ? instLangScoped
      : instLangScoped.filter((p) => p.gradeBand === state.selectedGrade);

  const bookRoles = Array.from(
    new Set(gradeScoped.map((p) => p.bookRole).filter(Boolean) as string[])
  );

  const roleScoped =
    state.selectedBookRole === 'all'
      ? gradeScoped
      : gradeScoped.filter((p) => p.bookRole === state.selectedBookRole);

  const editions = Array.from(
    new Set(roleScoped.map((p) => p.curriculumEdition).filter(Boolean) as string[])
  );

  const editionScoped =
    state.selectedEdition === 'all'
      ? roleScoped
      : roleScoped.filter((p) => p.curriculumEdition === state.selectedEdition);

  const subjects = Array.from(
    new Set(editionScoped.map((p) => p.subject).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b));

  const subjectScoped =
    state.selectedSubject === 'all'
      ? editionScoped
      : editionScoped.filter((p) => p.subject === state.selectedSubject);

  const years = Array.from(new Set(gradeScoped.map((p) => p.examYear).filter(Boolean) as string[]));
  const audiences = Array.from(new Set(base.map((p) => p.audience).filter(Boolean) as string[]));
  const tracks = Array.from(new Set(base.map((p) => p.track).filter(Boolean) as string[]));
  const carBrands = Array.from(new Set(base.map((p) => p.carBrand).filter(Boolean) as string[]));

  const carBrandScoped =
    state.selectedCarBrand === 'all'
      ? base
      : base.filter((p) => p.carBrand === state.selectedCarBrand);

  const modelYears = Array.from(
    new Set(carBrandScoped.map((p) => p.modelYear).filter(Boolean) as string[])
  );

  const langSet = new Set<Language>();
  for (const p of subjectScoped) {
    if (!p.availableLanguages || p.availableLanguages.length === 0) {
      langSet.add('en');
      langSet.add('am');
    } else {
      for (const l of p.availableLanguages) langSet.add(l);
    }
  }

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
    contentLanguages: Array.from(langSet),
  };
}

/**
 * Ensures downstream filter values are always compatible with upstream selections
 * so valid dropdown selections can never produce an empty product slice.
 */
export function normalizeCatalogFilterState(
  catalog: DigitalProduct[],
  next: CatalogFilterState
): CatalogFilterState {
  const s = { ...next };

  // Step 1: category -> region -> instructionLang
  const opts1 = computeSubFilterOptions(catalog, s);
  if (s.selectedInstructionLang !== 'all' && !opts1.instructionLanguages.includes(s.selectedInstructionLang)) {
    s.selectedInstructionLang = 'all';
  }

  // Step 2: recompute with normalized instructionLang -> grade -> bookRole -> edition -> subject
  const opts2 = computeSubFilterOptions(catalog, s);
  if (s.selectedGrade !== 'all' && !opts2.grades.includes(s.selectedGrade)) {
    s.selectedGrade = 'all';
  }
  const opts3 = computeSubFilterOptions(catalog, s);
  if (s.selectedBookRole !== 'all' && !opts3.bookRoles.includes(s.selectedBookRole)) {
    s.selectedBookRole = 'all';
  }
  const opts4 = computeSubFilterOptions(catalog, s);
  if (s.selectedEdition !== 'all' && !opts4.editions.includes(s.selectedEdition)) {
    s.selectedEdition = 'all';
  }
  const opts5 = computeSubFilterOptions(catalog, s);
  if (s.selectedSubject !== 'all' && !opts5.subjects.includes(s.selectedSubject)) {
    s.selectedSubject = 'all';
  }
  const opts6 = computeSubFilterOptions(catalog, s);
  if (s.selectedExamYear !== 'all' && !opts6.years.includes(s.selectedExamYear)) {
    s.selectedExamYear = 'all';
  }
  if (s.selectedAudience !== 'all' && !opts6.audiences.includes(s.selectedAudience)) {
    s.selectedAudience = 'all';
  }
  if (s.selectedTrack !== 'all' && !opts6.tracks.includes(s.selectedTrack)) {
    s.selectedTrack = 'all';
  }
  if (s.selectedCarBrand !== 'all' && !opts6.carBrands.includes(s.selectedCarBrand)) {
    s.selectedCarBrand = 'all';
  }
  const opts7 = computeSubFilterOptions(catalog, s);
  if (s.selectedModelYear !== 'all' && !opts7.modelYears.includes(s.selectedModelYear)) {
    s.selectedModelYear = 'all';
  }
  if (s.selectedContentLang !== 'all' && !opts7.contentLanguages.includes(s.selectedContentLang)) {
    s.selectedContentLang = 'all';
  }

  return s;
}

export function filterCatalogProducts(
  catalog: DigitalProduct[],
  state: CatalogFilterState
): DigitalProduct[] {
  const q = (state.searchQuery || '').trim().toLowerCase();
  const uiLang = state.lang || 'en';
  const list = catalog.filter((product) => {
    if (state.selectedCategory !== 'all' && product.category !== state.selectedCategory) {
      return false;
    }
    if (state.selectedRegion !== 'all' && product.regionId !== state.selectedRegion) {
      return false;
    }
    if (
      state.selectedInstructionLang !== 'all' &&
      product.instructionLanguage !== state.selectedInstructionLang
    ) {
      return false;
    }
    if (state.selectedBookRole !== 'all' && product.bookRole !== state.selectedBookRole) {
      return false;
    }
    if (state.selectedEdition !== 'all' && product.curriculumEdition !== state.selectedEdition) {
      return false;
    }
    if (state.selectedGrade !== 'all' && product.gradeBand !== state.selectedGrade) {
      return false;
    }
    if (state.selectedSubject !== 'all' && product.subject !== state.selectedSubject) {
      return false;
    }
    if (state.selectedExamYear !== 'all' && product.examYear !== state.selectedExamYear) {
      return false;
    }
    if (state.selectedAudience !== 'all' && product.audience !== state.selectedAudience) {
      return false;
    }
    if (state.selectedTrack !== 'all' && product.track !== state.selectedTrack) {
      return false;
    }
    if (state.selectedCarBrand !== 'all' && product.carBrand !== state.selectedCarBrand) {
      return false;
    }
    if (state.selectedModelYear !== 'all' && product.modelYear !== state.selectedModelYear) {
      return false;
    }
    if (
      state.selectedContentLang !== 'all' &&
      product.availableLanguages &&
      !product.availableLanguages.includes(state.selectedContentLang)
    ) {
      return false;
    }
    if (!q) return true;
    const regionName = product.regionId
      ? REGION_NAME_BY_ID[product.regionId]?.name[uiLang] || ''
      : '';
    return (
      product.title[uiLang].toLowerCase().includes(q) ||
      product.title.en.toLowerCase().includes(q) ||
      product.description[uiLang].toLowerCase().includes(q) ||
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

  if (state.sortBy === 'price_asc') {
    return [...list].sort((a, b) => a.priceEtb - b.priceEtb);
  }
  if (state.sortBy === 'price_desc') {
    return [...list].sort((a, b) => b.priceEtb - a.priceEtb);
  }
  return list;
}
