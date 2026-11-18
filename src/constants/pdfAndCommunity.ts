import {
  OwnerTrustProfile,
  PdfExportFormatOption,
} from '../types';

export const PDF_EXPORT_TIERS: PdfExportFormatOption[] = [
  {
    id: 'pdf_clean',
    fileExt: 'pdf',
    priceEtb: 50,
    label: {
      en: 'Clean Final PDF (.pdf)',
      am: 'ንጹህ PDF ፋይል (.pdf)',
      om: 'Faayila PDF Qulqulluu (.pdf)',
      ti: 'ጽሩይ PDF ፋይል (.pdf)',
      so: 'Fayl PDF Nadiif ah (.pdf)',
    },
    description: {
      en: 'Filled PDF fields + AI formatted layout ready to print or submit.',
      am: 'የተሞሉ ቅጾች እና በAI የተስተካከለ PDF ለህትመት ወይም ለመላክ ዝግጁ።',
      om: 'Unka guutamee fi maxxansaaf qophaaʼe.',
      ti: 'ዝተመልአ ቅጥዕታትን ንሕትመት ዝተዳለወ PDF።',
      so: 'Foomam la buuxiyay oo diyaar u ah daabacaad.',
    },
  },
  {
    id: 'word_editable',
    fileExt: 'doc',
    priceEtb: 75,
    label: {
      en: 'Editable Word Document (.doc)',
      am: 'የሚስተካከል የWord ፋይል (.doc)',
      om: 'Faayila Word Sirreeffamu (.doc)',
      ti: 'ዝመዓራረ Word ፋይል (.doc)',
      so: 'Fayl Word la tafatiri karo (.doc)',
    },
    description: {
      en: 'Opens cleanly in Microsoft Word / Google Docs for further edits.',
      am: 'በMicrosoft Word ወይም Google Docs ውስጥ ተጨማሪ ማስተካከያ ለማድረግ።',
      om: 'Microsoft Word fi Google Docs keessatti salphaatti banama.',
      ti: 'ኣብ Microsoft Word ወይ Google Docs ብቐሊሉ ይኽፈት።',
      so: 'Si fudud ugu furma Microsoft Word & Google Docs.',
    },
  },
  {
    id: 'png_highres',
    fileExt: 'png',
    priceEtb: 30,
    label: {
      en: 'High-Res Document Image (.png)',
      am: 'ጥራት ያለው ምስል (.png)',
      om: 'Suuraa Qulqullina Olaanaa (.png)',
      ti: 'ጽሩይ ስእሊ (.png)',
      so: 'Sawir Tayada Sare ah (.png)',
    },
    description: {
      en: 'Crisp A4 PNG image ideal for Telegram, WhatsApp, or portal uploads.',
      am: 'በቴሌግራም፣ በዋትስአፕ ወይም በኦንላይን ፖርታል ለመላክ ምቹ የሆነ ምስል።',
      om: 'Telegram, WhatsApp fi poortaaliif mijataa.',
      ti: 'ብTelegram፣ WhatsApp ወይ ኦንላይን ንምልኣኽ ምቹው።',
      so: 'Ku habboon Telegram, WhatsApp ama dirista degdegga ah.',
    },
  },
  {
    id: 'all_bundle',
    fileExt: 'pdf',
    priceEtb: 100,
    label: {
      en: 'Complete Bundle (PDF + Word + PNG)',
      am: 'ሙሉ ጥቅል (PDF + Word + PNG)',
      om: 'Paakeejii Guutuu (PDF + Word + PNG)',
      ti: 'ሙሉእ ጥቕላላ (PDF + Word + PNG)',
      so: 'Xirmo Dhammeystiran (PDF + Word + PNG)',
    },
    description: {
      en: 'Unlock all 3 output formats at once and save 55 ETB.',
      am: 'ሶስቱንም ቅርጾች በአንድ ጊዜ አውርደው 55 ብር ይቆጥቡ።',
      om: 'Bifa sadii walitti argachuun Birrii 55 qusadhu.',
      ti: 'ሰለስቲኦም ዓይነታት ብሓንሳብ ኣውሪድካ 55 ብር ቆጥብ።',
      so: 'Hel dhammaan 3-da nooc adigoo kaydsanaya 55 ETB.',
    },
  },
];

export const PDF_EXPORT_PRICE_MAP: Record<string, number> = PDF_EXPORT_TIERS.reduce(
  (acc, item) => {
    acc[item.id] = item.priceEtb;
    return acc;
  },
  {} as Record<string, number>
);

export interface StarterPdfTemplate {
  id: string;
  title: string;
  fields: { key: string; label: string; value: string }[];
  bodyText: string;
}

export const STARTER_PDF_TEMPLATES: StarterPdfTemplate[] = [
  {
    id: 'tpl_business_permit',
    title: 'Ethiopian Trade & License Application Form',
    fields: [
      { key: 'applicant_name', label: 'Applicant Full Name / የአመልካች ሙሉ ስም', value: '' },
      { key: 'tin_number', label: 'TIN Number / የግብር ከፋይ መለያ ቁጥር', value: '' },
      { key: 'subcity_woreda', label: 'City, Sub-City & Woreda / ክፍለ ከተማና ወረዳ', value: '' },
      { key: 'business_sector', label: 'Business Sector / የስራ ዘርፍ', value: '' },
      { key: 'capital_etb', label: 'Registered Capital (ETB) / ካፒታል', value: '' },
      { key: 'phone_number', label: 'Phone Number / ስልክ ቁጥር', value: '' },
    ],
    bodyText:
      'TO: Ministry of Trade & Regional Integration / Woreda Trade Office\n\nSubject: Application for Commercial Registration & Business License Renewal\n\nI respectfully submit this completed application form along with supporting TIN clearance and lease documentation for review and approval in accordance with Ethiopian Commercial Registration Proclamation.',
  },
  {
    id: 'tpl_office_letter',
    title: 'Bilingual Official Application / Clearance Form',
    fields: [
      { key: 'full_name', label: 'Full Name / ሙሉ ስም', value: '' },
      { key: 'id_or_student_no', label: 'ID / Employee / Student Number', value: '' },
      { key: 'department_office', label: 'Organization / University Office', value: '' },
      { key: 'request_date', label: 'Date / ቀን', value: new Date().toLocaleDateString() },
    ],
    bodyText:
      'Dear Sir / Madam,\n\nI kindly request processing of my official clearance / transcript verification document referenced above. Please update any missing lines or translate cleanly into Amharic or English using the AI Helper beside this form.',
  },
  {
    id: 'tpl_service_contract',
    title: 'Ethiopian Service & Consultancy Agreement',
    fields: [
      { key: 'client_party', label: 'First Party (Client)', value: '' },
      { key: 'provider_party', label: 'Second Party (Service Provider)', value: '' },
      { key: 'total_fee_etb', label: 'Agreed Contract Fee (ETB)', value: '' },
      { key: 'delivery_timeline', label: 'Completion Timeline', value: '' },
    ],
    bodyText:
      '1. Scope of Services: The Second Party agrees to deliver the project milestones specified in the schedule.\n2. Payment Terms: Settled via Telebirr or Commercial Bank of Ethiopia upon verified milestone acceptance.\n3. Governing Law: Governed by the Civil Code of Ethiopia.',
  },
];

export const OWNER_DEFAULT_PROFILE: OwnerTrustProfile = {
  fullName: 'Addis-Vault Owner',
  roleTitle: {
    en: 'Platform Owner',
    am: 'የመድረኩ ባለቤት',
    om: 'Abbaa Waltajjii',
    ti: 'ወናኒ መድረኽ',
    so: 'Mulkiilaha Madasha',
  },
  photoUrl: '',
  welcomeBio: {
    en: '',
    am: '',
    om: '',
    ti: '',
    so: '',
  },
  faydaStatement: {
    en: '',
    am: '',
    om: '',
    ti: '',
    so: '',
  },
  faydaMaskedCode: '',
  cityCountry: 'Addis Ababa, Ethiopia',
};
