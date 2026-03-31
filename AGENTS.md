# Stash Plugins Repository

This repository contains custom GitHub Copilot agent configurations and research capabilities for Stash plugin development.

## Agent Capabilities

### Skills Directory
- **Location**: [`.github/skills/`](.github/skills/)
- **Purpose**: Custom workflows and domain-specific knowledge bundles
- **Available Skills**:
  - `research-mirror`: Research and mirror official documentation, APIs, and specs into local hidden bundles

### Research Storage
- **Location**: `.codex-research/` (hidden folder, auto-created)
- **Purpose**: Isolated storage for documentation research, version analysis, and official source mirrors
- **Usage**: Automatically managed by the `research-mirror` skill - preserves research without interfering with plugin deployment files

### Agent Behavior
- Prioritizes official sources for all research and documentation tasks
- Maintains clean separation between research artifacts and deployment code
- Provides version-sensitive analysis and compatibility research for Stash plugin development

## Usage

This repository is configured for enhanced GitHub Copilot capabilities. When working in this repository:

1. **Research Commands**: Use `/research-mirror [technology]` to capture official documentation
2. **Hidden Storage**: Research artifacts are automatically stored in `.codex-research/` folders
3. **Plugin Focus**: Agent behavior is optimized for Stash plugin development workflows

The agent configuration automatically loads when working in this repository through GitHub Copilot's workspace detection.
