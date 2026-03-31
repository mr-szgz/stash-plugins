# Stash Plugins Repository

This repository contains custom GitHub Copilot agent configurations and research capabilities for Stash plugin development.

## Agent Capabilities

### Skills Directories
- **Codex project-local skills**: [`.agents/skills/`](.agents/skills/)
- **GitHub Copilot compatibility skills**: [`.github/skills/`](.github/skills/)
- **Purpose**: Custom workflows and domain-specific knowledge bundles
- **Available Skills**:
  - `research-mirror`: Research and mirror official documentation, APIs, and specs into local hidden bundles

### Research Storage
- **Location**: `.codex-research/` (hidden folder, auto-created)
- **Purpose**: Isolated storage for documentation research, version analysis, and official source mirrors
- **Usage**: Automatically managed by the `research-mirror` skill - preserves research without interfering with plugin deployment files

### Local References
- **Agent Skills docs mirror**: [`.agents/references/agentskills/`](.agents/references/agentskills/)
- **Purpose**: Repo-local reference copy of the `agentskills.io` documentation index and markdown pages

### Agent Behavior
- Prioritizes official sources for all research and documentation tasks
- Maintains clean separation between research artifacts and deployment code
- Provides version-sensitive analysis and compatibility research for Stash plugin development
- Prefer the Codex-local skill at `.agents/skills/research-mirror/` when working in Codex
- Treat `.github/skills/` as the GitHub Copilot-oriented copy unless the user explicitly asks for that layout

## Usage

This repository is configured for enhanced GitHub Copilot capabilities. When working in this repository:

1. **Codex Skill**: Use `$research-mirror` or point Codex at [`.agents/skills/research-mirror/SKILL.md`](.agents/skills/research-mirror/SKILL.md) for official documentation capture
2. **GitHub Copilot Command**: Use `/research-mirror [technology]` when working through the GitHub Copilot skill flow
3. **Hidden Storage**: Research artifacts are automatically stored in `.codex-research/` folders
4. **Plugin Focus**: Agent behavior is optimized for Stash plugin development workflows

The project keeps the Codex copy in-repo under `.agents/skills` so the skill remains project-scoped instead of being installed globally.
