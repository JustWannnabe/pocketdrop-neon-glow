
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  code VARCHAR(6) UNIQUE NOT NULL,
  password TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_text BOOLEAN DEFAULT false,
  text_content TEXT
);

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read files" ON public.files
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert files" ON public.files
  FOR INSERT WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('pocketdrop-files', 'pocketdrop-files', true);

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'pocketdrop-files');

CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pocketdrop-files');
