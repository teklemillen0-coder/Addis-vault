import { CategoryId, DigitalProduct, Language, LocalizedText } from "../types";

const COVER_EBOOKS =
  "/__l5e/assets-v1/aa722536-1f04-401e-b74f-02b4a98d1fe6/cat_ebooks_guides_1794711378299.jpg";
const COVER_TEMPLATES =
  "/__l5e/assets-v1/05e90630-2aac-44b5-aefd-b0eaf33986c3/cat_excel_notion_1794711379736.jpg";
const COVER_COURSES =
  "/__l5e/assets-v1/f52a2402-5f9b-4fe5-883c-d4a7564c3932/cat_mini_courses_1794711380522.jpg";
const COVER_SOFTWARE =
  "/__l5e/assets-v1/03c26f18-f3ee-49f2-a502-15f75c496e97/cat_software_kits_1794711380943.jpg";
const COVER_ART =
  "/__l5e/assets-v1/88ecf9cf-8223-47e2-8694-90e81c469c8f/cat_digital_art_1794711381528.jpg";
const COVER_MEDICAL =
  "/__l5e/assets-v1/78057722-9c49-419a-a803-ba7c112fc0e6/cat_medical_research_1794714175983.jpg";

type PracticalResource = {
  category: CategoryId;
  slug: string;
  title: string;
  amharicTitle: string;
  priceEtb: number;
};

const RESOURCE_DEFINITIONS: PracticalResource[] = [
  {
    category: "architecture_plans",
    slug: "autocad-site-plan",
    title: "AutoCAD Ethiopian Urban Plot Site-Plan Template Pack",
    amharicTitle: "የAutoCAD የኢትዮጵያ የከተማ ቦታ አቀማመጥ ንድፍ አብነት",
    priceEtb: 120,
  },
  {
    category: "architecture_plans",
    slug: "autocad-villa-details",
    title: "AutoCAD Villa Working Drawings: Plans, Sections & Details",
    amharicTitle: "የAutoCAD ቪላ የሥራ ሥዕሎች፡ ፕላን፣ ቆረጣና ዝርዝር",
    priceEtb: 140,
  },
  {
    category: "architecture_plans",
    slug: "small-clinic-layout",
    title: "Small Clinic Architectural Layout & Room Schedule Template",
    amharicTitle: "የትንሽ ክሊኒክ የሕንፃ አቀማመጥና የክፍል ዝርዝር አብነት",
    priceEtb: 110,
  },
  {
    category: "architecture_plans",
    slug: "reinforced-concrete-boq",
    title: "Reinforced-Concrete Takeoff, Bar Bending & BOQ Workbook",
    amharicTitle: "የኮንክሪት ብረት መጠን፣ የብረት መቁረጫና BOQ የስራ ደብተር",
    priceEtb: 130,
  },
  {
    category: "architecture_plans",
    slug: "mep-shop-drawings",
    title: "MEP Shop Drawing Coordination & Site Inspection Checklist",
    amharicTitle: "የMEP የሥራ ሥዕል ማስተባበሪያና የግንባታ ቦታ ቁጥጥር ዝርዝር",
    priceEtb: 100,
  },
  {
    category: "architecture_plans",
    slug: "road-drainage-design",
    title: "Urban Road Cross-Sections, Drainage & Quantity Templates",
    amharicTitle: "የከተማ መንገድ ቆረጣ፣ ፍሳሽና የመጠን ስሌት አብነቶች",
    priceEtb: 125,
  },
  {
    category: "architecture_plans",
    slug: "construction-tender-drawings",
    title: "Construction Tender Drawing Index & Submission Checklist",
    amharicTitle: "የግንባታ ጨረታ ሥዕል መዝገብና የማቅረቢያ ቁጥጥር ዝርዝር",
    priceEtb: 90,
  },
  {
    category: "business_ideas",
    slug: "laundry-feasibility",
    title: "Commercial Laundry Startup Plan & Equipment Cost Workbook",
    amharicTitle: "የንግድ ልብስ ማጠቢያ ማቋቋሚያ ዕቅድና የመሳሪያ ወጪ ስሌት",
    priceEtb: 110,
  },
  {
    category: "business_ideas",
    slug: "pharmacy-business-plan",
    title: "Community Pharmacy Business Plan & Launch Checklist",
    amharicTitle: "የማኅበረሰብ ፋርማሲ የንግድ ዕቅድና የማቋቋሚያ ዝርዝር",
    priceEtb: 120,
  },
  {
    category: "business_ideas",
    slug: "injera-bakery-feasibility",
    title: "Injera Bakery & Teff Processing Feasibility Workbook",
    amharicTitle: "የእንጀራ መጋገሪያና የጤፍ ማቀነባበሪያ አዋጭነት የስራ ደብተር",
    priceEtb: 100,
  },
  {
    category: "business_ideas",
    slug: "daycare-business-plan",
    title: "Daycare & Early Learning Center Business Plan Template",
    amharicTitle: "የሕፃናት ማቆያና የቅድመ ትምህርት ማዕከል የንግድ ዕቅድ",
    priceEtb: 90,
  },
  {
    category: "business_ideas",
    slug: "guesthouse-feasibility",
    title: "Regional Guesthouse Feasibility Study & Operations Planner",
    amharicTitle: "የክልል እንግዳ ማረፊያ አዋጭነት ጥናትና የሥራ ዕቅድ",
    priceEtb: 120,
  },
  {
    category: "business_ideas",
    slug: "solar-installation-business",
    title: "Solar Installation Microbusiness Plan & Quotation Sheets",
    amharicTitle: "የሶላር ተከላ አነስተኛ ንግድ ዕቅድና የዋጋ ጥቅስ ቅጾች",
    priceEtb: 110,
  },
  {
    category: "business_ideas",
    slug: "export-coffee-plan",
    title: "Coffee Export Readiness Plan, Costing & Shipment Checklist",
    amharicTitle: "የቡና ኤክስፖርት ዝግጅት ዕቅድ፣ የወጪ ስሌትና የጭነት ቁጥጥር",
    priceEtb: 130,
  },
  {
    category: "taxpayer_ed",
    slug: "vat-monthly-reconciliation",
    title: "VAT Monthly Reconciliation & Filing Preparation Workbook",
    amharicTitle: "የተ.እ.ታ ወርሃዊ ማስታረቂያና ለማስገባት የዝግጅት የስራ ደብተር",
    priceEtb: 90,
  },
  {
    category: "taxpayer_ed",
    slug: "withholding-tax-tracker",
    title: "Withholding Tax Certificate & Payment Tracking Templates",
    amharicTitle: "የዊዝሆልዲንግ ታክስ ሰርተፍኬትና የክፍያ መከታተያ አብነቶች",
    priceEtb: 80,
  },
  {
    category: "taxpayer_ed",
    slug: "payroll-paye-workbook",
    title: "Payroll, PAYE & Pension Contribution Calculation Workbook",
    amharicTitle: "የደመወዝ፣ PAYEና የጡረታ መዋጮ ስሌት የስራ ደብተር",
    priceEtb: 95,
  },
  {
    category: "taxpayer_ed",
    slug: "small-business-ledger",
    title: "Small Business Daily Ledger, Expense & Cashbook Templates",
    amharicTitle: "የአነስተኛ ንግድ ዕለታዊ መዝገብ፣ ወጪና የጥሬ ገንዘብ አብነቶች",
    priceEtb: 80,
  },
  {
    category: "taxpayer_ed",
    slug: "customs-import-costing",
    title: "Import Landed-Cost Calculator & Customs Document Checklist",
    amharicTitle: "የገቢ ዕቃ የወጪ ስሌትና የጉምሩክ ሰነድ ቁጥጥር ዝርዝር",
    priceEtb: 110,
  },
  {
    category: "taxpayer_ed",
    slug: "tax-audit-preparation",
    title: "Tax Audit Document Organizer & Reconciliation Checklist",
    amharicTitle: "የታክስ ኦዲት ሰነድ ማደራጃና የማስታረቂያ ቁጥጥር ዝርዝር",
    priceEtb: 95,
  },
  {
    category: "gov_manuals",
    slug: "public-tender-response",
    title: "Public Procurement Tender Response & Compliance Matrix Templates",
    amharicTitle: "የመንግሥት ግዥ ጨረታ ምላሽና የመስፈርት ማረጋገጫ አብነቶች",
    priceEtb: 120,
  },
  {
    category: "gov_manuals",
    slug: "bid-pricing-schedule",
    title: "Tender Bid Pricing Schedule, BOQ Review & Submission Checklist",
    amharicTitle: "የጨረታ ዋጋ ሰንጠረዥ፣ BOQ ግምገማና የማቅረቢያ ቁጥጥር",
    priceEtb: 100,
  },
  {
    category: "gov_manuals",
    slug: "supplier-registration-pack",
    title: "Supplier Registration Profile & Business Qualification Document Pack",
    amharicTitle: "የአቅራቢ ምዝገባ መገለጫና የንግድ ብቃት ሰነድ ጥቅል",
    priceEtb: 90,
  },
  {
    category: "gov_manuals",
    slug: "contract-delivery-tracker",
    title: "Public Contract Deliverables, Milestone & Acceptance Tracker",
    amharicTitle: "የመንግሥት ውል ማስረከቢያ፣ የሥራ ደረጃና ተቀባይነት መከታተያ",
    priceEtb: 100,
  },
  {
    category: "gov_manuals",
    slug: "ngo-project-proposal",
    title: "Ethiopian NGO Project Proposal, Logframe & Budget Templates",
    amharicTitle: "የኢትዮጵያ NGO ፕሮጀክት ሀሳብ፣ ሎግፍሬምና በጀት አብነቶች",
    priceEtb: 110,
  },
  {
    category: "gov_manuals",
    slug: "business-license-renewal",
    title: "Business License Renewal & Regulatory Document Checklist",
    amharicTitle: "የንግድ ፈቃድ እድሳትና የቁጥጥር ሰነድ ዝርዝር",
    priceEtb: 80,
  },
  {
    category: "medical",
    slug: "nursing-board-mcq",
    title: "Nursing Board Exam Review: Core Concepts & Practice Questions",
    amharicTitle: "የነርሲንግ ቦርድ ፈተና ዝግጅት፡ መሠረታዊ ጽንሰ ሐሳቦችና ልምምድ",
    priceEtb: 120,
  },
  {
    category: "medical",
    slug: "pharmacy-board-review",
    title: "Pharmacy Board Exam Review: Pharmacology & Practice Questions",
    amharicTitle: "የፋርማሲ ቦርድ ፈተና ዝግጅት፡ ፋርማኮሎጂና የልምምድ ጥያቄዎች",
    priceEtb: 130,
  },
  {
    category: "medical",
    slug: "midwifery-board-review",
    title: "Midwifery Board Exam Review: Maternal & Newborn Care Cases",
    amharicTitle: "የአዋላጅነት ቦርድ ፈተና ዝግጅት፡ የእናቶችና አራስ ሕፃናት ጉዳዮች",
    priceEtb: 120,
  },
  {
    category: "medical",
    slug: "medical-lab-board-review",
    title: "Medical Laboratory Board Exam Review & Case-Based Questions",
    amharicTitle: "የሕክምና ላቦራቶሪ ቦርድ ፈተና ዝግጅትና በጉዳይ ላይ የተመሠረቱ ጥያቄዎች",
    priceEtb: 125,
  },
  {
    category: "medical",
    slug: "public-health-board-review",
    title: "Public Health Board Exam Review: Epidemiology & Biostatistics",
    amharicTitle: "የሕዝብ ጤና ቦርድ ፈተና ዝግጅት፡ ኤፒዲሚዮሎጂና ባዮስታቲስቲክስ",
    priceEtb: 115,
  },
  {
    category: "medical",
    slug: "clinical-case-notes",
    title: "Clinical Case Presentation, SOAP Notes & Handover Templates",
    amharicTitle: "የክሊኒካል ጉዳይ ማቅረቢያ፣ SOAP ማስታወሻና የፈረቃ ርክክብ አብነቶች",
    priceEtb: 90,
  },
  {
    category: "medical",
    slug: "medical-research-protocol",
    title: "Health Research Protocol, Ethics Submission & Data Collection Forms",
    amharicTitle: "የጤና ምርምር ፕሮቶኮል፣ የሥነ ምግባር ማመልከቻና የመረጃ መሰብሰቢያ ቅጾች",
    priceEtb: 100,
  },
  {
    category: "auto_mechanic",
    slug: "hybrid-battery-diagnostics",
    title: "Hybrid Vehicle Battery Health, Cooling & Diagnostic Workflow Guide",
    amharicTitle: "የሃይብሪድ መኪና ባትሪ ጤና፣ ማቀዝቀዣና የምርመራ ሂደት መመሪያ",
    priceEtb: 135,
  },
  {
    category: "auto_mechanic",
    slug: "toyota-hybrid-inverter",
    title: "Toyota Hybrid Inverter Cooling & Fault-Finding Reference",
    amharicTitle: "የToyota ሃይብሪድ ኢንቨርተር ማቀዝቀዣና የብልሽት ማግኛ ማጣቀሻ",
    priceEtb: 140,
  },
  {
    category: "auto_mechanic",
    slug: "common-rail-diesel",
    title: "Common-Rail Diesel Injector Testing & Fuel-System Troubleshooting",
    amharicTitle: "የCommon-Rail ዲዝል ኢንጀክተር ሙከራና የነዳጅ ስርዓት ችግር መፍቻ",
    priceEtb: 125,
  },
  {
    category: "auto_mechanic",
    slug: "heavy-equipment-hydraulics",
    title: "Heavy Equipment Hydraulic Fault Diagnosis & Service Log",
    amharicTitle: "የከባድ ማሽን ሃይድሮሊክ ብልሽት ምርመራና የጥገና መዝገብ",
    priceEtb: 145,
  },
  {
    category: "auto_mechanic",
    slug: "excavator-undercarriage",
    title: "Excavator Undercarriage Inspection & Preventive Maintenance Guide",
    amharicTitle: "የኤክስካቫተር የታችኛው ክፍል ምርመራና መከላከያ ጥገና መመሪያ",
    priceEtb: 120,
  },
  {
    category: "auto_mechanic",
    slug: "air-brake-truck",
    title: "Commercial Truck Air-Brake Diagnosis & Workshop Checklist",
    amharicTitle: "የንግድ መኪና የአየር ፍሬን ምርመራና የጋራዥ ቁጥጥር ዝርዝር",
    priceEtb: 110,
  },
  {
    category: "repair_kits",
    slug: "diesel-generator-service",
    title: "Diesel Generator Preventive Maintenance & Fault Log Pack",
    amharicTitle: "የዲዝል ጀነሬተር መከላከያ ጥገናና የብልሽት መዝገብ ጥቅል",
    priceEtb: 100,
  },
  {
    category: "repair_kits",
    slug: "industrial-motor-winding",
    title: "Three-Phase Motor Testing, Winding & Commissioning Worksheets",
    amharicTitle: "የሶስት ፌዝ ሞተር ሙከራ፣ የኮይል ሥራና ማስጀመሪያ የስራ ወረቀቶች",
    priceEtb: 110,
  },
  {
    category: "repair_kits",
    slug: "solar-pv-installation",
    title: "Solar PV Sizing, Installation & Commissioning Checklist Pack",
    amharicTitle: "የሶላር PV መጠን ስሌት፣ ተከላና ማስጀመሪያ ዝርዝር ጥቅል",
    priceEtb: 105,
  },
  {
    category: "repair_kits",
    slug: "refrigeration-service",
    title: "Commercial Refrigeration Service, Leak-Test & Maintenance Log",
    amharicTitle: "የንግድ ማቀዝቀዣ ጥገና፣ የፍሳሽ ሙከራና የጥገና መዝገብ",
    priceEtb: 95,
  },
  {
    category: "repair_kits",
    slug: "building-electrical-inspection",
    title: "Building Electrical Inspection, Earthing & Test Record Templates",
    amharicTitle: "የሕንፃ ኤሌክትሪክ ምርመራ፣ መሬት ማያያዣና የሙከራ መዝገብ አብነቶች",
    priceEtb: 90,
  },
  {
    category: "repair_kits",
    slug: "welding-wps-workbook",
    title: "Welding Procedure, Consumables & Fabrication Inspection Workbook",
    amharicTitle: "የብየዳ ሂደት፣ የሥራ እቃዎችና የማምረቻ ምርመራ የስራ ደብተር",
    priceEtb: 100,
  },
  {
    category: "research_history",
    slug: "thesis-proposal-template",
    title: "University Thesis Proposal, Chapter Outline & Defense Planner",
    amharicTitle: "የዩኒቨርሲቲ ቴሲስ ሀሳብ፣ የምዕራፍ አቀማመጥና የመከላከያ ዕቅድ",
    priceEtb: 90,
  },
  {
    category: "research_history",
    slug: "systematic-review-screening",
    title: "Systematic Literature Review Search & Screening Workbook",
    amharicTitle: "የሥነ ጽሑፍ ግምገማ ፍለጋና የጥናት ምርጫ የስራ ደብተር",
    priceEtb: 85,
  },
  {
    category: "research_history",
    slug: "survey-data-dictionary",
    title: "Research Survey Codebook, Data Dictionary & Cleaning Log",
    amharicTitle: "የምርምር መጠይቅ ኮድ መዝገብ፣ የመረጃ መዝገበ ቃላትና የማጽዳት መዝገብ",
    priceEtb: 80,
  },
  {
    category: "research_history",
    slug: "field-research-consent",
    title: "Field Research Consent, Interview & Focus-Group Form Templates",
    amharicTitle: "የመስክ ምርምር ፈቃድ፣ ቃለ መጠይቅና የቡድን ውይይት ቅጾች",
    priceEtb: 85,
  },
  {
    category: "research_history",
    slug: "research-budget-timeline",
    title: "Research Budget, Fieldwork Timeline & Deliverables Planner",
    amharicTitle: "የምርምር በጀት፣ የመስክ ሥራ ጊዜ ሰሌዳና የውጤት ዕቅድ",
    priceEtb: 85,
  },
  {
    category: "research_history",
    slug: "data-analysis-report",
    title: "Quantitative Data Analysis Table & Results Chapter Template",
    amharicTitle: "የመጠናዊ መረጃ ትንተና ሰንጠረዥና የውጤት ምዕራፍ አብነት",
    priceEtb: 95,
  },
  {
    category: "research_history",
    slug: "thesis-defense-slides",
    title: "Thesis Defense Slide Structure, Timing & Question Planner",
    amharicTitle: "የቴሲስ መከላከያ ስላይድ አቀማመጥ፣ ጊዜና የጥያቄ ዝግጅት",
    priceEtb: 80,
  },
  {
    category: "law_academy",
    slug: "commercial-lease-template",
    title: "Commercial Premises Lease Agreement & Handover Checklist",
    amharicTitle: "የንግድ ቦታ ኪራይ ውልና የርክክብ ቁጥጥር ዝርዝር",
    priceEtb: 100,
  },
  {
    category: "law_academy",
    slug: "employment-contract-pack",
    title: "Employment Agreement, Job Description & Exit Checklist Pack",
    amharicTitle: "የሥራ ውል፣ የሥራ መግለጫና የመልቀቂያ ቁጥጥር ጥቅል",
    priceEtb: 95,
  },
  {
    category: "law_academy",
    slug: "service-agreement-template",
    title: "Professional Services Agreement, Scope & Change-Order Templates",
    amharicTitle: "የሙያ አገልግሎት ውል፣ የሥራ ወሰንና የለውጥ ትዕዛዝ አብነቶች",
    priceEtb: 90,
  },
  {
    category: "law_academy",
    slug: "construction-subcontract",
    title: "Construction Subcontract, Variation & Site Handover Templates",
    amharicTitle: "የግንባታ ንዑስ ውል፣ የለውጥ ሥራና የቦታ ርክክብ አብነቶች",
    priceEtb: 110,
  },
  {
    category: "law_academy",
    slug: "sales-distribution-agreement",
    title: "Sales, Distribution & Commission Agreement Template Pack",
    amharicTitle: "የሽያጭ፣ ስርጭትና ኮሚሽን ውል አብነት ጥቅል",
    priceEtb: 95,
  },
  {
    category: "law_academy",
    slug: "nda-confidentiality-pack",
    title: "Confidentiality, Non-Disclosure & Data-Handling Agreement Templates",
    amharicTitle: "የምስጢር ጥበቃ፣ ይፋ አለማድረግና የመረጃ አያያዝ ውል አብነቶች",
    priceEtb: 85,
  },
  {
    category: "electronics_manuals",
    slug: "fiber-network-installation",
    title: "Fiber-Optic Link Budget, Splicing & Installation Field Worksheets",
    amharicTitle: "የፋይበር ኦፕቲክ ሊንክ በጀት፣ ስፕላይሲንግና የተከላ የመስክ ወረቀቶች",
    priceEtb: 105,
  },
  {
    category: "electronics_manuals",
    slug: "cctv-site-survey",
    title: "CCTV Camera Site Survey, Storage Sizing & Commissioning Sheets",
    amharicTitle: "የCCTV ካሜራ የቦታ ጥናት፣ የማከማቻ መጠንና የማስጀመሪያ ቅጾች",
    priceEtb: 90,
  },
  {
    category: "electronics_manuals",
    slug: "solar-inverter-sizing",
    title: "Solar Inverter, Battery Bank & Protection Sizing Worksheet",
    amharicTitle: "የሶላር ኢንቨርተር፣ የባትሪ ስብስብና የጥበቃ መጠን ስሌት",
    priceEtb: 100,
  },
  {
    category: "electronics_manuals",
    slug: "network-cabling-labels",
    title: "Structured Network Cabling, Rack Elevation & Port-Label Templates",
    amharicTitle: "የኔትወርክ ኬብል፣ የራክ አቀማመጥና የፖርት መለያ አብነቶች",
    priceEtb: 85,
  },
  {
    category: "electronics_manuals",
    slug: "plc-maintenance-log",
    title: "PLC Panel Commissioning, I/O Map & Maintenance Log Templates",
    amharicTitle: "የPLC ፓነል ማስጀመሪያ፣ I/O ካርታና የጥገና መዝገብ አብነቶች",
    priceEtb: 110,
  },
  {
    category: "electronics_manuals",
    slug: "access-control-install",
    title: "Access Control, Biometric Reader & Door Hardware Installation Guide",
    amharicTitle: "የመግቢያ ቁጥጥር፣ የጣት አሻራ አንባቢና የበር እቃ ተከላ መመሪያ",
    priceEtb: 95,
  },
  {
    category: "livestock",
    slug: "dairy-farm-records",
    title: "Dairy Farm Milk Yield, Feed & Animal Health Record Templates",
    amharicTitle: "የወተት እርሻ የወተት ምርት፣ መኖና የእንስሳት ጤና መዝገብ አብነቶች",
    priceEtb: 80,
  },
  {
    category: "livestock",
    slug: "poultry-vaccination-tracker",
    title: "Poultry Flock Vaccination, Mortality & Feed-Use Tracker",
    amharicTitle: "የዶሮ ክትባት፣ የሞት መጠንና የመኖ አጠቃቀም መከታተያ",
    priceEtb: 80,
  },
  {
    category: "livestock",
    slug: "beekeeping-harvest-log",
    title: "Beekeeping Apiary Inspection, Harvest & Hive Treatment Log",
    amharicTitle: "የንብ ማነብ ቀፎ ምርመራ፣ ማር መሰብሰብና የቀፎ ሕክምና መዝገብ",
    priceEtb: 80,
  },
  {
    category: "livestock",
    slug: "sheep-goat-breeding-record",
    title: "Sheep & Goat Breeding, Weight & Veterinary Visit Records",
    amharicTitle: "የበግና ፍየል እርባታ፣ ክብደትና የእንስሳት ሐኪም ጉብኝት መዝገቦች",
    priceEtb: 80,
  },
  {
    category: "livestock",
    slug: "fish-farm-water-log",
    title: "Small Fish Farm Water Quality, Feeding & Harvest Planner",
    amharicTitle: "የትንሽ ዓሣ እርሻ የውሃ ጥራት፣ አመጋገብና የምርት ዕቅድ",
    priceEtb: 85,
  },
  {
    category: "livestock",
    slug: "irrigation-farm-calendar",
    title: "Smallholder Irrigation Crop Calendar, Input & Harvest Records",
    amharicTitle: "የአነስተኛ እርሻ መስኖ የሰብል ቀን መቁጠሪያ፣ ግብዓትና የምርት መዝገብ",
    priceEtb: 80,
  },
];

const COVERS: Partial<Record<CategoryId, string>> = {
  architecture_plans: COVER_ART,
  business_ideas: COVER_EBOOKS,
  taxpayer_ed: COVER_TEMPLATES,
  gov_manuals: COVER_TEMPLATES,
  medical: COVER_MEDICAL,
  auto_mechanic: COVER_COURSES,
  repair_kits: COVER_SOFTWARE,
  research_history: COVER_EBOOKS,
  law_academy: COVER_EBOOKS,
  electronics_manuals: COVER_SOFTWARE,
  livestock: COVER_EBOOKS,
};

const PATTERNS: DigitalProduct["accentPattern"][] = [
  "diamond",
  "lattice",
  "horizon",
  "prism",
  "weave",
  "arch",
];
const LANGUAGES: Language[] = ["en", "am", "om", "ti", "so"];

function localized(en: string, am: string): LocalizedText {
  return { en, am, om: en, ti: en, so: en };
}

function makeResource(resource: PracticalResource, index: number): DigitalProduct {
  return {
    id: `av26-${resource.slug}`,
    sku: `AV26-${resource.slug.toUpperCase().slice(0, 12)}`,
    category: resource.category,
    priceEtb: resource.priceEtb,
    format: "Practical Reference & Template Pack",
    fileSize: "1.2 MB",
    fileExtension: "html",
    coverImage: COVERS[resource.category] || COVER_EBOOKS,
    accentPattern: PATTERNS[index % PATTERNS.length],
    availableLanguages: LANGUAGES,
    title: localized(resource.title, resource.amharicTitle),
    description: localized(
      `${resource.title}. A practical Ethiopian-focused reference and editable planning resource.`,
      `${resource.amharicTitle}። ለኢትዮጵያ ሁኔታ የተዘጋጀ ተግባራዊ ማጣቀሻና ሊስተካከል የሚችል የዕቅድ ሰነድ።`,
    ),
    highlights: {
      en: [
        "Practical topic-focused reference",
        "Reusable planning and record templates",
        "Accessible through the Addis-Vault library",
      ],
      am: [
        "በርዕሱ ላይ ያተኮረ ተግባራዊ ማጣቀሻ",
        "እንደገና ሊጠቀሙባቸው የሚችሉ የዕቅድና መዝገብ አብነቶች",
        "በአዲስ-ቫውልት ቤተ-መጻሕፍት የሚገኝ",
      ],
      om: [
        "Madda qabatamaa mata-duree irratti xiyyeeffate",
        "Unka karooraa fi galmee irra deebi’anii fayyadaman",
        "Mana kitaabaa Addis-Vault keessatti argama",
      ],
      ti: [
        "ኣብ ርእሲ ዘተኮረ ተግባራዊ መወከሲ",
        "እንደገና ዝጥቀሙሎም ኣብነታት መደብን መዝገብን",
        "ኣብ ቤተ-መጻሕፍቲ Addis-Vault ይርከብ",
      ],
      so: [
        "Tixraac wax ku ool ah oo mawduuca diiradda saaraya",
        "Qaabab qorshe iyo diiwaan dib loo isticmaali karo",
        "Waxaa laga heli karaa maktabadda Addis-Vault",
      ],
    },
    sampleExcerpt: localized(
      `${resource.title}: overview, planning prompts and reusable checklist.`,
      `${resource.amharicTitle}፡ አጠቃላይ መግቢያ፣ የዕቅድ ጥያቄዎችና እንደገና የሚጠቀሙበት ዝርዝር።`,
    ),
  };
}

export const CATALOG_PRACTICAL_RESOURCES = RESOURCE_DEFINITIONS.map(makeResource);
