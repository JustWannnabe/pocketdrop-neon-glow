

# Plan: Match Homepage Button Styles

## Change in `src/pages/Index.tsx`

**Line 37** — Add `border border-primary` to the "Send a File" Link so it matches the "Receive a File" button's border box model:

```
// Before
className="flex-1 text-center px-8 py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all"

// After
className="flex-1 text-center px-8 py-3 rounded-lg font-display font-bold text-sm tracking-wider border border-primary bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all"
```

This ensures both buttons have identical sizing (same border, padding, font, and border-radius), differing only in color scheme.

