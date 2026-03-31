#!/usr/bin/env python3
"""
Regenerate bundle indexes from references/ and fixtures/.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


META_RE = re.compile(r"^(source|final_url|content_type):\s*(.+?)\s*$")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Sync SOURCE_URLS.md and REFERENCE_INDEX.md from an existing research bundle.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/sync_research_bundle.py --bundle .codex-research/openai-skills/2026-03-31\n"
            "  python scripts/sync_research_bundle.py --bundle .codex-research/openai-skills/2026-03-31 --dry-run\n"
        ),
    )
    parser.add_argument("--bundle", required=True, help="Target research bundle directory.")
    parser.add_argument("--dry-run", action="store_true", help="Report planned content without writing files.")
    return parser


def read_mirror_metadata(path: Path) -> dict[str, str]:
    metadata: dict[str, str] = {}
    with path.open("r", encoding="utf-8", errors="replace") as handle:
        for _ in range(12):
            line = handle.readline()
            if not line:
                break
            match = META_RE.match(line.strip())
            if match:
                metadata[match.group(1)] = match.group(2)
    return metadata


def collect_reference_entries(bundle: Path) -> list[dict[str, str]]:
    references_dir = bundle / "references"
    entries: list[dict[str, str]] = []
    if not references_dir.exists():
        return entries
    for path in sorted(references_dir.rglob("*.md")):
        metadata = read_mirror_metadata(path)
        relative_path = path.relative_to(bundle).as_posix()
        final_url = metadata.get("final_url", "")
        source_url = metadata.get("source", final_url)
        domain = path.relative_to(references_dir).parts[0] if path.relative_to(references_dir).parts else "unknown"
        entries.append(
            {
                "path": relative_path,
                "domain": domain,
                "source_url": source_url,
                "final_url": final_url,
                "content_type": metadata.get("content_type", ""),
            }
        )
    return entries


def collect_fixture_entries(bundle: Path) -> list[str]:
    fixtures_dir = bundle / "fixtures"
    if not fixtures_dir.exists():
        return []
    return [path.relative_to(bundle).as_posix() for path in sorted(fixtures_dir.rglob("*")) if path.is_file()]


def build_source_urls_content(bundle: Path, entries: list[dict[str, str]]) -> str:
    lines = [
        "# Source URLs",
        "",
        f"- Bundle: `{bundle.name}`",
        f"- Generated: `{datetime.now(timezone.utc).isoformat()}`",
        f"- Mirrored References: `{len(entries)}`",
        "",
    ]
    if not entries:
        lines.extend(["- TODO: add every official URL used in this bundle", ""])
        return "\n".join(lines)

    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for entry in entries:
        grouped[entry["domain"]].append(entry)

    for domain in sorted(grouped):
        lines.append(f"## {domain}")
        lines.append("")
        for entry in grouped[domain]:
            url = entry["final_url"] or entry["source_url"]
            lines.append(f"- `{url}` -> `{entry['path']}`")
        lines.append("")
    return "\n".join(lines)


def build_reference_index_content(bundle: Path, entries: list[dict[str, str]], fixtures: list[str]) -> str:
    lines = [
        "# Reference Index",
        "",
        f"- Bundle Path: `{bundle.resolve()}`",
        f"- Mirrored References: `{len(entries)}`",
        f"- Fixtures: `{len(fixtures)}`",
        "",
        "- `README.md`: bundle scope",
        "- `SOURCE_URLS.md`: verified sources",
        "- `RESEARCH_SUMMARY.md`: findings and version notes",
        "- `fixtures/`: user-provided artifacts",
        "- `references/`: mirrored markdown references by domain",
        "",
    ]

    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    for entry in entries:
        grouped[entry["domain"]].append(entry)

    lines.append("## References")
    lines.append("")
    if not entries:
        lines.append("- No mirrored references found.")
        lines.append("")
    else:
        for domain in sorted(grouped):
            lines.append(f"### {domain}")
            lines.append("")
            for entry in grouped[domain]:
                url = entry["final_url"] or entry["source_url"]
                lines.append(f"- `{entry['path']}`: `{url}`")
            lines.append("")

    lines.append("## Fixtures")
    lines.append("")
    if not fixtures:
        lines.append("- No fixtures saved.")
        lines.append("")
    else:
        for fixture in fixtures:
            lines.append(f"- `{fixture}`")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    args = build_parser().parse_args()
    bundle = Path(args.bundle)
    if not bundle.exists() or not bundle.is_dir():
        raise SystemExit(f"Error: --bundle must point to an existing directory. Received: {bundle}")

    references = collect_reference_entries(bundle)
    fixtures = collect_fixture_entries(bundle)
    source_urls_path = bundle / "SOURCE_URLS.md"
    reference_index_path = bundle / "REFERENCE_INDEX.md"
    source_urls_content = build_source_urls_content(bundle, references)
    reference_index_content = build_reference_index_content(bundle, references, fixtures)

    if not args.dry_run:
        source_urls_path.write_text(source_urls_content + "\n", encoding="utf-8")
        reference_index_path.write_text(reference_index_content + "\n", encoding="utf-8")

    json.dump(
        {
            "bundle_path": str(bundle.resolve()),
            "reference_count": len(references),
            "fixture_count": len(fixtures),
            "source_urls_path": str(source_urls_path.resolve()),
            "reference_index_path": str(reference_index_path.resolve()),
            "status": "planned" if args.dry_run else "written",
        },
        sys.stdout,
        indent=2,
    )
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
