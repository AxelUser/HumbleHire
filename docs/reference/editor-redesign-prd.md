# Editor redesign & templates — implementation PRD (step 2)

A self-contained brief for step 2 of the CV work: the full editor redesign, the per-CV styling system, and the template reshape. It carries every decision reached in the design session so the work can be picked up in a fresh conversation without re-deriving anything.

Authoritative decisions live in [ADR-012](../decisions/ADR-012-templates-render-resolved-styling.md), [ADR-013](../decisions/ADR-013-styling-is-a-per-cv-content-sibling.md), [ADR-010](../decisions/ADR-010-content-decoupled-from-presentation.md), and the [glossary](../../CONTEXT.md). This document is the spec those decisions point at; use the glossary's vocabulary (Template, Section, Styling, Palette, Preset) throughout. Step 1 is specified in [cv-model-refactor-prd.md](./cv-model-refactor-prd.md). A clickable visual reference of the target design is the prototype at `static/prototypes/editor.html`.

## Problem Statement

Step 1 landed the complete presentation-free content model (twelve JSON Resume sections), the descriptor-driven sync engine, serialization at JSON schema `v0.1.0`, and a **minimal** editor port that keeps the app building, editing, previewing, exporting, and syncing. What it deliberately did **not** do:

- Seven sections (volunteer, awards, certificates, publications, languages, interests, references) and the basics photo have **no editor surface and no PDF rendering**, even though they round-trip through serialization and sync.
- The editor is the legacy block layout: a section card (`BlockWrapper`) wrapping per-entry cards (`SortableItem` with `rounded-lg p-4`) — card-in-card nesting the redesign exists to remove.
- There is **no user control over presentation**: one hard-coded `classicTheme`, no colours, no fonts, no margins, no section order. `ThemeModule` bakes colours/sizes into one `build`, with no seam for a user palette.

## Solution

Two things ship together on this branch:

1. **A full-coverage Section editor** in a new design language: one card per [Section], flattened entries (mono sublabels, shallow padding, hairline dividers, no nested cards), progressive disclosure for secondary fields, section reorder and section/entry/field hiding. Every field in `CVContent` becomes editable, including the seven previously surface-less sections and the photo.
2. **A per-CV styling system and reshaped templates.** `ThemeModule` becomes [`CvTemplate`](../decisions/ADR-012-templates-render-resolved-styling.md): a fixed header plus a per-Section renderer map, driven by a shared walker, consuming **resolved styling tokens**. A new `cv.styling` sibling of content holds the user's template, palette, font, base size, density, and section order ([ADR-013](../decisions/ADR-013-styling-is-a-per-cv-content-sibling.md)). The editor grows a **Look** tab beside **Content**; the PDF preview stays pinned on the right, the sync drawer stays on the far right.

The content model, descriptor, sync, and serialization from step 1 are **not** touched. This step is presentation only.

## User Stories

_Editing (job seeker):_

1. As a job seeker, I want every section I could only export before — volunteer, awards, certificates, publications, languages, interests, references — to have a real editor, so that I can write them, not just import them.
2. As a job seeker, I want each section to read as one clean card with no boxes-inside-boxes, so that the editor feels calm and scannable.
3. As a job seeker, I want a job's rarely-used fields (url, employer description) tucked behind "More details", so that a typical entry stays short.
4. As a job seeker, I want to reorder my sections (Skills above Experience, Education first), so that the CV leads with my strongest material.
5. As a job seeker, I want to hide a whole section, a single entry, or a header field (phone, photo, location) without deleting it, so that I can shape a tailored copy or protect privacy.
6. As a job seeker, I want my current role marked distinctly while editing, so that I can see at a glance which job is ongoing.

_Styling (job seeker):_

7. As a job seeker, I want to pick a colour palette from a few presets, so that I can restyle my CV without being a designer.
8. As a confident job seeker, I want to set three colours by hand, so that I can match a personal brand.
9. As a job seeker, I want to choose a font, a text size, and a spacing density, so that I can fit one page and set a tone — without a wall of sliders.
10. As a job seeker, I want to see the rendered page update as I change colours and layout, so that I am never guessing.
11. As a job seeker, I want each of my CVs to keep its own look, and a tailored copy to start from its master's look but diverge freely, so that one restyle does not ripple where I do not want it.

_Maintainability (maintainer):_

12. As a maintainer, I want a new template to be a small declarative file that places tokens, so that adding a template never means re-deriving greys, contrast, or sizes.
13. As a maintainer, I want section order and hide-state handled once in a shared render driver, so that no template can get ordering or hiding wrong.
14. As a maintainer, I want styling kept out of `CVContent` and out of sync, so that the content model and the diff engine stay untouched by presentation.

## Implementation Decisions

### Section taxonomy (presentation)

The orderable/hideable unit is the **Section**, a presentation concept that is not one-to-one with `CVContent` keys.

- **Header** is fixed and always first; it is not a Section in the orderable set. It renders `basics`: full name, position, location, photo, and contacts (email, phone, url, profiles).
- **Twelve reorderable, hideable Sections**, each with a `SectionId`: `summary` (sourced from `basics.highlights`, with `basics.summary` reserved), `experience` (`work`), `projects`, `education`, `skills`, `volunteer`, `awards`, `certificates`, `publications`, `languages`, `interests`, `references`.

`SectionId` → content source is a single static map. The only cross-section regrouping is `basics → Header + Summary`; every other section maps to its own content array.

### Editor design language

The design is fixed by the confirmed prototype (`static/prototypes/editor.html`). Rules:

- **One card per Section.** The card is the only border. Its head row carries a drag handle (reorder), the section title, an entry count, a hide (eye) toggle, and a collapse chevron.
- **Flattened entries.** Inside a section there are **no per-entry cards**. Fields use mono uppercase **sublabels**, shallow vertical padding, and a **single hairline** between entries (not whitespace-only, not a box). Repeating string lists (highlights, courses, roles) render as bullet rows; keyword/tag lists render as chips.
- **Accent left-rail means "current role" only.** An entry with `current: true` gets the inset accent rail (as the step-1 job block already does). The rail is never used as a generic separator.
- **Progressive disclosure for secondary fields.** Primary fields are always visible; a quiet "+ More details" row per entry reveals the rest. Split per section:
  - experience — primary: company, role, dates, current, highlights, keywords · secondary: location, description, url
  - education — primary: institution, studyType, area, dates · secondary: url, score, courses
  - projects — primary: name, description, dates, highlights · secondary: url, keywords, roles, entity, type
  - awards — primary: title, awarder, date · secondary: summary
  - certificates — primary: name, issuer, date · secondary: url
  - publications — primary: name, publisher, releaseDate · secondary: url, summary
  - skills — primary: category name, keywords · secondary: level
  - volunteer — primary: organization, position, dates, highlights · secondary: url, summary
  - languages / interests / references — all fields primary
- **Empty sections** are absent from the editor body and offered in an "Add a section" tray; the render driver skips empty sections in the PDF.

### Hiding model

The editor surfaces three hide granularities, all keyed into the existing `cv.hidden` path set (step-1 `encodePath`/`isPathHidden`, `/`-terminated, prefix-safe):

- **Section** — a hide toggle on every reorderable Section, addressing the section's content source path (Summary → `basics/highlights/`, others → their content key).
- **Entry** — a hide toggle per list entry, addressing the entry `objectId` path. Read-time ancestor containment (step 1) means a hidden section shadows entry-hides beneath it without erasing them.
- **Header field** — a hide toggle only on Header's optional singletons (`basics/location/`, `basics/image/`, `basics/email/`, `basics/phone/`, `basics/url/`, each profile). **No per-field hiding inside repeating entries.**

### Editor frame and the Look tab

- The left editing column gains a tab switch: **Content** and **Look**. The PDF preview stays pinned to the right of the column so the user edits-and-sees. The sync drawer keeps the far-right slot; the Look tab never uses it.
- The **Look** tab is exactly five controls — no more:
  1. **Template** — a card picker (Classic now; others declared later).
  2. **Palette** — preset swatches first; an "Advanced" disclosure reveals three colour pickers (Accent, Text, Surface).
  3. **Font** — a curated set of 3–4 families (segmented).
  4. **Base size** — Compact / Normal / Large.
  5. **Density** — Compact / Normal / Relaxed.

### Styling state (`cv.styling`)

A new field on the CV, sibling of `content`/`hidden`/`baseline`/`hashes`, never inside `CVContent` ([ADR-013](../decisions/ADR-013-styling-is-a-per-cv-content-sibling.md)):

```ts
interface CvStyling {
	templateId: string; // e.g. "classic"
	palette: { presetId: string } | { accent: string; text: string; surface: string };
	font: FontKey; // curated key, not a free string
	baseSize: 'compact' | 'normal' | 'large';
	density: 'compact' | 'normal' | 'relaxed';
	sectionOrder: SectionId[]; // a permutation of the twelve; Header excluded
}
```

- **Excluded from sync.** It is not in `CVContent`, so the descriptor never projects it and the diff never raises it. Section order living here means reordering a master never surfaces as a sync change on its copies.
- **Inherited once at tailoring**, then independent: `createTailoredCV` deep-copies the master's `styling`.
- **Backfilled, not wiped.** A Dexie `upgrade` fills a default `styling` on existing CVs; `createCV` sets defaults. This change is additive and must not drop the database (unlike the step-1 content bump).

### Template contract (`CvTemplate`) and the render driver

`ThemeModule` is renamed and reshaped ([ADR-012](../decisions/ADR-012-templates-render-resolved-styling.md)):

```ts
interface CvTemplate {
	id: string;
	name: string;
	scale: TypeScale; // template-owned ratios (name/heading/body/caption)
	page: (s: ResolvedStyling) => PageSetup; // page size + pdfmake defaultStyle
	header: (basics: Basics, hidden: HiddenSet, s: ResolvedStyling) => Content;
	sections: Record<SectionId, (cv: CVContent, s: ResolvedStyling) => Content | null>;
}
```

- A **shared driver** `renderTemplate(template, cv)` does the assembly: resolve styling, build the header, then iterate `cv.styling.sectionOrder`, skipping Sections that are hidden (via the hidden set) or empty (renderer returns `null`), and concatenate into `TDocumentDefinitions`. Templates never write the section loop.
- v1 templates are **single-column**. `build`/renderers still return pdfmake content; pdfmake stays the engine.

### Resolved styling tokens

A single resolver is the only place that derives values:

```ts
interface ResolvedStyling {
	color: {
		accent: string;
		onAccent: string; // derived by luminance contrast
		text: string;
		muted: string; // derived from text (~60%)
		hairline: string; // derived from text (~14%)
		surface: string;
		onSurface: string; // derived by luminance contrast
	};
	font: { family: string; size: { name: number; heading: number; body: number; caption: number } };
	page: { margins: [number, number, number, number] };
}

resolveStyling(styling: CvStyling, template: CvTemplate): ResolvedStyling;
```

- **Palette** → resolve a preset id to its three colours, then derive `muted`, `hairline`, `onAccent`, `onSurface`. Users never set the derived four. **Surface** is carried even though single-column templates may not paint it; the Look UI flags it as unused when the active template ignores it.
- **Font** → map `FontKey` to a registered, embeddable, ATS-safe family. No free font field, no runtime Google Fonts (would break offline + the local-first network posture).
- **Base size** → a base body number; the four sizes are `base × template.scale`. The type scale is the template's, not the user's.
- **Density** → a margins tuple and the template's spacing rhythm.

### Rename mechanics

`ThemeModule`→`CvTemplate`, `src/lib/features/export/themes/`→`.../templates/`, `classicTheme`→`classicTemplate`, `DEFAULT_THEME_KEY`→`DEFAULT_TEMPLATE_ID`. The glossary "Theme" entry is already replaced by "Template". One atomic rename; no product/code split.

## Modules

To build or rewrite, each with a small interface testable in isolation:

- **Styling types** — `CvStyling`, `ResolvedStyling`, `SectionId`, `FontKey`, palette presets. Foundational, no logic.
- **Styling resolver** — `resolveStyling`: palette derivation (muted/hairline), contrast picks (onAccent/onSurface), size resolution, margins. The deepest, most-tested unit on the presentation side.
- **`CvTemplate` type + classic template** — rewrite `classicTheme` to the header + section-map shape, reading tokens. The Summary renderer sources `basics.highlights`.
- **Render driver** — `renderTemplate`: resolve, header, order-walk, skip hidden/empty, assemble. Owns ordering and hiding once.
- **Look tab** — Template picker, Palette (presets + advanced pickers), Font, Base size, Density controls, bound to `cv.styling`.
- **Editor frame** — Content/Look tab switch in the left column; preview stays right.
- **Section components** — rewrite the block components to the flat Section-card design (one card, sublabels, hairline, accent-rail-for-current, progressive disclosure), plus **new** Section editors for volunteer, awards, certificates, publications, languages, interests, references, and the Header photo. Section reorder (drag) and the "Add a section" tray.
- **Hiding controls** — section, entry, and Header-field toggles wired to `cv.hidden`.
- **Persistence / creation** — Dexie `upgrade` that backfills default `styling`; `createCV`/`createTailoredCV` defaults and master-styling clone.

## Testing Decisions

Assert external behaviour, not internals.

- **Styling resolver** — given a palette, derived muted/hairline are stable; onAccent/onSurface clear a contrast threshold against their backgrounds across light and dark accents/surfaces; sizes equal `base × scale`; density maps to the expected margins.
- **Render driver** — sections render in `sectionOrder`; hidden sections and hidden entries are absent; empty sections are absent; Header always first; Summary sources highlights. Order-agnostic to input content order.
- **Classic template** — a complete-CV fixture (all twelve sections populated) renders without throwing and places accent/text/muted tokens where expected (assert on the produced pdfmake doc's text/colour, not intermediate shapes).
- **Styling persistence** — a pre-styling stored CV loads with a valid default `styling` (backfill); `createTailoredCV` clones the master's styling and then mutates independently; styling never appears in a diff between master and tailored.
- **Section editors** — each new section round-trips edits into `content` and toggles hide paths correctly; progressive-disclosure fields persist when collapsed.

## Out of Scope

- **Multi-column templates** and free cross-column section placement. v1 is single-column; the section order is one flat list.
- A **free font field** and **runtime web-font loading**; only a curated, bundled set.
- **Raw four-value margin inputs** (density preset only) and **per-element font sizes** (base size + template scale only).
- **Per-field hiding inside repeating entries**; date-masking ("hide all dates" for age) — parked unless requested.
- A **live summary editor** (still deferred from step 1; highlights drives the Summary section, `basics.summary` stays reserved).
- **i18n** (the descriptor is the seam; no translation layer yet).
- **The `/cv/[id]` dev routing bug** (editor route falls back to the dashboard; `seedFullCv` `goto` throws `reading 'hash'`) — a real, separate bug to fix; not part of this redesign.

## Further Notes

- Keep `CVContent`, the descriptor, sync, and serialization untouched — this step is presentation only.
- Reuse the step-1 path machinery for all hiding; do not introduce a second address encoding.
- The exact curated font set (members and weights) is finalized at build time against bundle/offline cost; the contract (`FontKey` → embeddable family) does not depend on the choice.
- Surface having no visible effect under single-column templates is expected, not a bug; the Look UI says so.
