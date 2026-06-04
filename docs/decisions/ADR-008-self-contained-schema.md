# ADR-008: The published JSON schema is self-contained

- **Status**: Accepted
- **Date**: 2026-06-04
- **Feature**: serialization

---

The HumbleHire resume schema (`static/schema/resume/v0.0.1.json`) inlines the JSON Resume base schema under `$defs` and references it locally. It does not use a live `$ref` to the JSON Resume source URL. JSON Resume compatibility is verified by tests, not by structural inheritance.

## Why not a live $ref

The natural starting point is:

```json
"allOf": [
  { "$ref": "https://raw.githubusercontent.com/jsonresume/resume-schema/master/schema.json" },
  { ...HumbleHire extensions... }
]
```

This pins to `master` of a third-party repository. A published, versioned schema must mean one thing forever. If the JSON Resume maintainers restructure their schema, every previously published HumbleHire schema version silently changes meaning or breaks for consumers who resolve it. There is no stable canonical public URL for the JSON Resume schema that is safe to reference in a frozen artifact.

Inlining the base (under `$defs`, referenced as `#/$defs/jsonResume`) freezes the meaning of `v0.0.1.json` at the moment it was published. Future changes go into a new file, `v0.0.2.json`, served alongside the old one. Published files are never edited in place.

## What replaces the structural guarantee

Inlining the base removes the live dependency on JSON Resume but also removes the structural proof of compatibility. Two tests replace it.

Export: `toJsonResume(cv)` (lossy) and `toDocument(cv)` (lossless superset) are both validated against `@jsonresume/schema`, which bundles the current upstream JSON Resume schema independently of the inlined copy. If upstream changes and the export fails, it is time to evaluate a `v0.0.2` that re-inlines the newer base.

Import: a canonical external JSON Resume sample is fed through `parseDocument` and asserted `ok: true`, verifying the self-contained superset schema accepts documents from the JSON Resume ecosystem.

These run as a node-environment Vitest suite and are treated as an external-interop guard, not unit tests.
