from __future__ import annotations

import json
import sys
from typing import Any, Callable

from config import (
    PLUGIN_ID,
    PLUGIN_NAME,
    PluginSettings,
    fetch_plugin_settings,
    load_path_mappings,
    read_plugin_request,
    resolve_path_mappings_file,
)


def log(message: str) -> None:
    print(f"[{PLUGIN_ID}] {message}", file=sys.stderr)


def json_result(output: Any = None, error: str | None = None) -> dict[str, Any]:
    result: dict[str, Any] = {"output": output}
    if error:
        result["error"] = error
    return result


def detect_operation(args: dict[str, Any]) -> str:
    for key in ("operation", "mode", "task", "name"):
        value = args.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return "inspect_configuration"


def summarize_hook_context(hook_context: Any) -> dict[str, Any]:
    if not isinstance(hook_context, dict):
        return {}

    input_fields = hook_context.get("inputFields")
    if not isinstance(input_fields, list):
        input_fields = []

    return {
        "id": hook_context.get("id"),
        "type": hook_context.get("type"),
        "inputFields": input_fields,
    }


def get_settings(request: Any) -> tuple[PluginSettings, str | None]:
    try:
        return fetch_plugin_settings(request), None
    except Exception as exc:  # noqa: BLE001
        message = f"using default settings because GraphQL configuration lookup failed: {exc}"
        log(message)
        return PluginSettings(), str(exc)


def inspect_configuration(request: Any) -> dict[str, Any]:
    settings, settings_error = get_settings(request)
    mappings_path = resolve_path_mappings_file(settings, request)
    mappings, mapping_errors = load_path_mappings(mappings_path)

    output = {
        "plugin": {
            "id": PLUGIN_ID,
            "name": PLUGIN_NAME,
        },
        "serverConnection": {
            "scheme": request.server_connection.scheme,
            "host": request.server_connection.host,
            "port": request.server_connection.port,
            "configDir": str(request.server_connection.config_dir) if request.server_connection.config_dir else None,
            "pluginDir": str(request.server_connection.plugin_dir) if request.server_connection.plugin_dir else None,
        },
        "settings": settings.to_dict(),
        "settingsLoadError": settings_error,
        "pathMappings": {
            "path": str(mappings_path),
            "count": len(mappings),
            "missingLocalPaths": [mapping.local for mapping in mappings if not mapping.local_exists],
            "errors": mapping_errors,
        },
    }
    return json_result(output=output)


def validate_path_mappings(request: Any) -> dict[str, Any]:
    settings, settings_error = get_settings(request)
    mappings_path = resolve_path_mappings_file(settings, request)
    mappings, errors = load_path_mappings(mappings_path)

    output = {
        "path": str(mappings_path),
        "valid": not errors,
        "settingsLoadError": settings_error,
        "count": len(mappings),
        "mappings": [mapping.to_dict() for mapping in mappings],
        "errors": errors,
    }
    return json_result(output=output)


def handle_scene_event(request: Any) -> dict[str, Any]:
    settings, settings_error = get_settings(request)
    hook_summary = summarize_hook_context(request.args.get("hookContext"))

    if not settings.enable_python_hooks:
        return json_result(
            output={
                "status": "skipped",
                "reason": "enablePythonHooks is disabled",
                "settingsLoadError": settings_error,
                "hook": hook_summary,
            }
        )

    if settings.log_hook_payloads:
        log(f"scene hook received: {json.dumps(hook_summary, ensure_ascii=True)}")

    return json_result(
        output={
            "status": "handled",
            "settingsLoadError": settings_error,
            "hook": hook_summary,
            "note": "Python hook scaffold executed successfully.",
        }
    )


OPERATIONS: dict[str, Callable[[Any], dict[str, Any]]] = {
    "inspect_configuration": inspect_configuration,
    "validate_path_mappings": validate_path_mappings,
    "handle_scene_event": handle_scene_event,
}


def main() -> int:
    try:
        request = read_plugin_request()
        operation = detect_operation(request.args)
        handler = OPERATIONS.get(operation)
        if handler is None:
            print(
                json.dumps(
                    json_result(
                        error=f"Unknown operation: {operation}",
                        output={"availableOperations": sorted(OPERATIONS)},
                    )
                )
            )
            return 1

        result = handler(request)
        print(json.dumps(result, ensure_ascii=True))
        return 0
    except Exception as exc:  # noqa: BLE001
        log(f"fatal error: {exc}")
        print(json.dumps(json_result(error=str(exc), output=None), ensure_ascii=True))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
