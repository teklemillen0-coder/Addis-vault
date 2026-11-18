import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { loadPublicBusinessDirectory, PublicBusinessListing } from '@/lib/community-data';
import { submitBusinessListing } from '@/lib/directory.functions';
import { AdConfig, Language, PaymentMethod, PendingService } from '@/types';
import { UI_TRANSLATIONS } from '@/i18n/translations';
import { sanitizePhone, sanitizeUserInput } from '@/utils/appSecurity';
import { DIRECTORY_TIERS, directoryTierPrice } from '@/utils/servicePricing';
import { AdSlot } from './AdSlot';

type DirectoryTierId = 'basic' | 'standard' | 'featured';

interface BusinessDirectoryViewProps {
  lang: Language;
  adConfig: AdConfig;
  vipActive: boolean;
  lastConfirmedService: {
    service: PendingService;
    refNumber: string;
    paymentMethod: PaymentMethod;
  } | null;
  onConsumeConfirmedService: () => void;
  onRequestServiceCheckout: (service: PendingService) => void;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

const DIRECTORY_CATEGORIES = [
  'All Categories',
  'Cafe & Restaurant',
  'Clinic & Pharmacy',
  'Electronics & Repair',
  'Legal & Consultancy',
  'Real Estate & Construction',
  'Retail & Supermarket',
  'Transport & Logistics',
  'Training & Education',
  'General Service',
];

const ETHIOPIAN_CITIES = [
  'Addis Ababa',
  'Adama',
  'Hawassa',
  'Bahir Dar',
  'Mekelle',
  'Dire Dawa',
  'Gondar',
  'Jimma',
  'Dessie',
  'Jijiga',
  'Arba Minch',
  'Shashamane',
];

export const BusinessDirectoryView: React.FC<BusinessDirectoryViewProps> = ({
  lang,
  adConfig,
  lastConfirmedService,
  onConsumeConfirmedService,
  onRequestServiceCheckout,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [listings, setListings] = useState<PublicBusinessListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [savingNotice, setSavingNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration draft preserved until checkout payment is confirmed
  const [pendingListingId, setPendingListingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cafe & Restaurant');
  const [city, setCity] = useState('Addis Ababa');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tier, setTier] = useState<DirectoryTierId>('standard');

  const refreshDirectory = async () => {
    setLoading(true);
    try {
      const data = await loadPublicBusinessDirectory();
      setListings(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDirectory();
  }, []);

  // Automatically finalize paid business listing once CheckoutModal confirms payment
  useEffect(() => {
    if (
      !lastConfirmedService ||
      lastConfirmedService.service.kind !== 'directory_listing' ||
      !pendingListingId
    ) {
      return;
    }

    const persistPaidListing = async () => {
      try {
        const res = await submitBusinessListing({
          data: {
            id: pendingListingId,
            name: sanitizeUserInput(name, 120),
            category: sanitizeUserInput(category, 60),
            city: sanitizeUserInput(city, 60),
            area: sanitizeUserInput(area, 80),
            address: sanitizeUserInput(address, 200),
            phone: sanitizePhone(phone),
            description: tier === 'basic' ? '' : sanitizeUserInput(description, 800),
            hours: tier === 'basic' ? '' : sanitizeUserInput(hours, 120),
            mapUrl: tier === 'basic' ? '' : sanitizeUserInput(mapUrl, 400),
            tier,
            refNumber: lastConfirmedService.refNumber,
            paymentMethod: lastConfirmedService.paymentMethod,
          },
        });
        if (res.ok) {
          setSavingNotice(
            `Published "${name}" live to the Ethiopia Business Directory (${lastConfirmedService.refNumber}).`
          );
          setPendingListingId(null);
          setName('');
          setArea('');
          setAddress('');
          setPhone('');
          setHours('');
          setMapUrl('');
          setDescription('');
          setShowRegisterForm(false);
          await refreshDirectory();
        } else {
          setErrorNotice(res.error || 'Could not publish your business listing.');
        }
      } catch {
        setErrorNotice('Network error while publishing directory listing.');
      } finally {
        onConsumeConfirmedService();
      }
    };

    void persistPaidListing();
  }, [
    lastConfirmedService,
    pendingListingId,
    name,
    category,
    city,
    area,
    address,
    phone,
    hours,
    mapUrl,
    description,
    tier,
    onConsumeConfirmedService,
  ]);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return listings.filter((item) => {
      if (selectedCategory !== 'All Categories' && item.category !== selectedCategory) return false;
      if (selectedCity !== 'All Cities' && item.city !== selectedCity) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [listings, searchQuery, selectedCategory, selectedCity]);

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);
    if (!name.trim() || !phone.trim()) {
      setErrorNotice('Please enter both Business Name and Phone Number.');
      return;
    }
    const listingId = `biz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setIsSubmitting(true);
    try {
      const result = await submitBusinessListing({
        data: {
          id: listingId,
          name: sanitizeUserInput(name, 120),
          category: sanitizeUserInput(category, 60),
          city: sanitizeUserInput(city, 60),
          area: sanitizeUserInput(area, 80),
          address: sanitizeUserInput(address, 200),
          phone: sanitizePhone(phone),
          description: sanitizeUserInput(description, 800),
          hours: sanitizeUserInput(hours, 120),
          mapUrl: sanitizeUserInput(mapUrl, 400),
          tier: 'basic',
          refNumber: '',
          paymentMethod: 'free',
        },
      });
      if (!result.ok) {
        setErrorNotice(result.error);
        return;
      }
      setSavingNotice(`Published "${name}" to the free Ethiopia Business Directory.`);
      setName('');
      setArea('');
      setAddress('');
      setPhone('');
      setHours('');
      setMapUrl('');
      setDescription('');
      setShowRegisterForm(false);
      await refreshDirectory();
    } catch {
      setErrorNotice('Network error while publishing directory listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <AdSlot
        slot="top_banner"
        adConfig={adConfig}
        lang={lang}
        onTrackImpression={onTrackAdImpression}
        onTrackClick={onTrackAdClick}
      />

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <MapPin className="h-4 w-4" />
            <span>Ethiopia Business Location Directory · የንግድ አድራሻ ማውጫ</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Find Local Ethiopian Businesses &amp; Register Your Shop
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-stone-600 dark:text-stone-400">
            Search and publish business listings across Addis Ababa and regional cities for free.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRegisterForm((prev) => !prev)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          <span>{showRegisterForm ? 'Close Registration Form' : 'List a Business — Free'}</span>
        </button>
      </div>

      {savingNotice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{savingNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm font-semibold text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          {errorNotice}
        </div>
      )}

      {/* Free public business listing form */}
      {showRegisterForm && (
        <form
          onSubmit={handleSubmitRegistration}
          className="rounded-2xl border border-emerald-700/30 bg-white p-5 sm:p-6 space-y-5 shadow-sm dark:border-emerald-500/30 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-zinc-800">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                List Your Business in AddisVault Directory
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Listings are free and published after server-side validation.
              </p>
            </div>
            <span className="font-mono text-sm font-extrabold text-emerald-800 dark:text-emerald-400">Free</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Business / Shop Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Selam Optical & Pharmacy"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Business Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              >
                {DIRECTORY_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                City *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              >
                {ETHIOPIAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Neighborhood / Sub-City (Sefer)
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Bole Medhanialem / Piassa"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Exact Landmark / Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Friendship Bldg Ground Floor #12"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XXXXXXXX"
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
          </div>

          {(
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Opening Hours
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Mon–Sat 8:00 AM – 8:00 PM"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Google Maps Link (https://...)
                </label>
                <input
                  type="url"
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Services &amp; Business Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your products, specialties, or delivery coverage..."
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isSubmitting ? 'Publishing…' : 'Publish Business — Free'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Controls (100% Free) */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business name, street, area (Bole, Piassa, Kirkos), service, or phone..."
              className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            >
              {DIRECTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            >
              <option value="All Cities">All Cities (Ethiopia)</option>
              {ETHIOPIAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-stone-200 bg-white py-16 text-sm text-stone-500 dark:border-zinc-800 dark:bg-zinc-900">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-700" />
          <span>Loading Ethiopia Business Directory...</span>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            {listings.length === 0 ? 'Be the first business listed here' : t.noResultsTitle}
          </h2>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {listings.length === 0
              ? 'Register your shop, clinic, office, or local service starting at 100 ETB so customers across Ethiopia can find and call you directly.'
              : 'Try another city, area, or category keyword.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.map((biz) => (
            <article
              key={biz.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                biz.featured
                  ? 'border-amber-400 bg-amber-50/30 shadow-sm dark:border-amber-600/60 dark:bg-amber-950/10'
                  : 'border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-400">
                    {biz.category}
                  </span>
                  {biz.featured && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  {biz.name}
                </h3>

                <div className="flex items-start gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <span>
                    {[biz.area, biz.city].filter(Boolean).join(', ')}
                    {biz.address ? ` — ${biz.address}` : ''}
                  </span>
                </div>

                {biz.description && (
                  <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                    {biz.description}
                  </p>
                )}

                {biz.hours && (
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>{biz.hours}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3 dark:border-zinc-800">
                <a
                  href={`tel:${biz.phone.replace(/\s+/g, '')}`}
                  className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{biz.phone}</span>
                </a>
                {biz.map_url && (
                  <a
                    href={biz.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[38px] items-center justify-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Map</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
