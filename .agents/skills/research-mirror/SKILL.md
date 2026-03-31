---
name: research-mirror
description: Research and mirror official documentation, API references, specifications, changelogs, and release notes into repo-local hidden bundles for Stash plugin work. Use when Codex needs current official docs, version compatibility analysis, preserved research snapshots, source manifests, or to turn saved research into a reusable documentation skill.
---

# Research Mirror

Capture authoritative external documentation into `.codex-research/` without touching plugin deployment files.

Use bundled resources selectively:

- Run `scripts/init_research_bundle.py` to create the standard research bundle skeleton.
- Load `references/documentation-skill-template.md` when turning a research bundle into a reusable documentation skill.
- Use `agents/openai.yaml` for Codex UI metadata only; do not treat it as workflow documentation.

## Core Rules

- Prefer official vendor documentation, API references, changelogs, standards bodies, and official repositories in that order.
- Store research in `.codex-research/<topic-slug>/<YYYY-MM-DD>/`.
- Preserve user-provided artifacts exactly under `fixtures/`.
- Never overwrite an existing research bundle unless the user explicitly asks to refresh it.
- Keep "official source says" separate from "user runtime shows".

## Standard Layout

```text
.codex-research/<topic-slug>/<YYYY-MM-DD>/
|- README.md
|- SOURCE_URLS.md
|- RESEARCH_SUMMARY.md
|- REFERENCE_INDEX.md
|- fixtures/
`- raw/<domain>/
```

## Workflow

### 1. Scope the Research

- Extract the topic from the user request.
- If the user asks for "latest" or "current", verify the exact version from official sources before writing anything.
- Pick a stable slug and date-stamped output folder.
- Prefer bootstrapping the folder with `python scripts/init_research_bundle.py <topic-slug>` from this skill directory rather than hand-creating the files.

### 2. Discover Sources

Use this priority order:

1. Official vendor documentation
2. Official API reference
3. Official changelog or release notes
4. Official repository documentation
5. Standards body specifications
6. User-provided artifacts

### 3. Mirror Raw Sources

Save mirrored material under `raw/<domain>/` with descriptive filenames such as:

- `raw/<domain>/page.md`
- `raw/<domain>/api.md`
- `raw/<domain>/changelog.md`

Store user-provided files as numbered fixtures such as `fixtures/user-drop-001.md`.

### 4. Produce Curated Outputs

Always generate these files:

- `README.md`: bundle purpose and scope
- `SOURCE_URLS.md`: every official URL used
- `RESEARCH_SUMMARY.md`: key findings, versions, dates, and compatibility notes
- `REFERENCE_INDEX.md`: navigation hub for mirrored content

## Output Standards

### Research Summary

Include:

- Tool or platform name with exact version when available
- Research date in `YYYY-MM-DD`
- Official sources used
- Key capabilities from official documentation
- Compatibility notes, version constraints, and breaking changes
- User context only when it is clearly labeled as runtime-specific

### Communication

- State the scope before capturing sources.
- Report the storage path early.
- Confirm official sources before mirroring when the request is ambiguous.
- Return the created file paths at the end.

## Safety

- Use `.codex-research/` only for research artifacts.
- Do not modify plugin source, deployment files, or manifests during research-only work.
- Do not infer version currency without verification.
- Do not collapse multiple version snapshots into one folder.

## Documentation Skill Generation

When the user asks to turn research into a reusable documentation skill:

1. Read `SOURCE_URLS.md`, `RESEARCH_SUMMARY.md`, `REFERENCE_INDEX.md`, and the needed `raw/` files.
2. Load `references/documentation-skill-template.md` in this skill folder as the starting structure.
3. Extract the practical, high-value material into a self-contained `SKILL.md`.
4. Focus on setup, core APIs, examples, version information, and common workflows.
5. Keep the generated skill usable without requiring fresh external research.

## Quality Gates

- At least one official source was captured.
- `SOURCE_URLS.md` includes every verified URL used.
- `RESEARCH_SUMMARY.md` records exact versions and dates when they were available.
- User artifacts are preserved under `fixtures/`.
- Research stays isolated from plugin runtime and deployment files.
