#!/usr/bin/env python3
"""
Resolve a research bundle path without hand-building topic/date directories.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

from _bundle_utils import ensure_standard_bundle, find_latest_bundle, normalize_topic_slug, validate_date_string


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Resolve the canonical path for a research bundle.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/resolve_research_bundle.py --topic stashapp-plugins --latest\n"
            "  python scripts/resolve_research_bundle.py --topic \"OpenAI Skills\" --date 2026-03-31 --ensure\n"
            "  python scripts/resolve_research_bundle.py --topic lmstudio --today --ensure\n"
        ),
    )
    parser.add_argument("--topic", required=True, help="Topic slug or name to resolve.")
    parser.add_argument("--root", default=".codex-research", help="Research root directory. Defaults to .codex-research.")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--date", help="Specific bundle date in YYYY-MM-DD format.")
    group.add_argument("--today", action="store_true", help="Use today's date for the bundle.")
    group.add_argument("--latest", action="store_true", help="Resolve the latest existing bundle. Default behavior.")
    parser.add_argument(
        "--ensure",
        action="store_true",
        help="Create a standard dated bundle when the target bundle does not already exist.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    root = Path(args.root)
    topic_slug = normalize_topic_slug(args.topic)

    if args.date:
        target_date = validate_date_string(args.date)
    elif args.today:
        target_date = date.today().isoformat()
    else:
        target_date = None

    created_paths: list[str] = []
    created = False

    if target_date:
        bundle_path = root / topic_slug / target_date
        existed = bundle_path.exists()
        if args.ensure and not existed:
            bundle_path, new_paths = ensure_standard_bundle(root, topic_slug, target_date)
            created_paths = [str(path.resolve()) for path in new_paths]
            created = bool(new_paths)
            existed = bundle_path.exists()
        result = {
            "topic_input": args.topic,
            "topic_slug": topic_slug,
            "bundle_date": target_date,
            "bundle_path": str(bundle_path.resolve()),
            "layout": "dated",
            "exists": existed,
            "created": created,
            "created_paths": created_paths,
        }
        if not existed and not args.ensure:
            result["error"] = "bundle not found"
            json.dump(result, sys.stdout, indent=2)
            sys.stdout.write("\n")
            return 3
        json.dump(result, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 0

    latest = find_latest_bundle(root, topic_slug)
    if latest is None and args.ensure:
        bundle_path, new_paths = ensure_standard_bundle(root, topic_slug, date.today().isoformat())
        latest = find_latest_bundle(root, topic_slug)
        created_paths = [str(path.resolve()) for path in new_paths]
        created = bool(new_paths)
        result = {
            "topic_input": args.topic,
            "topic_slug": topic_slug,
            "bundle_date": latest.bundle_date if latest else date.today().isoformat(),
            "bundle_path": str(bundle_path.resolve()),
            "layout": "dated",
            "exists": True,
            "created": created,
            "created_paths": created_paths,
        }
        json.dump(result, sys.stdout, indent=2)
        sys.stdout.write("\n")
        return 0

    if latest is None:
        json.dump(
            {
                "topic_input": args.topic,
                "topic_slug": topic_slug,
                "exists": False,
                "error": "no bundle found for topic",
            },
            sys.stdout,
            indent=2,
        )
        sys.stdout.write("\n")
        return 3

    json.dump(
        {
            "topic_input": args.topic,
            "topic_slug": topic_slug,
            "bundle_date": latest.bundle_date,
            "bundle_path": str(latest.bundle_path.resolve()),
            "layout": latest.layout,
            "exists": True,
            "created": False,
            "created_paths": [],
        },
        sys.stdout,
        indent=2,
    )
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
