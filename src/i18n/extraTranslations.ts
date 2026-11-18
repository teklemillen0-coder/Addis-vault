import { Language } from '../types';

/** Strings for features added in the Nov 2026 upgrade (kept separate from the original UI dictionary). */
export interface ExtraStrings {
  navLibrary: string;
  navCvLegal: string;
  navJobsStaff: string;
  navGroupChat: string;
  navVideoStudio: string;
  navUniversity: string;
  navDirectory: string;
  navAdStudio: string;
  loadMore: string;
  showingOf: string;
  uniTitle: string;
  uniSubtitle: string;
  uniYearLabel: string;
  uniDeptLabel: string;
  examArchiveTitle: string;
  examArchiveSubtitle: string;
  examGradeTab: string;
  answerKeyIncluded: string;
  dirTitle: string;
  dirSubtitle: string;
  dirSearchPlaceholder: string;
  dirRegisterTitle: string;
  dirFreeSearch: string;
  dirCall: string;
  videoTitle: string;
  videoSubtitle: string;
  adTitle: string;
  adSubtitle: string;
  videoTopic: string;
  videoLanguage: string;
  videoDuration: string;
  videoGenerate: string;
  videoPreviewFree: string;
  videoPayDownload: string;
  videoDownloadNow: string;
  videoShare: string;
  ownerGateTitle: string;
  ownerGateSubmit: string;
  ownerGateDenied: string;
  ownerGateSignIn: string;
  tourTitle: string;
  sectionCv: string;
  sectionPdf: string;
  sectionCourt: string;
  sectionLawyers: string;
  sectionJobs: string;
  sectionExpediter: string;
  sectionDirectory: string;
}

const en: ExtraStrings = {
  navLibrary: 'Library',
  navCvLegal: 'CV & Legal',
  navJobsStaff: 'Jobs & Staff',
  navGroupChat: 'Group Chat',
  navVideoStudio: 'AI Video',
  navUniversity: 'University Hub',
  navDirectory: 'Directory',
  navAdStudio: 'AI Ad Studio',
  loadMore: 'Show more',
  showingOf: 'Showing {shown} of {total}',
  uniTitle: 'University Hub (የዩኒቨርሲቲ ማዕከል)',
  uniSubtitle: 'Rare Mid, Final & National Exit exams bundled with course modules — 20 to 85 ETB.',
  uniYearLabel: 'Year',
  uniDeptLabel: 'Department',
  examArchiveTitle: 'National Ministry & Matric Exam Archive',
  examArchiveSubtitle: 'Every year, sorted by grade → year → subject, each with a detailed answer key.',
  examGradeTab: 'Grade',
  answerKeyIncluded: 'Answer key included',
  dirTitle: 'Business Location & Phone Directory',
  dirSubtitle: 'Searching is 100% free. Businesses list their location for 100–300 ETB.',
  dirSearchPlaceholder: 'Search business, service, area or phone…',
  dirRegisterTitle: 'List your business',
  dirFreeSearch: 'Free to search',
  dirCall: 'Call',
  videoTitle: 'AI Video Studio',
  videoSubtitle: 'Any topic, any language, any length. Preview free — pay only to download (1 min = 50 ETB; longer 120–500+ ETB).',
  adTitle: 'AI Video Ad Studio & Multi-Platform Publisher',
  adSubtitle: 'Promo videos in any language sized for TikTok, YouTube & Facebook — 150–500 ETB.',
  videoTopic: 'What is the video about?',
  videoLanguage: 'Video language',
  videoDuration: 'Length',
  videoGenerate: 'Generate preview',
  videoPreviewFree: 'Free watermarked preview',
  videoPayDownload: 'Pay & download',
  videoDownloadNow: 'Download video',
  videoShare: 'Share to TikTok / YouTube / Facebook',
  ownerGateTitle: 'Security Gate',
  ownerGateSubmit: 'Unlock',
  ownerGateDenied: 'Access denied.',
  ownerGateSignIn: 'Sign in to continue.',
  tourTitle: 'Interactive Tourist Guide',
  sectionCv: 'CV Studio',
  sectionPdf: 'PDF Filler',
  sectionCourt: 'Court Drafts & Consults',
  sectionLawyers: "Lawyers' Academy",
  sectionJobs: 'Workers & Employers',
  sectionExpediter: 'Expediter (ጉዳይ አስፈፃሚ)',
  sectionDirectory: 'Directory',
};

const am: ExtraStrings = {
  navLibrary: 'ቤተ-መጻሕፍት',
  navCvLegal: 'CV እና ሕግ',
  navJobsStaff: 'ስራ እና ሰራተኛ',
  navGroupChat: 'የቡድን ውይይት',
  navVideoStudio: 'AI ቪዲዮ',
  navUniversity: 'የዩኒቨርሲቲ ማዕከል',
  navDirectory: 'ማውጫ',
  navAdStudio: 'AI ማስታወቂያ',
  loadMore: 'ተጨማሪ አሳይ',
  showingOf: 'ከ{total} ውስጥ {shown} እየታዩ ነው',
  uniTitle: 'የዩኒቨርሲቲ ማዕከል',
  uniSubtitle: 'ብርቅ የሚድ፣ ፋይናል እና ብሔራዊ የመውጫ ፈተናዎች ከሞጁል ጋር — ከ20 እስከ 85 ብር።',
  uniYearLabel: 'ዓመት',
  uniDeptLabel: 'የትምህርት ክፍል',
  examArchiveTitle: 'የብሔራዊ ሚኒስትሪና የማትሪክ ፈተናዎች ማኅደር',
  examArchiveSubtitle: 'በየዓመቱ — በክፍል → ዓመት → ትምህርት ዓይነት የተደረደሩ፣ ከዝርዝር መልስ ቁልፍ ጋር።',
  examGradeTab: 'ክፍል',
  answerKeyIncluded: 'የመልስ ቁልፍ ተካትቷል',
  dirTitle: 'የንግድ አድራሻና የስልክ ማውጫ',
  dirSubtitle: 'መፈለግ 100% ነፃ ነው። ንግዶች አድራሻቸውን በ100–300 ብር ያስመዘግባሉ።',
  dirSearchPlaceholder: 'ንግድ፣ አገልግሎት፣ ሰፈር ወይም ስልክ ይፈልጉ…',
  dirRegisterTitle: 'ንግድዎን ያስመዝግቡ',
  dirFreeSearch: 'መፈለግ ነፃ',
  dirCall: 'ደውል',
  videoTitle: 'AI ቪዲዮ ስቱዲዮ',
  videoSubtitle: 'በማንኛውም ርዕስ፣ ቋንቋና ርዝመት። ቅድመ እይታ ነፃ — ለማውረድ ብቻ ይክፈሉ (1 ደቂቃ = 50 ብር፤ ረጅም 120–500+ ብር)።',
  adTitle: 'AI የቪዲዮ ማስታወቂያ ስቱዲዮ',
  adSubtitle: 'ለቲክቶክ፣ ዩቲዩብና ፌስቡክ የሚሆኑ ማስታወቂያዎች በማንኛውም ቋንቋ — 150–500 ብር።',
  videoTopic: 'ቪዲዮው ስለምንድን ነው?',
  videoLanguage: 'የቪዲዮ ቋንቋ',
  videoDuration: 'ርዝመት',
  videoGenerate: 'ቅድመ እይታ ፍጠር',
  videoPreviewFree: 'ነፃ ምልክት ያለው ቅድመ እይታ',
  videoPayDownload: 'ክፈልና አውርድ',
  videoDownloadNow: 'ቪዲዮውን አውርድ',
  videoShare: 'ወደ ቲክቶክ / ዩቲዩብ / ፌስቡክ አጋራ',
  ownerGateTitle: 'የደህንነት በር',
  ownerGateSubmit: 'ክፈት',
  ownerGateDenied: 'መዳረሻ ተከልክሏል።',
  ownerGateSignIn: 'ለመቀጠል ይግቡ።',
  tourTitle: 'በይነተገናኝ የቱሪስት መመሪያ',
  sectionCv: 'CV ስቱዲዮ',
  sectionPdf: 'PDF መሙያ',
  sectionCourt: 'የፍርድ ቤት ሰነዶችና ምክር',
  sectionLawyers: 'የሕግ ባለሙያዎች አካዳሚ',
  sectionJobs: 'ሰራተኞችና አሰሪዎች',
  sectionExpediter: 'ጉዳይ አስፈፃሚ',
  sectionDirectory: 'ማውጫ',
};

const om: ExtraStrings = {
  ...en,
  navLibrary: 'Mana Kitaabaa',
  navCvLegal: 'CV fi Seera',
  navJobsStaff: 'Hojii fi Hojjetaa',
  navGroupChat: 'Marii Garee',
  navVideoStudio: 'Viidiyoo AI',
  navUniversity: 'Giddugala Yuunivarsiitii',
  navDirectory: 'Kallattii',
  loadMore: "Dabalata agarsiisi",
  showingOf: '{shown} kan {total} keessaa',
  uniTitle: 'Giddugala Yuunivarsiitii',
  uniYearLabel: 'Waggaa',
  uniDeptLabel: 'Muummee',
  examArchiveTitle: 'Kuusaa Qormaata Ministeeraa fi Maatirikii',
  examGradeTab: 'Kutaa',
  dirTitle: 'Kallattii Iddoo fi Bilbila Daldalaa',
  dirSubtitle: 'Barbaaduun bilisa. Daldalli iddoo isaa qarshii 100–300n galmeessa.',
  videoTitle: 'Istuudiyoo Viidiyoo AI',
  videoGenerate: 'Agarsiisa uumi',
  videoPayDownload: 'Kaffali & buufadhu',
  ownerGateTitle: 'Karra Nageenyaa',
  ownerGateSubmit: 'Bani',
  tourTitle: 'Qajeelcha Turistii',
};

const ti: ExtraStrings = {
  ...en,
  navLibrary: 'ቤተ-መጻሕፍቲ',
  navCvLegal: 'CVን ሕግን',
  navJobsStaff: 'ስራሕን ሰራሕተኛን',
  navGroupChat: 'ናይ ጉጅለ ዕላል',
  navVideoStudio: 'AI ቪድዮ',
  navUniversity: 'ማእከል ዩኒቨርሲቲ',
  navDirectory: 'መምርሒ',
  loadMore: 'ተወሳኺ ኣርኢ',
  showingOf: 'ካብ {total} {shown}',
  uniTitle: 'ማእከል ዩኒቨርሲቲ',
  uniYearLabel: 'ዓመት',
  uniDeptLabel: 'ክፍሊ ትምህርቲ',
  examArchiveTitle: 'መዝገብ ፈተናታት ሚኒስትሪን ማትሪክን',
  examGradeTab: 'ክፍሊ',
  dirTitle: 'መምርሒ ኣድራሻን ተሌፎንን ንግዲ',
  dirSubtitle: 'ምድላይ ብነጻ። ንግድታት ብ100–300 ብር ይምዝገቡ።',
  videoTitle: 'AI ቪድዮ ስቱድዮ',
  videoGenerate: 'ቅድመ ርእይቶ ፍጠር',
  videoPayDownload: 'ክፈልን ኣውርድን',
  ownerGateTitle: 'ማዕጾ ድሕንነት',
  ownerGateSubmit: 'ክፈት',
  tourTitle: 'መምርሒ በጻሕቲ',
};

const so: ExtraStrings = {
  ...en,
  navLibrary: 'Maktabadda',
  navCvLegal: 'CV & Sharci',
  navJobsStaff: 'Shaqo & Shaqaale',
  navGroupChat: 'Wadahadal',
  navVideoStudio: 'Fiidiyow AI',
  navUniversity: 'Xarunta Jaamacadda',
  navDirectory: 'Hagaha',
  loadMore: 'Muuji wax badan',
  showingOf: '{shown} ka mid ah {total}',
  uniTitle: 'Xarunta Jaamacadda',
  uniYearLabel: 'Sannad',
  uniDeptLabel: 'Waaxda',
  examArchiveTitle: 'Kaydka Imtixaannada Wasaaradda & Matric',
  examGradeTab: 'Fasal',
  dirTitle: 'Hagaha Goobaha & Telefoonnada Ganacsiga',
  dirSubtitle: 'Raadintu waa bilaash. Ganacsiyadu waxay is diiwaangeliyaan 100–300 ETB.',
  videoTitle: 'Istuudiyaha Fiidiyowga AI',
  videoGenerate: 'Samee muuqaal',
  videoPayDownload: 'Bixi & soo deji',
  ownerGateTitle: 'Albaabka Amniga',
  ownerGateSubmit: 'Fur',
  tourTitle: 'Hagaha Dalxiiska',
};

export const EXTRA_T: Record<Language, ExtraStrings> = { en, am, om, ti, so };

export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}
