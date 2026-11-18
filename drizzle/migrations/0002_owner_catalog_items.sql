CREATE TABLE public.catalog_items (
  id text PRIMARY KEY,
  action text NOT NULL DEFAULT 'add',
  category text NOT NULL DEFAULT 'education',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  file_path text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT (id, action, category, payload, updated_at, created_at) ON public.catalog_items TO anon, authenticated;
GRANT ALL ON public.catalog_items TO service_role;

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read catalog changes"
  ON public.catalog_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Owner uploads vault files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'vault-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner updates vault files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'vault-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner deletes vault files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'vault-files' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Owner reads vault files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'vault-files' AND public.has_role(auth.uid(), 'admin'));