

## Plan

### 1. Reduce hero section height
In `src/pages/Index.tsx`, change `min-h-[110vh]` to `min-h-screen` to eliminate the excessive gap before "How It Works".

### 2. Enhance particle visibility
In `src/components/NeonParticles.tsx`:
- Increase particle size range from `0.5–3` to `2–6` (`Math.random() * 4 + 2`)
- Increase opacity range from `0.15–0.65` to `0.4–0.9`
- Increase shadow blur from `size * 6` to `size * 12`

