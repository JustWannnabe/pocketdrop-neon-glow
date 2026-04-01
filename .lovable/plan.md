

# Plan: Add QR Code to Send Page Success Screen

## Overview
Add a QR code and download button to the `/send` success screen after upload, encoding the receive URL.

## Dependencies
Install `qrcode.react` package for QR code generation.

## Changes to `src/pages/Send.tsx`

1. **Import** `QRCodeCanvas` from `qrcode.react` and `Download` icon from `lucide-react`
2. **In the success view** (the `code ?` branch, around line 95), add between the code display and the description text:
   - A `QRCodeCanvas` rendering `${window.location.origin}/get?code=${code}`, wrapped in a styled container with white background, rounded corners, padding, and a neon cyan glow border (`shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)] border border-primary/40 rounded-xl bg-white p-4`)
   - A "Download QR" button styled as a small neon purple outlined button, using a canvas-to-PNG download approach (`canvas.toDataURL('image/png')` → create temporary `<a>` link and click)
3. **QR size**: 200×200px, with `ref` on the wrapping div to locate the canvas for download

