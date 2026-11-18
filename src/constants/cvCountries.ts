import { CvCountryStandard, Language } from '../types';
import { CV_COUNTRY_STANDARDS } from './careerAndLegal';

export type CvRegionGroupId =
  | 'All'
  | 'Ethiopia'
  | 'Middle East & GCC'
  | 'Europe & UK'
  | 'North America & Oceania'
  | 'Africa'
  | 'Asia & Latin America';

export const CV_REGION_GROUPS: CvRegionGroupId[] = [
  'All',
  'Ethiopia',
  'Middle East & GCC',
  'Europe & UK',
  'North America & Oceania',
  'Africa',
  'Asia & Latin America',
];

type CountryPresetSpec = {
  code: string;
  nameEn: string;
  regionGroup: Exclude<CvRegionGroupId, 'All'>;
  template: 'ethiopia' | 'gcc' | 'eu_uk' | 'dach' | 'us_ats' | 'aus_nz' | 'africa' | 'asia_latam';
  priceEtb: number;
};

function makeCountryStandard(spec: CountryPresetSpec): CvCountryStandard {
  const { code, nameEn, regionGroup, template, priceEtb } = spec;
  const slug = nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  const requiresPhoto = template === 'gcc' || template === 'dach' || template === 'asia_latam';
  const requiresVisaInfo = template === 'gcc' || template === 'asia_latam';
  const requiresSignatureBlock = template === 'dach';
  const maxPagesLabel =
    template === 'us_ats' ? '1–2 Pages US ATS' : template === 'aus_nz' ? '2–3 Pages CAR' : '2 Pages Standard';

  const formatEn =
    template === 'gcc'
      ? `${nameEn} Gulf CV (Photo + Visa + Nationality)`
      : template === 'dach'
        ? `${nameEn} Tabular Lebenslauf (Photo + Date/Signature)`
        : template === 'eu_uk'
          ? `${nameEn} Europass / Competency CV (No Photo)`
          : template === 'us_ats'
            ? `${nameEn} ATS Achievement Resume (No Photo)`
            : template === 'aus_nz'
              ? `${nameEn} CAR Impact Resume`
              : `${nameEn} National Corporate & NGO CV`;

  const rulesByTemplate: Record<CountryPresetSpec['template'], Record<Language, string[]>> = {
    ethiopia: {
      en: [
        'Formal Ethiopian/INGO CV with GPA, languages, and 2–3 verified referees.',
        'Paired with formal "To: Human Resources Department" Cover Letter.',
      ],
      am: [
        'የትምህርት GPA፣ ቋንቋዎች እና 2–3 ዋቢዎች (Referees) ይካተታሉ።',
        'መደበኛ የማመልከቻ ደብዳቤ (Cover Letter) አብሮ ይወጣል።',
      ],
      om: ['GPA, afaanota fi wabii 2–3 ni hammata.', 'Xalayaa iyyannoo waliin qophaaʼa.'],
      ti: ['GPA፣ ቋንቋታትን 2–3 ምስክርን የጠቓልል።', 'ደብዳቤ መመልከቲ ኣለዎ።'],
      so: ['Waxaa ku jira GPA, luqadaha, iyo 2–3 tixraacyo.', 'Warqad codsi rasmi ah ayaa la socota.'],
    },
    gcc: {
      en: [
        `${nameEn} employers require a clean headshot photo, Nationality, and Visa / Notice Period status.`,
        'Reverse-chronological format tailored for hospitality, construction, healthcare, and corporate Gulf portals.',
      ],
      am: [
        `የ${nameEn} ቀጣሪዎች ፕሮፌሽናል ፎቶ፣ ዜግነት እና የቪዛ ሁኔታ (Visa Status) በCV ራስጌ ላይ ይፈልጋሉ።`,
        'ለሆቴል፣ ምህንድስና፣ ጤና እና ቢሮ ስራዎች ተስማሚ አቀማመጥ።',
      ],
      om: [`Dhaabbileen ${nameEn} suuraa, lammummaa fi haala viizaa ni gaafatu.`, 'Akkaataa Gulf standard qophaaʼa.'],
      ti: [`ቀጠርቲ ${nameEn} ስእሊ፣ ዜግነትን ኩነታት ቪዛን ይሓቱ።`, 'ንስራሕ ገልፍ ዝተዳለወ።'],
      so: [`Shirkadaha ${nameEn} waxay rabaan sawir, jinsiyad, iyo xaaladda fiisaha.`, 'Qaabka Khaliijka u habaysan.'],
    },
    eu_uk: {
      en: [
        `${nameEn} equality standards omit headshot photo, birth date, and marital status.`,
        'Highlights concise 4-line Personal Profile, CEFR language levels, and measurable outcomes.',
      ],
      am: [
        `በ${nameEn} የስራ ህግ መሰረት ፎቶ፣ እድሜ እና የጋብቻ ሁኔታ አይካተትም።`,
        'ግልጽ Personal Profile እና የCEFR የቋንቋ ደረጃዎች ይቀመጣሉ።',
      ],
      om: [`Akka seera ${nameEn}ʼtti suuraan fi umuriin hin galu.`, 'Sadarkaa afaanii CEFR agarsiisa.'],
      ti: [`ብሕጊ ${nameEn} ስእልን ዕድመን ኣይእተውን።`, 'CEFR ደረጃ ቋንቋ የርኢ።'],
      so: [`Xeerka ${nameEn} ma ogola sawir ama daʼ.`, 'Heerka luqadda CEFR ayaa la muujiyaa.'],
    },
    dach: {
      en: [
        `${nameEn} classic Tabular Lebenslauf with top-right Bewerbungsfoto.`,
        'Mandatory closing City, Date, and Signature block at the bottom of the CV.',
      ],
      am: [
        `የ${nameEn} Tabular Lebenslauf ከላይ በስተቀኝ ፎቶ እና ከታች ቀንና ፊርማ ያለው።`,
        'የስራ እና ትምህርት ታሪክ በግልጽ የጊዜ ሰንጠረዥ ይደራጃል።',
      ],
      om: [`Lebenslauf ${nameEn} suuraa fi mallattoo dhumaatti qaba.`, 'Tartiiba gabatee yeroo qaba.'],
      ti: [`ናይ ${nameEn} Lebenslauf ምስ ስእልን ፊርማን።`, 'ብሰንጠረዥ ግዜ ይዳሎ።'],
      so: [`Qaabka ${nameEn} Lebenslauf wuxuu leeyahay sawir iyo saxeex.`, 'Jadwal taariikhi ah.'],
    },
    us_ats: {
      en: [
        `${nameEn} strict ATS-compliant resume: zero photos, zero tables/columns that break Applicant Tracking Systems.`,
        'Quantified action-verb achievement bullets + tailored 3-paragraph Cover Letter.',
      ],
      am: [
        `ለ${nameEn} ATS ሲስተም የተዘጋጀ፡ ፎቶና የልደት ቀን አያስገባም።`,
        'ውጤቶችን በቁጥር (Metrics) የሚያሳዩ ጠንካራ ዓረፍተ ነገሮች ይኖሩታል።',
      ],
      om: [`Resume ATS ${nameEn}: suuraa fi teessoo hin qabu.`, 'Buʼaa lakkoofsaan ibsa.'],
      ti: [`ን${nameEn} ATS ዝተዳለወ፡ ስእሊ የብሉን።`, 'ውጽኢት ብቑጽሪ የርኢ።'],
      so: [`ATS-ka ${nameEn} ma oggola sawir.`, 'Waxqabadka waxaa lagu qoraa tirooyin.'],
    },
    aus_nz: {
      en: [
        `${nameEn} CAR (Context–Action–Result) achievement layout without photo or personal age details.`,
        'Includes Career Objective, Core Competencies grid, and Verified Referees note.',
      ],
      am: [
        `የ${nameEn} CAR (Context-Action-Result) ስታንዳርድ ያለ ፎቶ እና እድሜ።`,
        'ዋና ብቃቶችን እና የስራ ውጤቶችን በግልጽ ያሳያል።',
      ],
      om: [`Akkaataa CAR ${nameEn} suuraa malee.`, 'Dandeettii ijoo agarsiisa.'],
      ti: [`ስታንዳርድ CAR ${nameEn} ብዘይ ስእሊ።`, 'ውጽኢት ስራሕ የርኢ።'],
      so: [`Qaabka CAR ee ${nameEn} sawir laʼaan.`, 'Xirfadaha muhiimka ah ayaa horreeya.'],
    },
    africa: {
      en: [
        `${nameEn} regional corporate, banking & UN/AU agency CV structure with clear academic credentials and 2–3 referees.`,
        'Clean reverse-chronological layout highlighting multilingual skills and compliance.',
      ],
      am: [
        `ለ${nameEn} ድርጅቶች፣ ባንኮች እና UN/AU ተቋማት የተዘጋጀ CV ከዋቢዎች (Referees) ጋር።`,
        'የትምህርት፣ ቋንቋ እና የስራ ልምድ ዝርዝር በግልጽ ይቀመጣል።',
      ],
      om: [`CV dhaabbilee ${nameEn} fi UN/AUf qophaaʼe.`, 'Wabii fi afaanota ni hammata.'],
      ti: [`ንትካላት ${nameEn}ን UN/AUን ዝተዳለወ CV።`, 'ምስክርን ቋንቋታትን የጠቓልል።'],
      so: [`CV-ga shirkadaha ${nameEn} & hayʼadaha UN/AU.`, 'Tixraacyada & luqadaha waa ku jiraan.'],
    },
    asia_latam: {
      en: [
        `${nameEn} international business CV featuring clean professional headshot, nationality/relocation note, and structured credentials.`,
        'Includes concise career objective, education chronology, and bilingual/English skill highlights.',
      ],
      am: [
        `ለ${nameEn} አለም አቀፍ ድርጅቶች የተዘጋጀ CV (ፕሮፌሽናል ፎቶ እና ዜግነት/የጉዞ ዝግጁነት ጋር)።`,
        'የትምህርት፣ የስራ ልምድ እና የቋንቋ ችሎታዎችን በግልጽ ያሳያል።',
      ],
      om: [`CV idil-addunyaa ${nameEn} suuraa fi lammummaa waliin.`, 'Muuxannoo fi barnoota sirnaan tarreessa.'],
      ti: [`ን${nameEn} ኣህጉራዊ ትካላት ዝተዳለወ CV።`, 'ስእልን ዜግነትን የጠቓልል።'],
      so: [`CV-ga caalamiga ah ee ${nameEn} oo sawir & jinsiyad leh.`, 'Waxbarashada & khibradda si cad ayuu u qoraa.'],
    },
  };

  return {
    id: slug,
    regionGroup,
    priceEtb,
    flagCode: code,
    countryName: {
      en: nameEn,
      am: nameEn,
      om: nameEn,
      ti: nameEn,
      so: nameEn,
    },
    formatLabel: {
      en: formatEn,
      am: formatEn,
      om: formatEn,
      ti: formatEn,
      so: formatEn,
    },
    requiresPhoto,
    requiresVisaInfo,
    requiresSignatureBlock,
    maxPagesLabel,
    rules: rulesByTemplate[template],
    writingGuide: CV_COUNTRY_STANDARDS[0].writingGuide,
  };
}

// Curated anchor standards (retain exact IDs: 'ethiopia', 'uae', 'eu_uk', 'germany', 'usa_canada', 'australia')
const CORE_STANDARDS_WITH_GROUPS: CvCountryStandard[] = CV_COUNTRY_STANDARDS.map((std) => {
  const regionGroup: Exclude<CvRegionGroupId, 'All'> =
    std.id === 'ethiopia'
      ? 'Ethiopia'
      : std.id === 'uae'
        ? 'Middle East & GCC'
        : std.id === 'eu_uk' || std.id === 'germany'
          ? 'Europe & UK'
          : 'North America & Oceania';
  return { ...std, regionGroup };
});

// Complete global sovereign coverage (189 additional nations -> 195+ entries total with core regional anchors)
const GLOBAL_COUNTRY_SPECS: CountryPresetSpec[] = [
  // Middle East & GCC (100 - 150 ETB)
  { code: 'SA', nameEn: 'Saudi Arabia', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'QA', nameEn: 'Qatar', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'KW', nameEn: 'Kuwait', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'BH', nameEn: 'Bahrain', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'OM', nameEn: 'Oman', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'JO', nameEn: 'Jordan', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'LB', nameEn: 'Lebanon', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'IL', nameEn: 'Israel', regionGroup: 'Middle East & GCC', template: 'eu_uk', priceEtb: 180 },
  { code: 'IQ', nameEn: 'Iraq', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'IR', nameEn: 'Iran', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'YE', nameEn: 'Yemen', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'SY', nameEn: 'Syria', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'PS', nameEn: 'Palestine', regionGroup: 'Middle East & GCC', template: 'gcc', priceEtb: 100 },
  { code: 'TR', nameEn: 'Turkey', regionGroup: 'Middle East & GCC', template: 'eu_uk', priceEtb: 160 },

  // Europe & UK (180 - 220 ETB)
  { code: 'GB', nameEn: 'United Kingdom', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'FR', nameEn: 'France', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'IT', nameEn: 'Italy', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'ES', nameEn: 'Spain', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'NL', nameEn: 'Netherlands', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'BE', nameEn: 'Belgium', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'CH', nameEn: 'Switzerland', regionGroup: 'Europe & UK', template: 'dach', priceEtb: 220 },
  { code: 'AT', nameEn: 'Austria', regionGroup: 'Europe & UK', template: 'dach', priceEtb: 220 },
  { code: 'SE', nameEn: 'Sweden', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'NO', nameEn: 'Norway', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'DK', nameEn: 'Denmark', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'FI', nameEn: 'Finland', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'IS', nameEn: 'Iceland', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'IE', nameEn: 'Ireland', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'PT', nameEn: 'Portugal', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'PL', nameEn: 'Poland', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'CZ', nameEn: 'Czech Republic', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'SK', nameEn: 'Slovakia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'HU', nameEn: 'Hungary', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'RO', nameEn: 'Romania', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'BG', nameEn: 'Bulgaria', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'GR', nameEn: 'Greece', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'HR', nameEn: 'Croatia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'SI', nameEn: 'Slovenia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'RS', nameEn: 'Serbia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'BA', nameEn: 'Bosnia and Herzegovina', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'ME', nameEn: 'Montenegro', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'AL', nameEn: 'Albania', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'MK', nameEn: 'North Macedonia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'UA', nameEn: 'Ukraine', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'BY', nameEn: 'Belarus', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'MD', nameEn: 'Moldova', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'RU', nameEn: 'Russia', regionGroup: 'Europe & UK', template: 'asia_latam', priceEtb: 180 },
  { code: 'EE', nameEn: 'Estonia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'LV', nameEn: 'Latvia', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'LT', nameEn: 'Lithuania', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'LU', nameEn: 'Luxembourg', regionGroup: 'Europe & UK', template: 'dach', priceEtb: 220 },
  { code: 'MT', nameEn: 'Malta', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'CY', nameEn: 'Cyprus', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'MC', nameEn: 'Monaco', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 200 },
  { code: 'LI', nameEn: 'Liechtenstein', regionGroup: 'Europe & UK', template: 'dach', priceEtb: 220 },
  { code: 'AD', nameEn: 'Andorra', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'SM', nameEn: 'San Marino', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },
  { code: 'VA', nameEn: 'Vatican City', regionGroup: 'Europe & UK', template: 'eu_uk', priceEtb: 180 },

  // North America & Oceania (250 - 300 ETB)
  { code: 'US', nameEn: 'United States', regionGroup: 'North America & Oceania', template: 'us_ats', priceEtb: 300 },
  { code: 'CA', nameEn: 'Canada', regionGroup: 'North America & Oceania', template: 'us_ats', priceEtb: 300 },
  { code: 'MX', nameEn: 'Mexico', regionGroup: 'North America & Oceania', template: 'asia_latam', priceEtb: 180 },
  { code: 'AU', nameEn: 'Australia (Regional)', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 250 },
  { code: 'NZ', nameEn: 'New Zealand', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 250 },
  { code: 'FJ', nameEn: 'Fiji', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'PG', nameEn: 'Papua New Guinea', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'SB', nameEn: 'Solomon Islands', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'VU', nameEn: 'Vanuatu', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'WS', nameEn: 'Samoa', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'TO', nameEn: 'Tonga', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'KI', nameEn: 'Kiribati', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'TV', nameEn: 'Tuvalu', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'NR', nameEn: 'Nauru', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'PW', nameEn: 'Palau', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'MH', nameEn: 'Marshall Islands', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },
  { code: 'FM', nameEn: 'Micronesia', regionGroup: 'North America & Oceania', template: 'aus_nz', priceEtb: 200 },

  // Africa (75 - 120 ETB)
  { code: 'KE', nameEn: 'Kenya', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'UG', nameEn: 'Uganda', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'TZ', nameEn: 'Tanzania', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'RW', nameEn: 'Rwanda', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'DJ', nameEn: 'Djibouti', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'SO', nameEn: 'Somalia', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'ER', nameEn: 'Eritrea', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'SD', nameEn: 'Sudan', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'SS', nameEn: 'South Sudan', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'ZA', nameEn: 'South Africa', regionGroup: 'Africa', template: 'africa', priceEtb: 120 },
  { code: 'NG', nameEn: 'Nigeria', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'GH', nameEn: 'Ghana', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'EG', nameEn: 'Egypt', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'MA', nameEn: 'Morocco', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'DZ', nameEn: 'Algeria', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'TN', nameEn: 'Tunisia', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'LY', nameEn: 'Libya', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'AO', nameEn: 'Angola', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'BJ', nameEn: 'Benin', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'BW', nameEn: 'Botswana', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'BF', nameEn: 'Burkina Faso', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'BI', nameEn: 'Burundi', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'CV', nameEn: 'Cabo Verde', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'CM', nameEn: 'Cameroon', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'CF', nameEn: 'Central African Republic', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'TD', nameEn: 'Chad', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'KM', nameEn: 'Comoros', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'CG', nameEn: 'Congo', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'CD', nameEn: 'DR Congo', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'CI', nameEn: "Cote d'Ivoire", regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'GQ', nameEn: 'Equatorial Guinea', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'SZ', nameEn: 'Eswatini', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'GA', nameEn: 'Gabon', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'GM', nameEn: 'Gambia', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'GN', nameEn: 'Guinea', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'GW', nameEn: 'Guinea-Bissau', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'LS', nameEn: 'Lesotho', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'LR', nameEn: 'Liberia', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'MG', nameEn: 'Madagascar', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'MW', nameEn: 'Malawi', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'ML', nameEn: 'Mali', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'MR', nameEn: 'Mauritania', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'MU', nameEn: 'Mauritius', regionGroup: 'Africa', template: 'africa', priceEtb: 120 },
  { code: 'MZ', nameEn: 'Mozambique', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'NA', nameEn: 'Namibia', regionGroup: 'Africa', template: 'africa', priceEtb: 100 },
  { code: 'NE', nameEn: 'Niger', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'ST', nameEn: 'Sao Tome and Principe', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'SN', nameEn: 'Senegal', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'SC', nameEn: 'Seychelles', regionGroup: 'Africa', template: 'africa', priceEtb: 120 },
  { code: 'SL', nameEn: 'Sierra Leone', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'TG', nameEn: 'Togo', regionGroup: 'Africa', template: 'africa', priceEtb: 80 },
  { code: 'ZM', nameEn: 'Zambia', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },
  { code: 'ZW', nameEn: 'Zimbabwe', regionGroup: 'Africa', template: 'africa', priceEtb: 90 },

  // Asia & Latin America (150 - 220 ETB)
  { code: 'JP', nameEn: 'Japan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 220 },
  { code: 'KR', nameEn: 'South Korea', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 220 },
  { code: 'CN', nameEn: 'China', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 200 },
  { code: 'SG', nameEn: 'Singapore', regionGroup: 'Asia & Latin America', template: 'eu_uk', priceEtb: 220 },
  { code: 'IN', nameEn: 'India', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'MY', nameEn: 'Malaysia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'TH', nameEn: 'Thailand', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'VN', nameEn: 'Vietnam', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'ID', nameEn: 'Indonesia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'PH', nameEn: 'Philippines', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'PK', nameEn: 'Pakistan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'BD', nameEn: 'Bangladesh', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'LK', nameEn: 'Sri Lanka', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'NP', nameEn: 'Nepal', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'AF', nameEn: 'Afghanistan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'AM', nameEn: 'Armenia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'AZ', nameEn: 'Azerbaijan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'BT', nameEn: 'Bhutan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'BN', nameEn: 'Brunei', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'KH', nameEn: 'Cambodia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'GE', nameEn: 'Georgia', regionGroup: 'Asia & Latin America', template: 'eu_uk', priceEtb: 160 },
  { code: 'KZ', nameEn: 'Kazakhstan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'KG', nameEn: 'Kyrgyzstan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'LA', nameEn: 'Laos', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'MV', nameEn: 'Maldives', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'MN', nameEn: 'Mongolia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'MM', nameEn: 'Myanmar', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'KP', nameEn: 'North Korea', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'TW', nameEn: 'Taiwan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 200 },
  { code: 'TJ', nameEn: 'Tajikistan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'TL', nameEn: 'Timor-Leste', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'TM', nameEn: 'Turkmenistan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'UZ', nameEn: 'Uzbekistan', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'BR', nameEn: 'Brazil', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 180 },
  { code: 'AR', nameEn: 'Argentina', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 180 },
  { code: 'CL', nameEn: 'Chile', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 180 },
  { code: 'CO', nameEn: 'Colombia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'PE', nameEn: 'Peru', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'EC', nameEn: 'Ecuador', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'VE', nameEn: 'Venezuela', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'BO', nameEn: 'Bolivia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'PY', nameEn: 'Paraguay', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'UY', nameEn: 'Uruguay', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 170 },
  { code: 'CR', nameEn: 'Costa Rica', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 170 },
  { code: 'PA', nameEn: 'Panama', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 170 },
  { code: 'CU', nameEn: 'Cuba', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'DO', nameEn: 'Dominican Republic', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'GT', nameEn: 'Guatemala', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'HN', nameEn: 'Honduras', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'SV', nameEn: 'El Salvador', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'NI', nameEn: 'Nicaragua', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'BZ', nameEn: 'Belize', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'JM', nameEn: 'Jamaica', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'HT', nameEn: 'Haiti', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 140 },
  { code: 'TT', nameEn: 'Trinidad and Tobago', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 170 },
  { code: 'BS', nameEn: 'Bahamas', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 180 },
  { code: 'BB', nameEn: 'Barbados', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 180 },
  { code: 'GY', nameEn: 'Guyana', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'SR', nameEn: 'Suriname', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 150 },
  { code: 'AG', nameEn: 'Antigua and Barbuda', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'DM', nameEn: 'Dominica', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'GD', nameEn: 'Grenada', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'KN', nameEn: 'Saint Kitts and Nevis', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'LC', nameEn: 'Saint Lucia', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
  { code: 'VC', nameEn: 'Saint Vincent and the Grenadines', regionGroup: 'Asia & Latin America', template: 'asia_latam', priceEtb: 160 },
];

export const ALL_CV_COUNTRIES: CvCountryStandard[] = [
  ...CORE_STANDARDS_WITH_GROUPS,
  ...GLOBAL_COUNTRY_SPECS.map(makeCountryStandard),
];

export function findCvCountryStandard(id?: string | null): CvCountryStandard {
  if (!id) return ALL_CV_COUNTRIES[0];
  return ALL_CV_COUNTRIES.find((c) => c.id === id) || ALL_CV_COUNTRIES[0];
}
