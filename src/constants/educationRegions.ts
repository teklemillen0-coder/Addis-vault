import { EthiopianRegionId, GradeBand, LocalizedText } from '../types';

export interface EthiopianRegionMeta {
  id: EthiopianRegionId;
  name: LocalizedText;
  shortTag: string;
  primaryLanguages: string[];
}

export const ETHIOPIAN_REGIONS: EthiopianRegionMeta[] = [
  {
    id: 'federal_addis',
    shortTag: 'Addis Ababa / Federal',
    name: { en: 'Addis Ababa / Federal', am: 'አዲስ አበባ / ፌዴራል', om: 'Finfinnee / Federaala', ti: 'ኣዲስ ኣበባ / ፌዴራል', so: 'Addis Ababa / Federaalka' },
    primaryLanguages: ['አማርኛ (Amharic)', 'Afaan Oromoo', 'English'],
  },
  {
    id: 'oromia',
    shortTag: 'Oromia',
    name: { en: 'Oromia Region', am: 'ኦሮሚያ ክልል', om: 'Naannoo Oromiyaa', ti: 'ክልል ኦሮሚያ', so: 'Deegaanka Oromiyaa' },
    primaryLanguages: ['Afaan Oromoo', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'amhara',
    shortTag: 'Amhara',
    name: { en: 'Amhara Region', am: 'አማራ ክልል', om: 'Naannoo Amaaraa', ti: 'ክልል ኣምሓራ', so: 'Deegaanka Amxaarada' },
    primaryLanguages: ['አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'tigray',
    shortTag: 'Tigray',
    name: { en: 'Tigray Region', am: 'ትግራይ ክልል', om: 'Naannoo Tigiraay', ti: 'ክልል ትግራይ', so: 'Deegaanka Tigray' },
    primaryLanguages: ['ትግርኛ (Tigrinya)', 'English'],
  },
  {
    id: 'somali',
    shortTag: 'Somali',
    name: { en: 'Somali Region', am: 'ሶማሌ ክልል', om: 'Naannoo Somaalee', ti: 'ክልል ሶማሌ', so: 'Deegaanka Soomaalida' },
    primaryLanguages: ['Af-Soomaali', 'English'],
  },
  {
    id: 'sidama',
    shortTag: 'Sidama',
    name: { en: 'Sidama Region', am: 'ሲዳማ ክልል', om: 'Naannoo Sidaamaa', ti: 'ክልል ሲዳማ', so: 'Deegaanka Sidaama' },
    primaryLanguages: ['Sidaamu Afoo', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'central_ethiopia',
    shortTag: 'Central Ethiopia',
    name: { en: 'Central Ethiopia Region', am: 'ማዕከላዊ ኢትዮጵያ ክልል', om: 'Naannoo Giddugaleessa Itoophiyaa', ti: 'ክልል ማእከላይ ኢትዮጵያ', so: 'Deegaanka Bartamaha Itoobiya' },
    primaryLanguages: ['Hadiyyisa', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'south_ethiopia',
    shortTag: 'South Ethiopia',
    name: { en: 'South Ethiopia Region', am: 'ደቡብ ኢትዮጵያ ክልል', om: 'Naannoo Kibba Itoophiyaa', ti: 'ክልል ደቡብ ኢትዮጵያ', so: 'Deegaanka Koonfurta Itoobiya' },
    primaryLanguages: ['Wolayttatto', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'south_west_ethiopia',
    shortTag: 'South West Ethiopia',
    name: { en: 'South West Ethiopia Peoples’ Region', am: 'ደቡብ ምዕራብ ኢትዮጵያ ሕዝቦች ክልል', om: 'Naannoo Kibba Lixa Itoophiyaa', ti: 'ክልል ደቡብ ምዕራብ ኢትዮጵያ', so: 'Deegaanka Koonfur-Galbeed Itoobiya' },
    primaryLanguages: ['አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'harari',
    shortTag: 'Harari',
    name: { en: 'Harari Region', am: 'ሐረሪ ክልል', om: 'Naannoo Hararii', ti: 'ክልል ሐረሪ', so: 'Deegaanka Harari' },
    primaryLanguages: ['Harari (ሐረሪ)', 'Afaan Oromoo', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'dire_dawa',
    shortTag: 'Dire Dawa',
    name: { en: 'Dire Dawa City Administration', am: 'ድሬዳዋ ከተማ አስተዳደር', om: 'Bulchiinsa Magaalaa Dirree Dawaa', ti: 'ምምሕዳር ከተማ ድሬዳዋ', so: 'Maamulka Magaalada Diridhaba' },
    primaryLanguages: ['አማርኛ (Amharic)', 'Afaan Oromoo', 'Af-Soomaali', 'English'],
  },
  {
    id: 'afar',
    shortTag: 'Afar',
    name: { en: 'Afar Region', am: 'አፋር ክልል', om: 'Naannoo Affaar', ti: 'ክልል ዓፋር', so: 'Deegaanka Cafarta' },
    primaryLanguages: ['Qafar Af (Afar)', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'benishangul_gumuz',
    shortTag: 'Benishangul-Gumuz',
    name: { en: 'Benishangul-Gumuz Region', am: 'ቤኒሻንጉል ጉሙዝ ክልል', om: 'Naannoo Beenishaangul-Gumuz', ti: 'ክልል ቤኒሻንጉል ጉሙዝ', so: 'Deegaanka Benishangul-Gumuz' },
    primaryLanguages: ['አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'gambella',
    shortTag: 'Gambella',
    name: { en: 'Gambella Region', am: 'ጋምቤላ ክልል', om: 'Naannoo Gaambeellaa', ti: 'ክልል ጋምቤላ', so: 'Deegaanka Gambella' },
    primaryLanguages: ['Nuer / Anyuak', 'አማርኛ (Amharic)', 'English'],
  },
];

export const REGION_NAME_BY_ID: Record<EthiopianRegionId, EthiopianRegionMeta> =
  ETHIOPIAN_REGIONS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<EthiopianRegionId, EthiopianRegionMeta>);

export const ALL_INSTRUCTION_LANGUAGES: string[] = [
  'አማርኛ (Amharic)',
  'Afaan Oromoo',
  'ትግርኛ (Tigrinya)',
  'Af-Soomaali',
  'Sidaamu Afoo',
  'English',
  'Wolayttatto',
  'Hadiyyisa',
  'Harari (ሐረሪ)',
  'Qafar Af (Afar)',
  'Nuer / Anyuak',
];

export const EDUCATION_GRADE_OPTIONS: GradeBand[] = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'G1-4',
  'G5-6',
  'G7-8',
  'G9-10',
  'G11-12',
  'University',
];

export const EDUCATION_SUBJECT_OPTIONS: string[] = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Amharic',
  'Afaan Oromoo',
  'Tigrinya',
  'Af-Soomaali',
  'Sidaamu Afoo',
  'Qafar Af',
  'Environmental Science',
  'General Science',
  'Social Studies',
  'Citizenship / Civics',
  'History',
  'Geography',
  'Economics',
  'ICT',
];
