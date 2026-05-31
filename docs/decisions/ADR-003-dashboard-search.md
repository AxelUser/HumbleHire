# ADR-003: Dashboard search — Fuse.js and asymmetric group filter

- **Status**: Accepted
- **Date**: 2026-05-25
- **Feature**: dashboard

---

The dashboard CV list needed fuzzy search with highlight support. Two decisions in the design aren't obvious from the code alone.

## Fuse.js for fuzzy matching

Fuse.js won out because of `includeMatches`: it returns character-level index ranges per matched key, which feed directly into highlight rendering. uFuzzy is smaller but requires rebuilding that extraction manually. MiniSearch is built for larger corpora — overkill for a list of a few dozen CVs.

Fuse indexes against `CVIndexEntry` — a small internal type (`{ id, name, company? }`) rather than the full CV. This keeps the index small and gives typed key constraints on match results. Card components continue reading `cv.*` directly; `CVIndexEntry` is an unexported implementation detail of the search module.

## Asymmetric group filter rule

CVs on the dashboard sit in master/tailored groups. Filtering each CV independently breaks the grouping: tailored copies appear orphaned, or masters vanish while their children remain.

The filter is asymmetric:

- Master matches → show the whole group (all tailored children included, unfiltered).
- Only children match → show the master as context (no highlight) + only the matching children.
- Nothing matches → hide the group.

When the master matches, showing all children is the right call — the master is the unit, tailored copies are applications of it, and hiding them because they don't contain the same query word removes context the user almost certainly wants. When only a child matches, the master appears as a container to avoid a disembodied result, but non-matching siblings drop out.

The count strip swaps vocabulary to avoid overclaiming: idle shows inventory ("X masters · Y tailored copies"), active search shows only the direct match count ("N matches"). Masters shown only as structural context don't pad the number.
