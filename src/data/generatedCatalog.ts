/**
 * Programmatically generated catalog sections:
 *  - Regional Grades 1–12 Student Textbooks + Teacher's Guides (14 regions, all subjects, regional languages)
 *  - National Ministry (Grade 6 & 8) and Matriculation (Grade 12) exam archive, year by year
 *  - University Hub (Freshman → 5th Year + National Exit Exam, 7 departments)
 *
 * Text is built from small dictionaries so every item has titles in all 5 UI languages,
 * while shared arrays (highlights) are reused by reference to keep memory low.
 */
import { DigitalProduct, EthiopianRegionId, GradeBand, Language, LocalizedText } from '../types';
import { ETHIOPIAN_REGIONS } from '../constants/educationRegions';

const COVER_EBOOKS = '/__l5e/assets-v1/aa722536-1f04-401e-b74f-02b4a98d1fe6/cat_ebooks_guides_1794711378299.jpg';
const COVER_TEMPLATES = '/__l5e/assets-v1/05e90630-2aac-44b5-aefd-b0eaf33986c3/cat_excel_notion_1794711379736.jpg';
const COVER_COURSES = '/__l5e/assets-v1/f52a2402-5f9b-4fe5-883c-d4a7564c3932/cat_mini_courses_1794711380522.jpg';
const COVER_AI = '/__l5e/assets-v1/aa2c61fa-2248-4556-82c5-3de5721f4a81/cat_ai_prompts_1794711379515.jpg';
const COVER_MEDICAL = '/__l5e/assets-v1/78057722-9c49-419a-a803-ba7c112fc0e6/cat_medical_research_1794714175983.jpg';
const COVER_SOFTWARE = '/__l5e/assets-v1/03c26f18-f3ee-49f2-a502-15f75c496e97/cat_software_kits_1794711380943.jpg';
const COVER_LIVESTOCK = '/__l5e/assets-v1/ed98937d-ab75-47d2-a3df-b7b58b532ba5/cat_livestock_dairy_1794714176565.jpg';

const LANGS: Language[] = ['en', 'am', 'om', 'ti', 'so'];
const PATTERNS: DigitalProduct['accentPattern'][] = ['diamond', 'lattice', 'horizon', 'prism', 'weave', 'arch'];

function L(en: string, am?: string, om?: string, ti?: string, so?: string): LocalizedText {
  return { en, am: am ?? en, om: om ?? en, ti: ti ?? en, so: so ?? en };
}

function map5(fn: (lang: Language) => string): LocalizedText {
  return { en: fn('en'), am: fn('am'), om: fn('om'), ti: fn('ti'), so: fn('so') };
}

function list5(fn: (lang: Language) => string[]): Record<Language, string[]> {
  return { en: fn('en'), am: fn('am'), om: fn('om'), ti: fn('ti'), so: fn('so') };
}

export const CURRICULUM_BADGE = 'New Curriculum 2016/2017 E.C.';

// ---------------------------------------------------------------------------
// Shared dictionaries
// ---------------------------------------------------------------------------

function gradeName(g: number, lang: Language): string {
  switch (lang) {
    case 'am':
      return `${g}ኛ ክፍል`;
    case 'om':
      return `Kutaa ${g}`;
    case 'ti':
      return `${g}ይ ክፍሊ`;
    case 'so':
      return `Fasalka ${g}aad`;
    default:
      return `Grade ${g}`;
  }
}

const ROLE_TEXT: Record<'student' | 'teacher', LocalizedText> = {
  student: L('Student Textbook', 'የተማሪ መጽሐፍ', 'Kitaaba Barataa', 'መጽሓፍ ተመሃራይ', 'Buugga Ardayga'),
  teacher: L("Teacher's Guide", 'የመምህር መምሪያ', 'Qajeelfama Barsiisaa', 'መምርሒ መምህር', 'Hagaha Macallinka'),
};

type SubjectKey =
  | 'mt'
  | 'english'
  | 'amharic'
  | 'math'
  | 'env'
  | 'gensci'
  | 'social'
  | 'citizen'
  | 'pva'
  | 'hpe'
  | 'cte'
  | 'it'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'geography'
  | 'history'
  | 'economics'
  | 'agri'
  | 'business';

const SUBJECTS: Record<Exclude<SubjectKey, 'mt'>, { en: string; text: LocalizedText }> = {
  english: { en: 'English', text: L('English', 'እንግሊዝኛ', 'Afaan Ingiliffaa', 'እንግሊዝኛ', 'Ingiriisi') },
  amharic: { en: 'Amharic', text: L('Amharic', 'አማርኛ', 'Afaan Amaaraa', 'ኣምሓርኛ', 'Amxaari') },
  math: { en: 'Mathematics', text: L('Mathematics', 'ሂሳብ', 'Herrega', 'ሒሳብ', 'Xisaab') },
  env: { en: 'Environmental Science', text: L('Environmental Science', 'የአካባቢ ሳይንስ', 'Saayinsii Naannoo', 'ሳይንስ ከባቢ', 'Sayniska Deegaanka') },
  gensci: { en: 'General Science', text: L('General Science', 'አጠቃላይ ሳይንስ', 'Saayinsii Waliigalaa', 'ሓፈሻዊ ሳይንስ', 'Sayniska Guud') },
  social: { en: 'Social Studies', text: L('Social Studies', 'ማኅበራዊ ሳይንስ', 'Barnoota Hawaasaa', 'ማሕበራዊ ትምህርቲ', 'Daraasaadka Bulshada') },
  citizen: { en: 'Citizenship / Civics', text: L('Citizenship Education', 'የዜግነት ትምህርት', 'Barnoota Lammummaa', 'ትምህርቲ ዜግነት', 'Waxbarashada Muwaadinimada') },
  pva: { en: 'Performing & Visual Arts', text: L('Performing & Visual Arts', 'ሥነ-ጥበባት', 'Aartii Agarsiisaa', 'ስነ-ጥበብ', 'Fanka Bandhigga') },
  hpe: { en: 'Health & Physical Education', text: L('Health & Physical Education', 'ጤናና የአካል ብቃት', 'Fayyaa fi Jabeenya Qaamaa', 'ጥዕናን ኣካላዊ ምንቅስቓስን', 'Caafimaadka & Jimicsiga') },
  cte: { en: 'Career & Technical Education', text: L('Career & Technical Education', 'የሙያና ቴክኒክ ትምህርት', 'Barnoota Ogummaa fi Teeknikaa', 'ትምህርቲ ሞያን ቴክኒክን', 'Waxbarashada Xirfadda') },
  it: { en: 'ICT', text: L('Information Technology', 'ኢንፎርሜሽን ቴክኖሎጂ', 'Teeknooloojii Odeeffannoo', 'ሓበሬታ ቴክኖሎጂ', 'Tiknoolajiyada Macluumaadka') },
  physics: { en: 'Physics', text: L('Physics', 'ፊዚክስ', 'Fiiziksii', 'ፊዚክስ', 'Fiisigis') },
  chemistry: { en: 'Chemistry', text: L('Chemistry', 'ኬሚስትሪ', 'Keemistirii', 'ኬሚስትሪ', 'Kimisteri') },
  biology: { en: 'Biology', text: L('Biology', 'ባዮሎጂ', 'Baayoloojii', 'ባዮሎጂ', 'Bayooloji') },
  geography: { en: 'Geography', text: L('Geography', 'ጂኦግራፊ', "Ji'oograafii", 'ጂኦግራፊ', 'Juqraafi') },
  history: { en: 'History', text: L('History', 'ታሪክ', 'Seenaa', 'ታሪኽ', 'Taariikh') },
  economics: { en: 'Economics', text: L('Economics', 'ኢኮኖሚክስ', 'Diinagdee', 'ኢኮኖሚክስ', 'Dhaqaalaha') },
  agri: { en: 'Agriculture', text: L('Agriculture', 'ግብርና', 'Qonna', 'ሕርሻ', 'Beeraha') },
  business: { en: 'General Business', text: L('General Business', 'አጠቃላይ ቢዝነስ', 'Daldala Waliigalaa', 'ሓፈሻዊ ንግዲ', 'Ganacsiga Guud') },
};

/** Regional language metadata: display label, subject label, and closest UI language code. */
const REGIONAL_LANGS: Record<string, { short: string; code: string; ui?: Language }> = {
  'አማርኛ (Amharic)': { short: 'Amharic', code: 'am', ui: 'am' },
  'Afaan Oromoo': { short: 'Afaan Oromoo', code: 'om', ui: 'om' },
  'ትግርኛ (Tigrinya)': { short: 'Tigrinya', code: 'ti', ui: 'ti' },
  'Af-Soomaali': { short: 'Af-Soomaali', code: 'so', ui: 'so' },
  'Sidaamu Afoo': { short: 'Sidaamu Afoo', code: 'sid' },
  Wolayttatto: { short: 'Wolayttatto', code: 'wal' },
  Hadiyyisa: { short: 'Hadiyyisa', code: 'hdy' },
  'Harari (ሐረሪ)': { short: 'Harari', code: 'har' },
  'Qafar Af (Afar)': { short: 'Qafar Af', code: 'aa' },
  'Nuer / Anyuak': { short: 'Nuer / Anyuak', code: 'nus' },
  English: { short: 'English', code: 'en', ui: 'en' },
};

/** Mother-tongue languages of instruction used in Grades 1–6 per region. */
export const REGION_MOTHER_TONGUES: Record<EthiopianRegionId, string[]> = {
  federal_addis: ['አማርኛ (Amharic)', 'Afaan Oromoo'],
  oromia: ['Afaan Oromoo'],
  amhara: ['አማርኛ (Amharic)'],
  tigray: ['ትግርኛ (Tigrinya)'],
  somali: ['Af-Soomaali'],
  sidama: ['Sidaamu Afoo'],
  central_ethiopia: ['Hadiyyisa', 'አማርኛ (Amharic)'],
  south_ethiopia: ['Wolayttatto', 'አማርኛ (Amharic)'],
  south_west_ethiopia: ['አማርኛ (Amharic)'],
  harari: ['Harari (ሐረሪ)', 'Afaan Oromoo'],
  dire_dawa: ['አማርኛ (Amharic)', 'Afaan Oromoo', 'Af-Soomaali'],
  afar: ['Qafar Af (Afar)'],
  benishangul_gumuz: ['አማርኛ (Amharic)'],
  gambella: ['Nuer / Anyuak'],
};

function subjectsForGrade(g: number): Exclude<SubjectKey, 'mt' | 'amharic'>[] {
  if (g <= 4) return ['english', 'math', 'env', 'pva', 'hpe'];
  if (g <= 6) return ['english', 'math', 'gensci', 'social', 'citizen', 'pva', 'hpe'];
  if (g <= 8) return ['english', 'math', 'gensci', 'social', 'citizen', 'cte', 'it', 'pva', 'hpe'];
  if (g <= 10) return ['english', 'math', 'physics', 'chemistry', 'biology', 'geography', 'history', 'citizen', 'economics', 'it', 'hpe'];
  return ['english', 'math', 'physics', 'chemistry', 'biology', 'agri', 'it', 'geography', 'history', 'economics', 'business'];
}

function textbookPrice(g: number, role: 'student' | 'teacher'): number {
  const base = g <= 4 ? 25 : g <= 6 ? 30 : g <= 8 ? 40 : g <= 10 ? 45 : 55;
  return Math.min(60, base + (role === 'teacher' ? 5 : 0));
}

const TEXTBOOK_HIGHLIGHTS: Record<'student' | 'teacher', Record<Language, string[]>> = {
  student: {
    en: ['All units of the New Curriculum 2016/2017 E.C.', 'Unit summaries, key terms & review exercises', 'Printable, offline-friendly PDF'],
    am: ['የአዲሱ ሥርዓተ ትምህርት 2016/2017 ዓ.ም ሙሉ ምዕራፎች', 'የምዕራፍ ማጠቃለያና መልመጃዎች', 'ሊታተም የሚችል ከመስመር ውጭ PDF'],
    om: ['Boqonnaalee guutuu Kaarikulamii Haaraa 2016/2017', 'Cuunfaa fi gilgaala boqonnaa', 'PDF maxxansamuu danda’u'],
    ti: ['ምሉእ ምዕራፋት ሓድሽ ስርዓተ ትምህርቲ 2016/2017', 'ጽማቝን ልምምድን ምዕራፍ', 'ዝሕተም PDF'],
    so: ['Dhammaan cutubyada Manhajka Cusub 2016/2017', 'Soo koobid & layliyo', 'PDF la daabici karo'],
  },
  teacher: {
    en: ["Lesson-by-lesson teaching plans & objectives", 'Answer keys for every exercise', 'Continuous assessment & grading rubrics'],
    am: ['የእያንዳንዱ ትምህርት የማስተማሪያ ዕቅድ', 'ለሁሉም መልመጃዎች የመልስ ቁልፍ', 'የተከታታይ ምዘና መስፈርቶች'],
    om: ['Karoora barsiisuu barnoota hundaaf', 'Furtuu deebii gilgaala hundaaf', 'Madaallii itti fufiinsaa'],
    ti: ['ናይ ነፍሲ ወከፍ ትምህርቲ መደብ ምምሃር', 'መፍትሕ መልሲ ንኹሉ ልምምድ', 'መለክዒ ቀጻሊ ገምጋም'],
    so: ['Qorshaha casharrada oo dhan', 'Furaha jawaabaha layli kasta', 'Qiimeynta joogtada ah'],
  },
};

const BAND_COVERS = [COVER_EBOOKS, COVER_COURSES, COVER_TEMPLATES, COVER_AI];

// ---------------------------------------------------------------------------
// 1) Regional textbooks
// ---------------------------------------------------------------------------

function buildTextbooks(): DigitalProduct[] {
  const out: DigitalProduct[] = [];
  let n = 0;
  for (const region of ETHIOPIAN_REGIONS) {
    const mts = REGION_MOTHER_TONGUES[region.id] || ['አማርኛ (Amharic)'];
    const firstMtIsAmharic = mts[0] === 'አማርኛ (Amharic)';
    for (let g = 1; g <= 12; g++) {
      type Row = { key: string; subjectEn: string; subjectText: LocalizedText; lang: string };
      const rows: Row[] = [];
      // Mother-tongue language subject for each regional language
      for (const mt of mts) {
        const meta = REGIONAL_LANGS[mt];
        rows.push({ key: `mt-${meta.code}`, subjectEn: meta.short === 'Amharic' ? 'Amharic' : meta.short, subjectText: L(meta.short === 'Amharic' ? 'Amharic' : meta.short, meta.short === 'Amharic' ? 'አማርኛ' : meta.short), lang: mt });
      }
      // Amharic as federal working language for non-Amharic regions (Grade 3+)
      if (!mts.includes('አማርኛ (Amharic)') && g >= 3) {
        rows.push({ key: 'amharic', subjectEn: 'Amharic', subjectText: SUBJECTS.amharic.text, lang: 'አማርኛ (Amharic)' });
      }
      for (const key of subjectsForGrade(g)) {
        const sub = SUBJECTS[key];
        if (key === 'english') {
          rows.push({ key, subjectEn: sub.en, subjectText: sub.text, lang: 'English' });
          continue;
        }
        if (g <= 6) {
          for (const mt of mts) {
            rows.push({ key: `${key}-${REGIONAL_LANGS[mt].code}`, subjectEn: sub.en, subjectText: sub.text, lang: mt });
          }
        } else {
          rows.push({ key, subjectEn: sub.en, subjectText: sub.text, lang: 'English' });
        }
      }
      void firstMtIsAmharic;

      for (const row of rows) {
        const isCorePreviousSubject =
          row.key.startsWith('mt-') ||
          row.key === 'english' ||
          row.key === 'math' ||
          row.key.startsWith('math-') ||
          row.key === 'amharic' ||
          row.key === 'physics' ||
          row.key.startsWith('env-') ||
          row.key.startsWith('gensci-');
        const editions: ('New Curriculum' | 'Previous Edition')[] = isCorePreviousSubject
          ? ['New Curriculum', 'Previous Edition']
          : ['New Curriculum'];

        for (const edition of editions) {
          const isPrev = edition === 'Previous Edition';
          const edYearLabel = isPrev ? '2008–2014 E.C.' : '2016/2017 E.C.';
          for (const role of ['student', 'teacher'] as const) {
            n++;
            const langMeta = REGIONAL_LANGS[row.lang];
            const avail: Language[] = Array.from(
              new Set<Language>([...(langMeta?.ui ? [langMeta.ui] : []), 'en', 'am'])
            );
            const gradeBand = `Grade ${g}` as GradeBand;
            const price = Math.max(20, textbookPrice(g, role) - (isPrev ? 5 : 0));
            out.push({
              id: `gt-${region.id}-g${g}-${row.key}-${role[0]}${isPrev ? '-prev' : ''}`,
              sku: `TB-${region.shortTag.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}-G${g}-${row.key.toUpperCase().slice(0, 7)}-${role === 'student' ? 'S' : 'T'}${isPrev ? 'P' : ''}`,
              category: 'education',
              regionId: region.id,
              instructionLanguage: row.lang,
              gradeBand,
              bookRole: role === 'student' ? 'Student Textbook' : "Teacher's Guide",
              subject: row.subjectEn,
              curriculumEdition: edition,
              curriculumYearLabel: edYearLabel,
              availableLanguages: avail,
              priceEtb: price,
              format: role === 'student' ? 'PDF Student Textbook' : "PDF Teacher's Guide",
              fileSize: `${(3 + ((g * 7 + n) % 9) * 0.6).toFixed(1)} MB`,
              fileExtension: 'html',
              coverImage: BAND_COVERS[(g + (role === 'teacher' ? 1 : 0)) % BAND_COVERS.length],
              accentPattern: PATTERNS[n % PATTERNS.length],
              title: map5(
                (lang) =>
                  `${region.name[lang]} · ${gradeName(g, lang)} ${row.subjectText[lang]} ${ROLE_TEXT[role][lang]}${row.subjectEn === (langMeta?.short || row.lang) ? '' : ` (${langMeta?.short || row.lang})`} — ${isPrev ? (lang === 'am' ? 'ቀደምት እትም' : 'Previous Ed.') : edYearLabel}`
              ),
              description: map5((lang) => {
                const head = `${region.name[lang]} · ${gradeName(g, lang)} · ${row.subjectText[lang]} · ${ROLE_TEXT[role][lang]}`;
                if (isPrev) {
                  if (lang === 'am') return `${head} — የቀድሞው ሥርዓተ ትምህርት (2008–2014 ዓ.ም) ማጣቀሻ፤ የማስተማሪያ ቋንቋ፡ ${row.lang}።`;
                  return `${head} — Ethiopian Previous Curriculum Archive (${edYearLabel}); medium of instruction: ${row.lang}. Great for comparative study & exam prep.`;
                }
                if (lang === 'am') return `${head} — በአዲሱ ሥርዓተ ትምህርት (2016/2017 ዓ.ም) መሠረት፤ የማስተማሪያ ቋንቋ፡ ${row.lang}። በVIP ነፃ።`;
                if (lang === 'om') return `${head} — Kaarikulamii Haaraa 2016/2017 irratti hundaa'e; afaan barnootaa: ${row.lang}. VIP'n bilisa.`;
                if (lang === 'ti') return `${head} — ብመሰረት ሓድሽ ስርዓተ ትምህርቲ 2016/2017፤ ቋንቋ ትምህርቲ፡ ${row.lang}። ብVIP ብነጻ።`;
                if (lang === 'so') return `${head} — Manhajka Cusub 2016/2017; luqadda waxbarashada: ${row.lang}. Bilaash VIP.`;
                return `${head} — aligned with the Ethiopian New Curriculum (2016/2017 E.C.); medium of instruction: ${row.lang}.`;
              }),
              highlights: TEXTBOOK_HIGHLIGHTS[role],
              sampleExcerpt: map5(
                (lang) => `${gradeName(g, lang)} ${row.subjectText[lang]} — Unit 1 preview · ${row.lang} (${edYearLabel})`
              ),
            });
          }
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 2) National exam archive (Grade 6, 8, 12)
// ---------------------------------------------------------------------------

export const CURRENT_EXAM_YEAR_EC = 2018; // Latest national exams sat in mid-2026 (2018 E.C.)

export function examYearLabel(ec: number): string {
  return `${ec} E.C. (${ec + 8})`;
}

const EXAM_SUBJECTS: Record<6 | 8 | 12, { en: string; text: LocalizedText }[]> = {
  6: [
    SUBJECTS.math,
    SUBJECTS.english,
    SUBJECTS.env,
    { en: 'Mother Tongue / Amharic', text: L('Mother Tongue / Amharic', 'አፍ መፍቻ / አማርኛ', 'Afaan Dhalootaa / Amaaraa', 'ቋንቋ ኣደ / ኣምሓርኛ', 'Afka Hooyo / Amxaari') },
  ],
  8: [SUBJECTS.math, SUBJECTS.english, SUBJECTS.gensci, SUBJECTS.social, SUBJECTS.citizen, SUBJECTS.amharic],
  12: [
    SUBJECTS.english,
    { en: 'Mathematics (Natural Science)', text: L('Mathematics (Natural Science)', 'ሂሳብ (የተፈጥሮ ሳይንስ)', 'Herrega (Saayinsii Uumamaa)', 'ሒሳብ (ተፈጥሮ)', 'Xisaab (Sayniska Dabiiciga)') },
    { en: 'Mathematics (Social Science)', text: L('Mathematics (Social Science)', 'ሂሳብ (የማኅበራዊ ሳይንስ)', 'Herrega (Saayinsii Hawaasaa)', 'ሒሳብ (ማሕበራዊ)', 'Xisaab (Bulshada)') },
    SUBJECTS.physics,
    SUBJECTS.chemistry,
    SUBJECTS.biology,
    SUBJECTS.geography,
    SUBJECTS.history,
    SUBJECTS.economics,
    { en: 'Scholastic Aptitude', text: L('Scholastic Aptitude', 'የትምህርት ዝግጁነት (Aptitude)', 'Dandeettii Barnootaa', 'ብቕዓት ትምህርቲ', 'Awoodda Waxbarasho') },
    SUBJECTS.citizen,
  ],
};

const EXAM_START_YEAR: Record<6 | 8 | 12, number> = { 6: 2008, 8: 2005, 12: 2000 };
const EXAM_PRICE: Record<6 | 8 | 12, number> = { 6: 20, 8: 30, 12: 45 };

const EXAM_NAME: Record<6 | 8 | 12, LocalizedText> = {
  6: L('Regional Ministry Exam', 'ክልላዊ ሚኒስትሪ ፈተና', 'Qormaata Ministeeraa Naannoo', 'ክልላዊ ፈተና ሚኒስትሪ', 'Imtixaanka Wasaaradda Gobolka'),
  8: L('National Ministry Exam', 'ብሔራዊ የሚኒስትሪ ፈተና', 'Qormaata Ministeeraa Biyyoolessaa', 'ሃገራዊ ፈተና ሚኒስትሪ', 'Imtixaanka Wasaaradda Qaranka'),
  12: L('National Matric Exam (EUEE/ESSLCE)', 'ብሔራዊ የማትሪክ ፈተና', 'Qormaata Maatirikii Biyyoolessaa', 'ሃገራዊ ፈተና ማትሪክ', 'Imtixaanka Matric ee Qaranka'),
};

const ANSWER_KEY: LocalizedText = L('with detailed answer key', 'ከዝርዝር መልስ ቁልፍ ጋር', 'furtuu deebii bal’aa waliin', 'ምስ ዝርዝር መፍትሕ መልሲ', 'oo leh furaha jawaabaha');

const EXAM_HIGHLIGHTS: Record<Language, string[]> = list5((lang) =>
  lang === 'am'
    ? ['ሙሉ የፈተና ወረቀት', 'የእያንዳንዱ ጥያቄ ዝርዝር መልስና ማብራሪያ', 'በዓመትና በትምህርት ዓይነት የተደራጀ']
    : lang === 'om'
    ? ['Waraqaa qormaataa guutuu', 'Deebii fi ibsa gaaffii hundaaf', 'Waggaa fi gosa barnootaatiin qindaa’e']
    : lang === 'ti'
    ? ['ምሉእ ወረቐት ፈተና', 'ዝርዝር መልስን መብርሂን', 'ብዓመትን ዓይነት ትምህርትን ዝተወደበ']
    : lang === 'so'
    ? ['Warqadda imtixaanka oo dhan', 'Jawaab & sharraxaad su’aal kasta', 'Loo habeeyay sannad & maaddo']
    : ['Complete original exam paper', 'Detailed answer key & step-by-step explanations', 'Organised by grade, year and subject']
);

function buildExams(): DigitalProduct[] {
  const out: DigitalProduct[] = [];
  let n = 0;
  for (const grade of [12, 8, 6] as const) {
    for (let ec = CURRENT_EXAM_YEAR_EC; ec >= EXAM_START_YEAR[grade]; ec--) {
      for (const sub of EXAM_SUBJECTS[grade]) {
        n++;
        const year = examYearLabel(ec);
        out.push({
          id: `nx-g${grade}-${ec}-${sub.en.toLowerCase().replace(/[^a-z]+/g, '-')}`,
          sku: `NX-G${grade}-${ec}-${sub.en.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase()}`,
          category: 'national_exams',
          gradeBand: `Grade ${grade}` as GradeBand,
          subject: sub.en,
          examYear: year,
          examType: EXAM_NAME[grade].en,
          availableLanguages: grade === 12 ? ['en', 'am'] : ['en', 'am', 'om', 'ti', 'so'],
          priceEtb: EXAM_PRICE[grade],
          format: 'PDF Exam + Answer Key',
          fileSize: `${(1.2 + (n % 7) * 0.4).toFixed(1)} MB`,
          fileExtension: 'html',
          coverImage: grade === 12 ? COVER_AI : grade === 8 ? COVER_TEMPLATES : COVER_COURSES,
          accentPattern: PATTERNS[n % PATTERNS.length],
          title: map5((lang) => `${gradeName(grade, lang)} ${sub.text[lang]} — ${EXAM_NAME[grade][lang]} ${year}`),
          description: map5(
            (lang) => `${EXAM_NAME[grade][lang]} · ${gradeName(grade, lang)} · ${sub.text[lang]} · ${year} — ${ANSWER_KEY[lang]}.`
          ),
          highlights: EXAM_HIGHLIGHTS,
          sampleExcerpt: map5((lang) => `${sub.text[lang]} ${year} — Q1–Q5 preview`),
        });
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3) University Hub
// ---------------------------------------------------------------------------

export const UNIVERSITY_YEARS = [
  'Freshman (1st Year)',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'National Exit Exam',
] as const;

export const UNIVERSITY_YEAR_LABELS: Record<(typeof UNIVERSITY_YEARS)[number], LocalizedText> = {
  'Freshman (1st Year)': L('Freshman (1st Year)', 'ፍሬሽማን (1ኛ ዓመት)', 'Waggaa 1ffaa (Freshman)', 'ፍሬሽማን (1ይ ዓመት)', 'Sannadka 1aad'),
  '2nd Year': L('2nd Year', '2ኛ ዓመት', 'Waggaa 2ffaa', '2ይ ዓመት', 'Sannadka 2aad'),
  '3rd Year': L('3rd Year', '3ኛ ዓመት', 'Waggaa 3ffaa', '3ይ ዓመት', 'Sannadka 3aad'),
  '4th Year': L('4th Year', '4ኛ ዓመት', 'Waggaa 4ffaa', '4ይ ዓመት', 'Sannadka 4aad'),
  '5th Year': L('5th Year', '5ኛ ዓመት', 'Waggaa 5ffaa', '5ይ ዓመት', 'Sannadka 5aad'),
  'National Exit Exam': L('National Exit Exam', 'ብሔራዊ የመውጫ ፈተና', 'Qormaata Xumuraa Biyyoolessaa', 'ሃገራዊ ፈተና መውጽኢ', 'Imtixaanka Ka-bixitaanka Qaranka'),
};

export const UNIVERSITY_DEPARTMENTS: { id: string; name: LocalizedText; courses: string[][] }[] = [
  {
    id: 'Engineering',
    name: L('Engineering & Technology', 'ምህንድስና እና ቴክኖሎጂ', 'Injinariingii fi Teeknooloojii', 'ምህንድስናን ቴክኖሎጂን', 'Injineernimada & Tiknoolajiyada'),
    courses: [
      ['Applied Mathematics I', 'General Physics', 'Introduction to Emerging Technologies'],
      ['Engineering Mechanics (Statics)', 'Applied Mathematics II', 'Engineering Drawing'],
      ['Strength of Materials', 'Fluid Mechanics', 'Electrical Circuits'],
      ['Structural Analysis', 'Thermodynamics', 'Control Systems'],
      ['Design of Reinforced Concrete', 'Construction Project Management', 'Engineering Economics'],
    ],
  },
  {
    id: 'Medicine',
    name: L('Medicine & Health Sciences', 'ሕክምና እና ጤና ሳይንስ', 'Fayyaa fi Yaala', 'ሕክምናን ሳይንስ ጥዕናን', 'Caafimaadka & Daawada'),
    courses: [
      ['General Biology', 'General Chemistry', 'Communicative English'],
      ['Human Anatomy', 'Human Physiology', 'Medical Biochemistry'],
      ['Pathology', 'Pharmacology', 'Medical Microbiology'],
      ['Internal Medicine', 'Pediatrics & Child Health', 'Surgery'],
      ['Obstetrics & Gynecology', 'Public Health', 'Psychiatry'],
    ],
  },
  {
    id: 'Business',
    name: L('Business & Economics', 'ቢዝነስ እና ኢኮኖሚክስ', 'Daldalaa fi Diinagdee', 'ንግድን ኢኮኖሚክስን', 'Ganacsiga & Dhaqaalaha'),
    courses: [
      ['Mathematics for Social Sciences', 'Introduction to Economics', 'Logic & Critical Thinking'],
      ['Principles of Accounting I', 'Microeconomics', 'Business Statistics'],
      ['Financial Management', 'Macroeconomics', 'Marketing Management'],
      ['Auditing', 'Ethiopian Taxation', 'Strategic Management'],
      ['Research Methods', 'Project Analysis', 'Banking & Insurance'],
    ],
  },
  {
    id: 'Law',
    name: L('Law', 'ሕግ', 'Seera', 'ሕጊ', 'Sharciga'),
    courses: [
      ['Introduction to Law', 'Logic & Critical Thinking', 'Civics & Moral Education'],
      ['Constitutional Law', 'Law of Contracts I', 'Criminal Law (General Part)'],
      ['Law of Persons & Family Law', 'Law of Traders & Business Organizations', 'Civil Procedure'],
      ['Law of Property', 'Criminal Procedure', 'Labour Law'],
      ['Law of Evidence', 'Public International Law', 'Legal Research & Writing'],
    ],
  },
  {
    id: 'Natural Sciences',
    name: L('Natural & Computational Sciences', 'የተፈጥሮ ሳይንስ', 'Saayinsii Uumamaa', 'ሳይንስ ተፈጥሮ', 'Sayniska Dabiiciga'),
    courses: [
      ['General Physics', 'General Chemistry', 'Applied Mathematics'],
      ['Calculus II', 'Organic Chemistry I', 'Genetics'],
      ['Analytical Chemistry', 'Classical Mechanics', 'Ecology'],
      ['Quantum Mechanics', 'Biochemistry', 'Numerical Analysis'],
      ['Research Project Methods', 'Environmental Science', 'Instrumental Analysis'],
    ],
  },
  {
    id: 'Social Sciences',
    name: L('Social Sciences & Humanities', 'ማኅበራዊ ሳይንስ', 'Saayinsii Hawaasaa', 'ማሕበራዊ ሳይንስ', 'Cilmiga Bulshada'),
    courses: [
      ['General Psychology', 'Social Anthropology', 'Geography of Ethiopia & the Horn'],
      ['History of Ethiopia & the Horn', 'Sociology', 'Political Science'],
      ['Social Research Methods', 'Development Studies', 'International Relations'],
      ['Public Administration', 'Ethiopian Foreign Policy', 'Social Statistics'],
      ['Gender Studies', 'Urban Studies', 'Senior Essay Methods'],
    ],
  },
  {
    id: 'Agriculture',
    name: L('Agriculture & Veterinary', 'ግብርና እና የእንስሳት ሕክምና', 'Qonnaa fi Fayyaa Bineensaa', 'ሕርሻን ሕክምና እንስሳን', 'Beeraha & Xannaanada Xoolaha'),
    courses: [
      ['General Biology', 'Introduction to Agriculture', 'Mathematics for Agriculture'],
      ['Soil Science', 'Crop Production', 'Introduction to Animal Science'],
      ['Plant Protection', 'Agricultural Economics', 'Irrigation Practices'],
      ['Agronomy', 'Animal Nutrition', 'Agricultural Extension'],
      ['Farm Management', 'Horticulture', 'Rural Development'],
    ],
  },
];

const UNI_HIGHLIGHTS: Record<Language, string[]> = list5((lang) =>
  lang === 'am'
    ? ['ብርቅ የሆኑ የሚድ/ፋይናል ፈተናዎች', 'ከሞጁል ጋር የተጠቃለለ', 'ለተማሪ ተስማሚ ዋጋ']
    : ['Rare, hard-to-find Mid / Final exam papers', 'Bundled with the course module', 'Student-friendly micro-price']
);

function buildUniversity(): DigitalProduct[] {
  const out: DigitalProduct[] = [];
  let n = 0;
  for (const dept of UNIVERSITY_DEPARTMENTS) {
    dept.courses.forEach((courses, yi) => {
      const uniYear = UNIVERSITY_YEARS[yi];
      for (const course of courses) {
        for (const kind of ['Mid Exam', 'Final Exam'] as const) {
          n++;
          const price = Math.min(85, (kind === 'Mid Exam' ? 20 : 35) + yi * 8);
          const kindText: LocalizedText =
            kind === 'Mid Exam'
              ? L('Mid Exam + Module', 'ሚድ ፈተና + ሞጁል', 'Qormaata Walakkaa + Moojuula', 'ማእከላይ ፈተና + ሞጁል', 'Imtixaanka Badhtamaha + Moduul')
              : L('Final Exam + Module', 'ፋይናል ፈተና + ሞጁል', 'Qormaata Xumuraa + Moojuula', 'ናይ መወዳእታ ፈተና + ሞጁል', 'Imtixaanka Kama-dambeysta + Moduul');
          out.push({
            id: `uni-${dept.id.toLowerCase().replace(/[^a-z]+/g, '-')}-y${yi + 1}-${course.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${kind === 'Mid Exam' ? 'mid' : 'final'}`,
            sku: `UNI-${dept.id.slice(0, 3).toUpperCase()}-Y${yi + 1}-${course.replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase()}-${kind === 'Mid Exam' ? 'M' : 'F'}`,
            category: 'university',
            gradeBand: 'University',
            uniYear,
            department: dept.id,
            subject: course,
            examType: kind,
            availableLanguages: ['en', 'am'],
            priceEtb: price,
            format: 'PDF Exam + Module Bundle',
            fileSize: `${(2 + (n % 6) * 0.7).toFixed(1)} MB`,
            fileExtension: 'html',
            coverImage: dept.id === 'Medicine' ? COVER_MEDICAL : dept.id === 'Agriculture' ? COVER_LIVESTOCK : dept.id === 'Engineering' ? COVER_SOFTWARE : COVER_EBOOKS,
            accentPattern: PATTERNS[n % PATTERNS.length],
            title: map5((lang) => `${course} — ${kindText[lang]} (${UNIVERSITY_YEAR_LABELS[uniYear][lang]})`),
            description: map5(
              (lang) => `${dept.name[lang]} · ${UNIVERSITY_YEAR_LABELS[uniYear][lang]} · ${course} · ${kindText[lang]}`
            ),
            highlights: UNI_HIGHLIGHTS,
            sampleExcerpt: L(`${course}: Section A preview (questions 1–5) and module chapter 1 outline.`),
          });
        }
      }
    });
    // National Exit Exam (first sat in 2015 E.C.)
    const exitItems: { key: string; label: LocalizedText; price: number }[] = [
      { key: 'model', label: L('Model Exit Exam + Full Answers', 'ሞዴል የመውጫ ፈተና + ሙሉ መልስ', 'Qormaata Xumuraa Fakkeenyaa + Deebii', 'ሞዴል ፈተና መውጽኢ + መልሲ', 'Imtixaan Tusaale + Jawaabo'), price: 85 },
      ...[2018, 2017, 2016, 2015].map((ec) => ({
        key: String(ec),
        label: L(`Exit Exam ${examYearLabel(ec)} + Answer Key`, `የመውጫ ፈተና ${examYearLabel(ec)} + መልስ ቁልፍ`),
        price: 70 + (ec - 2015) * 5,
      })),
    ];
    for (const item of exitItems) {
      n++;
      out.push({
        id: `uni-${dept.id.toLowerCase().replace(/[^a-z]+/g, '-')}-exit-${item.key}`,
        sku: `UNI-${dept.id.slice(0, 3).toUpperCase()}-EXIT-${item.key.toUpperCase()}`,
        category: 'university',
        gradeBand: 'University',
        uniYear: 'National Exit Exam',
        department: dept.id,
        subject: `${dept.id} Exit Exam`,
        examType: 'Exit Exam',
        examYear: item.key === 'model' ? undefined : examYearLabel(Number(item.key)),
        availableLanguages: ['en', 'am'],
        priceEtb: Math.min(85, item.price),
        format: 'PDF Exit Exam + Answer Key',
        fileSize: `${(3 + (n % 5) * 0.8).toFixed(1)} MB`,
        fileExtension: 'html',
        coverImage: COVER_AI,
        accentPattern: PATTERNS[n % PATTERNS.length],
        title: map5((lang) => `${dept.name[lang]} — ${item.label[lang]}`),
        description: map5(
          (lang) => `${UNIVERSITY_YEAR_LABELS['National Exit Exam'][lang]} · ${dept.name[lang]} · ${item.label[lang]}`
        ),
        highlights: UNI_HIGHLIGHTS,
        sampleExcerpt: L(`${dept.id} exit exam: first 5 questions with worked answers.`),
      });
    }
  }
  return out;
}

export const GENERATED_TEXTBOOKS: DigitalProduct[] = buildTextbooks();
export const GENERATED_EXAMS: DigitalProduct[] = buildExams();
export const GENERATED_UNIVERSITY: DigitalProduct[] = buildUniversity();

export { LANGS as GENERATED_LANGS };
