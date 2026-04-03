

# Plan: Add Password Visibility Toggle

## Overview
Add an Eye/EyeOff toggle to password fields in the Auth modal and the Send page, positioned inside the input on the right side in neon cyan.

## Changes

### 1. `src/components/AuthModal.tsx`
- Add `showPassword` state (`useState(false)`)
- Import `Eye`, `EyeOff` from lucide-react
- Wrap the password `<Input>` in a `relative` div
- Change input type to `showPassword ? "text" : "password"`, add `pr-10` padding
- Add an absolute-positioned button on the right with the Eye/EyeOff icon in `text-primary` with cyan glow

### 2. `src/pages/Send.tsx`
- Add `showPassword` state
- Import `Eye`, `EyeOff` from lucide-react
- Same pattern: wrap password Input in a `relative` div, toggle type, add icon button on the right

### Icon button styling
```
absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80
```
With `filter: drop-shadow(0 0 4px hsl(var(--neon-cyan) / 0.5))` for neon glow.

