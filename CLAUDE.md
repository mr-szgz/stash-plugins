# Claude Agent Configuration - Stash Plugins

This repository includes specialized GitHub Copilot agent configurations optimized for Stash plugin development.

## Research & Documentation System

### Skills Location
- **Codex-local path**: [`.agents/skills/`](.agents/skills/)
- **GitHub/Copilot path**: [`.github/skills/`](.github/skills/)
- **Current Skills**:
  - `research-mirror`: Official documentation research and local mirroring
- **Preference**:
  - Prefer `.agents/skills/research-mirror/` for Codex work in this repository
  - Keep `.github/skills/research-mirror/` as the GitHub Copilot-oriented copy

### Research Isolation 
- **Storage Path**: `.codex-research/` (hidden)
- **Purpose**: Clean separation between research artifacts and plugin deployment files
- **Behavior**: 
  - Never modifies plugin source during research tasks
  - Preserves official sources with exact version tracking
  - Maintains date-stamped research bundles for historical reference

### Local References
- **Path**: [`.agents/references/agentskills/`](.agents/references/agentskills/)
- **Purpose**: Repo-local mirror of Agent Skills documentation pages from `agentskills.io`

### Agent Optimizations

**Research-First Approach**:
- Prioritizes official vendor documentation over secondary sources
- Captures exact version strings and official URLs
- Separates "official source says" from "user runtime shows"

**Plugin Development Focus**:
- Understands Stash plugin structure and deployment patterns  
- Isolates research/docs from plugin runtime folders
- Provides version compatibility analysis for Stash ecosystem

## How It Works

When you work in this repository, GitHub Copilot automatically:

1. **Loads Skills**: Detects and offers skill-based workflows via `/` commands
2. **Manages Research**: Routes documentation capture to `.codex-research/` folders  
3. **Preserves Context**: Maintains clean boundaries between research and development tasks

When you work in this repository with Codex, prefer the repo-local skill at [`.agents/skills/research-mirror/SKILL.md`](.agents/skills/research-mirror/SKILL.md) so the workflow stays project-scoped.

This configuration enhances Codex model training by providing structured, discoverable workflows specifically tailored to plugin development and official documentation research.
