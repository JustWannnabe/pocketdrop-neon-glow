

# Plan: Build the Receive Page (`/get`)

## Overview
Create a `/get` page where users enter a 6-digit code to retrieve shared files or text, with password protection support and error handling — all in the dark neon theme.

## Files to Create

### 1. `src/pages/Get.tsx`
- Same layout shell as Send: `NeonParticles`, navbar with "PocketDrop" link, glow orbs
- **States**: `idle` → `loading` → `password` → `result` → `error`
- **Code input**: 6 individual `<input>` boxes (maxLength=1, numeric), auto-focus next on input, neon cyan border with glow on focus. Pre-fill from `?code=XXXXXX` URL param via `useSearchParams`
- **"Get File" button**: Neon cyan styled, triggers lookup
- **Lookup logic**:
  - Query `supabase.from('files').select('*').eq('code', code).single()`
  - If not found → red neon error "Invalid code"
  - If `expires_at` is in the past → red neon "This file has expired"
  - If `password` is set → show password input, validate on submit, red neon on mismatch
  - Otherwise → show result
- **Result view**:
  - If `is_text`: show `text_content` in a neon-bordered box with "Copy Text" button
  - If file: show `file_name` and a glowing cyan "Download" button linking to `file_url`
- **Error styling**: Red text with `text-red-500` and red glow shadow

## Files to Modify

### 2. `src/App.tsx`
- Import `Get` page, add `<Route path="/get" element={<Get />} />`

### 3. `src/pages/Index.tsx`
- Wire "Receive a File" button to `/get`

## Technical Details
- Use 6 individual controlled inputs with refs array for auto-focus behavior
- Parse `useSearchParams().get('code')` on mount to pre-fill
- Password comparison is plain-text client-side (matches current schema)
- Download uses `window.open(file_url)` or an `<a>` tag with `download` attribute

