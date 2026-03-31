#!/usr/bin/env python3
"""
Mirror official research sources into a dated .codex-research bundle.

The script is intentionally stdlib-only so the skill can recommend it without
an install step.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urldefrag, urlparse
from urllib.request import Request, urlopen

USER_AGENT = "research-mirror/1.0"
DEFAULT_ACCEPT = "text/markdown,text/plain,text/html;q=0.9,*/*;q=0.5"


@dataclass
class FetchResponse:
    url: str
    final_url: str
    status: int
    content_type: str
    charset: str | None
    body: bytes


class HtmlToMarkdown(HTMLParser):
    BLOCK_TAGS = {"article", "blockquote", "div", "main", "p", "section"}
    SKIP_TAGS = {"aside", "footer", "nav", "noscript", "script", "style", "svg"}

    def __init__(self, base_url: str) -> None:
        super().__init__(convert_charrefs=True)
        self.base_url = base_url
        self.parts: list[str] = []
        self.link_href: str | None = None
        self.link_text: list[str] = []
        self.list_stack: list[dict[str, int | bool]] = []
        self.skip_depth = 0
        self.in_pre = False
        self.pre_parts: list[str] = []
        self.in_inline_code = False
        self.title = ""
        self.in_title = False

    def append_text(self, text: str) -> None:
        if not text:
            return
        cleaned = re.sub(r"\s+", " ", text)
        if not cleaned.strip():
            return
        target = self.link_text if self.link_href else self.parts
        if target and target[-1] and not target[-1].endswith((" ", "\n", "(", "[", "`")):
            cleaned = " " + cleaned
        target.append(cleaned)

    def ensure_blank_line(self) -> None:
        if not self.parts:
            return
        combined = "".join(self.parts)
        if combined.endswith("\n\n"):
            return
        if combined.endswith("\n"):
            self.parts.append("\n")
        else:
            self.parts.append("\n\n")

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
            return
        if self.skip_depth:
            return
        attr_map = dict(attrs)
        if tag == "title":
            self.in_title = True
            return
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.ensure_blank_line()
            self.parts.append("#" * int(tag[1]) + " ")
            return
        if tag in self.BLOCK_TAGS:
            self.ensure_blank_line()
            if tag == "blockquote":
                self.parts.append("> ")
            return
        if tag in {"ul", "ol"}:
            self.ensure_blank_line()
            self.list_stack.append({"ordered": tag == "ol", "index": 0})
            return
        if tag == "li":
            self.ensure_blank_line()
            depth = max(len(self.list_stack) - 1, 0)
            prefix = "  " * depth
            if self.list_stack and self.list_stack[-1]["ordered"]:
                self.list_stack[-1]["index"] = int(self.list_stack[-1]["index"]) + 1
                bullet = f"{self.list_stack[-1]['index']}. "
            else:
                bullet = "- "
            self.parts.append(prefix + bullet)
            return
        if tag == "br":
            self.parts.append("\n")
            return
        if tag == "pre":
            self.ensure_blank_line()
            self.in_pre = True
            self.pre_parts = []
            return
        if tag == "code":
            if self.in_pre:
                return
            self.in_inline_code = True
            self.parts.append("`")
            return
        if tag == "a":
            href = attr_map.get("href")
            self.link_href = urljoin(self.base_url, href) if href else None
            self.link_text = []

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS:
            if self.skip_depth:
                self.skip_depth -= 1
            return
        if self.skip_depth:
            return
        if tag == "title":
            self.in_title = False
            return
        if tag in {"h1", "h2", "h3", "h4", "h5", "h6"}:
            self.ensure_blank_line()
            return
        if tag in self.BLOCK_TAGS:
            self.ensure_blank_line()
            return
        if tag in {"ul", "ol"}:
            if self.list_stack:
                self.list_stack.pop()
            self.ensure_blank_line()
            return
        if tag == "pre":
            code = "".join(self.pre_parts).rstrip()
            if code:
                self.parts.append("```\n" + code + "\n```\n")
            self.in_pre = False
            self.pre_parts = []
            self.ensure_blank_line()
            return
        if tag == "code" and self.in_inline_code:
            self.parts.append("`")
            self.in_inline_code = False
            return
        if tag == "a":
            text = "".join(self.link_text).strip() or (self.link_href or "")
            if self.link_href:
                self.parts.append(f"[{text}]({self.link_href})")
            elif text:
                self.parts.append(text)
            self.link_href = None
            self.link_text = []

    def handle_data(self, data: str) -> None:
        if self.skip_depth or not data:
            return
        if self.in_title:
            self.title += data
            return
        if self.in_pre:
            self.pre_parts.append(data)
            return
        self.append_text(data)

    def get_markdown(self) -> str:
        body = "".join(self.parts)
        body = re.sub(r"\n{3,}", "\n\n", body)
        return body.strip()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description=(
            "Mirror official documentation pages into a .codex-research bundle. "
            "The script checks each domain for /llms.txt and mirrors discovered pages."
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/mirror_research_sources.py --bundle .codex-research/openai-skills/2026-03-31 "
            "--url https://developers.openai.com/codex/skills\n"
            "  python scripts/mirror_research_sources.py --bundle .codex-research/openai-skills/2026-03-31 "
            "--domain agentskills.io\n"
            "  python scripts/mirror_research_sources.py --bundle .codex-research/openai-skills/2026-03-31 "
            "--url https://developers.openai.com/codex/skills --llms-limit 5 --max-pages 12\n\n"
            "Exit codes:\n"
            "  0  Success.\n"
            "  2  Invalid arguments.\n"
            "  3  No pages were mirrored.\n"
        ),
    )
    parser.add_argument(
        "--bundle",
        required=True,
        help="Existing .codex-research bundle path created by init_research_bundle.py.",
    )
    parser.add_argument(
        "--url",
        action="append",
        default=[],
        help="Official documentation page URL to mirror. Repeat for multiple pages.",
    )
    parser.add_argument(
        "--domain",
        action="append",
        default=[],
        help="Official docs domain or site root to inspect. Repeat for multiple domains.",
    )
    parser.add_argument(
        "--llms-limit",
        type=int,
        default=10,
        help="Maximum number of pages to mirror from each llms.txt file. Use 0 for no limit. Default: 10.",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=25,
        help="Maximum total number of mirrored pages, excluding llms.txt files. Default: 25.",
    )
    parser.add_argument(
        "--skip-llms",
        action="store_true",
        help="Do not check /llms.txt for the provided domains.",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="Overwrite existing mirrored files instead of skipping them.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Resolve and report pages without writing files.",
    )
    return parser


def unique(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for value in values:
        if value in seen:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def normalize_input_url(value: str) -> str:
    candidate = value.strip()
    if not candidate:
        raise ValueError("empty input")
    if "://" not in candidate:
        candidate = "https://" + candidate
    parsed = urlparse(candidate)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError(f"expected a domain or absolute URL, received {value!r}")
    clean = parsed._replace(fragment="")
    if clean.path in {"", "/"}:
        return f"{clean.scheme}://{clean.netloc}/"
    return clean.geturl()


def fetch_text(url: str) -> FetchResponse:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": DEFAULT_ACCEPT})
    with urlopen(request, timeout=30) as response:
        content_type_header = response.headers.get("Content-Type", "application/octet-stream")
        content_type = content_type_header.split(";")[0].strip().lower()
        charset = response.headers.get_content_charset()
        body = response.read()
        return FetchResponse(
            url=url,
            final_url=response.geturl(),
            status=getattr(response, "status", 200),
            content_type=content_type,
            charset=charset,
            body=body,
        )


def decode_body(body: bytes, charset: str | None) -> str:
    encodings = [charset, "utf-8", "utf-16", "latin-1"]
    for encoding in encodings:
        if not encoding:
            continue
        try:
            return body.decode(encoding)
        except UnicodeDecodeError:
            continue
    return body.decode("utf-8", errors="replace")


def extract_markdown_links(text: str, base_url: str, allowed_domain: str) -> list[str]:
    urls: list[str] = []
    patterns = [
        re.compile(r"\[[^\]]+\]\(([^)]+)\)"),
        re.compile(r"(?<!\()https?://[^\s)>]+"),
    ]
    for pattern in patterns:
        for match in pattern.finditer(text):
            candidate = match.group(1) if match.lastindex else match.group(0)
            resolved = urljoin(base_url, candidate.strip())
            resolved, _ = urldefrag(resolved)
            parsed = urlparse(resolved)
            if parsed.scheme not in {"http", "https"}:
                continue
            if parsed.netloc != allowed_domain:
                continue
            urls.append(resolved)
    return unique(urls)


def sanitize_segment(value: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", value.strip())
    cleaned = cleaned.strip(".-")
    return cleaned or "index"


def build_output_path(bundle: Path, url: str) -> Path:
    parsed = urlparse(url)
    domain = sanitize_segment(parsed.netloc)
    relative = parsed.path.strip("/")
    query = parsed.query
    if not relative:
        stem = "index"
        directory_segments: list[str] = []
    else:
        segments = [sanitize_segment(part) for part in relative.split("/") if part]
        filename = segments[-1]
        stem = sanitize_segment(Path(filename).stem if "." in filename else filename)
        directory_segments = segments[:-1]
        if parsed.path.endswith("/"):
            directory_segments = segments
            stem = "index"
    if query:
        suffix = hashlib.sha1(query.encode("utf-8")).hexdigest()[:8]
        stem = f"{stem}--{suffix}"
    destination = bundle / "references" / domain
    if directory_segments:
        destination = destination.joinpath(*directory_segments)
    return destination / f"{stem}.md"


def render_markdown(response: FetchResponse) -> str:
    text = decode_body(response.body, response.charset)
    metadata = (
        "<!--\n"
        f"source: {response.url}\n"
        f"retrieved: {datetime.now(timezone.utc).isoformat()}\n"
        f"final_url: {response.final_url}\n"
        f"content_type: {response.content_type}\n"
        "-->\n\n"
    )
    if response.content_type in {"text/markdown", "text/plain", "text/x-markdown"}:
        return metadata + text.strip() + "\n"
    if response.content_type == "text/html":
        parser = HtmlToMarkdown(response.final_url)
        parser.feed(text)
        body = parser.get_markdown()
        if parser.title.strip() and not body.startswith("# "):
            body = f"# {parser.title.strip()}\n\n{body}" if body else f"# {parser.title.strip()}"
        return metadata + body.strip() + "\n"
    raise ValueError(
        f"unsupported content type {response.content_type!r} for {response.url}. "
        "Expected text/plain, text/markdown, or text/html."
    )


def save_markdown(path: Path, content: str, refresh: bool, dry_run: bool) -> str:
    if path.exists() and not refresh:
        return "skipped"
    if dry_run:
        return "planned"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return "written"


def domain_root_url(value: str) -> str:
    normalized = normalize_input_url(value)
    parsed = urlparse(normalized)
    return f"{parsed.scheme}://{parsed.netloc}/"


def llms_url_for(root_url: str) -> str:
    return urljoin(root_url, "/llms.txt")


def mirror_one(
    bundle: Path,
    url: str,
    origin: str,
    refresh: bool,
    dry_run: bool,
) -> dict[str, object]:
    response = fetch_text(url)
    content = render_markdown(response)
    output_path = build_output_path(bundle, response.final_url)
    status = save_markdown(output_path, content, refresh=refresh, dry_run=dry_run)
    return {
        "url": response.url,
        "final_url": response.final_url,
        "content_type": response.content_type,
        "origin": origin,
        "saved_to": str(output_path),
        "status": status,
    }


def main() -> int:
    args = build_parser().parse_args()
    if not args.url and not args.domain:
        raise SystemExit("Error: provide at least one --url or --domain.")
    if args.llms_limit < 0:
        raise SystemExit(f"Error: --llms-limit must be >= 0. Received: {args.llms_limit}.")
    if args.max_pages <= 0:
        raise SystemExit(f"Error: --max-pages must be > 0. Received: {args.max_pages}.")

    bundle = Path(args.bundle)
    if not bundle.exists():
        raise SystemExit(
            f"Error: bundle path does not exist: {bundle}. Run scripts/init_research_bundle.py first."
        )
    if not bundle.is_dir():
        raise SystemExit(f"Error: --bundle must point to a directory. Received: {bundle}.")

    bundle.joinpath("references").mkdir(parents=True, exist_ok=True)
    requested_urls = unique(normalize_input_url(url) for url in args.url)
    domain_roots = unique(domain_root_url(domain) for domain in args.domain)

    mirror_queue: list[tuple[str, str]] = [(url, "requested-url") for url in requested_urls]
    if not requested_urls:
        mirror_queue.extend((root, "requested-domain-root") for root in domain_roots)

    llms_results: list[dict[str, object]] = []
    errors: list[dict[str, str]] = []

    if not args.skip_llms:
        domains_to_check = unique([domain_root_url(url) for url in requested_urls] + domain_roots)
        for root_url in domains_to_check:
            llms_url = llms_url_for(root_url)
            try:
                print(f"Checking {llms_url}", file=sys.stderr)
                llms_response = fetch_text(llms_url)
                llms_text = decode_body(llms_response.body, llms_response.charset)
                llms_output = build_output_path(bundle, llms_response.final_url)
                llms_status = save_markdown(
                    llms_output,
                    render_markdown(llms_response),
                    refresh=args.refresh,
                    dry_run=args.dry_run,
                )
                domain = urlparse(llms_response.final_url).netloc
                discovered_urls = extract_markdown_links(
                    llms_text,
                    base_url=llms_response.final_url,
                    allowed_domain=domain,
                )
                if args.llms_limit:
                    discovered_urls = discovered_urls[: args.llms_limit]
                for discovered_url in discovered_urls:
                    mirror_queue.append((discovered_url, "llms.txt"))
                llms_results.append(
                    {
                        "domain": domain,
                        "llms_url": llms_response.final_url,
                        "saved_to": str(llms_output),
                        "status": llms_status,
                        "discovered_urls": discovered_urls,
                    }
                )
            except HTTPError as exc:
                errors.append({"url": llms_url, "error": f"HTTP {exc.code}: {exc.reason}"})
            except URLError as exc:
                errors.append({"url": llms_url, "error": str(exc.reason)})
            except Exception as exc:  # pragma: no cover - defensive CLI path
                errors.append({"url": llms_url, "error": str(exc)})

    mirror_results: list[dict[str, object]] = []
    seen_urls: set[str] = set()
    page_limit = args.max_pages

    for url, origin in mirror_queue:
        if url in seen_urls:
            continue
        seen_urls.add(url)
        if page_limit <= 0:
            break
        try:
            print(f"Mirroring {url}", file=sys.stderr)
            mirror_results.append(
                mirror_one(
                    bundle=bundle,
                    url=url,
                    origin=origin,
                    refresh=args.refresh,
                    dry_run=args.dry_run,
                )
            )
            page_limit -= 1
        except HTTPError as exc:
            errors.append({"url": url, "error": f"HTTP {exc.code}: {exc.reason}"})
        except URLError as exc:
            errors.append({"url": url, "error": str(exc.reason)})
        except Exception as exc:  # pragma: no cover - defensive CLI path
            errors.append({"url": url, "error": str(exc)})

    result = {
        "bundle": str(bundle.resolve()),
        "requested_urls": requested_urls,
        "requested_domains": domain_roots,
        "llms": llms_results,
        "mirrors": mirror_results,
        "errors": errors,
    }
    json.dump(result, sys.stdout, indent=2)
    sys.stdout.write("\n")
    if not mirror_results and not llms_results:
        return 3
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
