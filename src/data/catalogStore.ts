/**
 * Live catalog = built-in catalog (PRODUCTS) + owner changes saved in the database
 * (adds, edits, deletes). Every price check and listing reads from here.
 */
import { useSyncExternalStore } from 'react';
import { DigitalProduct } from '../types';
import { PRODUCTS } from './products';

export interface CatalogChangeRow {
  id: string;
  action: string;
  category: string;
  payload: Partial<DigitalProduct> & { hasFile?: boolean; hasLink?: boolean };
}

const COVER_FALLBACK = '/__l5e/assets-v1/aa722536-1f04-401e-b74f-02b4a98d1fe6/cat_ebooks_guides_1794711378299.jpg';

let current: DigitalProduct[] = PRODUCTS;
let byId: Map<string, DigitalProduct> = new Map(PRODUCTS.map((p) => [p.id, p]));
let ownerFileIds = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function normalizeAdded(row: CatalogChangeRow): DigitalProduct {
  const p = row.payload || {};
  const title = p.title || { en: 'Untitled', am: 'Untitled', om: 'Untitled', ti: 'Untitled', so: 'Untitled' };
  const description = p.description || title;
  return {
    id: row.id,
    sku: p.sku || `AV-${row.id.slice(-6).toUpperCase()}`,
    category: (p.category || row.category || 'education') as DigitalProduct['category'],
    priceEtb: Math.max(0, Math.round(Number(p.priceEtb ?? 0))),
    format: p.format || 'PDF',
    fileSize: p.fileSize || '—',
    fileExtension: p.fileExtension || 'html',
    coverImage: p.coverImage || COVER_FALLBACK,
    accentPattern: p.accentPattern || 'diamond',
    title,
    description,
    highlights: p.highlights || { en: [], am: [], om: [], ti: [], so: [] },
    sampleExcerpt: p.sampleExcerpt || description,
    ...p,
  } as DigitalProduct;
}

export function applyCatalogChanges(rows: CatalogChangeRow[]) {
  const deleted = new Set<string>();
  const edits = new Map<string, Partial<DigitalProduct>>();
  const added: DigitalProduct[] = [];
  ownerFileIds = new Set();
  for (const row of rows) {
    const pdfUrl = typeof row.payload?.sourcePdfUrl === 'string' ? row.payload.sourcePdfUrl : '';
    const looksPdf = Boolean(pdfUrl && new URL(pdfUrl, 'https://addis-vault.local').pathname.toLowerCase().endsWith('.pdf'));
    if (row.payload?.hasPdf || looksPdf) ownerFileIds.add(row.id);
    if (row.action === 'delete') deleted.add(row.id);
    else if (row.action === 'edit') edits.set(row.id, row.payload || {});
    else added.push(normalizeAdded(row));
  }
  const base = PRODUCTS.filter((p) => !deleted.has(p.id)).map((p) => {
    const e = edits.get(p.id);
    if (!e) return p;
    const { hasFile: _f, hasLink: _l, ...rest } = e as Record<string, unknown>;
    return { ...p, ...(rest as Partial<DigitalProduct>) };
  });
  current = [...added.filter((p) => !deleted.has(p.id)), ...base];
  byId = new Map(current.map((p) => [p.id, p]));
  emit();
}

export function getCatalog(): DigitalProduct[] {
  return current;
}

export function getCatalogItem(id: string): DigitalProduct | undefined {
  return byId.get(id);
}

/** True when the owner attached a real uploaded file or link to this item. */
export function hasOwnerFile(id: string): boolean {
  return ownerFileIds.has(id);
}

export function isRealPdfAvailable(product: DigitalProduct): boolean {
  if (hasOwnerFile(product.id)) return true;
  if (!product.sourcePdfUrl) return false;
  try {
    return new URL(product.sourcePdfUrl).pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
}

export function useCatalog(): DigitalProduct[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => PRODUCTS
  );
}
