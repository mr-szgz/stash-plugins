LM Studio research snapshot saved on 2026-03-31.

Purpose:
- Keep LM Studio web research inside this plugin workspace without mixing it into normal plugin payloads.
- Use a hidden `.codex-research` path so deploy tooling is less likely to treat these files as runtime plugin assets.

Contents:
- `REFERENCE_INDEX.md`: current hub URLs, install URLs, and saved artifact list.
- `APP_TOC.md`: current app-docs table of contents snapshot.
- `DEVELOPER_TOC.md`: current developer-docs table of contents snapshot.
- `llms.txt` and `llms-full.txt`: raw official machine-readable snapshots from `lmstudio.ai`.
- `docs-*.html`, `download.html`, `changelog.html`: raw official page snapshots.
