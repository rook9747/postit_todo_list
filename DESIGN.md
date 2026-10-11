---
name: Warm Tactile Workspace
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad9e3'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2fd'
  surface-container: '#eeedf7'
  surface-container-high: '#e8e7f1'
  surface-container-highest: '#e3e1ec'
  on-surface: '#1a1b22'
  on-surface-variant: '#534434'
  inverse-surface: '#2f3038'
  inverse-on-surface: '#f1effa'
  outline: '#867461'
  outline-variant: '#d8c3ad'
  surface-tint: '#855300'
  primary: '#855300'
  on-primary: '#ffffff'
  primary-container: '#f59e0b'
  on-primary-container: '#613b00'
  inverse-primary: '#ffb95f'
  secondary: '#5f5e61'
  on-secondary: '#ffffff'
  secondary-container: '#e4e1e6'
  on-secondary-container: '#656467'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#30c88f'
  on-tertiary-container: '#004e34'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb8'
  primary-fixed-dim: '#ffb95f'
  on-primary-fixed: '#2a1700'
  on-primary-fixed-variant: '#653e00'
  secondary-fixed: '#e4e1e6'
  secondary-fixed-dim: '#c8c5ca'
  on-secondary-fixed: '#1b1b1e'
  on-secondary-fixed-variant: '#47464a'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fbf8ff'
  on-background: '#1a1b22'
  surface-variant: '#e3e1ec'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-sm: 0.75rem
  gutter-lg: 1.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the warmth of analog stationery filtered through contemporary editorial digital workspaces. Designed for knowledge workers, creatives, and quick-capture note-takers, it bridges intuitive physical post-its with focused productivity workflows.

The visual direction merges **Minimalism** with **Tactile / Modern Skeuomorphism**:
- Pure, uncluttered workspace canvases with generous breathing room.
- Subtle paper-like physical cues (tape highlights, soft lifted corners, paper textures) stripped of retro kitsch.
- Grounded, decisive charcoal surfaces grounding pastel note substrates.
- Direct, frictionless micro-interactions replicating rapid capture on a real desk.

## Colors

The palette establishes an interplay between structural monochrome canvas tones and warm, expressive post-it tint variants.

### Base Structural Palette
- **Canvas Base (`#F4F4F5`)**: Cool, clean architectural light-gray foundation that prevents paper elements from melting into the background.
- **Card Surface (`#FFFFFF`)**: Pure neutral background for floating docks, modaled views, and settings panels.
- **Primary Ink (`#09090B` / `#18181B`)**: High-contrast charcoal for titles, prominent copy, and solid pill CTAs.
- **Muted Ink (`#71717A` / `#A1A1AA`)**: Secondary text, counts, timestamps, and subtle structural iconography.
- **Brand Accent (`#F59E0B`)**: Amber warmth used for active indicators, spotlight highlights, and focal interactive elements.
- **System Sync (`#10B981`)**: Emerald status signal for uninterrupted real-time cloud persistence.

### Sticky Note Functional Tiers
Each note colorway possesses a three-tier chromatic hierarchy (Surface Fill, Edge Stroke, Deep Ink Accent):
- **Canary Yellow**: Surface `#FEF9C3`, Border `#FDE047`, Accent `#854D0E` (Base `#FEF08A`).
- **Blush Pink**: Surface `#FDF2F8`, Border `#FBCFE8`, Accent `#9D174D` (Base `#FCE7F3`).
- **Sage Green**: Surface `#F0FDF4`, Border `#BBF7D0`, Accent `#166534` (Base `#DCFCE7`).
- **Sky Blue**: Surface `#F0F9FF`, Border `#BAE6FD`, Accent `#075985` (Base `#E0F2FE`).

In dark mode, surfaces shift to `#121214` (canvas) and `#1E1E24` (surfaces), while note variants reduce luminescence by 60% and adopt glowing translucent tinted borders.

## Typography

Typography prioritizes high legibility at brief scannable lengths, utilizing modern geometric grotesques with humanist warmth. When deployed with localized font fallbacks (such as Pretendard for CJK), the metric balance ensures consistent baseline rhythm.

- **Headlines**: Weighted at `600` and `700` with subtle negative tracking (`-0.015em` to `-0.02em`) to produce a tight editorial presence.
- **Body & Content**: Optimized between `14px` and `15px` with a generous `1.5` to `1.6` line-height ratio, preventing long handwritten-style notes from crowding.
- **Labels & Timestamps**: Set strictly between `11px` and `13px` with positive tracking to maintain clear scanning against vibrant paper fills.

## Layout & Spacing

The workspace uses a responsive fluid grid system designed for flexible masonry arrangements and freeform spatial canvas layouts.

- **Desktop (≥ 1024px)**: 12-column dynamic masonry or free-drag canvas with `2rem` page margins and `1.25rem` gutters. Notes snap cleanly to standard multi-column modules (typically spanning 3–4 columns).
- **Tablet (768px – 1023px)**: 6-column grid with `1.5rem` outer margin and `1rem` column gutters.
- **Mobile (< 768px)**: 2-column or single-stream layout with `1rem` edge margins and `0.75rem` vertical stacking gaps for touch accessibility.

Component padding operates on an 8pt modular rhythm:
- Note interiors feature `space-md` (`1rem`) to `space-lg` (`1.5rem`) internal breathing space.
- Floating command docks and bottom navigation bars utilize `space-sm` (`0.5rem`) padding with inline element gaps of `space-xs` (`0.25rem`).

## Elevation & Depth

Elevation simulates real stationery layered over a modern digital work surface through subtle, layered ambient shadows rather than harsh directional drops.

### Elevation Levels
- **Level 0 (Flat Canvas)**: Canvas base (`#F4F4F5`). Borders are omitted or kept at hairline `rgba(0,0,0,0.04)`.
- **Level 1 (Resting Sticky Note)**: Simulates paper resting flat on a desk.
  - Shadow: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)`.
  - Border: 1px continuous hairline tinted to the specific note palette border color.
- **Level 2 (Hover / Active Drag)**: The note gently pulls away from the canvas.
  - Shadow: `0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)`.
  - Transform: Slight `-2px` translateY lift with an optional natural `-0.75deg` or `0.75deg` organic rotation.
- **Level 3 (Overlays, Flyouts & Modals)**: Floats distinctly above all workspace content.
  - Shadow: `0 20px 30px -10px rgba(0, 0, 0, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.04)`.
  - Backing: Subtle semi-translucent backdrop filter blur (`backdrop-blur-md`).

### Tactile Paper Details
- **Washi Tape Accents**: Semi-transparent rectangular tabs (`height: 14px`, `width: 48px`, `opacity: 0.7`, `backdrop-blur: 2px`) pinned at the top-center edge of select prioritized notes.
- **Corner Dog-Ears**: Subtle linear gradients applied to top-right corners denoting archived or pinned states.

## Shapes

The shape system blends pill contours for interactive utility controls with generous, organic rounded rects for stationery surfaces:

- **Interactive System Controls (Buttons, Inputs, Chips)**: Pill-shaped (`rounded-full`, 9999px) to convey tactile affordance, smoothness, and ease of interaction.
- **Note Surfaces & Cards**: `rounded-2xl` (16px) to `rounded-3xl` (24px) corners, eliminating aggressive digital edges and imparting a friendly, paper-card personality.
- **Floating Menus & Floating Action Bars**: Fully pill-shaped frames (`rounded-full`) or smooth squircle cards (`rounded-2xl`).
- **Washi Tape & Pin Accents**: Micro-radius corners (`rounded-xs`, 2px) to mimic hand-cut physical stationery accessories.

## Components

### Buttons
- **Primary CTA**: Deep charcoal pill (`#18181B`) with pure white text (`#FFFFFF`), `padding: 0.625rem 1.25rem`, `label-md` typography. Features a subtle `-1px` vertical lift on hover and an active click compression (`scale: 0.98`).
- **Ghost / Tertiary**: Transparent base, hovering into `rgba(0, 0, 0, 0.05)` fill with `#18181B` icon/text coloring.

### Sticky Note Cards
- **Structure**: Rounded-2xl surfaces using designated semantic pastel background fills with matching 1px border outlines.
- **Header**: Action tray (color changer, tape pin, three-dot overflow) visible either persistently or revealed smoothly on note hover.
- **Content Area**: Fluid auto-expanding editable text container with `14px–15px` body sizing.
- **Footer**: Low-contrast metadata (`label-sm`, `#71717A`) displaying last-modified time and tag tokens.

### Filter & Category Chips
- **Geometry**: Pill-shaped (`rounded-full`) buttons with `0.375rem 0.875rem` padding.
- **Default State**: Surface `#FFFFFF`, border `1px solid #E4E4E7`, text `#71717A`.
- **Selected State**: Dark charcoal fill (`#18181B`), white text, accompanied by note count bubble in a softened secondary tone.

### Input Fields & Search Bars
- **Style**: Floating pill search bar (`rounded-full`) encased in `#FFFFFF` with `Level 1` shadow and a `1px solid #E4E4E7` boundary.
- **States**: Focused state transitions border to `#F59E0B` with an ambient glow (`box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15)`).

### Selection Controls (Checkboxes & Radios)
- **Checkboxes**: Soft-square (`rounded-md`, 6px), checked state fills with charcoal `#18181B` displaying a clean white stroke checkmark. Inside colored notes, adapts to the respective note's deep accent tone.
- **Radio Buttons**: Concentric pill-circles, filled with inner amber or charcoal dot when selected.

### Live Sync Status Indicator
- A minimal pill badge housing a pulsating `#10B981` dot, paired with `caption` typography displaying "Saved" or "Syncing...".