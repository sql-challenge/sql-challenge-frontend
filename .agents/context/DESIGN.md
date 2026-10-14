# SQL CHALLENGE — Design System (Hybrid Pixel)

> **Status:** implemented. Replaces the previous noir/Oswald token doc, which was never
> shipped. The app uses an 8-bit / CRT detective aesthetic with a hybrid density rule.

## Aesthetic Direction

Retro pixel-art investigation terminal. A detective works a database crime scene inside a
CRT. The look is intentionally chunky: hard borders, offset pixel shadows, monospaced
numerals, and a faint scanline overlay.

**Hybrid rule** (the core principle):
- **Chrome** — header, nav, buttons, badges, tabs, terminal, modals, landing page: hard 8-bit.
  Square corners (`radius: 0`), `border-2`, `shadow-pixel` (4px hard offset).
- **Product surfaces** — dense data UI (dashboard cards, ranking rows, editor panels, forms):
  softened for legibility. `border-2`, small radius (`3px`), `shadow-pixel-sm` (2px offset).
  Never `rounded-full`, never `shadow-2xl`, never gradients.

## Colors

Defined as CSS variables in `app/globals.css`. Light and dark themes; **dark is default**.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | `#e8e8e8` | `#07070d` | Page base |
| `--foreground` | `#222222` | `#e8e8e8` | Text |
| `--card` | `#ffffff` | `#0d0d1a` | Panels |
| `--primary` | `#0055aa` | `#00e5ff` | Buttons, links, active, progress |
| `--accent` | `#8800aa` | `#ff00ff` | Secondary highlights, achievements, friend |
| `--success` | `#228833` | `#00ff41` | Correct query, completed objective |
| `--warning` | `#cc8800` | `#ffcc00` | Hints, XP tiers, penalties |
| `--destructive` | `#cc2222` | `#ff3333` | Errors, query failures |
| `--border` | `#c0c0c0` | `#222244` | All borders + pixel shadows |
| `--muted` | `#d4d0c8` | `#1a1a2e` | Inset wells, disabled |

**Rule:** never hardcode Tailwind palette colors (`text-emerald-400`, `bg-green-500`, …) or
raw hex in JSX. Use semantic tokens only. SVG that must be theme-aware uses
`fill="var(--primary)"` etc. so it follows the theme class automatically.

## Typography

| Role | Font | Variable | Applied via |
|------|------|----------|-------------|
| Display (headings) | Press Start 2P | `--font-display` | `font-display tracking-wide` |
| Body (UI + prose) | Pixelify Sans (400–700 variable) | `--font-body` | `font-sans` (default) |
| Mono (code + numerals) | JetBrains Mono (100–800 variable) | `--font-jetbrains-mono` | `font-mono tabular-nums` |

- Headings use `font-display` at reduced sizes (`text-lg`–`text-4xl`) — the font is wide, so
  reserve it for short labels. Long prose stays in the body font.
- Body font carries real weights (400–700): `font-semibold`/`font-bold` render as designed.
  Do not rely on faux bold anywhere.
- **Size floor:** nothing below `text-[10px]`, and 10px only for badges/meta chips; labels
  start at `text-[11px]`/`text-xs` (12px). Inputs and form text use `text-base` (16px).
- **Sans vs mono is a role split, not a style choice:** narrative and UI copy render in the
  body font; the mono face is reserved for code, SQL, identifiers (table/column names), and
  measured values (XP, timers, ranks, stats, counters) so digits don't jitter.
- Code (CodeMirror, terminal, SQL output) uses the real monospace, never the body font.
- Italic is not part of the system: the pixel faces have no true italics and synthesized
  obliques are banned. Use weight, color, or size to differentiate.

## Spacing & Shape

- Grid: Tailwind 4px scale.
- Page max-width `max-w-7xl`; panels `p-3`–`p-6`; section gaps `gap-6`/`gap-8`.
- Radius: `0` for chrome, `3px` for product panels (`.pixel-panel`). No other radii.

## Pixel Primitives (`app/globals.css`)

| Class | Effect |
|-------|--------|
| `.pixel-card` | Hard frame: `border-2`, `bg-card`, 4px pixel shadow, square. Chrome. |
| `.pixel-panel` | Soft frame: `border-2`, `bg-card`, 3px radius, 2px pixel shadow. Product. |
| `.pixel-inset` | Recessed well: `border-2`, `bg-muted`, inset shadow. Progress tracks, code gutters. |
| `.pixel-press` | `:active` sinks element by `translate(2px,2px)` and removes its shadow. |
| `.shadow-pixel` / `.shadow-pixel-sm` / `.shadow-pixel-primary` | Offset hard shadows. |
| `.bg-pixel-grid` | Faint 32px grid background. Console/canvas surfaces only (e.g. the landing terminal section) — never tiled across every section. |
| `.animate-blink-pixel` | Stepped on/off blink (cursor + loading dots). |
| `.scanlines` | Global CRT scanline overlay on `<body>`. |

## Component States

### Button (`_atoms/button.tsx`)
- Base: `pixel-press border-2`, focus-visible ring with offset, disabled dims + no cursor.
- Variants: primary / secondary / outline / ghost / destructive. All carry a pixel shadow
  that disappears on `:active` (the press).
- Sizes: sm / md / lg.

### Badge (`_atoms/badge.tsx`)
- `border-2`, square, `tracking-wide`, `whitespace-nowrap`. Variants share the semantic palette.

### Input (`_atoms/input.tsx`)
- `border-2 border-input`, square, focus ring with offset, error border uses `destructive`.

### Avatar (`_atoms/avatar.tsx`)
- Square (`border-2`), not circular — consistent with the pixel grid.

## Browser Surfaces

The parts not drawn by components still carry the theme (declared once in `app/globals.css`,
plus `ThemeProvider`):

- `::selection` uses primary/primary-foreground; `caret-color` is primary everywhere.
- Scrollbars are themed: `::-webkit-scrollbar` rules for Chrome/Safari (10px, square thumb in
  `--border`, primary on hover, no buttons); `scrollbar-width`/`scrollbar-color` are scoped to
  Firefox via `@supports (-moz-appearance: none)` so Chrome keeps the custom scrollbars.
- `colorScheme` is set on `<html>` from `ThemeProvider` (inline style, syncs with the theme
  toggle) so UA surfaces — default scrollbars, form controls — follow the active theme.
- Tab pattern is one shape everywhere: `border-b-2` track + `-mb-[2px] border-b-2
  border-transparent` buttons, active gets `text-primary border-primary`. No background-tinted
  tab variants.

## Motion

- Easing utilities: `ease-out-expo`, `ease-out-quart`.
- Scroll reveal: `Reveal` atom (IntersectionObserver, `once`, staggered `delay`).
- Pixel press: 90ms transform + shadow.
- Modal entrance: `animate-in zoom-in-95`; progress bars `duration-500 ease-out`.
- Landing hero: `<canvas>` "Investigation Grid" (`_components/_organisms/pixelHero.tsx`) —
  low-res buffer scaled with `image-rendering: pixelated`; ~30fps; static frame under
  `prefers-reduced-motion` or `< 768px`.
- **No animation libraries.** CSS transitions/keyframes + `tw-animate-css` only.
- `prefers-reduced-motion: reduce` globally zeroes durations.

## Icon & Emoji Policy

- **Icons:** `feather-icons-react` for all UI chrome (nav, buttons, cards, empty states,
  labels, stat tiles).
- **Emoji:** allowed only in narrative/tier/celebration content — achievement icons, chapter
  tier medals (🥇🥈🥉), narrative deduction marker, victory banner. Never in chrome.
- No emoji for buttons, nav links, labels, or section headers.

## Accessibility

- Focus-visible rings (with offset) on all interactive elements.
- `aria-label` on icon-only controls; `aria-current` on tabs; `aria-live="polite"` on results;
  `role="alert"` on errors; semantic `button`/`nav`/`table`/`th`/`td`.
- Form fields linked via `htmlFor`/`id`.
- Class-based dark/light toggle, dark default, persisted in `localStorage`.
- `prefers-reduced-motion` respected globally.

## Files of note

- `app/globals.css` — tokens + primitives.
- `app/layout.tsx` — font wiring (`Press Start 2P`, `Pixelify Sans`, `JetBrains Mono`).
- `_context/themeProvider.tsx` — theme class + `colorScheme` on `<html>`.
- `_components/_molecules/logo.tsx` — pixel-bitmap magnifier, theme-aware via CSS vars.
- `_components/_organisms/pixelHero.tsx` — landing canvas.
- `app/icon.svg`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/manifest.ts` — brand
  assets on the pixel palette.
