# Dashboard

The dashboard is the home page of HumbleHire. It lists every CV you have, organised so you can find a specific one quickly even when the list grows long.

## Grouping

Tailored copies appear nested under the master they were tailored from. The grouping matches how you actually think about CVs: one master with several tailored variants for different applications, visible together rather than scattered through a flat list.

## Search

A search box at the top of the dashboard filters the list. Search is fuzzy and forgiving of small typos, and matches are highlighted in place on each card so you can see why a CV came back.

The group filter is intentionally asymmetric. When the master matches the query, all of its tailored copies show alongside it because those copies belong to the matching unit. When only a tailored copy matches, the master appears as context so the result does not float orphaned.

The count strip above the list adapts to what is happening. With no active query it tells you how many masters and how many tailored copies you have. With an active query it tells you how many cards directly matched, without padding the number with masters that are present only as context.

## Background

See [ADR-003](../../decisions/ADR-003-dashboard-search.md) for the search library choice and the rationale behind the asymmetric filter.
