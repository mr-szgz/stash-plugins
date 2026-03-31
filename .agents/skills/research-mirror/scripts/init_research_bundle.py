#!/usr/bin/env python3
"""
Initialize a dated research bundle for the research-mirror skill.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

from _bundle_utils import ensure_standard_bundle, normalize_topic_slug, validate_date_string


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create a standard .codex-research bundle skeleton.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/init_research_bundle.py openai-skills\n"
            "  python scripts/init_research_bundle.py \"OpenAI Skills\" --date 2026-03-31 --format json\n"
            "  python scripts/init_research_bundle.py openai-skills --root tmp/research\n"
        ),
    )
    parser.add_argument(
        "topic_slug",
        help="Topic name or slug for the research bundle. Values are normalized to kebab-case.",
    )
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
    parser.add_argument(
        "--format",
        choices={"json", "path"},
        default="json",
        help="Stdout format. Use json for agent workflows or path for simple shell piping. Default: json.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    topic_slug = normalize_topic_slug(args.topic_slug)
    bundle_date = validate_date_string(args.date)
    bundle_root, created_paths = ensure_standard_bundle(Path(args.root), topic_slug, bundle_date)

    if args.format == "path":
        print(bundle_root.resolve())
        return 0

    result = {
        "topic_input": args.topic_slug,
        "topic_slug": topic_slug,
        "bundle_date": bundle_date,
        "bundle_path": str(bundle_root.resolve()),
        "created": [str(path.resolve()) for path in created_paths],
        "created_count": len(created_paths),
    }
    json.dump(result, fp=sys.stdout, indent=2)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
