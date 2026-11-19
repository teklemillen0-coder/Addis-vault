import React, { useMemo, useState } from 'react';
import { Loader2, RefreshCw, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { saveCatalogItem } from '@/lib/catalog.functions';
import { getCatalog, isRealPdfAvailable } from '@/data/catalogStore';
import { reloadCatalogChanges } from '@/lib/catalog-data';

function isDirectPdfUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
}

function matchItem(filename: string) {
  const catalog = getCatalog();
  const normalized = filename.toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return catalog.find((item) => {
    const candidates = [item.id, item.sku, item.title.en, item.title.am];
    return candidates.some((candidate) => {
      const key = candidate.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      return key && (normalized.includes(key) || key.includes(normalized));
    });
  });
}

export const OwnerPdfManager: React.FC = () => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [csvText, setCsvText] = useState('');
  const catalog = useMemo(() => getCatalog(), [busy, message]);
  const linkedCount = catalog.filter(isRealPdfAvailable).length;

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let attached = 0;
    let rejected = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          rejected += 1;
          continue;
        }
        const item = matchItem(file.name);
        if (!item) {
          rejected += 1;
          continue;
        }
        const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, '_').slice(-100);
        const filePath = `${item.id}/${Date.now()}-${safeName}`;
        const { error } = await supabase.storage.from('vault-files').upload(filePath, file, { upsert: true });
        if (error) {
          rejected += 1;
          continue;
        }
        const result = await saveCatalogItem({ data: {
          id: item.id,
          action: 'edit',
          category: item.category,
          payload: {
            title: item.title,
            description: item.description,
            priceEtb: item.priceEtb,
            category: item.category,
            format: 'PDF',
            gradeBand: item.gradeBand,
            subject: item.subject,
            uniYear: item.uniYear,
            department: item.department,
            examYear: item.examYear,
          },
          filePath,
        } });
        if (result.ok) attached += 1;
        else rejected += 1;
      }
      await reloadCatalogChanges();
      setMessage(`Attached ${attached} full PDF${attached === 1 ? '' : 's'}; ${rejected} file${rejected === 1 ? '' : 's'} could not be matched or attached.`);
    } finally {
      setBusy(false);
    }
  };

  const importCsv = async () => {
    setBusy(true);
    let attached = 0;
    let rejected = 0;
    try {
      const catalog = getCatalog();
      const rows = csvText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      for (const row of rows) {
        const parts = row.includes('\t') ? row.split('\t') : row.split(',');
        const key = parts[0]?.trim().replace(/^"|"$/g, '') || '';
        const url = parts.slice(1).join(',').trim().replace(/^"|"$/g, '');
        const item = catalog.find((candidate) => candidate.id === key || candidate.sku === key);
        if (!item || !isDirectPdfUrl(url)) {
          rejected += 1;
          continue;
        }
        const result = await saveCatalogItem({ data: {
          id: item.id,
          action: 'edit',
          category: item.category,
          payload: {
            title: item.title,
            description: item.description,
            priceEtb: item.priceEtb,
            category: item.category,
            format: 'PDF',
            gradeBand: item.gradeBand,
            subject: item.subject,
            uniYear: item.uniYear,
            department: item.department,
            examYear: item.examYear,
            sourcePdfUrl: url,
          },
          linkUrl: url,
        } });
        if (result.ok) attached += 1;
        else rejected += 1;
      }
      await reloadCatalogChanges();
      setMessage(`Imported ${attached} official/direct PDF URL${attached === 1 ? '' : 's'}; ${rejected} row${rejected === 1 ? '' : 's'} rejected.`);
    } finally {
      setBusy(false);
    }
  };

  const syncOfficialUrls = async () => {
    setBusy(true);
    await reloadCatalogChanges();
    const syncedCatalog = getCatalog();
    const syncedCount = syncedCatalog.filter(isRealPdfAvailable).length;
    setMessage(`Official/owner PDF sync complete. ${syncedCount} of ${syncedCatalog.length} catalog items currently have a verified PDF source.`);
    setBusy(false);
  };

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">Bulk PDF Manager</h2>
          <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">Upload real full PDFs or import verified direct `.pdf` URLs. Summary PDFs are never imported.</p>
        </div>
        <button type="button" onClick={syncOfficialUrls} disabled={busy} className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-emerald-600 px-4 text-xs font-bold text-emerald-800 disabled:opacity-50 dark:text-emerald-300">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Sync Official PDFs
        </button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block rounded-xl border border-dashed border-stone-300 p-4 text-xs font-semibold text-stone-700 dark:border-zinc-700 dark:text-stone-300">
          <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Bulk PDF files</span>
          <input type="file" accept="application/pdf,.pdf" multiple onChange={(event) => void uploadFiles(event.target.files)} className="mt-3 block w-full text-xs" />
        </label>

        <div className="rounded-xl border border-stone-200 p-4 dark:border-zinc-800">
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
            CSV / TSV direct PDF URLs
            <textarea value={csvText} onChange={(event) => setCsvText(event.target.value)} placeholder={'SKU_or_ID,https://official-source/item.pdf'} className="mt-2 h-24 w-full rounded-lg border border-stone-300 p-2 text-xs font-normal dark:border-zinc-700 dark:bg-zinc-950" />
          </label>
          <button type="button" onClick={importCsv} disabled={busy || !csvText.trim()} className="mt-3 min-h-[38px] rounded-lg bg-amber-600 px-3 text-xs font-bold text-white disabled:opacity-50">Import PDF URLs</button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3 text-xs dark:bg-zinc-950">
        <span className="font-semibold text-stone-700 dark:text-stone-300">Full-PDF coverage</span>
        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{linkedCount} / {catalog.length}</span>
      </div>
      {message && <p className="mt-3 text-xs font-semibold text-emerald-800 dark:text-emerald-400">{message}</p>}
    </section>
  );
};
