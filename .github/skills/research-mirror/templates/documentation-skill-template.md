# Documentation Skill Template

This template guides agents in creating documentation-serving skills from research bundles. Use this to transform captured research into immediately accessible skills that embed documentation directly.

## Template Structure

### 1. YAML Frontmatter Pattern

```yaml
---
name: {technology-slug}
description: '{Technology Name} {type} documentation and {key features}. Provides comprehensive documentation for {primary use cases}. Use for: {key triggers as comma-separated list}.'
argument-hint: 'Specify what you need help with: "{category 1}", "{category 2}", "{category 3}", or specific {technology} questions'
---
```

**Guidelines:**
- `name`: Use kebab-case matching the research folder name
- `description`: Start with full technology name, include "documentation", list 3-5 key use cases
- `argument-hint`: Provide 3-4 main categories users might ask about

### 2. Main Heading & Overview

```markdown
# {Technology Name} {Documentation Type}

{One-line description of what the skill provides and scope}

## When to Use

**PRIMARY TRIGGERS:**
- "{technology name} {primary feature}"
- "{key use case 1}"  
- "{key use case 2}"
- "{key use case 3}"
- "{specific API/feature name}"

**USE CASES:**
- {Use case 1 with action verb}
- {Use case 2 with action verb}
- {Use case 3 with action verb}
- {Use case 4 with action verb}
```

**Guidelines:**
- Use exact technology name as users would search for it
- Primary triggers should match common user requests
- Use cases should start with action verbs (Building, Implementing, Setting up, etc.)

### 3. Core Documentation Areas

Organize content into logical numbered sections:

```markdown
## Core Documentation Areas

### 1. {Primary Feature/Concept}

{Brief intro paragraph}

**Key Points:**
- {Bullet point with specific details}
- {Configuration or setup information}
- {Important limitations or requirements}

**{Subsection if needed}:**
```
{code example or configuration}
```

### 2. {Secondary Feature/API}

{Follow same pattern}
```

**Content Organization Guidelines:**
- Start with most fundamental concepts (authentication, setup, basic usage)  
- Progress to advanced features and integrations
- Include practical examples and code snippets
- Use consistent formatting for code blocks, warnings, and key points

### 4. Practical Examples Section

```markdown
## Example Implementations

**{Common Task 1}:**
```language
{code example with comments}
```

**{Common Task 2}:**
```language
{code example with comments}  
```
```

**Example Guidelines:**
- Provide ready-to-use code snippets
- Include inline comments explaining key parts
- Cover common integration patterns
- Show error handling where relevant

### 5. Version & Resource Information

```markdown
## Version Information

- **{Feature} Status:** {Stable/Beta/Experimental}
- **Current Version:** {version if applicable}
- **Compatibility:** {version requirements}
- **Breaking Changes:** {major version notes}

## Resources Referenced

**Official Documentation:**
- {Primary official URL}
- {Secondary official URL}
- {API reference URL}

**Repository References:**  
- {Main repository}
- {Examples/samples repository}
- {Specific implementation paths}

---

*Documentation compiled from official {Technology} sources and validated against current implementations.*
```

## Agent Usage Guidelines

### Content Extraction from Research

**From Research Bundles:**
1. **Read SOURCE_URLS.md** - Identify primary official sources
2. **Review RESEARCH_SUMMARY.md** - Extract key capabilities and version info
3. **Process raw/** folders - Pull specific API details and examples
4. **Check REFERENCE_INDEX.md** - Find organized content areas

**Content Transformation:**
- Convert research findings into authoritative statements
- Transform URLs and references into embedded knowledge
- Reorganize content into logical skill sections
- Create practical examples from API documentation

### Quality Standards

**Documentation Completeness:**
- [ ] All major features from research covered
- [ ] Authentication/setup information included  
- [ ] Practical examples for common use cases
- [ ] Version information and compatibility notes
- [ ] Error handling and best practices

**Skill Structure:**
- [ ] YAML frontmatter follows template pattern
- [ ] Triggers match how users would request help
- [ ] Content organized in logical progression
- [ ] Code examples are complete and functional
- [ ] Official sources properly attributed

### Common Patterns by Technology Type

**API Documentation:**
- Authentication methods (API keys, OAuth, etc.)
- Endpoint structure and common patterns
- Request/response examples
- Rate limiting and error handling

**Framework/Library Documentation:**
- Installation and setup
- Core concepts and architecture
- Common usage patterns and examples
- Integration with other tools

**Configuration/Tool Documentation:**
- Setup and initialization
- Configuration options and examples
- Common workflows and use cases
- Troubleshooting and best practices

## Template Usage Flow

1. **Initialize**: Create new SKILL.md in research folder using this template
2. **Extract**: Pull key information from research bundle files
3. **Organize**: Structure content into logical documentation areas
4. **Examples**: Create practical code examples from API documentation
5. **Validate**: Ensure skill provides immediate value without external research
6. **Test**: Verify triggers and content match user expectations

## Anti-Patterns to Avoid

❌ **Don't create skills that still require external research**  
✅ **Extract and embed all necessary documentation**

❌ **Don't copy-paste raw documentation without organization**  
✅ **Restructure content for skill-based consumption**

❌ **Don't include every minor detail from research**  
✅ **Focus on practical, commonly-needed information**

❌ **Don't use vague or generic triggers**  
✅ **Use specific technology names and common user requests**

---

*This template creates self-contained documentation skills that provide immediate access to research findings without requiring external sources or additional research steps.*
