import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { saveCatalogItem } from '@/lib/catalog.functions';
import { CategoryId, DigitalProduct, Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { ETHIOPIAN_REGIONS, ALL_INSTRUCTION_LANGUAGES } from '../constants/educationRegions';
import { UNIVERSITY_DEPARTMENTS, UNIVERSITY_YEARS } from '../data/generatedCatalog';

export const OWNER_CATEGORIES: CategoryId[] = [
  'education',
  'national_exams',
  'university',
  'law_academy',
  'video_arts',
  'culinary',
  'medical',
  'research_history',
  'business_diaspora',
  'childrens_books',
  'gov_manuals',
  'repair_kits',
  'livestock',
  'business_ideas',
  'taxpayer_ed',
  'electronics_manuals',
  'architecture_plans',
  'auto_mechanic',
];

/** "+ Add New / አዲስ ጨምር" bar shown only in Owner Mode. */
export const OwnerActionBar: React.FC<{
  label: string;
  onAdd: () => void;
}> = ({ label, onAdd }) => (
  <div className="my-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-amber-500/70 bg-amber-50/70 px-3.5 py-2.5 dark:border-amber-500/50 dark:bg-amber-950/20">
    <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">{label}</span>
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 text-xs font-bold text-white hover:bg-amber-700"
    >
      <Plus className="h-4 w-4" />
      <span>+ Add New / አዲስ ጨምር</span>
    </button>
  </div>
);

interface EditorProps {
  lang: Language;
  open: boolean;
  item: DigitalProduct | null;
  defaults: Partial<DigitalProduct>;
  onClose: () => void;
  onSaved: () => void;
}

const field =
  'mt-1 h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100';

export const OwnerItemEditor: React.FC<EditorProps> = ({ lang, open, item, defaults, onClose, onSaved }) => {
  const t = UI_TRANSLATIONS[lang];
  const isNew = !item;
  const base = useMemo<Partial<DigitalProduct>>(() => item || defaults, [item, defaults]);
  const [form, setForm] = useState({
    titleEn: '',
    titleAm: '',
    descEn: '',
    descAm: '',
    price: 50,
    category: 'education' as string,
    gradeBand: '',
    subject: '',
    regionId: '',
    instructionLanguage: '',
    bookRole: '',
    uniYear: '',
    department: '',
    examYear: '',
    carBrand: '',
    modelYear: '',
    format: 'PDF',
    video: false,
    linkUrl: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      titleEn: base.title?.en || '',
      titleAm: base.title?.am || '',
      descEn: base.description?.en || '',
      descAm: base.description?.am || '',
      price: base.priceEtb ?? 50,
      category: base.category || 'education',
      gradeBand: base.gradeBand || '',
      subject: base.subject || '',
      regionId: base.regionId || '',
      instructionLanguage: base.instructionLanguage || '',
      bookRole: base.bookRole || '',
      uniYear: base.uniYear || '',
      department: base.department || '',
      examYear: base.examYear || '',
      carBrand: base.carBrand || '',
      modelYear: base.modelYear || '',
      format: base.format || 'PDF',
      video: Boolean(base.hasVideoPreview),
      linkUrl: '',
    });
    setFile(null);
    setError(null);
  }, [open, base]);

  if (!open) return null;

  const set = (k: keyof typeof form, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (form.titleEn.trim().length < 2 && form.titleAm.trim().length < 2) {
      setError('Title is required / ርዕስ ያስፈልጋል');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const id = item?.id || `own-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      let filePath: string | undefined;
      if (file) {
        const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
        filePath = `${id}/${Date.now()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from('vault-files').upload(filePath, file, { upsert: true });
        if (upErr) throw new Error('Upload failed / መጫን አልተሳካም');
      }
      const titleEn = form.titleEn.trim() || form.titleAm.trim();
      const titleAm = form.titleAm.trim() || titleEn;
      const descEn = form.descEn.trim() || titleEn;
      const descAm = form.descAm.trim() || descEn;
      const opt = (v: string) => (v.trim() ? v.trim() : undefined);
      const res = await saveCatalogItem({
        data: {
          id,
          action: isNew ? 'add' : 'edit',
          category: form.category,
          payload: {
            title: { en: titleEn, am: titleAm, om: titleEn, ti: titleEn, so: titleEn },
            description: { en: descEn, am: descAm, om: descEn, ti: descEn, so: descEn },
            priceEtb: Math.max(0, Math.round(Number(form.price) || 0)),
            category: form.category,
            format: form.video ? 'MP4 Video + PDF' : form.format || 'PDF',
            gradeBand: opt(form.gradeBand),
            subject: opt(form.subject),
            regionId: opt(form.regionId),
            instructionLanguage: opt(form.instructionLanguage),
            bookRole: opt(form.bookRole),
            uniYear: opt(form.uniYear),
            department: opt(form.department),
            examYear: opt(form.examYear),
            carBrand: opt(form.carBrand),
            modelYear: opt(form.modelYear),
            hasVideoPreview: form.video,
            ...(item?.coverImage ? { coverImage: item.coverImage } : {}),
          },
          ...(filePath ? { filePath } : {}),
          ...(form.linkUrl.trim() ? { linkUrl: form.linkUrl.trim() } : {}),
        },
      });
      if (!res.ok) throw new Error(res.error);
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const cat = form.category;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-stone-200 bg-white shadow-2xl sm:rounded-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-3.5 dark:border-zinc-800">
          <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
            {isNew ? '+ Add New / አዲስ ጨምር' : 'Edit / አስተካክል'}
          </h2>
          <button type="button" onClick={onClose} aria-label={t.closeBtn} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5 text-xs font-semibold text-stone-700 dark:text-stone-300">
          <label className="block">Title (English)<input className={field} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value.slice(0, 300))} /></label>
          <label className="block">ርዕስ (አማርኛ)<input className={field} value={form.titleAm} onChange={(e) => set('titleAm', e.target.value.slice(0, 300))} /></label>
          <label className="block">Description (English)<textarea className={`${field} h-20 py-2`} value={form.descEn} onChange={(e) => set('descEn', e.target.value.slice(0, 380))} /></label>
          <label className="block">መግለጫ (አማርኛ)<textarea className={`${field} h-20 py-2`} value={form.descAm} onChange={(e) => set('descAm', e.target.value.slice(0, 380))} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">Price / ዋጋ (ETB)<input type="number" min={0} className={field} value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></label>
            <label className="block">Category / ዘርፍ
              <select className={field} value={form.category} onChange={(e) => set('category', e.target.value)}>
                {OWNER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t.categories[c]}</option>
                ))}
              </select>
            </label>
          </div>
          {(cat === 'education' || cat === 'national_exams' || cat === 'video_arts') && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">Grade<input className={field} placeholder="Grade 9" value={form.gradeBand} onChange={(e) => set('gradeBand', e.target.value)} /></label>
              <label className="block">Subject<input className={field} value={form.subject} onChange={(e) => set('subject', e.target.value)} /></label>
            </div>
          )}
          {cat === 'education' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">Region
                <select className={field} value={form.regionId} onChange={(e) => set('regionId', e.target.value)}>
                  <option value="">—</option>
                  {ETHIOPIAN_REGIONS.map((r) => <option key={r.id} value={r.id}>{r.name[lang]}</option>)}
                </select>
              </label>
              <label className="block">Language
                <select className={field} value={form.instructionLanguage} onChange={(e) => set('instructionLanguage', e.target.value)}>
                  <option value="">—</option>
                  {ALL_INSTRUCTION_LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              <label className="block">Book type
                <select className={field} value={form.bookRole} onChange={(e) => set('bookRole', e.target.value)}>
                  <option value="">—</option>
                  <option value="Student Textbook">Student Textbook</option>
                  <option value="Teacher's Guide">Teacher's Guide</option>
                </select>
              </label>
            </div>
          )}
          {cat === 'national_exams' && (
            <label className="block">Exam year<input className={field} placeholder="2018 E.C. (2026)" value={form.examYear} onChange={(e) => set('examYear', e.target.value)} /></label>
          )}
          {cat === 'university' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">Year
                <select className={field} value={form.uniYear} onChange={(e) => set('uniYear', e.target.value)}>
                  <option value="">—</option>
                  {UNIVERSITY_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <label className="block">Department
                <select className={field} value={form.department} onChange={(e) => set('department', e.target.value)}>
                  <option value="">—</option>
                  {UNIVERSITY_DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
                </select>
              </label>
            </div>
          )}
          {cat === 'auto_mechanic' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="block">Car brand<input className={field} value={form.carBrand} onChange={(e) => set('carBrand', e.target.value)} /></label>
              <label className="block">Model years<input className={field} placeholder="2015–2020" value={form.modelYear} onChange={(e) => set('modelYear', e.target.value)} /></label>
            </div>
          )}
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.video} onChange={(e) => set('video', e.target.checked)} />
            <span>Video course / የቪዲዮ ትምህርት</span>
          </label>
          <label className="block">
            Upload file (PDF, Word, MP4…) / ፋይል ይጫኑ
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-stone-300 p-3 dark:border-zinc-700">
              <Upload className="h-4 w-4" />
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
            </span>
          </label>
          <label className="block">Or paste a link (https://…) / ሊንክ ይለጥፉ<input className={field} value={form.linkUrl} onChange={(e) => set('linkUrl', e.target.value.slice(0, 900))} /></label>
          {error && <p className="text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-stone-200 px-5 py-3.5 dark:border-zinc-800">
          <button type="button" onClick={onClose} className="min-h-[42px] rounded-xl border border-stone-300 px-4 text-sm font-semibold dark:border-zinc-700">{t.closeBtn}</button>
          <button type="button" disabled={busy} onClick={handleSave} className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-amber-600 px-5 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>Save / አስቀምጥ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
