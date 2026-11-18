import React from 'react';
import { Download, PackageCheck, Store } from 'lucide-react';
import { AdConfig, DigitalProduct, Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { AdSlot } from './AdSlot';

interface DownloadsViewProps {
  lang: Language;
  allProducts: DigitalProduct[];
  onOpenInVault: (product: DigitalProduct, order: null) => void;
  onBrowseMarketplace: () => void;
  adConfig: AdConfig;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  lang,
  allProducts,
  onOpenInVault,
  onBrowseMarketplace,
  adConfig,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const unlockedEntries = allProducts.map((product) => ({ product, order: null }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t.downloadsTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600 dark:text-stone-400">
            {t.downloadsSubtitle}
          </p>
        </div>

      </div>

      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
        Published catalog entries are available to everyone.
      </p>

      {unlockedEntries.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <PackageCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            {t.downloadsEmptyTitle}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-stone-600 dark:text-stone-400">
            {t.downloadsEmptyBody}
          </p>
          <button
            type="button"
            onClick={onBrowseMarketplace}
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Store className="h-4 w-4" />
            <span>{t.browseStoreBtn}</span>
          </button>
        </div>
      ) : (
        <>
          <div>
            <AdSlot
              slot="download_page"
              adConfig={adConfig}
              lang={lang}
              onTrackImpression={onTrackAdImpression}
              onTrackClick={onTrackAdClick}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedEntries.map(({ product, order }) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={product.coverImage}
                    alt={product.title[lang]}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-stone-200">
                    <span className="font-mono text-amber-300">{product.sku}</span>
                    <span className="font-mono">{product.fileSize}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {t.categories[product.category]} · {product.format}
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    {product.title[lang]}
                  </h3>

                  <div className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-xs text-stone-600 dark:border-zinc-800 dark:text-stone-400">
                    <div className="flex justify-between">
                      <span>Access</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Free</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenInVault(product, null)}
                    className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                  >
                    <Download className="h-4 w-4" />
                    <span>{t.vaultOpenBtn}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
