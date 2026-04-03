

# Plan: Build /my-uploads Page

## Overview
Create a `/my-uploads` page for signed-in users to view and manage their uploaded files, with delete functionality and redirect for unauthenticated users.

## Database Migration
Add a DELETE RLS policy so authenticated users can delete their own files:
```sql
CREATE POLICY "Users can delete own files"
ON public.files FOR DELETE TO authenticated
USING (user_id = auth.uid());
```

## New File: `src/pages/MyUploads.tsx`
- On mount, check auth state via `supabase.auth.getSession()`. If no session, redirect to `/` using `navigate("/")`
- Query `supabase.from('files').select('*').eq('user_id', user.id).order('created_at', { ascending: false })`
- Page layout: `NeonParticles` background, `<Navbar>`, page title "My Uploads" in neon cyan glow
- **File cards** in a responsive grid, each showing:
  - File name (or "Text Snippet" if `is_text`)
  - 6-digit code in neon cyan
  - Expiry status: green "Never expires" if password set, yellow "Expires: [date]" if future, red "Expired" if past
  - "Copy Code" button (copies code to clipboard)
  - "Delete" button (red neon) — deletes from storage bucket first (`supabase.storage.from('pocketdrop-files').remove([path])`), then deletes from `files` table (`supabase.from('files').delete().eq('id', file.id)`)
- **Empty state**: centered message "No files uploaded yet" with a "Send a File" button linking to `/send`

## Modified File: `src/App.tsx`
- Import `MyUploads` and add route: `<Route path="/my-uploads" element={<MyUploads />} />`

## Technical Notes
- Extract storage path from `file_url` for deletion (parse the public URL to get the relative path)
- For text-only entries (`is_text = true`), skip storage deletion since no file was uploaded to the bucket
- Use `toast` for success/error feedback on delete

