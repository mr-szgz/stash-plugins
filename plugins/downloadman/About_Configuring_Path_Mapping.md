# Configuring Path Mapping

`Downloadman` expects your local path mapping file at:

`plugins/downloadman/stash_path_mappings.json`

This file is user-local. It is ignored by git and should not be committed.

## Quick Setup

1. Copy [`example_stash_path_mappings.json`](./example_stash_path_mappings.json) to `stash_path_mappings.json` in the same folder.
2. Replace the example values with your real mappings.
3. Keep the file as valid JSON.

## File Schema

The file must be a JSON array of mapping objects.

Each mapping object has:

- `orig`: the original source path prefix coming from Stash
- `local`: the local path prefix on your machine

Example:

```json
[
  {
    "orig": "/LIBRARY/EXAMPLE-A/",
    "local": "X:/Example/Library-A/"
  },
  {
    "orig": "/LIBRARY/EXAMPLE-B/",
    "local": "Y:/Example/Library-B/"
  }
]
```

## Notes

- Use forward slashes in the JSON values unless you have a specific reason not to.
- Keep `orig` values specific enough to match the correct source tree.
- Keep trailing slashes consistent across both `orig` and `local`.
- Order can matter if you have overlapping prefixes. Put more specific mappings first.
