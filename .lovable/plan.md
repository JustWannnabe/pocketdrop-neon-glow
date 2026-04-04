

# Plan: File Size Check + Expiry Countdown on /send

## Changes to `src/pages/Send.tsx`

### 1. File size validation (50MB limit)
- At the top of `handleUpload`, before `setUploading(true)`, add a check: if `!isText && file && file.size > 50 * 1024 * 1024`, show `toast.error("File too large! Maximum size is 50MB")` and return early
- No UI change needed beyond the toast error

### 2. Expiry countdown timer
- Add state: `expiresAt` (string | null) to store the expiry timestamp when upload succeeds (set it alongside `setCode`)
- Add `useEffect` that runs when `code` and `expiresAt` are set (no password): calculates remaining time, updates a `countdown` state string every 60 seconds using `setInterval`
- Format: "Expires in: X days Y hours Z minutes"
- Display the countdown below the code (replacing or alongside the existing static "Expires in 10 days" text), styled in yellow neon: `text-yellow-400` with `drop-shadow(0 0 6px ...)`
- If password-protected (`expiresAt` is null), show nothing extra (keep existing "Password-protected" text)

### Technical details
- Import `useEffect` (already partially imported via `useState`)
- New state: `expiresAt: string | null`, `countdown: string`
- Interval cleanup in useEffect return
- Countdown calculation: diff between `expiresAt` date and `Date.now()`, extract days/hours/minutes

