import React, { useMemo, useState } from 'react';
import { GraduationCap, Search } from 'lucide-react';
import { DigitalProduct, Language } from '../types';
import { EXTRA_T, fmt } from '../i18n/extraTranslations';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { UNIVERSITY_DEPARTMENTS, UNIVERSITY_YEARS, UNIVERSITY_YEAR_LABELS } from '../data/generatedCatalog';
import { ProductCard } from './ProductCard';

interface UniversityHubViewProps {
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

const PAGE = 12;

export const UniversityHubView: React.FC<UniversityHubViewProps> = ({
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
  const [year, setYear] = useState<string>('all');
  const [dept, setDept] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (year !== 'all' && p.uniYear !== year) return false;
      if (dept !== 'all' && p.department !== dept) return false;
      if (!q) return true;
      return (
        p.title[lang].toLowerCase().includes(q) ||
        p.title.en.toLowerCase().includes(q) ||
        (p.subject || '').toLowerCase().includes(q)
      );
    });
  }, [products, year, dept, query, lang]);

  const chip = (active: boolean) =>
    `min-h-[38px] whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
      active
        ? 'bg-emerald-700 text-white dark:bg-emerald-600'
        : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300'
    }`;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-800 text-amber-300">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">{x.uniTitle}</h1>
            <p className="text-sm text-stone-600 dark:text-stone-300">{x.uniSubtitle}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-300">{x.uniYearLabel}</div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button type="button" className={chip(year === 'all')} onClick={() => { setYear('all'); setVisible(PAGE); }}>
                {t.allOption}
              </button>
              {UNIVERSITY_YEARS.map((y) => (
                <button key={y} type="button" className={chip(year === y)} onClick={() => { setYear(y); setVisible(PAGE); }}>
                  {UNIVERSITY_YEAR_LABELS[y][lang]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-300">{x.uniDeptLabel}</div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button type="button" className={chip(dept === 'all')} onClick={() => { setDept('all'); setVisible(PAGE); }}>
                {t.allOption}
              </button>
              {UNIVERSITY_DEPARTMENTS.map((d) => (
                <button key={d.id} type="button" className={chip(dept === d.id)} onClick={() => { setDept(d.id); setVisible(PAGE); }}>
                  {d.name[lang]}
                </button>
              ))}
            </div>
          </div>
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value.slice(0, 120)); setVisible(PAGE); }}
              placeholder={t.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs font-medium text-stone-500 dark:text-stone-400">
        {fmt(x.showingOf, { shown: Math.min(visible, filtered.length), total: filtered.length })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.slice(0, visible).map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            lang={lang}
            inCart={cartIds.has(p.id)}
            isUnlocked={unlockedIds.has(p.id)}
            onAddToCart={onAddToCart}
            onPreview={onPreview}
            onDownloadFull={onOpenVault}
            ownerMode={ownerMode}
            onEdit={onEditItem}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
      {visible < filtered.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-6 text-sm font-semibold text-stone-800 hover:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
          >
            {x.loadMore}
          </button>
        </div>
      )}
    </section>
  );
};
