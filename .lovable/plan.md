

# Plan: Upload Progress Bar on /send Page

## Overview
Replace the upload button with a neon cyan progress bar during file uploads, showing real-time percentage. Text mode skips the progress bar entirely.

## Challenge
The Supabase JS client's `storage.upload()` doesn't support `onUploadProgress`. We'll use `XMLHttpRequest` directly against the Supabase Storage REST API to get upload progress events.

## Changes to `src/pages/Send.tsx`

### New state
- `uploadProgress: number` (0–100) to track percentage

### Upload logic change (file mode only)
- Replace `supabase.storage.from(...).upload(path, file)` with a custom XHR upload:
  - `PUT` to `${SUPABASE_URL}/storage/v1/object/pocketdrop-files/${path}`
  - Headers: `Authorization: Bearer <anon_key>`, `Content-Type: <file.type>`
  - `xhr.upload.onprogress` updates `uploadProgress` state
  - Wrapped in a Promise that resolves/rejects on load/error
- Text mode: no progress bar, goes straight to success as before

### UI change
- When `uploading` is true and `!isText`: hide the Upload button, show instead:
  - A styled `<Progress>` component (from `src/components/ui/progress.tsx`) with neon cyan styling
  - Text below: "Uploading... 45%" in cyan
  - Container with dark background, rounded corners, neon glow border
- When `uploading` is true and `isText`: show a simple spinner/loading state (existing behavior)

### Reset
- Reset `uploadProgress` to 0 in the `reset()` function

## Technical Notes
- XHR upload uses the anon key from `import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY` and the URL from `import.meta.env.VITE_SUPABASE_URL`
- The `getPublicUrl` call remains unchanged after upload completes
- Progress component gets custom className for neon cyan indicator styling

