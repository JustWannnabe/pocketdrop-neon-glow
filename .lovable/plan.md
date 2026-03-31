

# Plan: Build the Upload Page (`/send`)

## Overview
Create a new `/send` page with file/text upload functionality, matching the dark neon theme. Includes drag-and-drop, file/text toggle, optional password, and code display after upload.

## Files to Create

### 1. `src/pages/Send.tsx`
Main upload page with:
- **NeonParticles** background + same navbar as Index
- **Toggle switch** ("Send File" / "Send Text") using the existing `Switch` component
- **File mode**: Drag-and-drop zone with dashed cyan neon border (`border-dashed border-primary`), glow on hover/drag-over. Accepts all file types. Shows file name after selection.
- **Text mode**: `Textarea` for pasting text content, styled with neon border
- **Password field**: Optional `Input` with helper text "Add password = file never expires, otherwise deleted after 10 days"
- **Upload button**: Neon cyan styled button, disabled while uploading, shows loading state
- **Upload logic**:
  - Generate random 6-digit numeric code (`Math.floor(100000 + Math.random() * 900000)`)
  - For files: upload to `pocketdrop-files` bucket via `supabase.storage`, then insert metadata into `files` table
  - For text: insert into `files` table with `is_text: true`, `text_content`, and placeholder `file_url`/`file_name`/`file_type`
  - Set `expires_at` to 10 days from now if no password; `null` if password provided
- **Success view**: Replace the form with the 6-digit code displayed in large glowing neon text (`font-display text-6xl text-primary neon-text-cyan`), with a "Copy Code" button and "Send Another" link

## Files to Modify

### 2. `src/App.tsx`
- Import `Send` page
- Add route: `<Route path="/send" element={<Send />} />`

### 3. `src/pages/Index.tsx`
- Wire "Send a File" button to navigate to `/send` using `Link` from react-router-dom

## Technical Details
- Use `supabase.storage.from('pocketdrop-files').upload()` for file storage
- Use `supabase.from('files').insert()` for metadata
- Generate public URL via `supabase.storage.from('pocketdrop-files').getPublicUrl()`
- Handle drag events (`onDragOver`, `onDragLeave`, `onDrop`) for the drop zone
- Toast errors on failure using existing sonner toaster

