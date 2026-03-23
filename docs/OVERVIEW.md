# HumbleHire - Project Overview

## What Is It

HumbleHire is a resume builder that keeps your CVs organised: one master CV, tailored copies for each opportunity, and a clear record of what you sent where.

---

## Why It Exists

This project is a free (and open-source) alternative to my own Google Docs workflow, which required copy-pasting entire documents to create job-specific variants.
You end up with a bunch of `cv_v3_backend.pdf` files and no clear lineage, making it really chaotic to manage, especially when you have to update your master CV with new information.
HumbleHire aims to replace that manual process with a structured workflow where every change is visual and traceable.

---

## Goals

- **Interactive block-based editor** - CV is composed of discrete, editable blocks (name, position, contacts, highlights, job history, projects, education).
- **Tailoring** - create a tailored copy from any CV for a specific company or role, with sync back from the master CV.
- **Local-first** - all data is stored locally on your machine, no need to sync with the cloud.
- **Diff and merge** - compare versions side-by-side and selectively merge changes across tailored copies.
- **Export** - produce clean, formatted PDF/HTML output from any version.

## Non-Goals

- Not a SaaS application.
- Not a job board or application tracker.
- Not an AI-powered CV writer or optimizer.
- Not a collaborative/multi-user tool.
- Not a general document editor - structure is fixed to CV blocks.

---

## CV Blocks

I've tried to keep the blocks as minimal as possible, while still being able to express the most common CV content. This list may be opinionated, but it's what I've found to be the most common and useful.

| Block       | Description                                                |
| ----------- | ---------------------------------------------------------- |
| Full Name   | Applicant's legal or preferred name                        |
| Position    | Target job title                                           |
| Location    | City, country, or remote preference                        |
| Contacts    | Email, phone, LinkedIn, GitHub, etc.                       |
| Highlights  | 3-5 bullet points of professional summary                  |
| Job History | Per-company: name, dates, role, achievements (bullet list) |
| Projects    | Name, description, stack, link                             |
| Education   | Institution, degree, dates                                 |

---

## User Stories

### Versioning

- As a user, I can create a new CV from scratch by filling in structured blocks.
- As a user, I can create a tailored copy of my CV for a specific job posting.
- As a user, I can view the full version history of any CV.
- As a user, I can compare two CV versions and see what changed.

### Editing

- As a user, I can edit any block inline and see a live preview of the CV.
- As a user, I can reorder, hide, or show blocks without deleting content.
- As a user, I can add multiple entries within repeatable blocks (jobs, projects).

### Export

- As a user, I can export any CV version to PDF.
- As a user, I can share a CV version as a static HTML page.

---

## Out of Scope (v1)

- Import from LinkedIn or existing PDF
- ATS score analysis
- MCP server for building CV using AI Agents
