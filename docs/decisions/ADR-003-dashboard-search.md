# ADR-003: Dashboard search with Fuse.js and an asymmetric group filter

- **Status**: Accepted
- **Date**: 2026-05-25
- **Feature**: dashboard

---

The dashboard CV list has fuzzy search with match highlighting. Two parts of the design are not obvious from the code: the matcher is Fuse.js, and the master/tailored group filter is asymmetric.

## Fuse.js for fuzzy matching

Fuse.js was chosen for `includeMatches`, which returns character-level index ranges per matched key. Those ranges feed straight into highlight rendering. uFuzzy is smaller but would need that extraction rebuilt by hand. MiniSearch is built for large corpora, more than a list of a few dozen CVs needs.

Fuse indexes a small internal `CVIndexEntry` (`{ id, name, company? }`) rather than the full CV. This keeps the index small and gives typed keys on match results. Card components keep reading `cv.*` directly; `CVIndexEntry` is an unexported detail of the search module.

## Asymmetric group filter

CVs sit in master/tailored groups. Filtering each CV on its own breaks the grouping: tailored copies look orphaned, or a master disappears while its children stay. The filter is asymmetric instead:

- Master matches: show the whole group, all tailored children included.
- Only children match: show the master as context, unhighlighted, plus the matching children only.
- Nothing matches: hide the group.

When the master matches, its tailored copies are applications of it, so hiding a copy because it lacks the query word would drop context the user wants. When only a child matches, the master appears as a container so the result is not left disembodied, but non-matching siblings drop out.

The count strip changes vocabulary to avoid overclaiming. Idle shows inventory ("X masters · Y tailored copies"); active search shows the direct match count only ("N matches"). Masters shown only as context do not pad the number.
