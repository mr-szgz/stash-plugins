---
name: stashapp-graphql-api
description: 'Complete Stash GraphQL API documentation and UI Plugin API reference. Provides comprehensive documentation for Stash GraphQL queries, mutations, authentication, UI plugins, and development workflows. Use for: GraphQL API queries, plugin development, authentication setup, UI plugin creation, schema reference, mutation examples.'
argument-hint: 'Specify what you need help with: "GraphQL API", "UI plugins", "authentication", "queries", "mutations", "plugin development", or specific API questions'
---

# Stash GraphQL API & Plugin Documentation

Complete reference documentation for Stash GraphQL API, UI Plugin API, and development workflows.

## When to Use

**PRIMARY TRIGGERS:**
- "Stash GraphQL API"
- "Stash plugin development"  
- "UI plugin API"
- "GraphQL queries/mutations"
- "Stash authentication"
- "Plugin API reference"
- "Stash schema"

**USE CASES:**
- Building Stash plugins
- GraphQL API integration
- UI plugin development
- Authentication implementation
- Query/mutation examples
- Schema reference

## Core Documentation Areas

### 1. GraphQL API Overview

**Endpoint & Access:**
- Endpoint: `<server>:<port>/graphql` (default: `localhost:9999/graphql`)
- GraphQL Playground: Settings > Tools > GraphQL playground
- Documentation Explorer: Click left panel in playground

**Key Features:**
- Type-based schema
- Introspective and self-documenting
- Integrated playground for testing
- Complete schema exploration via introspection queries

### 2. Authentication Methods

**API Key (Recommended)**
```bash
curl -X POST \
  -H "ApiKey: <your_api_key>" \
  -H "Content-Type: application/json" \
  --data '{ "query": "<graphql_query>" }' \
  localhost:9999/graphql
```

**API Key Location:** Settings > Security > Authentication

**Legacy Cookie Authentication (Obsolete v0.7+)**
```bash
curl --verbose --cookie-jar cookie.txt \
  --data 'username=stash&password=**' \
  localhost:9999/login

curl --cookie cookie.txt \
  -H "Content-Type: application/json" \
  --data '{ "query": "<graphql_query>" }' \
  localhost:9999/graphql
```

### 3. UI Plugin API

**Global Object:** `window.PluginApi`

⚠️ **EXPERIMENTAL:** Subject to change without notice

**Core Properties:**
- `React` - React library instance
- `ReactDOM` - ReactDOM library instance  
- `GQL` - Generated GraphQL client interface (low-level)
- `StashService` - Higher-level service (preferred over GQL)
- `libraries` - Access to UI libraries

**Available Libraries:**
- ReactRouterDOM
- Bootstrap  
- Apollo
- Intl
- FontAwesome (Regular, Solid, Brands)
- Mousetrap & MousetrapPause
- ReactSelect

**Registration Methods:**

**Route Registration:**
```javascript
PluginApi.register.route(path, component)
```
- `path` (string): Route path (use `/plugin/` prefix)
- `component` (React.FC): React function component
- Returns: `void`

**Component Registration:**
```javascript
PluginApi.register.component(name, component)  
```
- `name` (string): Unique component name (prefix with `plugin-`)
- `component` (React.FC): React function component
- Returns: `void`

### 4. Plugin Development Structure

**Plugin Configuration (.yml)**
```yaml
name: Plugin Name
description: Plugin description
version: 1.0.0
url: http://localhost:3000/plugin.js
settings:
  - key: setting_key
    displayName: Setting Display Name
    description: Setting description
    type: STRING
    defaultValue: default_value
```

**Plugin Integration Points:**
- **Embedded Plugins:** Run within Stash process
- **External Plugins:** Separate processes communicating via API
- **UI Plugins:** Client-side JavaScript components

### 5. Common GraphQL Patterns

**Basic Query Structure:**
```graphql
query {
  findScenes(
    filter: { per_page: 10 }
  ) {
    count
    scenes {
      id
      title
      path
      rating100
    }
  }
}
```

**Mutation Pattern:**
```graphql
mutation {
  sceneUpdate(input: {
    id: "scene_id"
    title: "New Title"
    rating100: 85
  }) {
    id
    title
    rating100
  }
}
```

### 6. Schema Structure Areas

**Core Entity Types:**
- Scene, Image, Gallery, Performer, Studio, Tag, Movie
- SceneMarker, SavedFilter, ConfigGeneral
- Job, LogEntry, Plugin, Package

**Common Filter Types:**
- `FindFilter` - Pagination and sorting
- `<Entity>FilterType` - Entity-specific filtering
- Date ranges, string matching, numeric comparisons

**Input Types:**
- `<Entity>CreateInput` - For creation mutations
- `<Entity>UpdateInput` - For update mutations
- `BulkUpdate<Entity>Input` - For bulk operations

## Usage Patterns

### Plugin Development Workflow

1. **Setup Plugin Structure**
   - Create `.yml` configuration
   - Develop plugin logic (.js/.py)
   - Define settings and UI integration

2. **Authentication Integration**
   - Implement API key handling
   - Set up GraphQL client with headers
   - Handle authentication errors

3. **GraphQL Integration**
   - Design queries for data retrieval
   - Implement mutations for data updates
   - Handle pagination and filtering

4. **UI Plugin Development**
   - Register routes with `PluginApi.register.route`
   - Use available React libraries
   - Integrate with Stash UI components

### API Integration Best Practices

**Error Handling:**
- Always check for GraphQL errors in response
- Handle authentication failures gracefully
- Implement retry logic for network issues

**Performance:**
- Use pagination for large result sets
- Request only needed fields in queries
- Batch mutations where possible

**Security:**
- Store API keys securely
- Validate all user inputs
- Use proper CORS settings for web plugins

## Example Implementations

**Simple Scene Query:**
```javascript
const query = `
  query GetScenes($filter: FindFilterType) {
    findScenes(filter: $filter) {
      count
      scenes {
        id
        title
        path
        rating100
        performers { name }
        tags { name }
      }
    }
  }
`;

fetch('http://localhost:9999/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ApiKey': 'your-api-key'
  },
  body: JSON.stringify({
    query: query,
    variables: { filter: { per_page: 25 } }
  })
});
```

**UI Plugin Route Registration:**
```javascript
// Register a new plugin page
PluginApi.register.route('/plugin/my-plugin', () => {
  const React = PluginApi.React;
  
  return React.createElement('div', {}, [
    React.createElement('h1', {}, 'My Plugin'),
    React.createElement('p', {}, 'Plugin content here')
  ]);
});
```

## Version Information

- **API Status:** Stable GraphQL API
- **UI Plugin API:** Experimental (subject to change)
- **Authentication:** API Key method recommended (v0.7+)
- **Legacy Support:** Cookie auth deprecated in v0.7

## Resources Referenced

**Official Documentation:**
- https://docs.stashapp.cc/api/
- https://docs.stashapp.cc/in-app-manual/plugins/
- GraphQL Playground: Settings > Tools > GraphQL playground

**Repository References:**  
- GitHub: https://github.com/stashapp/stash
- UI Examples: `/pkg/plugin/examples/react-component`
- GraphQL Schema: `/ui/v2.5/graphql/`

---

*Documentation compiled from official Stash sources and validated against current API implementations.*
