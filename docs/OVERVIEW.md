# HumbleHire — Project Overview

## Problem

Job seekers keep one comprehensive CV and tailor it per application. The usual workflow is copy the file, edit the copy, export, apply, repeat. A few applications in, the folder fills with `cv_v3_backend_FINAL2.pdf` files and there is no record of which copy came from which master, or what changed when the master was updated.

HumbleHire replaces that ad-hoc process with one master CV that holds the full record, tailored copies that branch off it for specific roles and stay linked back, and a way to selectively pull master changes into each tailored copy without losing the intentional differences.

## What it is

A free, open-source CV builder. Everything runs on your own machine. No account, no cloud sync. You write CVs, organise tailored copies, and export PDFs from the same surface.

## Approach

A few decisions shape how the rest of the tool feels:

- **One master, many tailored copies.** The master is your full record; tailored copies are how you adapt that record per application. The relationship is always one master to many tailored copies. Tailored copies do not chain.
- **Selective, one-way sync.** When the master changes, each tailored copy can decide change-by-change what to absorb and what to ignore. Discarded changes are remembered, so the same suggestion does not reappear every time. The point is to preserve intentional divergence, not to over-write it.
- **Fixed block structure.** Every CV is composed of the same nine blocks in the same order. The shape is opinionated on purpose: consistent output, predictable parsing by applicant tracking systems, and one less thing for you to fiddle with.
- **Local-first.** Your CVs live on your machine. There is no sign-up and no sync server. Backups are on you, which is what export is for.

## Features

### [Editor](features/cv-editor/OVERVIEW.md)

Build a CV by clicking on the preview itself. The editor and the rendered CV are the same surface, so every change is visible immediately and saved automatically. Blocks can be hidden without losing their content, which is what makes one master CV usable as the source of many tailored copies.

### [Tailoring](features/tailoring/OVERVIEW.md)

Create a tailored copy of any CV for a specific role or company. The copy stays linked to its master, so when the master changes later, you can review each incoming change and either pull it in or set it aside. Sync is always one-way and always selective.

### [Dashboard](features/dashboard/OVERVIEW.md)

All your CVs in one view, with tailored copies nested under the master they came from. Fuzzy search filters and highlights matches in place. The grouping filter keeps results in context instead of leaving tailored copies orphaned.

### [Export](features/export/OVERVIEW.md)

Turn any CV into a clean PDF in one click. The editor has a live preview so what you see is what the file will be. Hidden and empty blocks drop out of the export automatically.

## See also

- [SCOPE.md](SCOPE.md) — what HumbleHire covers and what it deliberately does not
- [decisions/](decisions/) — architecture decisions
- [../CONTEXT.md](../CONTEXT.md) — the shared vocabulary for this project
