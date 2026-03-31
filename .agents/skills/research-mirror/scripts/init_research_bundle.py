#!/usr/bin/env python3
"""
Initialize a dated research bundle for the research-mirror skill.

Usage:
    python scripts/init_research_bundle.py <topic-slug> [--date YYYY-MM-DD] [--root PATH]
"""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create a standard .codex-research bundle skeleton.",
    )
    parser.add_argument("topic_slug", help="Kebab-case topic slug for the research bundle.")
    parser.add_argument(
        "--date",
        default=date.today().isoformat(),
        help="Bundle date in YYYY-MM-DD format. Defaults to today.",
    )
    parser.add_argument(
        "--root",
        default=".codex-research",
        help="Research root directory. Defaults to .codex-research.",
    )
    return parser


def write_if_missing(path: Path, content: str) -> None:
    if not path.exists():
        path.write_text(content, encoding="utf-8")


def main() -> int:
    args = build_parser().parse_args()

    bundle_root = Path(args.root) / args.topic_slug / args.date
    raw_dir = bundle_root / "raw"
    fixtures_dir = bundle_root / "fixtures"

    raw_dir.mkdir(parents=True, exist_ok=True)
    fixtures_dir.mkdir(parents=True, exist_ok=True)

    write_if_missing(
        bundle_root / "README.md",
        "\n".join(
            [
                f"# {args.topic_slug}",
                "",
                f"- Topic: `{args.topic_slug}`",
                f"- Capture Date: `{args.date}`",
                "- Scope: TODO",
                "",
            ]
        ),
    )
    write_if_missing(
        bundle_root / "SOURCE_URLS.md",
        "\n".join(
            [
                "# Source URLs",
                "",
                "- TODO: add every official URL used in this bundle",
                "",
            ]
        ),
    )
    write_if_missing(
        bundle_root / "RESEARCH_SUMMARY.md",
        "\n".join(
            [
                "# Research Summary",
                "",
                f"- Research Date: `{args.date}`",
                "- Official Version: TODO",
                "- Key Findings:",
                "  - TODO",
                "- Compatibility Notes:",
                "  - TODO",
                "",
            ]
        ),
    )
    write_if_missing(
        bundle_root / "REFERENCE_INDEX.md",
        "\n".join(
            [
                "# Reference Index",
                "",
                "- `README.md`: bundle scope",
                "- `SOURCE_URLS.md`: verified sources",
                "- `RESEARCH_SUMMARY.md`: findings and version notes",
                "- `fixtures/`: user-provided artifacts",
                "- `raw/`: mirrored source material",
                "",
            ]
        ),
    )

    print(bundle_root.resolve())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
