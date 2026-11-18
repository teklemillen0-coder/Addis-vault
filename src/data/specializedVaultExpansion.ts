import { CategoryId, DigitalProduct, Language, LocalizedText } from '../types';

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

const COVER_BY_CATEGORY: Partial<Record<CategoryId, string>> = {
  repair_kits: COVER_SOFTWARE,
  architecture_plans: COVER_ART,
  auto_mechanic: COVER_COURSES,
  medical: COVER_MEDICAL,
  law_academy: COVER_EBOOKS,
  taxpayer_ed: COVER_TEMPLATES,
  gov_manuals: COVER_EBOOKS,
  business_diaspora: COVER_AI,
  business_ideas: COVER_AI,
  research_history: COVER_EBOOKS,
  childrens_books: COVER_CHILDREN,
  livestock: COVER_LIVESTOCK,
  electronics_manuals: COVER_SOFTWARE,
  culinary: COVER_CULINARY,
  video_arts: COVER_COURSES,
};

function L(en: string, am?: string): LocalizedText {
  return { en, am: am ?? en, om: en, ti: en, so: en };
}

let seq = 0;
function entry(
  category: CategoryId,
  key: string,
  en: string,
  am: string,
  priceEtb: number,
  extra: Partial<DigitalProduct> = {}
): DigitalProduct {
  seq++;
  const highlights: Record<Language, string[]> = {
    en: ['Verified Ethiopian & international reference edition', 'Indexed tables, diagrams & worked examples', 'Offline-ready encrypted Vault access'],
    am: ['የተረጋገጠ የኢትዮጵያና ዓለም አቀፍ ማጣቀሻ', 'ዝርዝር ሰንጠረዦች፣ ሥዕሎችና ምሳሌዎች', 'ከመስመር ውጭ በቮልት የሚነበብ'],
    om: ['Madda mirkanaa’aa Itoophiyaa fi addunyaa', 'Gabatee fi fakkeenya qabatamaa', 'Vault keessatti yeroo hunda banaa'],
    ti: ['ዝተረጋገጸ መወከሲ ጽሑፍ', 'ዝርዝር ሰንጠረዣትን ምሳሌታትን', 'ብቐሊሉ ኣብ Vault ዝንበብ'],
    so: ['Tixraac la hubiyay oo Itoobiya & caalami ah', 'Shaxanno iyo tusaalooyin dhammaystiran', 'Kaydka Vault ee offline la akhrin karo'],
  };
  return {
    id: `exp-${category}-${key}`,
    sku: `EXP-${category.slice(0, 4).toUpperCase()}-${key.toUpperCase().slice(0, 10)}`,
    category,
    priceEtb,
    format: extra.hasVideoPreview ? 'Video + PDF Reference' : 'PDF Reference Vault',
    fileSize: `${(2.4 + (seq % 8) * 1.1).toFixed(1)} MB`,
    fileExtension: 'html',
    coverImage: COVER_BY_CATEGORY[category] || COVER_EBOOKS,
    accentPattern: PATTERNS[seq % PATTERNS.length],
    availableLanguages: ALL_LANGS,
    title: L(en, am),
    description: L(`${en} — curated Ethiopian & international practitioner reference.`, `${am} — ለባለሙያዎችና ተማሪዎች የተዘጋጀ።`),
    highlights,
    sampleExcerpt: L(`${en}: executive summary, key standards & practical checklist.`, `${am}፡ የመግቢያ ናሙና እና ዋና መመሪያ።`),
    ...extra,
  };
}

export const SPECIALIZED_VAULT_EXPANSION: DigitalProduct[] = [
  // Repair Kits & Workshop Schematics (10 new)
  entry('repair_kits', 'iphone-pcb', 'iPhone 11–16 Motherboard Power & Charging Diagnostic Schematic Pack', 'የአይፎን 11–16 ማዘርቦርድ ፓወር እና ቻርጂንግ ጥገና መመሪያ', 260),
  entry('repair_kits', 'samsung-a-series', 'Samsung Galaxy A14–A55 Schematic, PMIC Pinout & Display Repair Kit', 'የሳምሰንግ ጋላክሲ A ተከታታይ ስልክ ቦርድና ስክሪን ጥገና', 220),
  entry('repair_kits', 'tecno-infinix', 'Tecno & Infinix MTK/SPD Boot, Baseband & Charging Circuit Bench Manual', 'የቴክኖ እና ኢንፊኒክስ ስልክ ሶፍትዌርና ሃርድዌር ጥገና መመሪያ', 190),
  entry('repair_kits', 'laptop-power-rails', 'Laptop Motherboard 3V/5V/19V Power Rail Tracing & MOSFET Testing', 'የላፕቶፕ ማዘርቦርድ ፓወር ሬይል እና ሞስፌት መፈተሻ መመሪያ', 280),
  entry('repair_kits', 'solar-inverter', 'Hybrid Solar Inverter (3kVA–10kVA) MPPT & IGBT Bench Repair Guide', 'የሶላር ኢንቨርተር እና MPPT መቆጣጠሪያ ጥገና መመሪያ', 290),
  entry('repair_kits', 'printer-copier', 'Laser Printer & Photocopier Fuser, Drum & Error Code Service Pack', 'የሌዘር ፕሪንተር እና ፎቶኮፒ ማሽን ጥገናና የኤረር ኮድ መፍቻ', 210),
  entry('repair_kits', 'fridge-ac-inverter', 'Inverter Refrigerator & Split AC PCB Compressor Diagnostic Manual', 'የኢንቨርተር ፍሪጅና ኤሲ ኮምፕረሰር ጥገና መመሪያ', 240),
  entry('repair_kits', 'tv-tcon-backlight', 'LED/Smart TV Mainboard, T-Con & LED Backlight Voltage Conversion Kit', 'የስማርት ቲቪ ቲ-ኮን እና ባክላይት ጥገና መመሪያ', 220),
  entry('repair_kits', 'washing-machine-pcb', 'Front-Load Washing Machine Drain Pump, Triac & Error Code Kit', 'የልብስ ማጠቢያ ማሽን ቦርድ እና የኤረር ኮድ ጥገና', 190),
  entry('repair_kits', 'ups-voltage-reg', 'Office UPS, AVR Stabilizer & Battery Management Circuit Repair Guide', 'የUPS እና ቮልቴጅ ስታቢላይዘር ጥገና መመሪያ', 180),

  // Architecture, Engineering & EBCS Codes (10 new)
  entry('architecture_plans', 'ebcs-1-4-structural', 'Ethiopian Building Codes (EBCS 1–4): Actions, Concrete & Steel Worked Examples', 'የኢትዮጵያ የሕንጻ ኮድ (EBCS 1–4) የስትራክቸራል ዲዛይን ምሳሌዎች', 350),
  entry('architecture_plans', 'ebcs-7-8-seismic', 'EBCS-7 Geotechnics & EBCS-8 Seismic Design for Addis & Rift Valley Zones', 'EBCS-7 የአፈር ምርመራ እና EBCS-8 የመሬት መንቀጥቀጥ ዲዛይን', 360),
  entry('architecture_plans', 'era-highway-geom', 'Ethiopian Roads Authority (ERA) Geometric & Pavement Design Summary', 'የኢትዮጵያ መንገዶች ባለሥልጣን የመንገድና ፔቭመንት ዲዛይን መመሪያ', 340),
  entry('architecture_plans', 'g2-villa-cad', 'Modern Ethiopian G+2 Family Villa Full Floor Plan, Elevation & BOQ Sheet', 'ዘመናዊ G+2 መኖሪያ ቤት ፕላንና ሙሉ የዋጋ ግምት (BOQ)', 320),
  entry('architecture_plans', 'g4-mixed-commercial', 'G+4 Mixed-Use Commercial Building Architectural & Rebar Detailing Pack', 'የG+4 የንግድና መኖሪያ ሕንጻ ፕላንና የብረት ዝርዝር (Bar Bending)', 390),
  entry('architecture_plans', 'boq-takeoff-excel', 'Ethiopian Construction Quantity Surveying, Take-Off & Unit Rate Workbook', 'የግንባታ ቁጥር ሥራ (Take-Off) እና የዋጋ ትመና ኤክሴል መመሪያ', 280),
  entry('architecture_plans', 'mep-plumbing-elec', 'Ethiopian Residential Plumbing, Septic & Electrical Conduit Layout Standards', 'የቤት ውስጥ ውሃ፣ ፍሳሽ እና ኤሌክትሪክ መስመር ዝርጋታ ስታንዳርድ', 250),
  entry('architecture_plans', 'water-supply-rural', 'Gravity-Fed Rural Water Supply, Borehole & Reservoir Hydraulic Design Guide', 'የገጠር ንጹሕ ውሃ አቅርቦትና የውሃ ማጠራቀሚያ ዲዛይን መመሪያ', 290),

  // Medical, Pharmacology & Nursing Vault (6 new)
  entry('medical', 'eth-stg-primary', 'Ethiopian Primary Healthcare Standard Treatment Guidelines (STG) Quick Index', 'የኢትዮጵያ መደበኛ የሕክምና መመሪያ (STG) ፈጣን ማጣቀሻ', 240, { audience: 'Doctors & Students' }),
  entry('medical', 'icu-emergency-drugs', 'Emergency Room & ICU Vasopressor, Antibiotic & Antidote Dosing Tables', 'የድንገተኛ ክፍልና አይሲዩ መድኃኒት መጠን ሰንጠረዥ', 260, { audience: 'Doctors & Students' }),
  entry('medical', 'pediatric-neonatal', 'Ethiopian NICU & Pediatric Weight-Based Dosing & Resuscitation Protocols', 'የሕፃናትና አራስ ሕክምና የመድኃኒት መጠን መመሪያ', 250, { audience: 'Doctors & Students' }),
  entry('medical', 'obgyn-emocon', 'Maternal Health, Preeclampsia, PPH & Safe Delivery Clinical Pocketbook', 'የእናቶች ጤና፣ ደም መፍሰስ እና ወሊድ ክሊኒካል መመሪያ', 240, { audience: 'Doctors & Students' }),
  entry('medical', 'family-chronic-care', 'Diabetes, Hypertension & Kidney Diet Workbook for Ethiopian Families', 'የስኳር እና ደም ግፊት ሕመምተኞች የቤት ውስጥ አመጋገብ መመሪያ', 130, { audience: 'Patients & Families' }),
  entry('medical', 'mother-baby-first-year', 'Newborn Feeding, Vaccination Calendar & Danger Signs Guide for Parents', 'የአራስ ልጅ አመጋገብ፣ ክትባትና የአደጋ ምልክቶች መመሪያ', 120, { audience: 'Patients & Families' }),

  // Law, Tax & Government Reference Sources (9 new)
  entry('law_academy', 'commercial-code-1243', 'Commercial Code Proclamation No. 1243/2021 Structured Comparison Guide', 'የንግድ ሕግ አዋጅ ቁጥር 1243/2021 ዝርዝር ማብራሪያ', 290, { lawSection: 'Codes & Proclamations' }),
  entry('law_academy', 'labour-proclamation-1156', 'Ethiopian Labour Proclamation 1156/2019 Termination, Leave & Severance Manual', 'የአሠሪና ሠራተኛ አዋጅ 1156/2019 የካሳና የሥራ ውል መመሪያ', 240, { lawSection: 'Codes & Proclamations' }),
  entry('law_academy', 'cassation-vol-20-26', 'Federal Supreme Court Cassation Binding Precedents Digest (Vol. 20–26)', 'የፌዴራል ጠቅላይ ፍርድ ቤት ሰበር ሰሚ ችሎት ውሳኔዎች ማጠቃለያ', 320, { lawSection: 'Cassation Decisions' }),
  entry('taxpayer_ed', 'vat-income-tax-979', 'Income Tax 979/2016, VAT & Withholding Reconciliation Monthly Playbook', 'የገቢ ግብር አዋጅ 979/2016፣ ተ.እ.ታ እና ዊዝሆልዲንግ ታክስ ማስታወቂያ', 210),
  entry('taxpayer_ed', 'customs-hs-clearance', 'Ethiopian Customs Commission HS Tariff, Franco-Valuta & Bonded Clearance Guide', 'የኢትዮጵያ ጉምሩክ ታሪፍ እና ዕቃ ማስወጫ ሥርዓት መመሪያ', 250),
  entry('taxpayer_ed', 'category-ab-books', 'Category A & B Bookkeeping, Depreciation Rates & Audit Defense Manual', 'የደረጃ ሀ እና ለ ግብር ከፋዮች የሂሳብ መዝገብ አያያዝ መመሪያ', 220),
  entry('gov_manuals', 'ethiotelecom-telebirr-api', 'Ethio Telecom Telebirr Merchant Integration, KYC & USSD Business Setup', 'የቴሌብር ነጋዴ አካውንት እና የክፍያ ሥርዓት አጠቃቀም መመሪያ', 150),
  entry('gov_manuals', 'land-lease-building-permit', 'Urban Land Lease Auction, Title Deed Transfer & Building Permit Checklist', 'የከተማ ቦታ ሊዝ፣ የካርታ ዝውውር እና የግንባታ ፈቃድ መመሪያ', 180),
  entry('gov_manuals', 'import-export-nbe-fx', 'NBE Foreign Exchange Directive, L/C, CAD & Export Retention Rules Handbook', 'የብሔራዊ ባንክ የውጭ ምንዛሪ፣ L/C እና ኤክስፖርት መመሪያ', 240),

  // Auto Mechanic Brand/Year Packs (6 new)
  entry('auto_mechanic', 'suzuki-dzire-2020', 'Suzuki Dzire / Swift K12M (2018–2024) AMT Gearbox & Maintenance Manual', 'የሱዙኪ ዲዛየር (2018–2024) የሞተር እና AMT ጊርቦክስ ጥገና', 230, { carBrand: 'Suzuki', modelYear: '2020–2024' }),
  entry('auto_mechanic', 'byd-ev-diagnostics', 'BYD Seagull / Dolphin / Atto 3 (2022–2026) High-Voltage & BMS Service Guide', 'የBYD ኤሌክትሪክ መኪና ባትሪ (BMS) እና ጥገና መመሪያ', 290, { carBrand: 'BYD', modelYear: '2022–2026' }),
  entry('auto_mechanic', 'toyota-hilux-1gd', 'Toyota Hilux & Fortuner 1GD/2GD-FTV (2016–2024) DPF, Injector & 4WD Guide', 'የቶዮታ ሀይላክስ (2016–2024) ኢንጀክተር እና DPF ጥገና', 280, { carBrand: 'Toyota', modelYear: '2016–2024' }),
  entry('auto_mechanic', 'sinotruck-howo-371', 'SinoTruck HOWO 371 / Euro-3–5 Common Rail & Air Brake Workshop Manual', 'የሳይኖትራክ ሃዎ 371 ኮመን ሬይል እና የአየር ፍሬን ጥገና መመሪያ', 310, { carBrand: 'SinoTruck', modelYear: '2015–2024' }),
  entry('auto_mechanic', 'isuzu-npr-nkr', 'Isuzu NPR / NQR 4HK1 (2012–2022) Turbo, Clutch & Wiring Fault Guide', 'የኢሱዙ NPR 4HK1 ሞተር፣ ተርቦ እና የኤሌክትሪክ ገመድ ጥገና', 260, { carBrand: 'Isuzu', modelYear: '2012–2022' }),
  entry('auto_mechanic', 'hyundai-atus-i10', 'Hyundai Atos, i10 & Tucson (2010–2022) Sensor Pinout & Timing Chain Kit', 'የሀዩንዳይ አቶስ እና i10 ሴንሰርና ታይሚንግ ሰንሰለት ጥገና', 210, { carBrand: 'Hyundai', modelYear: '2010–2022' }),

  // Diaspora, Tourism, Livestock, IT & Children's Books (14 new)
  entry('business_diaspora', 'hawassa-bahirdar-invest', 'Regional Cities Business & Tourism Guide: Hawassa, Bahir Dar, Adama & Dire Dawa', 'የክልል ከተሞች ቢዝነስና ቱሪዝም መመሪያ (ሐዋሳ፣ ባሕር ዳር፣ አዳማ፣ ድሬዳዋ)', 160),
  entry('business_diaspora', 'lalibela-axum-simien', 'Historic North Circuit Heritage & Eco-Lodge Operations Guide (Lalibela, Gondar, Axum)', 'የሰሜን ኢትዮጵያ ታሪካዊ ቦታዎች ቱሪዝምና ኢኮ-ሎጅ መመሪያ', 170),
  entry('business_diaspora', 'diaspora-origin-id-bank', 'Ethiopian Diaspora Yellow Card, Tax-Free Privileges & Diaspora Mortgage Banking', 'የዳያስፖራ ቢጫ ካርድ፣ ባንክ አካውንት እና የቤት ባለቤትነት መመሪያ', 150),
  entry('business_ideas', 'cloud-saas-ethiopia', 'Building SaaS, Telebirr Checkouts & B2B Software Agencies in Ethiopia', 'በኢትዮጵያ የሶፍትዌር (SaaS) እና ቴሌብር ቢዝነስ መገንቢያ መመሪያ', 210),
  entry('business_ideas', 'cold-chain-avocado', 'Avocado, Mango & Cold-Chain Agro-Export Business Feasibility Plan', 'የአቮካዶ እና ፍራፍሬ ቀዝቃዛ ሰንሰለት ኤክስፖርት አዋጭነት ጥናት', 220),
  entry('electronics_manuals', 'mikrotik-isp-wisp', 'MikroTik RouterOS, PPPoE & Campus Wi-Fi Hotspot Deployment Guide', 'የማይክሮቲክ ራውተር እና ሆትስፖት ኔትወርክ መዘርጊያ መመሪያ', 230),
  entry('electronics_manuals', 'cctv-nvr-access', 'Hikvision / Dahua IP Camera NVR, PoE & Biometric Access Control Manual', 'የCCTV ካሜራ (IP/NVR) እና የጣት አሻራ መቆጣጠሪያ መገጣጠሚያ', 210),
  entry('electronics_manuals', 'esp32-plc-automation', 'Industrial PLC & ESP32 Telemetry for Ethiopian Factories & Greenhouses', 'የኢንዱስትሪ PLC እና ስማርት ግሪንሃውስ ቁጥጥር መመሪያ', 260),
  entry('livestock', 'dairy-mastitis-silage', 'Crossbred Dairy Cow Nutrition, Silage Making & Mastitis Prevention Manual', 'የተሻሻለ የወተት ላም አመጋገብ፣ ሳይሌጅ አዘገጃጀትና የጡት በሽታ መከላከያ', 160),
  entry('livestock', 'beef-feedlot-90day', '90-Day Borena Beef Cattle Feedlot Rationing & Export Weight Gain Guide', 'የቦረና ሰንጋ 90 ቀን ማድለቢያ የመኖ ስሌትና የጤና መመሪያ', 170),
  entry('livestock', 'sheep-goat-vaccines', 'Highland & Lowland Sheep & Goat Breeding, Deworming & Vaccine Calendar', 'የበግ እና ፍየል እርባታ፣ ትል ማጥፊያና የክትባት ቀን መቁጠሪያ', 140),
  entry('research_history', 'geez-manuscript-archive', 'Ge’ez Paleography, Ethiopian Calendrical Computations & Manuscript Heritage', 'የግዕዝ ብራና መጻሕፍት ጥናትና የኢትዮጵያ የቀን መቁጠሪያ ስሌት', 190),
  entry('research_history', 'academic-journal-thesis', 'Postgraduate Research Methodology, SPSS/R Data Analysis & Citation Handbook', 'የድህረ-ምረቃ ጥናትና ምርምር፣ የSPSS/R ዳታ ትንተና መመሪያ', 210),
  entry('childrens_books', 'fidel-animals-bilingual', 'Bilingual Amharic–English Fidel & Ethiopian Wildlife Illustrated Storybook', 'ባለሁለት ቋንቋ የፊደል እና የኢትዮጵያ የዱር እንስሳት የልጆች መጽሐፍ', 90, { gradeBand: 'G1-4' }),
  entry('childrens_books', 'oromo-tig-folktales', 'Illustrated Horn of Africa Folktales: Cleverness, Kindness & Teamwork (Ages 5–10)', 'የኢትዮጵያ ተረቶች በሥዕል፡ ብልህነት፣ ደግነት እና ኅብረት (ለልጆች)', 95, { gradeBand: 'G1-4' }),
  entry('culinary', 'export-spice-berbere', 'Artisanal Berbere, Mitmita, Korerima & Shiro Standardized Commercial Recipes', 'ለገበያና ለኤክስፖርት የሚሆን የበርበሬ፣ ሚጥሚጣና ሽሮ ደረጃውን የጠበቀ አዘገጃጀት', 140),
  entry('video_arts', 'premiere-motion-am', 'CapCut, Premiere Pro & Motion Graphics Course for Ethiopian YouTube Creators', 'ለኢትዮጵያ ዩቲዩበሮች የቪዲዮ ኤዲቲንግ (CapCut & Premiere) ኮርስ', 240, { track: 'Fine Arts', hasVideoPreview: true }),
];
