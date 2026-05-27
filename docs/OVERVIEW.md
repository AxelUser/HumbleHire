# HumbleHire — Project Overview

## Problem

Job seekers keep one comprehensive CV and tailor it per application. The usual workflow is copy the file, edit the copy, export, apply, repeat. A few applications in, the folder is full of `cv_v3_backend_FINAL2.pdf` files with no record of what came from what or what changed when.

HumbleHire fixes that. One master CV holds the full record. Tailored copies branch off it for specific roles and stay linked. When the master changes, each tailored copy can pull in the parts that matter and ignore the rest.

## What it is

A local-first, block-based CV builder that runs in the browser. Free, open source, static SvelteKit. No backend, no account, no cloud. All data lives in IndexedDB.

## How it works

### Block-based editor

A CV has nine fixed blocks in fixed order: Full Name, Position, Location, Contacts, Highlights, Skills, Job History, Projects, Education. The last six are repeatable. Clicking a field edits it in place; changes auto-save a second after typing stops. Any block can be hidden without losing its content; hidden blocks are skipped on export.

### Dashboard

Lists every CV, grouping tailored copies under their master. Fuzzy search filters and highlights matches. The group filter is asymmetric: a master that matches shows all its children; a child that matches shows its master as context. See [ADR-003](decisions/ADR-003-dashboard-search.md).

### Tailoring and sync

A tailored CV starts as a full copy of a master at a moment in time and keeps a link back. From then on the two are independent.

When the master changes, the tailored copy gets an "updates available" indicator. The sync view splits the change set into diff items at the finest reasonable grain: a text edit, an added or removed entry, a modified entry, or a single new achievement inside a job. The user accepts or discards each one. Discards are remembered against the master's current state, so the same dismissed change does not keep reappearing.

Sync is one-way only: master into tailored. Tailored copies cannot derive from other tailored copies.

### Export

Export builds the PDF in the browser with pdfmake and downloads it directly. No print dialog. The editor's side-by-side preview renders the same PDF with PDF.js, so the preview is the file. Hidden and empty blocks are stripped before the theme runs. The v1 theme is Classic: single-column, conservative typography, ATS-parseable. The theme interface allows more later. See [ADR-002](decisions/ADR-002-client-side-pdf-generation.md).

### Storage

IndexedDB via Dexie.js. Nothing leaves the browser. Clearing site data wipes everything, which is what export is for. See [ADR-001](decisions/ADR-001-indexeddb-dexie.md).

## Scope

### In

- Block-based editor with click-to-edit and auto-save
- Master / tailored relationships with selective, one-way sync
- Dashboard with fuzzy search and master-grouped listing
- Single-click PDF export with live byte-accurate preview
- Local-first storage

### Out

- Cloud sync, accounts, multi-device
- Multi-user or collaborative editing
- Tailored-to-tailored derivation, tailored-to-master sync
- Job application tracking beyond the optional company label
- LinkedIn or PDF import
- AI-driven writing, ATS scoring, recommendations
- Custom block types or user-editable block order
- Named version snapshots or version history
