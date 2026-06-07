# ADR-012: Templates render resolved styling tokens

- **Status**: Accepted
- **Date**: 2026-06-07
- **Feature**: template

---

The presentation module is renamed from `ThemeModule` to **`CvTemplate`** and reshaped so that a template owns only layout and graphics, while every colour, font, size, and margin is supplied to it as a **resolved styling token**. This is the step-2 presentation contract that [ADR-010](./ADR-010-content-decoupled-from-presentation.md) deferred. The per-CV state those tokens are computed from is covered separately in [ADR-013](./ADR-013-styling-is-a-per-cv-content-sibling.md).

## What changed

- **`Theme` → `Template`** across product copy, code, and the [glossary](../../CONTEXT.md): `ThemeModule` becomes `CvTemplate`, `themes/` becomes `templates/`, `classicTheme` becomes `classicTemplate`. The glossary's old "Theme" entry (which listed "Template" under _Avoid_) is reversed.
- **A template is a fixed header plus a map of per-[section] renderers, not a monolithic `build`.** A shared driver walks the user's section order, skips hidden and empty sections, and invokes each renderer. Order-handling and hide-handling live once in the driver, so a template cannot get them wrong and stays thin. v1 templates are **single-column**.
- **`build` receives resolved tokens, not raw user choices.** A single styling resolver turns the user's inputs into a complete `ResolvedStyling`: the colour set (`accent`, `text`, `surface`) plus the **derived** `onAccent`, `muted`, `hairline`, and `onSurface`; the four font sizes computed from one base size times the **template-owned** type scale; and the page margins from a density preset. The template reads tokens (`styling.color.accent`, `styling.font.size.heading`) and decides only **where** each lands — it never computes a tint, a contrast colour, or a size.
- **The orderable units are presentation sections, not content keys.** `basics` splits into a fixed **Header** (name, position, location, contacts, photo — always first) and a reorderable **Summary** sourced from `basics.highlights`. The other eleven content arrays each map to one section. Section visibility reuses the existing `hidden` address set.

## Why

The old `ThemeModule` hard-coded colours, fonts, and sizes inside one `build` function, so a second template meant copying that machinery and re-deriving greys and contrast by hand — and there was no way for a user palette to reach the render. Splitting derivation into one resolver and reducing a template to "place these tokens in this layout" makes a new template a small, declarative file and guarantees every template derives neutrals and contrast identically and accessibly. Driving section order and hide-state from a shared walker, rather than each template's own loop, removes a whole class of per-template bugs.

## Consequences

- Templates lose the ability to pick their own greys or contrast colours; those are derived centrally. This is deliberate — it is what keeps the neutral scale correct and the output accessible regardless of palette.
- **Surface** has no visible effect under single-column v1 templates unless a template chooses to use it (a tinted header band, chip fills). It is carried in the contract now for forward compatibility with multi-column templates; the Look UI flags it as unused where a template ignores it.
- The type scale being template-owned means size resolution needs the active template's scale; the resolver takes it as input rather than hard-coding one global scale.
- pdfmake stays the render target; `build` still returns `TDocumentDefinitions`. Swapping the render engine is out of scope.
