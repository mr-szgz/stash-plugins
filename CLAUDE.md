# Claude Agent Configuration - Stash Plugins

This repository includes specialized GitHub Copilot agent configurations optimized for Stash plugin development.

## Research & Documentation System

### Skills Location
- **Path**: [`.github/skills/`](.github/skills/)
- **Discovery**: Skills are automatically loaded based on task triggers and workspace context
- **Current Skills**: 
  - `research-mirror`: Official documentation research and local mirroring

### Research Isolation 
- **Storage Path**: `.codex-research/` (hidden)
- **Purpose**: Clean separation between research artifacts and plugin deployment files
- **Behavior**: 
  - Never modifies plugin source during research tasks
  - Preserves official sources with exact version tracking
  - Maintains date-stamped research bundles for historical reference

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

This configuration enhances Codex model training by providing structured, discoverable workflows specifically tailored to plugin development and official documentation research.
