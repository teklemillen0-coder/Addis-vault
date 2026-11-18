import React, { useMemo, useState } from 'react';
import { BookOpenCheck, Check, ChevronDown, Eye, Pencil, ShieldCheck, ShoppingBag, Trash2 } from 'lucide-react';
import { DigitalProduct, Language } from '../types';
import { EXTRA_T } from '../i18n/extraTranslations';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface ExamArchivePanelProps {
  lang: Language;
  products: DigitalProduct[];
  cartIds: Set<string>;
  unlockedIds: Set<string>;
  onAddToCart: (id: string) => void;
  onPreview: (p: DigitalProduct) => void;
  onOpenVault: (p: DigitalProduct) => void;
  ownerMode?: boolean;
  onEditItem?: (p: DigitalProduct) => void;
  onDeleteItem?: (p: DigitalProduct) => void;
}

const GRADES = ['Grade 12', 'Grade 8', 'Grade 6'] as const;

function yearSortKey(label: string | undefined): number {
  const m = label?.match(/(\d{4})/);
  return m ? Number(m[1]) : -1;
}

/** National Ministry (G6, G8) & Matric (G12) archive, strictly Grade → Year → Subject. */
export const ExamArchivePanel: React.FC<ExamArchivePanelProps> = ({
  lang,
  products,
  cartIds,
  unlockedIds,
  onAddToCart,
  onPreview,
  onOpenVault,
  ownerMode,
  onEditItem,
  onDeleteItem,
}) => {
  const x = EXTRA_T[lang];
  const t = UI_TRANSLATIONS[lang];
  const [grade, setGrade] = useState<(typeof GRADES)[number]>('Grade 12');
  const [openYear, setOpenYear] = useState<string | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, DigitalProduct[]>();
    for (const p of products) {
      if (p.category !== 'national_exams' || p.gradeBand !== grade) continue;
      const key = p.examYear || 'Bundles';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    const entries = Array.from(map.entries()).map(([year, items]) => ({
      year,
      items: items.sort((a, b) => (a.subject || '').localeCompare(b.subject || '')),
    }));
    return entries.sort((a, b) => yearSortKey(b.year) - yearSortKey(a.year));
  }, [products, grade]);

  const activeYear = openYear ?? groups[0]?.year ?? null;

  return (
    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-5 dark:border-amber-900/40 dark:bg-amber-950/10">
      <div className="flex items-start gap-3">
        <BookOpenCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-700 dark:text-amber-400" />
        <div>
          <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">{x.examArchiveTitle}</h2>
          <p className="text-sm text-stone-600 dark:text-stone-300">{x.examArchiveSubtitle}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2" role="tablist">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={grade === g}
            onClick={() => {
              setGrade(g);
              setOpenYear(null);
            }}
            className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors ${
              grade === g
                ? 'bg-amber-600 text-white'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
            }`}
          >
            {g.replace('Grade', x.examGradeTab)}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {groups.map(({ year, items }) => {
          const open = activeYear === year;
          return (
            <div key={year} className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <button
                type="button"
                onClick={() => setOpenYear(open ? '' : year)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <span className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  {year === 'Bundles' ? (lang === 'am' ? 'የብዙ ዓመታት ጥቅሎች' : 'Multi-year bundles & practice packs') : year}
                </span>
                <span className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  {items.length} · {x.answerKeyIncluded}
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                </span>
              </button>
              {open && (
                <ul className="divide-y divide-stone-100 border-t border-stone-100 dark:divide-zinc-800 dark:border-zinc-800">
                  {items.map((p) => {
                    const unlocked = unlockedIds.has(p.id);
                    const inCart = cartIds.has(p.id);
                    return (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">{p.subject}</div>
                          <div className="truncate text-[11px] text-stone-500 dark:text-stone-400">{p.title[lang]}</div>
                        </div>
                        <span className="font-mono text-sm font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
                          {p.priceEtb} ETB
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPreview(p)}
                            aria-label={t.sampleBtn}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:text-stone-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {unlocked ? (
                            <button
                              type="button"
                              onClick={() => onOpenVault(p)}
                              className="flex h-9 items-center gap-1 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {t.vaultOpenBtn}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onAddToCart(p.id)}
                              className={`flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-semibold ${
                                inCart
                                  ? 'border border-emerald-600 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
                              }`}
                            >
                              {inCart ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                              {inCart ? t.addedToCartBtn : t.addToCartBtn}
                            </button>
                          )}
                          {ownerMode && onEditItem && (
                            <button
                              type="button"
                              onClick={() => onEditItem(p)}
                              aria-label="Edit item"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {ownerMode && onDeleteItem && (
                            <button
                              type="button"
                              onClick={() => onDeleteItem(p)}
                              aria-label="Delete item"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
