CREATE TABLE public.business_listings (
  id text PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  city text NOT NULL DEFAULT 'Addis Ababa',
  area text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL,
  description text NOT NULL DEFAULT '',
  hours text NOT NULL DEFAULT '',
  map_url text NOT NULL DEFAULT '',
  tier text NOT NULL DEFAULT 'basic',
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  ref_number text NOT NULL DEFAULT '',
  payment_method text NOT NULL DEFAULT 'telebirr',
  price_etb integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (id, name, category, city, area, address, phone, description, hours, map_url, tier, featured, status, created_at)
  ON public.business_listings TO anon, authenticated;
GRANT ALL ON public.business_listings TO service_role;

ALTER TABLE public.business_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active business listings"
  ON public.business_listings FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Admins can view all business listings"
  ON public.business_listings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX business_listings_status_idx ON public.business_listings (status, featured DESC, created_at DESC);