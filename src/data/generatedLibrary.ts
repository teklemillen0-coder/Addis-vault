/**
 * Extra specialised-library items (Ethiopian business, tax, electronics, architecture,
 * EBCS codes, government structure manuals, garage manuals by brand & year, livestock,
 * grade-by-grade video tutoring, arts & crafts, cooking, medical, research, diaspora &
 * tourism, children's storybooks). English + Amharic titles; other UI languages fall back to English.
 */
import { CategoryId, DigitalProduct, GradeBand, Language, LocalizedText } from '../types';

const COVER_EBOOKS = '/__l5e/assets-v1/aa722536-1f04-401e-b74f-02b4a98d1fe6/cat_ebooks_guides_1794711378299.jpg';
const COVER_TEMPLATES = '/__l5e/assets-v1/05e90630-2aac-44b5-aefd-b0eaf33986c3/cat_excel_notion_1794711379736.jpg';
const COVER_COURSES = '/__l5e/assets-v1/f52a2402-5f9b-4fe5-883c-d4a7564c3932/cat_mini_courses_1794711380522.jpg';
const COVER_SOFTWARE = '/__l5e/assets-v1/03c26f18-f3ee-49f2-a502-15f75c496e97/cat_software_kits_1794711380943.jpg';
const COVER_ART = '/__l5e/assets-v1/88ecf9cf-8223-47e2-8694-90e81c469c8f/cat_digital_art_1794711381528.jpg';
const COVER_CULINARY = '/__l5e/assets-v1/f87215ce-bf90-4fa1-9b42-2e40f0c0a4af/cat_culinary_ethiopia_1794714175504.jpg';
const COVER_MEDICAL = '/__l5e/assets-v1/78057722-9c49-419a-a803-ba7c112fc0e6/cat_medical_research_1794714175983.jpg';
const COVER_CHILDREN = '/__l5e/assets-v1/686f8a54-d029-480b-850c-db820fd43143/cat_childrens_storybooks_1794714176025.jpg';
const COVER_LIVESTOCK = '/__l5e/assets-v1/ed98937d-ab75-47d2-a3df-b7b58b532ba5/cat_livestock_dairy_1794714176565.jpg';
const COVER_AI = '/__l5e/assets-v1/aa2c61fa-2248-4556-82c5-3de5721f4a81/cat_ai_prompts_1794711379515.jpg';

const PATTERNS: DigitalProduct['accentPattern'][] = ['diamond', 'lattice', 'horizon', 'prism', 'weave', 'arch'];
const ALL_LANGS: Language[] = ['en', 'am', 'om', 'ti', 'so'];

function L(en: string, am?: string): LocalizedText {
  return { en, am: am ?? en, om: en, ti: en, so: en };
}

const COVER_BY_CATEGORY: Partial<Record<CategoryId, string>> = {
  business_ideas: COVER_AI,
  taxpayer_ed: COVER_TEMPLATES,
  electronics_manuals: COVER_SOFTWARE,
  architecture_plans: COVER_ART,
  gov_manuals: COVER_EBOOKS,
  auto_mechanic: COVER_COURSES,
  livestock: COVER_LIVESTOCK,
  video_arts: COVER_ART,
  culinary: COVER_CULINARY,
  medical: COVER_MEDICAL,
  research_history: COVER_EBOOKS,
  business_diaspora: COVER_AI,
  childrens_books: COVER_CHILDREN,
};

let counter = 0;
function item(
  category: CategoryId,
  key: string,
  en: string,
  am: string,
  priceEtb: number,
  extra: Partial<DigitalProduct> & { video?: boolean } = {}
): DigitalProduct {
  counter++;
  const { video, ...rest } = extra;
  const highlights: Record<Language, string[]> = {
    en: video
      ? ['HD video lessons with chapter markers', 'Downloadable PDF companion guide', 'Choose your language track']
      : ['Complete, printable PDF guide', 'Practical Ethiopian examples', 'Lifetime access in your Vault'],
    am: video
      ? ['ኤችዲ የቪዲዮ ትምህርቶች በምዕራፍ', 'ተጓዳኝ PDF መመሪያ', 'የቋንቋ ምርጫ']
      : ['ሙሉ ሊታተም የሚችል PDF', 'ተግባራዊ የኢትዮጵያ ምሳሌዎች', 'በቮልትዎ ዘላቂ መዳረሻ'],
    om: [],
    ti: [],
    so: [],
  };
  highlights.om = highlights.en;
  highlights.ti = highlights.en;
  highlights.so = highlights.en;
  return {
    id: `lib-${category}-${key}`,
    sku: `LIB-${category.slice(0, 4).toUpperCase()}-${key.toUpperCase().slice(0, 10)}`,
    category,
    priceEtb,
    format: video ? 'MP4 Video Course + PDF' : 'PDF Guide',
    fileSize: video ? `${180 + (counter % 9) * 40} MB` : `${(2 + (counter % 8) * 0.9).toFixed(1)} MB`,
    fileExtension: 'html',
    coverImage: COVER_BY_CATEGORY[category] || COVER_EBOOKS,
    accentPattern: PATTERNS[counter % PATTERNS.length],
    availableLanguages: video ? ALL_LANGS : ['en', 'am'],
    hasVideoPreview: Boolean(video),
    videoChapters: video ? ['01. Introduction', '02. Step-by-step walkthrough', '03. Common mistakes & tips'] : undefined,
    title: L(en, am),
    description: L(`${en} — curated for Ethiopia, priced in ETB.`, `${am} — ለኢትዮጵያ የተዘጋጀ።`),
    highlights,
    sampleExcerpt: L(`${en}: chapter 1 preview.`, `${am}፡ የምዕራፍ 1 ናሙና።`),
    ...rest,
  };
}

const out: DigitalProduct[] = [];

// Business ideas & feasibility studies
[
  ['poultry', 'Poultry Farm (500 Layers) Feasibility Study', 'የዶሮ እርባታ (500 ዶሮዎች) የአዋጭነት ጥናት', 180],
  ['coffee-export', 'Coffee Processing & Export Business Plan', 'የቡና ማቀነባበሪያና ኤክስፖርት ቢዝነስ ፕላን', 250],
  ['block-making', 'Hollow Block Manufacturing Feasibility', 'የብሎኬት ማምረቻ አዋጭነት ጥናት', 200],
  ['bakery', 'Bakery & Bread Distribution Business Plan', 'የዳቦ ቤት እና ስርጭት ቢዝነስ ፕላን', 150],
  ['cafe', 'Café & Juice House Startup Guide', 'የካፌና ጁስ ቤት ማስጀመሪያ መመሪያ', 120],
  ['liquid-soap', 'Liquid Soap & Detergent Production Study', 'የፈሳሽ ሳሙና ማምረቻ ጥናት', 150],
  ['honey', 'Modern Beekeeping & Honey Packaging Plan', 'ዘመናዊ ንብ ማነብና ማር ማሸግ', 160],
  ['dairy-processing', 'Small Dairy Processing (Milk, Yogurt, Butter) Study', 'አነስተኛ የወተት ማቀነባበሪያ ጥናት', 220],
].forEach(([k, en, am, p]) => out.push(item('business_ideas', k as string, en as string, am as string, p as number)));

// Taxpayer education (VAT / TOT / Profit tax) — videos & guides
[
  ['vat-video', 'VAT (15%) Explained — Registration, Invoicing & Monthly Filing (Video)', 'ተጨማሪ እሴት ታክስ (15%) — ምዝገባ፣ ደረሰኝና ወርሃዊ ማሳወቂያ (ቪዲዮ)', 120, true],
  ['tot-video', 'Turnover Tax (TOT 2% / 10%) for Small Businesses (Video)', 'የተርን ኦቨር ታክስ (TOT) ለአነስተኛ ንግዶች (ቪዲዮ)', 100, true],
  ['profit-tax-video', 'Business Profit Tax — Category A, B & C Taxpayers (Video)', 'የንግድ ትርፍ ግብር — ደረጃ ሀ፣ ለ እና ሐ (ቪዲዮ)', 130, true],
  ['payroll-tax-guide', 'Employment Income Tax & Pension Contribution Guide', 'የሥራ ግብርና የጡረታ መዋጮ መመሪያ', 80, false],
  ['withholding-guide', 'Withholding Tax (2%) & TIN Compliance Guide', 'ተቀናሽ ግብር (2%) እና የግብር ከፋይ መለያ ቁጥር መመሪያ', 70, false],
  ['bookkeeping-guide', 'Simple Bookkeeping for Category C Taxpayers', 'ለደረጃ ሐ ግብር ከፋዮች ቀላል የሂሳብ አያያዝ', 60, false],
].forEach(([k, en, am, p, v]) => out.push(item('taxpayer_ed', k as string, en as string, am as string, p as number, { video: v as boolean })));

// Electronics photo & video manuals
[
  ['tv-repair', 'LED / Smart TV Repair — Photo & Video Manual', 'የኤልኢዲ / ስማርት ቲቪ ጥገና — የፎቶና ቪዲዮ ማኑዋል', 150, true],
  ['phone-repair', 'Smartphone Screen, Battery & Charging Port Repair (Video)', 'የስማርትፎን ስክሪን፣ ባትሪና ቻርጅ ፖርት ጥገና (ቪዲዮ)', 140, true],
  ['solar-install', 'Home Solar System Installation — Photo Manual', 'የቤት ሶላር ሲስተም ገጠማ — የፎቶ ማኑዋል', 120, false],
  ['fridge-repair', 'Refrigerator & Freezer Troubleshooting Manual', 'የማቀዝቀዣ ጥገና ማኑዋል', 110, false],
  ['cctv', 'CCTV Camera Installation & DVR Setup (Video)', 'የሲሲቲቪ ካሜራ ገጠማና ዲቪአር ዝግጅት (ቪዲዮ)', 130, true],
].forEach(([k, en, am, p, v]) => out.push(item('electronics_manuals', k as string, en as string, am as string, p as number, { video: v as boolean })));

// Architecture & AutoCAD plans + video training
[
  ['g1-villa', 'G+1 Villa Complete Plan Set (Architectural + Structural DWG)', 'የG+1 ቪላ ሙሉ ፕላን (አርክቴክቸራል + ስትራክቸራል)', 450],
  ['g2-apartment', 'G+2 Apartment Plan Set with BOQ', 'የG+2 አፓርትመንት ፕላን ከBOQ ጋር', 600],
  ['condo-renovation', 'Condominium Interior Renovation Plans', 'የኮንዶሚኒየም የውስጥ እድሳት ፕላኖች', 250],
  ['autocad-video', 'AutoCAD 2D & 3D Full Video Training (Amharic)', 'ሙሉ የአውቶካድ 2D እና 3D የቪዲዮ ስልጠና (በአማርኛ)', 350, true],
  ['revit-video', 'Revit Architecture for Ethiopian Projects (Video)', 'ሬቪት አርክቴክቸር ለኢትዮጵያ ፕሮጀክቶች (ቪዲዮ)', 380, true],
].forEach(([k, en, am, p, v]) => out.push(item('architecture_plans', k as string, en as string, am as string, p as number, { video: Boolean(v) })));

// EBCS 1–14 construction codes
[
  'Basis of Design & Actions on Structures',
  'Structural Use of Concrete',
  'Design of Steel Structures',
  'Design of Composite Steel & Concrete Structures',
  'Design of Timber Structures',
  'Design of Masonry Structures',
  'Foundations & Geotechnical Design',
  'Design of Structures for Earthquake Resistance',
  'Sanitary & Plumbing Installations',
  'Electrical Installations in Buildings',
  'Mechanical Services (HVAC & Lifts)',
  'Fire Safety & Protection of Buildings',
  'Building Planning, Accessibility & Architecture',
  'Building Construction Supervision & Quality Control',
].forEach((name, i) =>
  out.push(
    item('gov_manuals', `ebcs-${i + 1}`, `EBCS-${i + 1}: ${name}`, `ኢቢሲኤስ-${i + 1} (EBCS-${i + 1})፡ ${name}`, 90 + (i % 4) * 20, {
      format: 'PDF Code + Commentary',
    })
  )
);

// Government organisational structure & administrative manuals
[
  ['gov-structure', 'Ethiopian Federal Government Organizational Structure (2017 E.C.)', 'የኢትዮጵያ ፌዴራል መንግሥት አደረጃጀት (2017 ዓ.ም)', 120],
  ['civil-service', 'Civil Service Proclamation & HR Administration Manual', 'የሲቪል ሰርቪስ አዋጅና የሰው ሀብት አስተዳደር ማኑዋል', 150],
  ['procurement', 'Public Procurement & Property Administration Manual', 'የመንግሥት ግዥና ንብረት አስተዳደር ማኑዋል', 160],
  ['bsc', 'Balanced Scorecard (BSC) & Planning Manual for Public Offices', 'የባላንስድ ስኮርካርድ (BSC) እና ዕቅድ ማኑዋል', 130],
  ['office-letters', 'Official Letter Writing & Archiving Standards (Amharic)', 'የመደበኛ ደብዳቤ አጻጻፍና ማኅደር አያያዝ', 80],
].forEach(([k, en, am, p]) => out.push(item('gov_manuals', k as string, en as string, am as string, p as number)));

// Garage & auto mechanic manuals — searchable by brand & year
const CAR_MODELS: [string, string, string[]][] = [
  ['Toyota', 'Corolla', ['2000–2007', '2008–2013', '2014–2019', '2020–2025']],
  ['Toyota', 'Hilux / Vigo', ['2005–2015', '2016–2025']],
  ['Toyota', 'Land Cruiser 70/200', ['2007–2015', '2016–2025']],
  ['Toyota', 'Vitz / Yaris', ['2005–2010', '2011–2019']],
  ['Hyundai', 'Atos / i10', ['2008–2014', '2015–2023']],
  ['Hyundai', 'Elantra / Accent', ['2010–2016', '2017–2024']],
  ['Suzuki', 'Dzire / Swift', ['2012–2017', '2018–2025']],
  ['Isuzu', 'NPR / FSR Truck', ['2005–2015', '2016–2025']],
  ['Nissan', 'Patrol / Navara', ['2008–2016', '2017–2025']],
  ['Mitsubishi', 'L200 / Pajero', ['2006–2015', '2016–2024']],
  ['Volkswagen', 'Golf / Polo', ['2008–2016', '2017–2024']],
  ['Mercedes-Benz', 'Actros / Axor Truck', ['2005–2015', '2016–2024']],
  ['Sinotruk', 'HOWO Dump Truck', ['2010–2017', '2018–2025']],
  ['BYD', 'Atto 3 / Dolphin (EV)', ['2022–2025']],
  ['Bajaj', 'Qute / RE Three-Wheeler', ['2010–2018', '2019–2025']],
];
CAR_MODELS.forEach(([brand, model, years]) =>
  years.forEach((yr) =>
    out.push(
      item(
        'auto_mechanic',
        `${brand}-${model}-${yr}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        `${brand} ${model} (${yr}) Workshop Repair Manual — Engine, Gearbox, Electrical & Wiring`,
        `${brand} ${model} (${yr}) የጋራዥ ጥገና ማኑዋል — ሞተር፣ ጊር ቦክስና ኤሌክትሪክ`,
        brand === 'Mercedes-Benz' || brand === 'Sinotruk' || brand === 'Isuzu' ? 250 : 180,
        { carBrand: brand, modelYear: yr, format: 'PDF Workshop Manual + Wiring Diagrams' }
      )
    )
  )
);

// Livestock & animal husbandry videos / medication guides
[
  ['dairy-cattle', 'Dairy Cattle Feeding & Milk Yield (Video)', 'የወተት ላሞች መኖና የወተት ምርት (ቪዲዮ)', 150, true],
  ['sheep-goat', 'Sheep & Goat Fattening for Export (Video)', 'ለኤክስፖርት በግና ፍየል ማድለብ (ቪዲዮ)', 140, true],
  ['vet-meds', 'Livestock Medication & Vaccination Calendar Guide', 'የእንስሳት መድኃኒትና የክትባት መርሐ ግብር', 120, false],
  ['poultry-disease', 'Poultry Diseases — Signs, Treatment & Prevention', 'የዶሮ በሽታዎች — ምልክት፣ ሕክምናና መከላከያ', 100, false],
  ['fish-farming', 'Fish Farming (Tilapia) Pond Guide', 'የዓሣ እርባታ (ቲላፒያ) መመሪያ', 110, false],
].forEach(([k, en, am, p, v]) => out.push(item('livestock', k as string, en as string, am as string, p as number, { video: v as boolean })));

// Grade-by-grade video tutoring
for (let g = 1; g <= 12; g++) {
  out.push(
    item('video_arts', `tutor-g${g}`, `Grade ${g} Full-Year Video Tutoring (All Core Subjects)`, `የ${g}ኛ ክፍል የሙሉ ዓመት የቪዲዮ ማጠናከሪያ`, g <= 6 ? 120 : g <= 10 ? 180 : 250, {
      video: true,
      track: 'Grade Tutoring',
      gradeBand: `Grade ${g}` as GradeBand,
    })
  );
}
// Fine arts & handicrafts
[
  ['painting', 'Ethiopian Painting & Iconography Basics (ስነ-ጥበብ) — Video', 'የኢትዮጵያ ሥዕልና ቅብ መሠረታዊ (ስነ-ጥበብ)', 150, 'Fine Arts'],
  ['drawing', 'Pencil Drawing & Portrait Course (ስነ-ጥበብ)', 'የእርሳስ ሥዕልና ፖርትሬት ኮርስ', 120, 'Fine Arts'],
  ['basketry', 'Traditional Basketry (Mesob) Weaving (እደ-ጥበብ) — Video', 'ባህላዊ የመሶብ ስራ (እደ-ጥበብ)', 100, 'Handicrafts'],
  ['pottery', 'Pottery & Clay Craft (እደ-ጥበብ) — Video', 'የሸክላ ስራ (እደ-ጥበብ)', 110, 'Handicrafts'],
  ['weaving', 'Habesha Kemis & Netela Hand-Weaving (እደ-ጥበብ)', 'የሀበሻ ቀሚስና ነጠላ ሽመና (እደ-ጥበብ)', 130, 'Handicrafts'],
].forEach(([k, en, am, p, tr]) =>
  out.push(item('video_arts', k as string, en as string, am as string, p as number, { video: true, track: tr as DigitalProduct['track'] }))
);

// Cooking — Ethiopian & international
[
  ['doro-wat', 'Doro Wat & Holiday Dishes (Video Recipe)', 'ዶሮ ወጥና የበዓል ምግቦች (የቪዲዮ አሰራር)', 80, true],
  ['injera', 'Perfect Teff Injera at Home (Video)', 'ፍጹም የጤፍ እንጀራ በቤት (ቪዲዮ)', 60, true],
  ['fasting', 'Ethiopian Fasting (Tsom) Recipes Collection', 'የጾም ምግብ አሰራሮች ስብስብ', 70, false],
  ['italian', 'Italian Pasta & Pizza Masterclass (Video)', 'የጣልያን ፓስታና ፒዛ (ቪዲዮ)', 90, true],
  ['arabic', 'Arabic & Middle-Eastern Dishes (Video)', 'የአረብ ምግቦች (ቪዲዮ)', 90, true],
  ['cakes', 'Cakes, Pastries & Bakery Business Recipes', 'ኬክና የዳቦ ውጤቶች አሰራር', 100, false],
].forEach(([k, en, am, p, v]) => out.push(item('culinary', k as string, en as string, am as string, p as number, { video: v as boolean })));

// Medical & health research
[
  ['emergency-protocols', 'Ethiopian Emergency & Critical Care Protocols', 'የኢትዮጵያ የድንገተኛ ሕክምና ፕሮቶኮሎች', 220, 'Doctors & Students'],
  ['stg', 'Standard Treatment Guidelines (Hospitals) Summary', 'የሕክምና መመሪያ (STG) ማጠቃለያ', 200, 'Doctors & Students'],
  ['diabetes-patient', 'Living with Diabetes — Patient & Family Guide', 'ከስኳር በሽታ ጋር መኖር — ለታማሚና ቤተሰብ', 60, 'Patients & Families'],
  ['maternal', 'Pregnancy & Newborn Care Guide (Amharic)', 'የእርግዝናና የአራስ ልጅ እንክብካቤ መመሪያ', 60, 'Patients & Families'],
  ['hypertension', 'High Blood Pressure — Diet & Medication Guide', 'የደም ግፊት — የአመጋገብና መድኃኒት መመሪያ', 50, 'Patients & Families'],
].forEach(([k, en, am, p, aud]) =>
  out.push(item('medical', k as string, en as string, am as string, p as number, { audience: aud as DigitalProduct['audience'] }))
);

// Academic research, history & literature
[
  ['research-methods', 'Academic Research Methods & Thesis Writing (Ethiopian Universities)', 'የጥናትና ምርምር ዘዴ እና ቴሲስ አጻጻፍ', 150],
  ['adwa', 'The Battle of Adwa — History & Primary Sources', 'የዓድዋ ጦርነት — ታሪክና ምንጮች', 90],
  ['axum', 'Aksumite Civilization — Research Compendium', 'የአክሱም ሥልጣኔ — የጥናት ስብስብ', 100],
  ['amharic-lit', 'Classic Amharic Literature Anthology', 'የአማርኛ ሥነ-ጽሑፍ ስብስብ', 80],
  ['spss', 'SPSS & STATA for Research Data Analysis', 'SPSS እና STATA ለጥናት መረጃ ትንተና', 160],
].forEach(([k, en, am, p]) => out.push(item('research_history', k as string, en as string, am as string, p as number)));

// Diaspora guide + interactive tourist guide
[
  ['neighborhoods', 'Diaspora Guide: Best Addis Neighborhoods to Buy or Rent (Bole, CMC, Ayat, Summit, Lebu)', 'የዳያስፖራ መመሪያ፡ ለመግዛት ወይም ለመከራየት ምርጥ የአዲስ አበባ ሰፈሮች', 200],
  ['diaspora-business', 'Diaspora Business Guide: Investment, Licensing & Foreign Currency Accounts', 'የዳያስፖራ ቢዝነስ መመሪያ፡ ኢንቨስትመንት፣ ፈቃድና የውጭ ምንዛሪ ሂሳብ', 250],
  ['real-estate-law', 'Buying Property in Ethiopia — Legal Checklist for Diaspora', 'በኢትዮጵያ ንብረት መግዛት — ለዳያስፖራ የሕግ ዝርዝር', 180],
  ['tour-north', 'Tourist Guide: Historic Route (Lalibela, Gondar, Axum, Bahir Dar)', 'የቱሪስት መመሪያ፡ ታሪካዊ መስመር (ላሊበላ፣ ጎንደር፣ አክሱም፣ ባሕር ዳር)', 120],
  ['tour-south', 'Tourist Guide: Omo Valley, Arba Minch & Rift Valley Lakes', 'የቱሪስት መመሪያ፡ ኦሞ ሸለቆ፣ አርባ ምንጭና የስምጥ ሸለቆ ሀይቆች', 120],
  ['tour-east', 'Tourist Guide: Harar Jugol, Dire Dawa & Danakil Depression', 'የቱሪስት መመሪያ፡ ሐረር ጁጎል፣ ድሬዳዋና ዳናክል', 120],
].forEach(([k, en, am, p]) => out.push(item('business_diaspora', k as string, en as string, am as string, p as number)));

// Printable children's storybooks
[
  ['lion-mouse', 'The Lion and the Clever Mouse (Printable, Amharic & English)', 'አንበሳውና ብልኋ አይጥ (ሊታተም የሚችል)', 40],
  ['abebe-school', "Abebe's First Day at School (Printable Picture Book)", 'የአበበ የመጀመሪያ የትምህርት ቀን', 40],
  ['fidel-coloring', 'Fidel Alphabet Colouring Book (ሀ–ፐ)', 'የፊደል ቀለም መቀቢያ መጽሐፍ (ሀ–ፐ)', 35],
  ['animal-tales', 'Ethiopian Animal Folktales Collection', 'የኢትዮጵያ የእንስሳት ተረቶች ስብስብ', 50],
  ['bedtime-om', 'Bedtime Stories in Afaan Oromoo & Amharic', 'የመኝታ ሰዓት ተረቶች በአፋን ኦሮሞና አማርኛ', 45],
].forEach(([k, en, am, p]) => out.push(item('childrens_books', k as string, en as string, am as string, p as number)));

export const GENERATED_LIBRARY: DigitalProduct[] = out;
