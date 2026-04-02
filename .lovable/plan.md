

# Plan: Add Optional User Authentication

## Overview
Add optional sign-in/sign-up via email+password. App remains fully anonymous by default. Signed-in users get their `user_id` saved with uploads.

## Step 1: Database Migration
Add nullable `user_id` column to `files` table:
```sql
ALTER TABLE public.files ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
```

## Step 2: Create `src/components/AuthModal.tsx`
A dialog modal with:
- Toggle between "Sign In" and "Sign Up" modes
- Email + password fields styled in dark neon theme (cyan borders, purple accents)
- Submit button, error display, close button
- Uses `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`

## Step 3: Create `src/components/Navbar.tsx`
Extract the repeated navbar into a shared component:
- Listens to `supabase.auth.onAuthStateChange()` for session state
- If signed out: shows "Sign In" button that opens AuthModal
- If signed in: shows truncated email + "Sign Out" button
- Accepts optional children or props for page-specific nav links (e.g. "How it works" on Index, "Home" on Send/Get)

## Step 4: Update all pages
Replace inline `<nav>` in `Index.tsx`, `Send.tsx`, and `Get.tsx` with the shared `<Navbar>` component.

## Step 5: Update `Send.tsx` upload logic
Before inserting into `files` table, check for active session via `supabase.auth.getSession()`. If user is signed in, include `user_id` in the insert. If not, omit it (null).

## Technical Notes
- No profile table needed — only storing `user_id` on files, no extra user data
- RLS policies remain unchanged (public insert/select) since auth is optional
- Email confirmation will use default behavior (users must verify email)

