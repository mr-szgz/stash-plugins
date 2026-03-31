#!/usr/bin/env python3
"""
Copy user artifacts into a bundle's fixtures directory with deterministic naming.
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path

from _bundle_utils import next_fixture_name


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Add a fixture file or text payload to a research bundle.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/add_research_fixture.py --bundle .codex-research/lmstudio/2026-03-31 --file notes.txt\n"
            "  python scripts/add_research_fixture.py --bundle .codex-research/lmstudio/2026-03-31 --text \"Server returned 401\" --label runtime-defaults\n"
            "  Get-Content trace.log | python scripts/add_research_fixture.py --bundle .codex-research/lmstudio/2026-03-31 --stdin --extension .log\n"
        ),
    )
    parser.add_argument("--bundle", required=True, help="Target research bundle directory.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--file", help="Source file to copy into fixtures/.")
    group.add_argument("--text", help="Literal text to save into a fixture file.")
    group.add_argument("--stdin", action="store_true", help="Read fixture content from stdin.")
    parser.add_argument("--label", help="Optional human-readable suffix for the fixture filename.")
    parser.add_argument(
        "--prefix",
        default="user-drop",
        help="Fixture filename prefix. Default: user-drop.",
    )
    parser.add_argument(
        "--extension",
        help="Optional explicit output extension, including the leading dot.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    bundle = Path(args.bundle)
    fixtures_dir = bundle / "fixtures"
    fixtures_dir.mkdir(parents=True, exist_ok=True)

    if args.file:
        source_path = Path(args.file)
        if not source_path.exists() or not source_path.is_file():
            raise SystemExit(f"Error: --file path does not exist or is not a file: {source_path}")
        suffix = args.extension or source_path.suffix or ".bin"
        destination_name = next_fixture_name(fixtures_dir, args.prefix, suffix, args.label)
        destination = fixtures_dir / destination_name
        shutil.copyfile(source_path, destination)
        size_bytes = destination.stat().st_size
        source = str(source_path.resolve())
    else:
        content = sys.stdin.read() if args.stdin else args.text or ""
        suffix = args.extension or ".md"
        destination_name = next_fixture_name(fixtures_dir, args.prefix, suffix, args.label)
        destination = fixtures_dir / destination_name
        destination.write_text(content, encoding="utf-8")
        size_bytes = destination.stat().st_size
        source = "stdin" if args.stdin else "literal-text"

    json.dump(
        {
            "bundle_path": str(bundle.resolve()),
            "fixture_path": str(destination.resolve()),
            "prefix": args.prefix,
            "label": args.label,
            "source": source,
            "size_bytes": size_bytes,
        },
        sys.stdout,
        indent=2,
    )
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
