---
name: research-mirror
description: 'Research and mirror official documentation, APIs, specs, changelog/release notes for libraries, platforms, tools, standards. Captures authoritative sources into local hidden research bundles. Use for: latest documentation, current API reference, official spec research, version compatibility analysis, save external docs locally, preserve research snapshots, build source manifests, capture user artifacts as fixtures.'
argument-hint: 'Specify technology/API/standard to research (e.g., "FastAPI v0.104", "React 18 hooks API", "OpenAPI 3.1 spec")'
---

# Research Mirror

Capture authoritative documentation and research into reusable local bundles without interfering with project files.

## When to Use

**PRIMARY TRIGGERS:**
- "research [technology/API/standard]"  
- "get latest docs for [X]"
- "find current spec/API reference"
- "save documentation locally"
- "capture official sources"
- "version compatibility check"
- "preserve research snapshot"
- "create documentation skill from research"
- "generate skill from research bundle"
- "make research into skill"

**USE CASES:**
- Version-sensitive research (latest, current, v1.2.x)
- API compatibility analysis 
- Official spec verification
- Pre-implementation research
- Building reusable research bundles

## Core Workflow

### 1. INITIALIZE
```yaml
Topic: [Extract from user request]
Version: [Determine official current version if "latest"]
Storage: .codex-research/<topic-slug>/<YYYY-MM-DD>/
```

### 2. SOURCE DISCOVERY
**Priority Order:**
1. Official vendor documentation
2. Official API reference  
3. Official changelog/releases
4. Official repository docs
5. Standards body specifications
6. User-provided artifacts

### 3. CAPTURE & MIRROR
**Raw Sources:**
- Primary doc pages → `raw/<domain>/page.md`  
- API references → `raw/<domain>/api.md`
- Changelogs → `raw/<domain>/changelog.md`
- User artifacts → `fixtures/user-drop-001.md`

**Curated Outputs:**
- `README.md` - Bundle purpose & scope
- `SOURCE_URLS.md` - All official URLs used  
- `RESEARCH_SUMMARY.md` - Key findings & current state
- `REFERENCE_INDEX.md` - Hub pages & saved artifacts

### 4. STRUCTURE & VALIDATE
**Standard Layout:**
```
.codex-research/<topic-slug>/2026-03-31/
├── README.md              # Bundle overview
├── SOURCE_URLS.md         # Source manifest  
├── RESEARCH_SUMMARY.md    # Key findings
├── REFERENCE_INDEX.md     # Navigation index
├── fixtures/              # User-provided content
├── raw/<domain>/          # Mirrored pages
└── <subtopic>/           # Focused areas
    ├── OFFICIAL_SPEC_NOTES.md
    └── API_COMPAT_MATRIX.md
```

## Execution Patterns

### Pattern A: Version Research  
```
Input: "research FastAPI latest"
1. Identify current FastAPI version from official sources
2. Mirror primary docs hub  
3. Capture API reference pages
4. Save changelog/release notes
5. Generate research summary with exact versions
```

### Pattern B: Compatibility Analysis
```  
Input: "OpenAPI 3.1 compatibility research"
1. Mirror OpenAPI 3.1 specification
2. Find tools claiming 3.1 support
3. Capture compatibility matrices
4. Generate comparison notes
```

### Pattern C: User Artifact Integration
```
Input: User provides logs/screenshots/configs
1. Save user content as numbered fixtures
2. Research official sources for context
3. Map user artifacts to official documentation
4. Generate runtime comparison notes
```

## Safety Protocols

**ISOLATION RULES:**
- ✅ Use hidden `.codex-research/` folder
- ✅ Preserve user artifacts exactly as provided
- ❌ Never modify project/deployment files during research
- ❌ Never browse project folders to determine storage location  
- ❌ Never overwrite existing research without explicit refresh request

**VERSION ACCURACY:**
- Always verify "latest" claims from official sources
- Save exact version strings and capture dates
- Separate "official docs say" from "user runtime shows"
- Never assume version currency without verification

## Output Standards

**Research Summary Format:**
- Tool/Platform: [Official name + exact version]
- Research Date: [YYYY-MM-DD]  
- Official Sources: [Primary URLs verified]
- Key Capabilities: [Bullet list from official docs]
- Compatibility Notes: [Version constraints, breaking changes]
- User Context: [Runtime settings, local configurations]

**Communication Style:**
- State research scope upfront
- Report storage location immediately  
- Confirm official sources before mirroring
- Deliver artifact file paths at completion

## Advanced Scenarios

**Multi-version Research:** Create date-based subfolders for version comparison
**Standard Compliance:** Generate official-spec-to-implementation mapping tables  
**Runtime Integration:** Capture live URLs, ports, flags from user environment
**Research Refresh:** Compare new findings against existing research bundles

## Documentation Skill Generation

Transform completed research bundles into ready-to-use documentation skills that embed knowledge directly within the skill file.

### When to Generate Skills

**SKILL CREATION TRIGGERS:**
- "create documentation skill from [research-topic]"
- "generate skill from research bundle" 
- "make research accessible as skill"
- "turn research into documentation skill"

**USE CASES:**
- Convert research into immediately accessible documentation
- Create self-contained skills that don't require external lookups
- Make research findings easily discoverable and reusable
- Package domain expertise as portable skills

### Skill Generation Workflow

**1. TEMPLATE USAGE**
```
Template: .github/skills/research-mirror/templates/documentation-skill-template.md
Target: .codex-research/<topic-slug>/SKILL.md
Purpose: Transform research bundle into documentation-serving skill
```

**2. CONTENT EXTRACTION**
- Review `SOURCE_URLS.md` for official source verification
- Extract key findings from `RESEARCH_SUMMARY.md`
- Process `raw/` folders for specific API details and examples  
- Organize content from `REFERENCE_INDEX.md` structure
- Preserve user fixtures as practical examples where relevant

**3. SKILL STRUCTURE**
```yaml
# Generated skill frontmatter pattern
---
name: {research-folder-name}
description: '{Technology} documentation and {key-features}. Use for: {trigger-list}'
argument-hint: 'Specify category: "{area1}", "{area2}", or specific questions'
---
```

**4. DOCUMENTATION ORGANIZATION**
- **Authentication & Setup** - From official source requirements
- **Core API/Features** - Extracted from research findings  
- **Practical Examples** - Code snippets and implementation patterns
- **Integration Patterns** - Common usage scenarios from research
- **Version Information** - Current status and compatibility notes
- **Resource References** - Official sources captured during research

### Template Features

**Content Patterns:**
- YAML frontmatter matching research folder structure
- Trigger phrases based on common user requests
- Logical content progression from basic to advanced
- Embedded code examples and practical implementations
- Official source attribution and version tracking

**Quality Standards:**
- Self-contained (no external research required)
- Practical examples ready for immediate use
- Organized for skill-based consumption vs raw documentation
- Focuses on commonly-needed information vs exhaustive coverage

### Generation Best Practices

**Content Transformation:**
- Convert research findings into authoritative embedded knowledge
- Restructure content for immediate practical access  
- Create complete code examples from API documentation fragments
- Focus on common use cases identified during research

**Skill Design:**
- Use technology-specific triggers matching user search patterns
- Organize content in logical implementation order
- Include error handling and best practices from official sources
- Maintain version context and compatibility information

**Quality Gates for Generated Skills:**
- [ ] All major features from research bundle covered
- [ ] Authentication/setup procedures included
- [ ] Complete practical examples for common scenarios  
- [ ] Version information and breaking changes documented
- [ ] Triggers match natural user request patterns
- [ ] No external research required to use the skill

## Quality Gates

- [ ] At least one official source captured
- [ ] SOURCE_URLS.md contains all verified links
- [ ] RESEARCH_SUMMARY.md includes exact versions and dates  
- [ ] User artifacts preserved in fixtures/ with original formatting
- [ ] Research isolated in hidden folder structure
- [ ] No speculation or interpretation beyond official sources
