# Documentation Skill Template

Use this asset when converting a completed research bundle into a documentation-serving Codex skill.

## Frontmatter

```yaml
---
name: {technology-slug}
description: {Technology} documentation and implementation guidance for {primary use cases}. Use when Codex needs setup steps, API details, integration patterns, version notes, or practical examples for {technology}.
---
```

Guidelines:

- Use kebab-case for `name`.
- Put trigger language in `description`.
- Keep frontmatter limited to `name` and `description`.

## Recommended Structure

```markdown
# {Technology Name}

One-line scope statement.

## Setup

Installation, authentication, prerequisites, and environment requirements.

## Core Concepts

The minimum concepts Codex needs before implementation.

## Common Workflows

The most common tasks users will ask for, with concise examples.

## Example Implementations

Ready-to-use snippets for typical integration patterns.

## Version Notes

Current version, compatibility constraints, and breaking changes.

## Official Sources

List the primary official references used to build the skill.
```

## Extraction Workflow

1. Read `SOURCE_URLS.md` to confirm official sources.
2. Read `RESEARCH_SUMMARY.md` to extract versions, capabilities, and compatibility notes.
3. Pull only the needed details from `references/` and `REFERENCE_INDEX.md`.
4. Reorganize the material into task-oriented documentation instead of source-order notes.
5. Add complete practical examples for the most common requests.

## Quality Gates

- The generated skill is self-contained for routine use.
- Setup and authentication steps are included when relevant.
- Examples are complete enough to run or adapt directly.
- Version information is explicit.
- Official sources are identified.
