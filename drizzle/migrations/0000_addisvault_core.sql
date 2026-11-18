-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_code text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  region text NOT NULL DEFAULT 'Addis Ababa',
  member_role text NOT NULL DEFAULT 'Student',
  share_phone boolean NOT NULL DEFAULT false,
  verified_buyer boolean NOT NULL DEFAULT false,
  points integer NOT NULL DEFAULT 20,
  downloads_count integer NOT NULL DEFAULT 0,
  purchases_count integer NOT NULL DEFAULT 0,
  referrals_count integer NOT NULL DEFAULT 0,
  helpful_chats_count integer NOT NULL DEFAULT 0,
  last_login_bonus_at timestamptz,
  legacy_member_id text UNIQUE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, region, member_role, share_phone) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own profile" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Members update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  code text;
  r text := left(COALESCE(meta->>'member_role', 'Student'), 40);
BEGIN
  IF r NOT IN ('Student', 'Professional', 'Business Owner', 'Lawyer', 'Artisan') THEN
    r := 'Student';
  END IF;
  LOOP
    code := 'AV-MBR-' || lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE member_code = code);
  END LOOP;
  INSERT INTO public.profiles (id, member_code, full_name, email, phone, region, member_role, share_phone)
  VALUES (
    NEW.id,
    code,
    left(COALESCE(NULLIF(meta->>'full_name', ''), split_part(COALESCE(NEW.email, ''), '@', 1)), 100),
    NEW.email,
    NULLIF(left(COALESCE(meta->>'phone', ''), 24), ''),
    left(COALESCE(NULLIF(meta->>'region', ''), 'Addis Ababa'), 80),
    r,
    COALESCE((meta->>'share_phone')::boolean, false)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Daily login bonus (+10 points, at most once every 20 hours)
CREATE OR REPLACE FUNCTION public.claim_login_bonus()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_points integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  UPDATE public.profiles
     SET points = points + 10, last_login_bonus_at = now(), updated_at = now()
   WHERE id = auth.uid()
     AND (last_login_bonus_at IS NULL OR last_login_bonus_at < now() - interval '20 hours')
  RETURNING points INTO new_points;
  IF new_points IS NULL THEN
    SELECT points INTO new_points FROM public.profiles WHERE id = auth.uid();
  END IF;
  RETURN new_points;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_login_bonus() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_login_bonus() TO authenticated;

-- Worker profiles (public board)
CREATE TABLE public.worker_profiles (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.worker_profiles TO anon, authenticated;
GRANT ALL ON public.worker_profiles TO service_role;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view worker profiles" ON public.worker_profiles
  FOR SELECT TO anon, authenticated USING (true);

-- Job listings (public board)
CREATE TABLE public.job_listings (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.job_listings TO anon, authenticated;
GRANT ALL ON public.job_listings TO service_role;
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view job listings" ON public.job_listings
  FOR SELECT TO anon, authenticated USING (true);

-- Expediter (errand) requests: owner-only
CREATE TABLE public.expediter_requests (
  id text PRIMARY KEY,
  tracking_code text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  owner_reply text,
  quote_etb numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.expediter_requests TO authenticated;
GRANT ALL ON public.expediter_requests TO service_role;
ALTER TABLE public.expediter_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can view expediter requests" ON public.expediter_requests
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner can update expediter requests" ON public.expediter_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Legal consultation bookings: owner-only
CREATE TABLE public.legal_consultations (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.legal_consultations TO authenticated;
GRANT ALL ON public.legal_consultations TO service_role;
ALTER TABLE public.legal_consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can view consultations" ON public.legal_consultations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Community chat
CREATE TABLE public.chat_messages (
  id text PRIMARY KEY,
  user_id uuid,
  member_code text NOT NULL,
  author_name text NOT NULL,
  author_region text NOT NULL DEFAULT 'Ethiopia',
  author_role text NOT NULL DEFAULT 'Student',
  verified_buyer boolean NOT NULL DEFAULT false,
  room text NOT NULL DEFAULT 'trust' CHECK (room IN ('trust', 'exams', 'careers')),
  message text NOT NULL,
  optional_phone text,
  helpful_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_created_at_idx ON public.chat_messages (created_at DESC);
GRANT SELECT (id, member_code, author_name, author_region, author_role, verified_buyer, room, message, optional_phone, helpful_count, created_at)
  ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read chat messages" ON public.chat_messages
  FOR SELECT TO anon, authenticated USING (true);