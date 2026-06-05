# Import

Import turns a structured file into a new standalone CV in HumbleHire. It accepts both formats HumbleHire exports — HumbleHire JSON for a lossless round-trip, or any valid JSON Resume file from another tool.

## Formats

HumbleHire accepts two formats on import.

**HumbleHire JSON** (`.humblehire.json`) is the lossless format. A file exported from HumbleHire in this format imports back without loss.

**JSON Resume** (`.json`) is the interop format, based on the [JSON Resume](https://jsonresume.org) open standard ([schema v0.0.1](https://humblehire.cv/schema/resume/v0.0.1.json)). Any valid JSON Resume file — from another tool, hand-written, or generated — imports as a new CV. Some fields that HumbleHire stores separately are combined on the way in: a `summary` string becomes a single highlight bullet, for example.

## Importing

Import is available from the dashboard. Selecting a file validates it against the schema before anything is written. If the file is not a valid HumbleHire or JSON Resume document, the import stops with an error.

A successful import always creates a new standalone CV. It does not overwrite an existing CV, even if the file contains an `id` field from a previous export. Imported CVs have no master and are not linked to any existing CV.

## Limitations

The `hidden` state of blocks is not exported, so visibility choices are not restored on import. Re-importing a file creates a new standalone CV rather than merging back into an existing one, even if the file carries an `id` from a previous export. PDF files cannot be imported. Fields that do not map to any HumbleHire block are silently dropped.

## Background

The choice to always create a new CV on import rather than updating an existing one, and to accept both export formats on the way in, is recorded in [ADR-006](../../decisions/ADR-006-export-import-schema-as-dto.md). The schema used for validation is defined in [ADR-008](../../decisions/ADR-008-self-contained-schema.md).
