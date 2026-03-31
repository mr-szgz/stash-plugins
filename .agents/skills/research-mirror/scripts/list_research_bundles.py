#!/usr/bin/env python3
"""
List research bundles under .codex-research in a deterministic format.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from _bundle_utils import iter_bundle_records, normalize_topic_slug


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="List research bundles under a .codex-research root.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/list_research_bundles.py\n"
            "  python scripts/list_research_bundles.py --topic stashapp-plugins\n"
            "  python scripts/list_research_bundles.py --latest-only --format table\n"
        ),
    )
    parser.add_argument(
        "--root",
        default=".codex-research",
        help="Research root directory. Defaults to .codex-research.",
    )
    parser.add_argument(
        "--topic",
        help="Optional topic slug or name filter.",
    )
    parser.add_argument(
        "--latest-only",
        action="store_true",
        help="Return only the latest record per topic, preferring dated bundles over legacy layouts.",
    )
    parser.add_argument(
        "--format",
        choices={"json", "table"},
        default="json",
        help="Stdout format. Default: json.",
    )
    return parser


def select_latest(records: list[dict[str, object]]) -> list[dict[str, object]]:
    latest: dict[str, dict[str, object]] = {}
    for record in records:
        topic = str(record["topic_slug"])
        previous = latest.get(topic)
        if previous is None:
            latest[topic] = record
            continue
        prev_date = previous.get("bundle_date")
        curr_date = record.get("bundle_date")
        if curr_date and (not prev_date or str(curr_date) > str(prev_date)):
            latest[topic] = record
    return sorted(latest.values(), key=lambda item: (str(item["topic_slug"]), str(item["bundle_date"] or "")))


def render_table(records: list[dict[str, object]]) -> str:
    lines = []
    header = "TOPIC\tDATE\tLAYOUT\tREFS\tFIXTURES\tPATH"
    lines.append(header)
    for record in records:
        lines.append(
            "\t".join(
                [
                    str(record["topic_slug"]),
                    str(record["bundle_date"] or "-"),
                    str(record["layout"]),
                    str(record["reference_count"]),
                    str(record["fixture_count"]),
                    str(record["bundle_path"]),
                ]
            )
        )
    return "\n".join(lines)


def main() -> int:
    args = build_parser().parse_args()
    root = Path(args.root)
    topic_filter = normalize_topic_slug(args.topic) if args.topic else None

    records = [record.to_dict() for record in iter_bundle_records(root)]
    if topic_filter:
        records = [record for record in records if record["topic_slug"] == topic_filter]
    if args.latest_only:
        records = select_latest(records)

    result = {
        "root": str(root.resolve()),
        "count": len(records),
        "bundles": records,
    }

    if args.format == "table":
        print(render_table(records))
    else:
        json.dump(result, sys.stdout, indent=2)
        sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
