# SQL Challenger — Design Tokens

## Colors

### Light Theme
```css
--background: oklch(0.99 0.005 250)
--foreground: oklch(0.15 0 0)
--card: oklch(1 0.005 250)
--card-foreground: oklch(0.15 0 0)
--primary: oklch(0.52 0.2 250)
--primary-foreground: oklch(0.98 0 0)
--secondary: oklch(0.96 0.005 250)
--secondary-foreground: oklch(0.15 0 0)
--muted: oklch(0.96 0.005 250)
--muted-foreground: oklch(0.5 0 0)
--accent: oklch(0.6 0.22 280)
--accent-foreground: oklch(0.98 0 0)
--destructive: oklch(0.55 0.22 25)
--success: oklch(0.6 0.18 145)
--warning: oklch(0.65 0.2 65)
--border: oklch(0.9 0.005 250)
--input: oklch(0.9 0.005 250)
--ring: oklch(0.52 0.2 250)
```

### Dark Theme
```css
--background: oklch(0.1 0.008 250)
--foreground: oklch(0.98 0 0)
--card: oklch(0.14 0.008 250)
--card-foreground: oklch(0.98 0 0)
--primary: oklch(0.55 0.22 250)
--secondary: oklch(0.2 0.008 250)
--muted: oklch(0.2 0.008 250)
--muted-foreground: oklch(0.75 0 0)
--accent: oklch(0.6 0.22 280)
--border: oklch(0.24 0.008 250)
--input: oklch(0.2 0.008 250)
```

Neutrals are tinted toward brand blue (hue 250) at low chroma (0.005-0.008). Gives dark backgrounds a subtle noir blue cast.

### Semantic Color Usage
| Token | Usage |
|-------|-------|
| primary | Buttons, links, active states, progress fill |
| accent | Secondary highlights, achievements UI |
| success | Correct query, objectives completed |
| destructive | Errors, query failures |
| warning | XP penalties, hints warning |
| muted | Subtle backgrounds, disabled states |

## Typography

### Families
| Role | Font | CSS Variable |
|------|------|-------------|
| Display (headings) | Oswald (sans, condensed) | `--font-oswald` |
| Body (UI) | Sora (sans, geometric) | `--font-sora` |
| Mono (code) | Geist Mono (variable) | `--font-geist-mono` |

Usage: `className="font-display"` for headings, `font-sans` (default) for body.

### Scale
- **body**: 14–16px (text-sm / text-base)
- **headings**: text-lg → text-5xl, `font-display tracking-tight`
- **code**: text-sm font-mono
- **captions**: text-xs

## Spacing
- Grid system: Tailwind spacing scale (4px base)
- Card padding: p-6 (24px)
- Section gaps: gap-6 / gap-8
- Page max-width: max-w-7xl (1280px)
- Consistent border radius: rounded-xl (12px), rounded-lg (8px)

## Elevation
- Cards: `border border-border bg-card` (minimal, flat)
- Hover: `hover:border-primary/50 hover:shadow-lg`
- Header: `bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60`
- Modal overlay: `bg-black/50 backdrop-blur-sm`

## Component States
### Button (`_atoms/button.tsx`)
- base: `inline-flex items-center justify-center rounded-lg transition-all`
- disabled: `opacity-50 pointer-events-none`
- focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- variants: primary / secondary / outline / ghost / destructive
- sizes: sm / md / lg

### Badge (`_atoms/badge.tsx`)
- base: `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors`
- variants: default / primary / success / warning / destructive / outline

### Input (`_atoms/input.tsx`)
- base: `flex h-11 w-full rounded-lg border border-input bg-input px-4 py-2 text-base`
- focus: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- error: `border-destructive focus-visible:ring-destructive`

## Motion Patterns
- **Easing**: `ease-out-expo` (cubic-bezier(0.16, 1, 0.3, 1)) and `ease-out-quart` available as utilities
- **Transitions**: transition-all with duration-300 / 500
- **Progress bars**: `duration-500 ease-out`
- **Hover cards**: `hover:-translate-y-1 hover:shadow-lg`, 300ms
- **Modal entrance**: `animate-in zoom-in-95 duration-200` (tw-animate-css)
- **Victory banner**: `animate-in zoom-in-95 duration-300 ease-out-expo`
- **Timer gold pulse**: `animate-gold-pulse` (keyframe glow effect)
- **Loading**: `animate-spin` (spinner), `animate-pulse` (skeleton)
- **No Framer Motion / GSAP** — only CSS transitions, keyframes, and tw-animate-css
- **`prefers-reduced-motion: reduce`** respected globally (durations set to 0.01ms)

## Accessibility
- focus-visible rings on all interactive elements (buttons, inputs, tabs)
- aria-label on: theme toggler, friend notification bell, close buttons
- aria-current on tab buttons
- aria-live="polite" on results panel
- role="alert" on error/feedback messages
- Semantic HTML throughout (button, input, label, nav, table, th, tr, td)
- Form fields linked via htmlFor/id
- Dark/light theme with class-based toggle
- No jest-axe or a11y linting configured yet

## Icon System
- Library: feather-icons-react (feather icons) — primary icon set
- Used in: header nav, achievements, stats, close buttons, user menu, search
- Emoji only in content areas (narrative, tier badges, empty state illustrations)
- No emoji in UI chrome (buttons, nav links, labels)
