import type { DigitalProduct, Language, LocalizedText } from "../types";

const COURSE_YEARS = [
  "Freshman (1st Year)",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "6th Year",
  "7th Year",
  "Postgraduate",
] as const;

const COURSE_SETS: Record<string, readonly (readonly string[])[]> = {
  Engineering: [
    [
      "Applied Mathematics I",
      "General Physics I",
      "Engineering Graphics",
      "Computing for Engineers",
      "Introduction to Engineering",
      "General Chemistry",
      "Communicative English",
    ],
    [
      "Applied Mathematics II",
      "Engineering Mechanics: Statics",
      "Engineering Materials",
      "Engineering Drawing and CAD",
      "Electrical Circuits I",
      "Probability and Statistics for Engineers",
      "Technical Communication",
    ],
    [
      "Strength of Materials",
      "Fluid Mechanics I",
      "Electrical Circuits II",
      "Thermodynamics I",
      "Numerical Methods",
      "Surveying I",
      "Engineering Geology",
    ],
    [
      "Structural Analysis I",
      "Geotechnical Engineering I",
      "Hydraulics",
      "Reinforced Concrete Design I",
      "Transportation Engineering I",
      "Construction Materials",
      "Engineering Economy",
    ],
    [
      "Advanced Structural Analysis",
      "Steel Structure Design",
      "Foundation Engineering",
      "Water Resources Engineering",
      "Highway Engineering",
      "Construction Project Management",
      "Engineering Research Methods",
    ],
    [
      "Advanced Concrete Design",
      "Earthquake Engineering",
      "Bridge Engineering",
      "Construction Contract Administration",
      "Urban Infrastructure Planning",
      "Environmental Impact Assessment",
      "Senior Design Project I",
    ],
    [
      "Integrated Infrastructure Design",
      "Advanced Geotechnical Design",
      "Sustainable Construction",
      "Engineering Risk and Safety",
      "Professional Practice and Ethics",
      "Senior Design Project II",
      "Engineering Seminar",
    ],
    [
      "Advanced Structural Engineering",
      "Computational Mechanics",
      "Advanced Transportation Systems",
      "Water and Environmental Engineering",
      "Construction Management Research",
      "Graduate Research Methods",
      "Thesis Seminar",
    ],
  ],
  Medicine: [
    [
      "General Biology",
      "General Chemistry",
      "Physics for Health Sciences",
      "Introduction to Health Sciences",
      "Medical Terminology",
      "Communicative English",
      "Ethics and Professionalism",
    ],
    [
      "Human Anatomy I",
      "Human Physiology I",
      "Medical Biochemistry I",
      "Histology and Cell Biology",
      "Embryology",
      "Medical Microbiology I",
      "Basic Clinical Skills",
    ],
    [
      "Human Anatomy II",
      "Human Physiology II",
      "Medical Biochemistry II",
      "Immunology",
      "Parasitology",
      "Pathology I",
      "Pharmacology I",
    ],
    [
      "Systemic Pathology",
      "Pharmacology II",
      "Clinical Microbiology",
      "Clinical Examination and Diagnosis",
      "Epidemiology and Biostatistics",
      "Behavioral Sciences",
      "Clinical Attachment I",
    ],
    [
      "Internal Medicine I",
      "General Surgery I",
      "Pediatrics I",
      "Obstetrics and Gynecology I",
      "Emergency Medicine",
      "Radiology and Imaging",
      "Clinical Attachment II",
    ],
    [
      "Internal Medicine II",
      "General Surgery II",
      "Pediatrics II",
      "Obstetrics and Gynecology II",
      "Psychiatry",
      "Ophthalmology and ENT",
      "Clinical Clerkship I",
    ],
    [
      "Advanced Clinical Clerkship",
      "Family Medicine",
      "Anesthesia and Critical Care",
      "Public Health and Community Medicine",
      "Clinical Ethics and Patient Safety",
      "Internship Preparation",
      "Medical Research Project",
    ],
    [
      "Advanced Clinical Epidemiology",
      "Evidence-Based Medicine",
      "Advanced Internal Medicine",
      "Advanced Surgery",
      "Health Systems and Policy",
      "Graduate Research Methods",
      "Thesis or Clinical Research Project",
    ],
  ],
  Business: [
    [
      "Mathematics for Business",
      "Introduction to Economics",
      "Principles of Management",
      "Financial Accounting I",
      "Business Communication",
      "Computer Applications in Business",
      "Logic and Critical Thinking",
    ],
    [
      "Financial Accounting II",
      "Microeconomics",
      "Business Statistics I",
      "Marketing Principles",
      "Business Law",
      "Cost Accounting I",
      "Organizational Behavior",
    ],
    [
      "Intermediate Accounting I",
      "Macroeconomics",
      "Business Statistics II",
      "Cost and Management Accounting",
      "Principles of Finance",
      "Human Resource Management",
      "Operations Management",
    ],
    [
      "Advanced Financial Accounting",
      "Auditing I",
      "Public Finance and Taxation",
      "Financial Management",
      "Cost and Management Accounting II",
      "Business Research Methods",
      "Strategic Management",
    ],
    [
      "Auditing II",
      "Taxation of Business Entities",
      "Financial Statement Analysis",
      "Investment and Portfolio Management",
      "Accounting Information Systems",
      "Corporate Governance",
      "Business Research Project",
    ],
    [
      "International Accounting",
      "Advanced Auditing and Assurance",
      "Public Sector Accounting",
      "Advanced Corporate Finance",
      "Risk Management",
      "Business Valuation",
      "Applied Research Seminar",
    ],
    [
      "Forensic Accounting",
      "Advanced Tax Planning",
      "Banking and Financial Institutions",
      "Strategic Performance Management",
      "International Business",
      "Senior Research Project",
      "Professional Ethics in Accounting",
    ],
    [
      "Advanced Financial Reporting",
      "Contemporary Auditing Research",
      "Applied Econometrics",
      "Corporate Finance Seminar",
      "Public Financial Management",
      "Graduate Research Methods",
      "Thesis Seminar",
    ],
  ],
  Law: [
    [
      "Introduction to Law",
      "Logic and Critical Thinking",
      "Civics and Moral Education",
      "Legal English",
      "Introduction to Ethiopian Legal System",
      "Legal Research Skills",
      "Constitutional Foundations",
    ],
    [
      "Constitutional Law I",
      "Law of Contracts I",
      "Criminal Law: General Part",
      "Law of Persons",
      "Property Law I",
      "Legal Method and Writing",
      "Ethiopian Legal History",
    ],
    [
      "Constitutional Law II",
      "Law of Contracts II",
      "Criminal Law: Specific Offences",
      "Family Law",
      "Law of Traders",
      "Civil Procedure I",
      "Administrative Law",
    ],
    [
      "Law of Property II",
      "Criminal Procedure",
      "Civil Procedure II",
      "Labour Law",
      "Company Law",
      "Law of Evidence",
      "Human Rights Law",
    ],
    [
      "Public International Law",
      "Commercial Transactions",
      "Investment Law",
      "Land Law",
      "Tax Law",
      "Legal Clinic I",
      "Legal Research Methods",
    ],
    [
      "International Humanitarian Law",
      "Bankruptcy and Insolvency Law",
      "Intellectual Property Law",
      "Environmental Law",
      "Alternative Dispute Resolution",
      "Legal Clinic II",
      "Senior Research Paper",
    ],
    [
      "Advanced Civil Litigation",
      "Advanced Criminal Justice",
      "Federalism and Intergovernmental Law",
      "Comparative Constitutional Law",
      "Professional Responsibility",
      "Moot Court Practice",
      "Senior Thesis",
    ],
    [
      "Advanced Commercial Law",
      "Advanced Human Rights Law",
      "Comparative Legal Systems",
      "Legislative Drafting",
      "Graduate Legal Research Methods",
      "Special Topics in Ethiopian Law",
      "Thesis Seminar",
    ],
  ],
  "Natural Sciences": [
    [
      "General Physics I",
      "General Chemistry I",
      "Mathematics for Natural Sciences",
      "Biology I",
      "Introduction to Computing",
      "Scientific Communication",
      "Critical Thinking",
    ],
    [
      "Calculus II",
      "General Physics II",
      "Organic Chemistry I",
      "Cell Biology",
      "Probability and Statistics",
      "Programming for Scientists",
      "Laboratory Methods",
    ],
    [
      "Classical Mechanics",
      "Organic Chemistry II",
      "Genetics",
      "Differential Equations",
      "Analytical Chemistry",
      "Ecology",
      "Scientific Instrumentation",
    ],
    [
      "Quantum Mechanics I",
      "Physical Chemistry",
      "Molecular Biology",
      "Numerical Analysis",
      "Electromagnetism",
      "Biostatistics",
      "Research Methods in Science",
    ],
    [
      "Quantum Mechanics II",
      "Biochemistry",
      "Instrumental Analysis",
      "Evolutionary Biology",
      "Computational Modeling",
      "Environmental Science",
      "Undergraduate Research Project",
    ],
    [
      "Solid State Physics",
      "Advanced Organic Synthesis",
      "Microbiology",
      "Mathematical Modeling",
      "Spectroscopy",
      "Conservation Biology",
      "Research Seminar",
    ],
    [
      "Advanced Materials Science",
      "Applied Biophysics",
      "Advanced Molecular Genetics",
      "Scientific Data Analysis",
      "Climate Science",
      "Senior Research Project",
      "Science Ethics and Communication",
    ],
    [
      "Advanced Quantum Theory",
      "Advanced Analytical Chemistry",
      "Molecular Genetics",
      "Computational Physics",
      "Advanced Ecology",
      "Graduate Research Methods",
      "Thesis Seminar",
    ],
  ],
  "Social Sciences": [
    [
      "General Psychology",
      "Introduction to Sociology",
      "Introduction to Political Science",
      "Geography of Ethiopia and the Horn",
      "History of Ethiopia",
      "Social Anthropology",
      "Academic Writing",
    ],
    [
      "Development Studies",
      "Social Psychology",
      "Political Theory",
      "Economic Geography",
      "African History",
      "Sociological Theory I",
      "Introduction to Research",
    ],
    [
      "Social Research Methods I",
      "Development Economics",
      "Comparative Politics",
      "Urban Geography",
      "Ethiopian Social History",
      "Sociological Theory II",
      "Social Statistics I",
    ],
    [
      "Public Administration",
      "International Relations",
      "Social Research Methods II",
      "Population Studies",
      "Ethiopian Foreign Policy",
      "Social Statistics II",
      "Gender and Society",
    ],
    [
      "Public Policy Analysis",
      "Political Economy",
      "Regional Planning",
      "Conflict and Peace Studies",
      "Migration and Urbanization",
      "Qualitative Research Methods",
      "Senior Essay I",
    ],
    [
      "Governance and Decentralization",
      "International Development",
      "Advanced Social Statistics",
      "Human Rights and Society",
      "Environmental Sociology",
      "Senior Essay II",
      "Community-Based Research",
    ],
    [
      "Comparative Public Policy",
      "Advanced Development Theory",
      "Peacebuilding Practice",
      "Social Impact Assessment",
      "Advanced Qualitative Analysis",
      "Senior Research Project",
      "Professional Ethics",
    ],
    [
      "Advanced Development Studies",
      "Political Economy Seminar",
      "Public Policy Research",
      "Advanced Social Theory",
      "Graduate Research Methods",
      "Applied Social Statistics",
      "Thesis Seminar",
    ],
  ],
  Agriculture: [
    [
      "Introduction to Agriculture",
      "General Biology",
      "Chemistry for Agriculture",
      "Mathematics for Agriculture",
      "Introduction to Animal Science",
      "Soil and Water Basics",
      "Agricultural Communication",
    ],
    [
      "Soil Science I",
      "Crop Production I",
      "Animal Anatomy and Physiology",
      "Agricultural Economics I",
      "Plant Biology",
      "Rural Sociology",
      "Agricultural Statistics",
    ],
    [
      "Soil Fertility and Plant Nutrition",
      "Crop Production II",
      "Animal Breeding",
      "Plant Pathology",
      "Agricultural Economics II",
      "Farm Machinery",
      "Research Methods in Agriculture",
    ],
    [
      "Agronomy",
      "Animal Nutrition",
      "Irrigation and Drainage",
      "Entomology",
      "Agricultural Extension Methods",
      "Livestock Production Systems",
      "Farm Management",
    ],
    [
      "Horticulture",
      "Veterinary Parasitology",
      "Plant Protection",
      "Agricultural Marketing",
      "Rangeland Management",
      "Food Science and Postharvest",
      "Agricultural Project Analysis",
    ],
    [
      "Veterinary Medicine I",
      "Advanced Crop Improvement",
      "Watershed Management",
      "Dairy Science",
      "Poultry Production",
      "Agribusiness Management",
      "Agricultural Research Project I",
    ],
    [
      "Veterinary Medicine II",
      "Sustainable Agriculture",
      "Animal Disease Epidemiology",
      "Climate-Smart Agriculture",
      "Advanced Irrigation Design",
      "Agricultural Research Project II",
      "Rural Development Planning",
    ],
    [
      "Advanced Agronomy",
      "Veterinary Public Health",
      "Plant Breeding and Biotechnology",
      "Agricultural Economics and Policy",
      "Livestock Systems Research",
      "Graduate Research Methods",
      "Thesis Seminar",
    ],
  ],
};

const COURSE_YEAR_LABELS: Record<(typeof COURSE_YEARS)[number], LocalizedText> = {
  "Freshman (1st Year)": {
    en: "Freshman (1st Year)",
    am: "ፍሬሽማን (1ኛ ዓመት)",
    om: "Waggaa 1ffaa (Freshman)",
    ti: "ፍሬሽማን (1ይ ዓመት)",
    so: "Sannadka 1aad",
  },
  "2nd Year": {
    en: "2nd Year",
    am: "2ኛ ዓመት",
    om: "Waggaa 2ffaa",
    ti: "2ይ ዓመት",
    so: "Sannadka 2aad",
  },
  "3rd Year": {
    en: "3rd Year",
    am: "3ኛ ዓመት",
    om: "Waggaa 3ffaa",
    ti: "3ይ ዓመት",
    so: "Sannadka 3aad",
  },
  "4th Year": {
    en: "4th Year",
    am: "4ኛ ዓመት",
    om: "Waggaa 4ffaa",
    ti: "4ይ ዓመት",
    so: "Sannadka 4aad",
  },
  "5th Year": {
    en: "5th Year",
    am: "5ኛ ዓመት",
    om: "Waggaa 5ffaa",
    ti: "5ይ ዓመት",
    so: "Sannadka 5aad",
  },
  "6th Year": {
    en: "6th Year",
    am: "6ኛ ዓመት",
    om: "Waggaa 6ffaa",
    ti: "6ይ ዓመት",
    so: "Sannadka 6aad",
  },
  "7th Year": {
    en: "7th Year",
    am: "7ኛ ዓመት",
    om: "Waggaa 7ffaa",
    ti: "7ይ ዓመት",
    so: "Sannadka 7aad",
  },
  Postgraduate: {
    en: "Postgraduate",
    am: "ድህረ ምረቃ",
    om: "Barnoota Digirii 2ffaa",
    ti: "ድሕረ ምረቓ",
    so: "Jaamacad Sare",
  },
};

const DEPARTMENT_LABELS: Record<string, LocalizedText> = {
  Engineering: {
    en: "Engineering & Technology",
    am: "ምህንድስና እና ቴክኖሎጂ",
    om: "Injinariingii fi Teeknooloojii",
    ti: "ምህንድስናን ቴክኖሎጂን",
    so: "Injineernimada & Tiknoolajiyada",
  },
  Medicine: {
    en: "Medicine & Health Sciences",
    am: "ሕክምና እና ጤና ሳይንስ",
    om: "Fayyaa fi Yaala",
    ti: "ሕክምናን ሳይንስ ጥዕናን",
    so: "Caafimaadka & Daawada",
  },
  Business: {
    en: "Business & Economics",
    am: "ቢዝነስ እና ኢኮኖሚክስ",
    om: "Daldalaa fi Diinagdee",
    ti: "ንግድን ኢኮኖሚክስን",
    so: "Ganacsiga & Dhaqaalaha",
  },
  Law: { en: "Law", am: "ሕግ", om: "Seera", ti: "ሕጊ", so: "Sharciga" },
  "Natural Sciences": {
    en: "Natural & Computational Sciences",
    am: "የተፈጥሮ ሳይንስ",
    om: "Saayinsii Uumamaa",
    ti: "ሳይንስ ተፈጥሮ",
    so: "Sayniska Dabiiciga",
  },
  "Social Sciences": {
    en: "Social Sciences & Humanities",
    am: "ማኅበራዊ ሳይንስ",
    om: "Saayinsii Hawaasaa",
    ti: "ማሕበራዊ ሳይንስ",
    so: "Cilmiga Bulshada",
  },
  Agriculture: {
    en: "Agriculture & Veterinary",
    am: "ግብርና እና የእንስሳት ሕክምና",
    om: "Qonnaa fi Fayyaa Bineensaa",
    ti: "ሕርሻን ሕክምና እንስሳን",
    so: "Beeraha & Xannaanada Xoolaha",
  },
};

const COURSE_KIND = [
  {
    key: "module",
    title: { en: "Course Module Only", am: "ኮርስ / ሞጁል ብቻ" },
    format: "Course Module & Lecture Notes",
    description:
      "Standalone course module with a topic outline, lecture-note summaries, key terminology, worked examples, and references.",
    sample:
      "Free preview: course objectives, unit outline, key terms, and the opening lecture-note section.",
  },
  {
    key: "exam",
    title: { en: "Course Exam Bank Only — Mid & Final", am: "የኮርስ ፈተናዎች ብቻ — Mid & Final" },
    format: "Midterm & Final Practice Exam Bank",
    description:
      "Course-specific midterm and final practice questions, worksheet exercises, and worked answer explanations for revision.",
    sample:
      "Free preview: sample midterm and final question formats, worksheet topics, and an answer-explanation preview.",
  },
  {
    key: "bundle",
    title: { en: "Complete Bundle — Course + Exam Bank", am: "ሙሉ ጥቅል — ኮርስ እና ፈተና በአንድ ላይ" },
    format: "Complete Course + Midterm & Final Bundle",
    description:
      "Combined course module and lecture-note study guide with midterm and final practice exams, worksheets, and worked answer explanations.",
    sample:
      "Free preview: course unit outline plus a sample midterm/final practice section and answer explanation.",
  },
] as const;

const courseSlug = (course: string) =>
  course
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const languageText = (en: string, am: string): LocalizedText => ({
  en,
  am,
  om: en,
  ti: en,
  so: en,
});

function mapLanguage(fn: (language: Language) => string): LocalizedText {
  return { en: fn("en"), am: fn("am"), om: fn("om"), ti: fn("ti"), so: fn("so") };
}

function mapLanguageValues<T>(fn: (language: Language) => T): Record<Language, T> {
  return { en: fn("en"), am: fn("am"), om: fn("om"), ti: fn("ti"), so: fn("so") };
}

function buildCourseOptions(): DigitalProduct[] {
  const products: DigitalProduct[] = [];
  let index = 0;
  for (const [department, years] of Object.entries(COURSE_SETS)) {
    years.forEach((courses, yearIndex) => {
      const uniYear = COURSE_YEARS[yearIndex];
      courses.forEach((course, courseIndex) => {
        const basePrice = 80 + ((yearIndex * 19 + courseIndex * 13 + index * 7) % 161);
        const examPrice = 60 + ((yearIndex * 11 + courseIndex * 17 + index * 5) % 121);
        for (const kind of COURSE_KIND) {
          index += 1;
          const priceEtb =
            kind.key === "module"
              ? basePrice
              : kind.key === "exam"
                ? examPrice
                : Math.min(500, basePrice + examPrice - 20);
          const title = languageText(
            `${course} — ${kind.title.en}`,
            `${course} — ${kind.title.am}`,
          );
          const labels = DEPARTMENT_LABELS[department];
          const courseHighlights = mapLanguageValues((lang) => {
            if (kind.key === "module") {
              return lang === "am"
                ? ["የኮርስ ዓላማና የክፍል ዝርዝር", "የማስታወሻ ማጠቃለያና ቁልፍ ቃላት", "የማጣቀሻ መመሪያ"]
                : [
                    "Course objectives and unit outline",
                    "Lecture-note summaries and key terms",
                    "Reference and revision guide",
                  ];
            }
            if (kind.key === "exam") {
              return lang === "am"
                ? ["የሚድተርምና ፋይናል የልምምድ ጥያቄዎች", "የ worksheet ልምምዶች", "የተሰሩ የመልስ ማብራሪያዎች"]
                : [
                    "Midterm and final practice questions",
                    "Course worksheet exercises",
                    "Worked answer explanations",
                  ];
            }
            return lang === "am"
              ? [
                  "ሙሉ የኮርስ ሞጁልና የንግግር ማስታወሻዎች",
                  "የሚድተርምና ፋይናል የልምምድ ፈተናዎች",
                  "worksheet እና የመልስ ማብራሪያዎች",
                ]
              : [
                  "Complete course module and lecture notes",
                  "Midterm and final practice exam bank",
                  "Worksheets with worked answer explanations",
                ];
          });
          products.push({
            id: `uni-coursepack-${courseSlug(department)}-y${yearIndex + 1}-${courseSlug(course)}-${kind.key}`,
            sku: `UCP-${department
              .replace(/[^A-Za-z]/g, "")
              .slice(0, 3)
              .toUpperCase()}-Y${yearIndex + 1}-${courseSlug(course).replace(/-/g, "").slice(0, 8).toUpperCase()}-${kind.key.toUpperCase()}`,
            category: "university",
            gradeBand: "University",
            uniYear,
            department,
            subject: course,
            examType:
              kind.key === "module"
                ? "Course Module"
                : kind.key === "exam"
                  ? "Course Exam Bank"
                  : "Course + Exam Bundle",
            availableLanguages: ["en", "am"],
            priceEtb,
            format: kind.format,
            fileSize: `${(1.5 + ((index * 7) % 35) / 10).toFixed(1)} MB`,
            fileExtension: "html",
            coverImage:
              department === "Medicine"
                ? "/__l5e/assets-v1/78057722-9c49-419a-a803-ba7c112fc0e6/cat_medical_research_1794714175983.jpg"
                : department === "Agriculture"
                  ? "/__l5e/assets-v1/ed98937d-ab75-47d2-a3df-b7b58b532ba5/cat_livestock_dairy_1794714176565.jpg"
                  : "/__l5e/assets-v1/f52a2402-5f9b-4fe5-883c-d4a7564c3932/cat_mini_courses_1794711380522.jpg",
            accentPattern: (["diamond", "lattice", "horizon", "prism", "weave", "arch"] as const)[
              index % 6
            ],
            title,
            description: mapLanguage((lang) => {
              const prefix = `${labels[lang]} · ${COURSE_YEAR_LABELS[uniYear][lang]} · ${course}.`;
              if (lang === "am") return `${prefix} ${kind.description}`;
              return `${prefix} ${kind.description}`;
            }),
            highlights: courseHighlights,
            sampleExcerpt: mapLanguage(
              () =>
                `${course} — ${kind.sample} Sample material is for preview; full course resources require purchase, VIP access, or verified Owner access.`,
            ),
          });
        }
      });
    });
  }
  return products;
}

export const GENERATED_UNIVERSITY_COURSE_OPTIONS = buildCourseOptions();
export const UNIVERSITY_COURSE_YEARS = COURSE_YEARS;
export const UNIVERSITY_COURSE_YEAR_LABELS = COURSE_YEAR_LABELS;
