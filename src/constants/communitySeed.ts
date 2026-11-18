import { WorkerSkillCategory } from '../types';

export const WORKER_CATEGORIES: {
  id: WorkerSkillCategory;
  labels: { en: string; am: string; om: string; ti: string; so: string };
}[] = [
  {
    id: 'housemaid',
    labels: {
      en: 'Housemaid / Domestic Worker',
      am: 'የቤት ሰራተኛ (Housemaid)',
      om: 'Hojjetaa Manaa',
      ti: 'ሰራሕተኛ ገዛ',
      so: 'Shaqaalaha Guriga',
    },
  },
  {
    id: 'plumber',
    labels: {
      en: 'Plumber',
      am: 'ቧምቧ ሰራተኛ (Plumber)',
      om: 'Hojjetaa Ujummoo Bishaanii',
      ti: 'ሰራሕተኛ ቧምቧ',
      so: 'Farsamo-yaqaan Tubbooyinka',
    },
  },
  {
    id: 'gypsum',
    labels: {
      en: 'Gypsum & Finishing Worker',
      am: 'ጂብሰም እና ፊኒሺንግ ሰራተኛ',
      om: 'Hojjetaa Jiipsamii fi Xumuraa',
      ti: 'ሰራሕተኛ ጂብሰምን ፊኒሺንግን',
      so: 'Shaqaalaha Gypsum & Qurxinta',
    },
  },
  {
    id: 'electrician',
    labels: {
      en: 'Electrician',
      am: 'ኤሌክትሪሻን (Electrician)',
      om: 'Elektirishiinii',
      ti: 'ኤሌክትሪሻን',
      so: 'Koronto-yaqaan',
    },
  },
  {
    id: 'tutor',
    labels: {
      en: 'Home Tutor / Teacher',
      am: 'አስጠኚ እና መምህር (Tutor)',
      om: 'Barsiisaa / Qoʼachiisaa',
      ti: 'ኣስጠኚ / መምህር',
      so: 'Macallin Guri',
    },
  },
  {
    id: 'driver',
    labels: {
      en: 'Licensed Driver',
      am: 'ሹፌር (Driver)',
      om: 'Konkolaachisaa',
      ti: 'መራሕ መኪና',
      so: 'Darawal',
    },
  },
  {
    id: 'skilled_labor',
    labels: {
      en: 'Carpenter / Mason / Skilled Labor',
      am: 'አናጺ / ግንበኛ / ልዩ ባለሙያ',
      om: 'Muka-hoo / Gimbii / Ogummaa',
      ti: 'ነዳቓይ / ነዳቓይ ሓጺን',
      so: 'Farsamo-yaqaan Guud',
    },
  },
];
