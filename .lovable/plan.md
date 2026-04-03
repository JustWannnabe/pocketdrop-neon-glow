

# Plan: Improve Auth UI and Navbar Profile Dropdown

## Changes

### 1. `src/components/AuthModal.tsx`
- Add a glowing `Lock` icon (lucide-react) centered above the title, with neon cyan glow using `drop-shadow` and a circular border
- Upgrade `DialogContent` styling: `bg-background/90 backdrop-blur-xl border-primary/20 shadow-[0_0_30px_hsl(var(--neon-cyan)/0.1)]`
- Increase input focus glow intensity: `focus:shadow-[0_0_20px_hsl(var(--neon-cyan)/0.25)]` and add `focus:ring-1 focus:ring-primary/50`

### 2. `src/components/Navbar.tsx`
- Import `User`, `Upload`, `LogOut` icons, `DropdownMenu` components, and `useNavigate`
- **Logged out**: Change "Sign In" button to neon cyan outlined style (`border-primary text-primary neon-text-cyan`)
- **Logged in**: Replace email+SignOut text with a circular avatar button:
  - `w-9 h-9 rounded-full border-2 border-primary` with cyan glow shadow
  - `User` icon inside
- Clicking avatar opens a `DropdownMenu` with dark neon styling (`bg-background/95 backdrop-blur-xl border-primary/20`):
  - User email (greyed, `text-muted-foreground text-xs`, non-interactive label)
  - Separator
  - "My Uploads" item with `Upload` icon, navigates to `/my-uploads`
  - "Sign Out" item with `LogOut` icon, styled red (`text-red-400`)

### 3. No new pages created
The `/my-uploads` route will be a future addition; the menu item just navigates there.

