

# Plan: Cleanup Edge Function + Background Trigger

## Overview
Create a `cleanup-files` edge function that purges expired and overflow files, and silently invoke it when users visit `/get`.

## New File: `supabase/functions/cleanup-files/index.ts`

- Import CORS headers, create a Supabase admin client using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Step 1**: Query expired rows: `expires_at < now()` AND `password IS NULL`
- **Step 2**: For each expired row where `is_text` is false, extract the storage path from `file_url` and delete from `pocketdrop-files` bucket
- **Step 3**: Delete all expired rows from `files` table matching the same condition
- **Step 4**: Count total rows in `files`. If > 500, query the oldest 100 rows where `password IS NULL` ordered by `created_at ASC`, delete their storage files, then delete the rows
- Handle CORS preflight, return JSON with counts of deleted items
- No JWT validation needed (public cleanup endpoint, no sensitive data returned)

## Modified File: `src/pages/Get.tsx`

- Add a `useEffect` that fires once on mount, calling `supabase.functions.invoke('cleanup-files')` silently (no await, no UI feedback, fire-and-forget inside a `.catch(() => {})`)

## Technical Notes
- Storage path extraction: parse `file_url` to get the path after `/object/public/pocketdrop-files/`
- Use service role key server-side to bypass RLS for deletion
- The cleanup call is best-effort — errors are silently ignored on the client

