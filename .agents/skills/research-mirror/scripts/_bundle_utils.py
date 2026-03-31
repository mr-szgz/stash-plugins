from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


@dataclass
class BundleRecord:
    topic_slug: str
    bundle_date: str | None
    bundle_path: Path
    layout: str

    @property
    def references_dir(self) -> Path:
        return self.bundle_path / "references"

    @property
    def fixtures_dir(self) -> Path:
        return self.bundle_path / "fixtures"

    @property
    def reference_count(self) -> int:
        if not self.references_dir.exists():
            return 0
        return sum(1 for path in self.references_dir.rglob("*") if path.is_file())

    @property
    def fixture_count(self) -> int:
        if not self.fixtures_dir.exists():
            return 0
        return sum(1 for path in self.fixtures_dir.rglob("*") if path.is_file())

    @property
    def has_standard_files(self) -> bool:
        required = [
            "README.md",
            "SOURCE_URLS.md",
            "RESEARCH_SUMMARY.md",
            "REFERENCE_INDEX.md",
        ]
        return all((self.bundle_path / name).exists() for name in required)

    def to_dict(self) -> dict[str, object]:
        return {
            "topic_slug": self.topic_slug,
            "bundle_date": self.bundle_date,
            "bundle_path": str(self.bundle_path.resolve()),
            "layout": self.layout,
            "reference_count": self.reference_count,
            "fixture_count": self.fixture_count,
            "has_standard_files": self.has_standard_files,
        }


def normalize_topic_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    if not slug:
        raise ValueError("topic slug resolved to an empty value")
    return slug


def validate_date_string(value: str) -> str:
    if not DATE_RE.match(value):
        raise ValueError(f"date must be in YYYY-MM-DD format. Received: {value!r}")
    date.fromisoformat(value)
    return value


def iter_bundle_records(root: Path) -> list[BundleRecord]:
    records: list[BundleRecord] = []
    if not root.exists():
        return records

    for topic_dir in sorted(path for path in root.iterdir() if path.is_dir()):
        dated_children = [
            child for child in topic_dir.iterdir() if child.is_dir() and DATE_RE.match(child.name)
        ]
        for bundle_dir in sorted(dated_children, key=lambda item: item.name):
            records.append(
                BundleRecord(
                    topic_slug=topic_dir.name,
                    bundle_date=bundle_dir.name,
                    bundle_path=bundle_dir,
                    layout="dated",
                )
            )

        has_legacy_content = any(
            not (child.is_dir() and DATE_RE.match(child.name)) for child in topic_dir.iterdir()
        )
        if has_legacy_content:
            records.append(
                BundleRecord(
                    topic_slug=topic_dir.name,
                    bundle_date=None,
                    bundle_path=topic_dir,
                    layout="legacy",
                )
            )
    return records


def find_latest_bundle(root: Path, topic_slug: str) -> BundleRecord | None:
    candidates = [record for record in iter_bundle_records(root) if record.topic_slug == topic_slug]
    dated = [record for record in candidates if record.bundle_date]
    if dated:
        return max(dated, key=lambda record: record.bundle_date or "")
    return candidates[0] if candidates else None


def standard_bundle_content(topic_slug: str, bundle_date: str) -> dict[str, str]:
    return {
        "README.md": "\n".join(
            [
                f"# {topic_slug}",
                "",
                f"- Topic: `{topic_slug}`",
                f"- Capture Date: `{bundle_date}`",
                "- Scope: TODO",
                "",
            ]
        ),
        "SOURCE_URLS.md": "\n".join(
            [
                "# Source URLs",
                "",
                "- TODO: add every official URL used in this bundle",
                "",
            ]
        ),
        "RESEARCH_SUMMARY.md": "\n".join(
            [
                "# Research Summary",
                "",
                f"- Research Date: `{bundle_date}`",
                "- Official Version: TODO",
                "- Key Findings:",
                "  - TODO",
                "- Compatibility Notes:",
                "  - TODO",
                "",
            ]
        ),
        "REFERENCE_INDEX.md": "\n".join(
            [
                "# Reference Index",
                "",
                "- `README.md`: bundle scope",
                "- `SOURCE_URLS.md`: verified sources",
                "- `RESEARCH_SUMMARY.md`: findings and version notes",
                "- `fixtures/`: user-provided artifacts",
                "- `references/`: mirrored markdown references by domain",
                "",
            ]
        ),
    }


def ensure_standard_bundle(root: Path, topic_slug: str, bundle_date: str) -> tuple[Path, list[Path]]:
    normalized_topic = normalize_topic_slug(topic_slug)
    normalized_date = validate_date_string(bundle_date)
    bundle_root = root / normalized_topic / normalized_date
    created_paths: list[Path] = []

    for directory in (bundle_root, bundle_root / "references", bundle_root / "fixtures"):
        if not directory.exists():
            directory.mkdir(parents=True, exist_ok=True)
            created_paths.append(directory)

    for name, content in standard_bundle_content(normalized_topic, normalized_date).items():
        path = bundle_root / name
        if not path.exists():
            path.write_text(content, encoding="utf-8")
            created_paths.append(path)

    return bundle_root, created_paths


def next_fixture_name(fixtures_dir: Path, prefix: str, suffix: str, label: str | None = None) -> str:
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d+)(?:-[A-Za-z0-9._-]+)?{re.escape(suffix)}$")
    highest = 0
    if fixtures_dir.exists():
        for path in fixtures_dir.iterdir():
            if not path.is_file():
                continue
            match = pattern.match(path.name)
            if match:
                highest = max(highest, int(match.group(1)))
    sequence = highest + 1
    name = f"{prefix}-{sequence:03d}"
    if label:
        sanitized = re.sub(r"[^A-Za-z0-9._-]+", "-", label.strip()).strip(".-")
        if sanitized:
            name = f"{name}-{sanitized}"
    return f"{name}{suffix}"
