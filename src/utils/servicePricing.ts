/**
 * Authoritative ETB pricing for pay-after-preview services.
 * Prices are always recomputed from these tables / formulas at checkout.
 */
import { PendingService } from '../types';

export interface DirectoryTier {
  id: string;
  priceEtb: number;
  label: { en: string; am: string };
  perks: { en: string; am: string };
}

/** Business Location Directory registration: 100–300 ETB. Searching is always free. */
export const DIRECTORY_TIERS: DirectoryTier[] = [
  {
    id: 'basic',
    priceEtb: 100,
    label: { en: 'Basic Listing', am: 'መሠረታዊ ምዝገባ' },
    perks: { en: 'Name, category, location & phone', am: 'ስም፣ ዘርፍ፣ አድራሻና ስልክ' },
  },
  {
    id: 'standard',
    priceEtb: 200,
    label: { en: 'Standard Listing', am: 'መደበኛ ምዝገባ' },
    perks: { en: 'Basic + description, opening hours & map link', am: 'መሠረታዊ + መግለጫ፣ የስራ ሰዓትና ካርታ' },
  },
  {
    id: 'featured',
    priceEtb: 300,
    label: { en: 'Featured Listing', am: 'ተለይቶ የሚታይ ምዝገባ' },
    perks: { en: 'Standard + shown first with a Featured badge', am: 'መደበኛ + ቀድሞ የሚታይ ልዩ ምልክት' },
  },
];

export function directoryTierPrice(tierId: string | undefined): number {
  return DIRECTORY_TIERS.find((t) => t.id === tierId)?.priceEtb ?? DIRECTORY_TIERS[0].priceEtb;
}

/**
 * AI Video Studio: pay after preview, by duration.
 * Up to 1 minute = 50 ETB. Above 1 minute: 120 ETB for up to 2 minutes, then +55 ETB per started minute
 * (3 min = 175, 5 min = 285, 9 min = 505 …).
 */
export function videoStudioPriceEtb(durationSec: number): number {
  const sec = Math.max(1, Math.round(durationSec || 0));
  const minutes = Math.ceil(sec / 60);
  if (minutes <= 1) return 50;
  return 120 + (minutes - 2) * 55;
}

/**
 * AI Video Ad Studio (multi-platform promo): 150–500 ETB.
 * 150 ETB for one platform; +100 ETB per extra platform; +50 ETB when longer than 30 seconds; capped at 500 ETB.
 */
export function adStudioPriceEtb(platformCount: number, durationSec: number): number {
  const platforms = Math.max(1, Math.min(5, Math.round(platformCount || 1)));
  const base = 150 + (platforms - 1) * 100 + (durationSec > 30 ? 50 : 0);
  return Math.min(500, base);
}

export function servicePriceEtb(service: PendingService): number {
  switch (service.kind) {
    case 'directory_listing':
      return directoryTierPrice(service.params.tierId);
    case 'video_studio':
      return videoStudioPriceEtb(service.params.durationSec ?? 60);
    case 'ad_studio':
      return adStudioPriceEtb(service.params.platformCount ?? 1, service.params.durationSec ?? 15);
    default:
      return 0;
  }
}
