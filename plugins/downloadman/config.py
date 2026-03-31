from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


PLUGIN_ID = "downloadman"
PLUGIN_NAME = "Downloadman"
DEFAULT_CACHE_SIZE_MB = 500.0


def _pick(mapping: Mapping[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in mapping:
            return mapping[key]
    return default


def _parse_int(value: Any, default: int) -> int:
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return default


def _parse_float(value: Any, default: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def normalize_plugins_config(raw_plugins: Any) -> dict[str, Any]:
    if not raw_plugins:
        return {}
    if isinstance(raw_plugins, str):
        try:
            parsed = json.loads(raw_plugins)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return raw_plugins if isinstance(raw_plugins, dict) else {}


@dataclass(slots=True)
class SessionCookie:
    name: str = "session"
    value: str = ""

    @property
    def header_value(self) -> str:
        return f"{self.name}={self.value}" if self.value else ""


@dataclass(slots=True)
class ServerConnection:
    scheme: str = "http"
    host: str = "127.0.0.1"
    port: int = 9999
    config_dir: Path | None = None
    plugin_dir: Path | None = None
    session_cookie: SessionCookie | None = None

    @property
    def graphql_url(self) -> str:
        return f"{self.scheme}://{self.host}:{self.port}/graphql"


@dataclass(slots=True)
class PluginRequest:
    server_connection: ServerConnection
    args: dict[str, Any]
    raw_payload: dict[str, Any]


@dataclass(slots=True)
class PluginSettings:
    cache_size_mb: float = DEFAULT_CACHE_SIZE_MB
    path_mappings: Any = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "cacheSizeMB": self.cache_size_mb,
            "pathMappings": self.path_mappings,
        }


@dataclass(slots=True)
class PathMapping:
    orig: str
    local: str
    local_exists: bool

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _plugin_dir_fallback() -> Path:
    return Path(__file__).resolve().parent


def read_plugin_request(stdin_text: str | None = None) -> PluginRequest:
    raw_text = sys.stdin.read() if stdin_text is None else stdin_text
    payload: dict[str, Any] = {}

    if raw_text and raw_text.strip():
        parsed = json.loads(raw_text)
        if isinstance(parsed, dict):
            payload = parsed

    connection_payload = payload.get("server_connection") or {}
    if not isinstance(connection_payload, dict):
        connection_payload = {}

    session_cookie_payload = _pick(
        connection_payload,
        "SessionCookie",
        "session_cookie",
        default={},
    )
    if not isinstance(session_cookie_payload, dict):
        session_cookie_payload = {}

    plugin_dir = Path(
        _pick(connection_payload, "PluginDir", "pluginDir", default=str(_plugin_dir_fallback()))
    )
    config_dir_value = _pick(connection_payload, "Dir", "dir")
    config_dir = Path(config_dir_value) if config_dir_value else None

    connection = ServerConnection(
        scheme=str(_pick(connection_payload, "Scheme", "scheme", default="http")),
        host=str(_pick(connection_payload, "Host", "host", "Hostname", "hostname", default="127.0.0.1")),
        port=_parse_int(_pick(connection_payload, "Port", "port", default=9999), 9999),
        config_dir=config_dir,
        plugin_dir=plugin_dir,
        session_cookie=SessionCookie(
            name=str(_pick(session_cookie_payload, "Name", "name", default="session")),
            value=str(_pick(session_cookie_payload, "Value", "value", default="")),
        ),
    )

    args = payload.get("args") or {}
    if not isinstance(args, dict):
        args = {}

    return PluginRequest(
        server_connection=connection,
        args=args,
        raw_payload=payload,
    )


def post_graphql(
    connection: ServerConnection,
    query: str,
    variables: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    body = json.dumps(
        {
            "query": query,
            "variables": dict(variables or {}),
        }
    ).encode("utf-8")

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if connection.session_cookie and connection.session_cookie.header_value:
        headers["Cookie"] = connection.session_cookie.header_value

    request = Request(
        connection.graphql_url,
        data=body,
        headers=headers,
        method="POST",
    )

    try:
        with urlopen(request, timeout=10) as response:
            response_body = response.read().decode("utf-8")
    except HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"GraphQL request failed with HTTP {exc.code}: {detail}") from exc
    except URLError as exc:
        raise RuntimeError(f"Unable to reach Stash GraphQL endpoint at {connection.graphql_url}: {exc}") from exc

    try:
        payload = json.loads(response_body)
    except json.JSONDecodeError as exc:
        raise RuntimeError("GraphQL response was not valid JSON") from exc

    if payload.get("errors"):
        raise RuntimeError(f"GraphQL returned errors: {payload['errors']}")

    data = payload.get("data")
    if not isinstance(data, dict):
        raise RuntimeError("GraphQL response was missing a data object")

    return data


def fetch_plugin_settings(request: PluginRequest) -> PluginSettings:
    query = """
    query DownloadmanPluginConfiguration {
      configuration {
        plugins
      }
    }
    """

    data = post_graphql(request.server_connection, query)
    configuration = data.get("configuration") or {}
    if not isinstance(configuration, dict):
        configuration = {}

    plugins_config = normalize_plugins_config(configuration.get("plugins"))
    plugin_config = plugins_config.get(PLUGIN_ID) or {}
    if not isinstance(plugin_config, dict):
        plugin_config = {}

    return PluginSettings(
        cache_size_mb=max(0.0, _parse_float(plugin_config.get("cacheSizeMB"), DEFAULT_CACHE_SIZE_MB)),
        path_mappings=plugin_config.get("pathMappings") or [],
    )


def load_path_mappings(raw_config: Any) -> tuple[list[PathMapping], list[str]]:
    raw_mappings = raw_config

    if isinstance(raw_config, str):
        if not raw_config.strip():
            return [], []
        try:
            raw_mappings = json.loads(raw_config)
        except json.JSONDecodeError as exc:
            return [], [f"Path mappings must be valid JSON: {exc}"]

    if not isinstance(raw_mappings, list):
        return [], ["Path mappings must be a JSON array."]

    mappings: list[PathMapping] = []
    errors: list[str] = []

    for index, item in enumerate(raw_mappings):
        if not isinstance(item, dict):
            errors.append(f"Mapping #{index + 1} must be an object.")
            continue

        orig = str(item.get("orig") or "").strip()
        local = str(item.get("local") or "").strip()

        if not orig:
            errors.append(f"Mapping #{index + 1} is missing 'orig'.")
            continue
        if not local:
            errors.append(f"Mapping #{index + 1} is missing 'local'.")
            continue

        mappings.append(
            PathMapping(
                orig=orig,
                local=local,
                local_exists=Path(local).exists(),
            )
        )

    return mappings, errors
