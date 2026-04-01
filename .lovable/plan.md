

## Plan: Add "Paste Code" Button on /get Page

### Changes

**`src/pages/Get.tsx`** (single edit):
- Add a `pasteFromClipboard` function that calls `navigator.clipboard.readText()`, extracts up to 6 digits, and fills the `digits` state
- Add a small neon purple outlined button labeled "Paste Code" with a `Clipboard` icon, placed below the 6 input boxes and above the error message
- Style: `border border-accent text-accent text-xs neon-text-purple hover:bg-accent/10` — small, outlined, matching the purple neon theme
- Import `Clipboard` icon from lucide-react

**No changes needed to Index.tsx** — the "Receive a File" button already navigates to `/get`.

