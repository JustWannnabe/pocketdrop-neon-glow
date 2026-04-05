

# Plan: Z-Index Fix, Mobile Layout, and Particle Adjustments

## 1. NeonParticles.tsx — Particle adjustments
- Change `COUNT` from `40` → `80` (2x particles)
- Change `size` from `Math.random() * 4 + 2` → `Math.random() * 2 + 1` (50% smaller)
- Change `speedX` from `(Math.random() - 0.5) * 0.3` → `(Math.random() - 0.5) * 0.6` (2x speed)
- Change `speedY` from `(Math.random() - 0.5) * 0.2` → `(Math.random() - 0.5) * 0.4` (2x speed)

## 2. Index.tsx — Z-index wrapper + mobile layout
- Wrap everything after `<NeonParticles />` (Navbar, hero, how-it-works, footer) in `<div className="relative z-10">`
- Hero section: change `min-h-screen` → `min-h-[70vh]` to remove gap before "How It Works"
- Hero buttons: change `flex-col sm:flex-row` → `flex-row` and add `w-full max-w-sm` on container, `flex-1 text-center` on each Link for equal-width side-by-side layout

## 3. Send.tsx — Z-index wrapper
- Wrap everything after `<NeonParticles />` (line 149) in `<div className="relative z-10">`

## 4. Get.tsx — Z-index wrapper
- Wrap everything after `<NeonParticles />` (line 142) in `<div className="relative z-10">`

## 5. MyUploads.tsx — Z-index wrapper
- Wrap everything after `<NeonParticles />` in `<div className="relative z-10">` (decorative blur divs, Navbar, and main all inside)

