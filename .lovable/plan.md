

# Plan: Fix Homepage Spacing, Hero Text, and Navbar on Mobile

## 1. `src/pages/Index.tsx` — Reduce hero/section gap + responsive hero text

- **Hero section** (line 23): reduce bottom padding from `pb-16` to `pb-8`
- **How It Works section** (line 47): reduce top padding from `py-24` to `py-12 md:py-24`
- **Hero h1** (line 27): change `text-5xl md:text-7xl` to `text-3xl md:text-5xl lg:text-7xl` so it doesn't wrap to 3 lines on mobile

## 2. `src/components/Navbar.tsx` — Hide nav links on small screens

- Wrap the `{children}` slot in a `<div className="hidden sm:flex items-center gap-6">` so "How it works" and "About" links are hidden on mobile, leaving only the Sign In button visible
- Keep the Sign In / avatar button outside this wrapper so it's always visible

