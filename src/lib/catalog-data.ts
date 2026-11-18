import { supabase } from '@/integrations/supabase/client';
import { applyCatalogChanges, CatalogChangeRow } from '@/data/catalogStore';

const CACHE_KEY = 'addisvault_catalog_changes';

/** Loads owner catalog changes (public read) and applies them; falls back to the last cached copy offline. */
export async function reloadCatalogChanges(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, action, category, payload')
      .order('created_at', { ascending: false })
      .limit(5000);
    if (error) throw error;
    const rows = (data || []) as unknown as CatalogChangeRow[];
    applyCatalogChanges(rows);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
    } catch {
      // ignore quota
    }
  } catch {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) applyCatalogChanges(JSON.parse(cached) as CatalogChangeRow[]);
    } catch {
      // ignore
    }
  }
}
