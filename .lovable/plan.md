

# Plan: Connect Supabase and Create Database Schema

## Overview
Set up Supabase backend with a `files` table and a public storage bucket for PocketDrop.

## Step 1: Enable Supabase
Connect a Supabase instance to the project (Lovable Cloud or external). This will generate the Supabase client integration files.

## Step 2: Create migration for "files" table
Create a SQL migration with the following schema:

```sql
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

-- Allow anyone to read files by code (no auth required for receiving)
CREATE POLICY "Anyone can read files" ON public.files
  FOR SELECT USING (true);

-- Allow anyone to insert files (no auth required for sending)
CREATE POLICY "Anyone can insert files" ON public.files
  FOR INSERT WITH CHECK (true);
```

## Step 3: Create storage bucket migration
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('pocketdrop-files', 'pocketdrop-files', true);

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'pocketdrop-files');

-- Allow public upload
CREATE POLICY "Public upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pocketdrop-files');
```

## Step 4: Wire up Supabase client
Install `@supabase/supabase-js` and create the client integration files under `src/integrations/supabase/` with auto-generated types for the `files` table.

## Technical Notes
- RLS policies allow public read/insert since PocketDrop is a no-login file sharing app
- The `code` column is unique and indexed for fast lookups
- Storage bucket is public for direct file URL access
- No update/delete policies for now (files are immutable once shared)

