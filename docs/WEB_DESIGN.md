# HumbleHire — Web Design Guide

**Direction:** Soft Neo-Brutalism · **Palette:** Cool & Concrete · **Author:** Aleksey Maltsev

---

## Design Philosophy

HumbleHire expresses the "humble but grinding" feeling of job hunting. The aesthetic is **assertive without aggression** — calm surfaces communicating quiet determination through strong geometry rather than flashy polish.

> Not loud. Not timid. Just steady.

---

## Typography

**Font:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (400–800)

- Body: 400–500 weight, `line-height: 1.6`
- UI labels & buttons: 700 (`font-bold`)
- Display / hero: 800 (`font-extrabold`), `tracking-tight` to `tracking-tighter`
- Section eyebrows: 800, `uppercase`, `tracking-widest`, accent color

**Rule:** if text is interactive or structural, it is bold. Muted weight only for body copy and metadata.

---

## Color Palette — Cool & Concrete

| Token                | Light                                     | Dark                          | Use                       |
| -------------------- | ----------------------------------------- | ----------------------------- | ------------------------- |
| `--background`       | `oklch(0.97 0.006 255)` — cool off-white  | `oklch(0.13 0.03 264)`        | Page surface              |
| `--card`             | `oklch(1 0 0)` — pure white               | `oklch(0.18 0.03 264)`        | Elevated surface          |
| `--foreground`       | `oklch(0.12 0.025 262)` — near-black      | `oklch(0.95 0.008 255)`       | Primary text, borders     |
| `--primary`          | `oklch(0.22 0.04 264)` — dark slate       | `oklch(0.90 0.015 255)`       | Primary buttons           |
| `--secondary`        | `oklch(0.88 0.018 255)` — light grey-blue | `oklch(0.26 0.038 262)`       | Secondary surfaces        |
| `--muted`            | `oklch(0.93 0.010 255)`                   | `oklch(0.26 0.038 262)`       | Disabled, skeleton        |
| `--muted-foreground` | `oklch(0.48 0.040 258)`                   | `oklch(0.62 0.040 258)`       | Captions, metadata        |
| `--accent`           | `oklch(0.52 0.16 252)` — **steel blue**   | `oklch(0.58 0.18 252)`        | ONE accent, use sparingly |
| `--border`           | `oklch(0.22 0.025 262)` — near-black      | `oklch(0.95 0.008 255 / 18%)` | All visible borders       |

**Accent rule:** Steel blue (`--accent`) is the single punch of color. Use it for: eyebrows, highlighted numbers, active badges, CTA hover. Do not introduce other hues.

---

## Shadow System — Hard Offset (No Blur)

Shadows are purely geometric offsets — no `blur-radius`. They create depth through parallelism, not softness.

```css
/* Shadow color adapts to theme via --shadow-color */
/* :root  */
--shadow-color: oklch(0.12 0.025 262); /* near-black */
/* .dark  */
--shadow-color: oklch(0.95 0.008 255 / 30%); /* white glow */

--shadow-brutal-sm: 2px 2px 0px 0px var(--shadow-color); /* default buttons, small cards */
--shadow-brutal: 4px 4px 0px 0px var(--shadow-color); /* cards, primary CTA */
--shadow-brutal-hover: 6px 6px 0px 0px var(--shadow-color); /* hover state */
--shadow-brutal-accent: 4px 4px 0px 0px oklch(0.52 0.16 252); /* accent emphasis — fixed color */
```

**Hover interaction pattern** (`.hover-brutal`):

- Rest: `shadow-brutal-sm` + `translate(0, 0)`
- Hover: `translate(-2px, -2px)` + `shadow-brutal-hover` → element "lifts" diagonally
- Active: back to rest — snaps back on click

Apply `.hover-brutal` to: all bordered/filled buttons, cards, CV rows, stat panels. **Not** on ghost/link buttons or plain text elements.

---

## Borders

- **Thickness:** `border-2` (2px) everywhere. Never `border` (1px).
- **Color:** `border-foreground` (near-black) for interactive elements and structural containers. `border-border` for subtle separators.
- **Radius:** `--radius: 0.125rem` — nearly square. Soft Neo-Brutalism avoids round softness. Badges and chips use `rounded-none`.
- **Block sections:** left accent stripe — `border-l-4 border-foreground pl-3` — marks editable CV sections.
- **Separators:** `border-b-2 border-foreground` for toolbars and headers. Never hairline.

---

## Component Conventions

### Buttons

All filled/bordered variants (`default`, `secondary`, `outline`, `destructive`, `accent`) share:

- `border-2 border-foreground`
- `shadow-brutal-sm hover-brutal`
- `font-bold`

`accent` variant: `bg-accent text-accent-foreground` — steel blue fill. Use for primary one-off CTAs ("New CV", "Get Started"). Not for frequent recurring actions ("Save Version").

The `outline` variant uses `hover:bg-muted` (neutral grey) — reserved for secondary/additive actions (e.g. "Add Contact"). `hover:bg-accent` is not used on any button variant; accent hover is reserved for non-button interactive elements.

Ghost buttons: borderless, no shadow — use for subtle icon actions. Hover uses `bg-muted` (neutral grey), **not** accent blue, to avoid contrast conflicts with destructive (red) icons.

Sizing: `size="lg"` for primary CTAs (New CV, Get Started). `size="sm"` for inline toolbar actions.

### Cards

`border-2 border-foreground shadow-brutal hover-brutal` — all cards lift on hover. No `rounded-xl`, no `shadow-sm`.

### Badges

`rounded-none border` (inherits near-black border from token), `font-bold`, `px-2.5 py-1`. The border color comes from `--border` token — no `border-transparent` overrides.

### Inputs / Textareas

`border-2` (never `border`). Focus ring: `ring-[3px]` with steel blue `--ring` token.

### Block Spacing — CV Editor Internals

Spacing inside CV block components follows a strict three-tier hierarchy. Use `gap` on parent flex containers, not `mb-*` on individual children.

| Role | Class | px | Where |
|---|---|---|---|
| Entry card gap | `gap-4` | 16 | Between entry cards (education, jobs, projects) |
| Field gap | `gap-2` | 8 | Between fields within a card; between flat list items |
| List item gap | `gap-1.5` | 6 | Between bullet items in EditableList |
| Inline gap | `gap-2` | 8 | Same-row elements (dates, label+value) |
| Entry padding | `p-4` | 16 | Internal padding of entry cards |
| Add button margin | `mt-2` | 8 | Above "Add" buttons in flat lists / EditableList |

**Rules:**

1. Entry card spacing is controlled by `gap-4` on the flex container, not `mb-4` on individual cards.
2. All fields within an entry card sit in `flex flex-col gap-2`. No individual margin classes on fields.
3. EditableList uses `gap-1.5` internally — bullet items are denser content.
4. In entry card blocks, the add button is a sibling in the `gap-4` container (inherits 16px space). In flat lists and EditableList, use `mt-2`.
5. Entry cards use `border rounded-lg p-4`. No margin classes on cards.

```
PanelCard (px-4 py-4)
  └─ Block content
       ├─ Cards container (gap-4)
       │    └─ Card (p-4, border rounded-lg)
       │         └─ Fields (gap-2)
       │              ├─ Header row (gap-2 inline)
       │              ├─ Text fields
       │              ├─ Date row (gap-2 inline)
       │              └─ EditableList (gap-1.5)
       └─ Add button (inherits gap-4)
```

### Bullet Points

List items with bullet points use a geometric square (■) to maintain Neo-Brutalist rectangular aesthetic:

- Size: `text-lg` (1.125rem) with `leading-none`
- Positioning: `mt-[0.2rem]` to vertically center with first line of text
- Color: `text-muted-foreground` for subtle hierarchy
- Character: ■ (geometric square, not circular •)

---

## Layout

- **Max content width:** `max-w-5xl` (1024px) with `px-6` side padding.
- **Global structure:** sticky Header → `flex-1` main content → Footer.
- **Header:** sticky, `border-b-2 border-foreground`, shows logo + contextual back button.
- **Footer:** `border-t-2 border-foreground`, author credit.
- **CV editor toolbar:** `sticky top-14` (below global header), `border-b-2 border-foreground`.

---

## Dark Mode

Implemented via [mode-watcher](https://github.com/svecosystem/mode-watcher). Adds `.dark` class to `<html>`.

In dark mode:

- Borders soften: `oklch(0.95 0.008 255 / 18%)` — near-white at low opacity
- Hard shadows become: `oklch(0.95 0.008 255 / 30%)` — subtle glow instead of hard black
- Accent brightens slightly: `oklch(0.58 0.18 252)`
- Destructive uses solid red (not `destructive/60`) for legibility

Toggle: floating `fixed bottom-6 right-6` button. Uses Sun/Moon icon to indicate the mode you'll _switch to_.

---

## Voice & Copy

- Section eyebrows: short, directional — `↳ Your CVs`, `✦ Your job search, tracked`
- Motivation copy: understated — _"Every application is practice. Keep showing up."_
- UI labels: direct, no filler — "Save Version", "Delete", "Dashboard"
- Avoid: exclamation marks, marketing superlatives, emoji in UI chrome

---

## What Not To Do

- Don't introduce new accent colors — steel blue is the only hue
- Don't round corners with `rounded-xl` or `rounded-lg`
- Don't use `shadow-sm` (blurred) — hard offset only
- Don't use `border` (1px) for interactive elements
- Don't use ghost hover with accent background when the icon may be red/destructive
- Don't use light font weights on interactive elements
