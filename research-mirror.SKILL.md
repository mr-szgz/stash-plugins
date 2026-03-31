---
name: Research Mirror
description: Research current official documentation, specs, release/version context, examples, and runtime references for a product, API, standard, library, or platform, then save both raw source mirrors and curated local notes into a hidden Codex research folder. Use when Codex needs to browse the web, collect latest authoritative URLs, preserve docs locally, build TOCs or source manifests, capture user-provided snippets/logs/screenshots as fixtures, or create a reusable research bundle without touching deploy/runtime folders.
---

# Research Mirror

Create a local research snapshot that is easy to reuse later and unlikely to interfere with deploys.

## Core rules

- Prefer primary sources.
- Use official vendor docs, standards bodies, official changelogs, official repos, official API references, and official release notes before secondary sources.
- Treat user-provided snippets, screenshots, logs, and defaults as local fixtures, not as substitutes for official references.
- Save research first; do not “understand the whole repo” unless the user explicitly asks for codebase analysis.
- Avoid browsing the target deploy or plugin tree just to decide where to save research.
- Isolate saved research in a hidden folder so deploy tooling is less likely to pick it up.

## Default storage pattern

- Save under a hidden folder in the current workspace:
  - `.codex-research/<topic-slug>/<YYYY-MM-DD>/`
- If the user already has an established research folder, continue using it.
- If multiple subtopics exist, create a focused subfolder, for example:
  - `.codex-research/<topic-slug>/<YYYY-MM-DD>/api-compat/`
  - `.codex-research/<topic-slug>/<YYYY-MM-DD>/runtime/`
  - `.codex-research/<topic-slug>/<YYYY-MM-DD>/fixtures/`

## First-pass workflow

1. Identify the topic and the exact research target.
2. Determine the current official version or version family if the user asked for “latest”, `0.4.x`, “current”, “today”, or similar.
3. Find the official documentation hubs and changelog/release sources.
4. Save raw source mirrors.
5. Save curated notes that explain what was found and how the sources relate.

## Scope discipline

- Do not read unrelated folders in the workspace to “get context”.
- Do not inspect deployment folders unless the user explicitly wants deployment integration.
- Do not edit product/runtime files when the task is research-only.
- Do not overwrite existing research files unless the user asked for refresh or replacement.

## Source selection

Prefer this order:

1. Official docs
2. Official API reference
3. Official changelog or release notes
4. Official repository docs
5. Standards/specification source if the product claims compatibility with one
6. User-provided local artifacts

If compatibility is part of the task:

- Save both:
  - what the product says it supports
  - what the upstream standard or official API reference says
- Write a comparison note mapping product endpoints/pages to upstream spec pages.

## What to save

Save a mix of raw and curated artifacts.

### Raw artifacts

- Official docs pages as markdown when practical.
- If markdown mirroring is rate-limited or blocked, save HTML snapshots or plain-text extracts instead.
- Machine-readable indexes if the site provides them.
- Changelog or release note page snapshots.
- User-provided snippets exactly as given.
- User-provided logs as fixture files.

### Curated artifacts

- `README.md`
  - explain what the research bundle is for
  - explain why the folder is hidden
- `SOURCE_URLS.md`
  - list all official source URLs used
- `REFERENCE_INDEX.md`
  - list current hub pages, install pages, spec pages, and saved artifacts
- `RESEARCH_SUMMARY.md`
  - summarize the current version, current docs set, and key findings
- `*_TOC.md`
  - save section-level or page-level tables of contents for important docs hubs
- `*_SPEC_NOTES.md`
  - summarize the upstream standard or official API reference in compact form
- `*_RUNTIME_DEFAULTS.md`
  - save user-provided live URLs, ports, flags, and local settings when available

## Naming conventions

- Use stable, boring names.
- Prefer:
  - `README.md`
  - `SOURCE_URLS.md`
  - `REFERENCE_INDEX.md`
  - `RESEARCH_SUMMARY.md`
  - `APP_TOC.md`
  - `API_TOC.md`
  - `OFFICIAL_SPEC_NOTES.md`
  - `runtime-defaults.md`
  - `server-log-fixture-001.txt`
  - `user-drop-001.md`
- Number sequential user drops or fixtures when ingesting multiple ad hoc artifacts.

## Recommended file structure

```text
.codex-research/
  <topic-slug>/
    <YYYY-MM-DD>/
      README.md
      SOURCE_URLS.md
      REFERENCE_INDEX.md
      RESEARCH_SUMMARY.md
      user-drop-001.md
      runtime-defaults.md
      fixtures/
        server-log-fixture-001.txt
      raw/
        <domain>/
          <saved pages>.md
      raw-html/
        <saved pages>.html
      <subtopic>/
        RESEARCH_SUMMARY.md
        OFFICIAL_SPEC_NOTES.md
        SOURCE_URLS.md
```

## Web capture guidance

- Use web browsing for anything version-sensitive, current, niche, or spec-sensitive.
- When a site offers a clean markdown mirror path or mirror tool, prefer that for saved references.
- If markdown mirroring fails due to rate limits or bot protection:
  - save a raw HTML snapshot if possible
  - save the source URL manifest
  - write a curated summary using the official pages you successfully inspected
- Do not block the whole task on one failed mirror fetch if the research summary can still be completed from official sources.

## TOC extraction guidance

- Save top-level docs hubs first.
- Extract page and section titles from official docs navigation when possible.
- Keep TOC files short and navigable.
- Prefer absolute source URLs in saved notes.

## User-provided artifact handling

When the user drops content directly into chat:

- Save it verbatim unless they ask for cleanup.
- Use sequential files like `user-drop-001.md`, `user-drop-002.md`, and so on.

When the user provides logs:

- Save them as fixture files, for example `server-log-fixture-001.txt`.
- Preserve timestamps and formatting.

When the user provides screenshots or runtime values:

- Save a short `runtime-defaults.md` note.
- Capture base URLs, ports, toggles, and other concrete defaults shown in the image or text.

## Comparison-note guidance

When the target claims compatibility with another API or standard:

1. Save the product’s compatibility docs.
2. Save or cite the official upstream spec/reference pages.
3. Write a compact mapping:
   - product page
   - upstream spec page
   - endpoint or object
   - key supported behavior
   - notable extension, omission, or local constraint

Do not over-interpret unsupported details unless the official docs clearly state them.

## Communication pattern

Keep status updates short and operational.

- State that the task is research-and-save only.
- Say where the hidden research bundle will be written.
- Mention when raw official snapshots are being downloaded.
- Mention when curated notes are being written.
- Avoid long analysis in chat when the value belongs in saved research files.

## Safety rules

- Do not save research into normal source, plugin, deploy, or runtime asset folders by default.
- Do not modify application code or deployment manifests during research-only tasks.
- Do not assume relative dates; save exact dates in notes.
- Do not claim a version is latest unless you verified it from an official current source.

## Deliverable checklist

- Create the hidden research folder.
- Save at least one raw official source artifact.
- Save `SOURCE_URLS.md`.
- Save `RESEARCH_SUMMARY.md`.
- Save a concise index or TOC if the docs are navigation-heavy.
- Save user-provided snippets/logs/screenshots as fixtures when present.
- Report back with the absolute file paths of the important saved artifacts.

## Output style for the saved notes

- Use short sections.
- Prefer bullet lists for URLs, endpoints, and artifacts.
- Use exact version strings and exact dates.
- Keep speculation out of the summary.
- Separate “official source says” from “user runtime says”.
