# crud-gen

A CLI tool for generating CRUD boilerplate code for multi-tenant SaaS applications using React, Chakra UI v3, RTK Query, Formik, and TanStack Table.

## Features

- 🚀 **Complete CRUD Generation** - Generate API, types, components, pages, hooks, and tests
- 🎨 **Chakra UI v3** - Modern form components with Field.Root syntax
- 📊 **RTK Query** - API slice generation with caching and optimistic updates
- 📝 **Formik + Yup** - Form management with validation
- 📋 **TanStack Table** - Data tables with sorting and pagination
- 🧪 **Vitest + MSW** - Test file generation
- 🔒 **Safe Generation** - Never overwrites files unless forced
- ⏪ **Rollback Support** - Automatic rollback on errors
- 📦 **Dependency Checking** - Warns about missing packages

## Installation

```bash
npm install -g crud-gen
```

Or use npx:

```bash
npx crud-gen
```

## Quick Start

### 1. Initialize in your project

```bash
cd your-react-project
crud-gen init
```

This creates:
- `crud-gen.config.json` - Configuration file
- `.crud-gen/` - Directory for tracking generated files

### 2. Create an entity schema

Create `schemas/user.json`:

```json
{
  "entity": "User",
  "plural": "Users",
  "route": "users",
  "apiEndpoint": "/api/v1/users",
  "tenantScoped": true,
  "fields": [
    {
      "name": "id",
      "type": "string",
      "ui": {
        "form": { "exclude": true },
        "table": { "exclude": true }
      }
    },
    {
      "name": "email",
      "type": "string",
      "validation": { "required": true, "type": "email" },
      "ui": {
        "form": {
          "component": "Input",
          "type": "email",
          "placeholder": "Enter email",
          "label": "Email Address"
        },
        "table": {
          "visible": true,
          "sortable": true,
          "header": "Email"
        }
      }
    },
    {
      "name": "role",
      "type": "string",
      "validation": { "required": true },
      "ui": {
        "form": {
          "component": "Select",
          "label": "Role",
          "options": [
            { "label": "Admin", "value": "admin" },
            { "label": "User", "value": "user" }
          ]
        },
        "table": { "visible": true }
      }
    }
  ]
}
```

### 3. Generate code

```bash
crud-gen generate schemas/user.json
```

Output:
```
✓ Created src/store/user/userApi.ts
✓ Created src/store/user/index.ts
✓ Created src/types/user.ts
✓ Created src/components/user/UserForm.tsx
✓ Created src/components/user/UserTable.tsx
✓ Created src/components/user/UserDetails.tsx
✓ Created src/pages/users/index.tsx
✓ Created src/pages/users/create.tsx
✓ Created src/pages/users/[id]/edit.tsx
✓ Created src/pages/users/[id]/index.tsx
✓ Created src/hooks/useUser.ts
```

## Commands

### `crud-gen init`

Initialize configuration in the current project.

Options:
- `--force` - Overwrite existing configuration

### `crud-gen generate <entity-file>`

Generate CRUD code for an entity.

Options:
- `--only <parts...>` - Only generate specific parts (api, types, components, pages, hooks, tests)
- `--skip <parts...>` - Skip specific parts
- `--force` - Overwrite existing files

Examples:
```bash
# Generate everything
crud-gen generate schemas/user.json

# Only generate API and types
crud-gen generate schemas/user.json --only api types

# Skip test generation
crud-gen generate schemas/user.json --skip tests

# Force overwrite
crud-gen generate schemas/user.json --force
```

### `crud-gen list`

List all generated entities.

### `crud-gen clean <entity>`

Remove all generated files for an entity.

Options:
- `--yes` - Skip confirmation prompt

## Configuration

The `crud-gen.config.json` file contains:

```json
{
  "projectRoot": ".",
  "paths": {
    "pages": "src/pages",
    "components": "src/components",
    "store": "src/store",
    "hooks": "src/hooks",
    "types": "src/types",
    "tests": "src/__tests__"
  },
  "defaults": {
    "listType": "table",
    "detailsView": "page",
    "tenantScoped": true,
    "generateTests": true
  },
  "api": {
    "responseShape": {
      "dataField": "data",
      "successField": "success",
      "messageField": "message",
      "metaField": "meta"
    }
  },
  "components": {
    "tableComponent": "DataTable",
    "gridComponent": "CardGrid",
    "formLayout": "vertical"
  }
}
```

## Required Dependencies

Your target project must have these packages installed:

- `@chakra-ui/react` ^3.0.0
- `@reduxjs/toolkit` ^1.9.0
- `react-redux` ^8.0.0
- `formik` ^2.0.0
- `yup` ^1.0.0
- `@tanstack/react-table` ^8.0.0
- `react-router-dom` ^6.0.0

The CLI will warn you about missing or outdated packages.

## Field Types

| Type | TypeScript | Description |
|------|------------|-------------|
| `string` | `string` | Text values |
| `number` | `number` | Numeric values |
| `boolean` | `boolean` | Boolean flags |
| `date` | `Date` | Date values |
| `relation` | `string` | Foreign key reference |
| `computed` | `string` | Computed from other fields |

## Form Components

| Component | Description |
|-----------|-------------|
| `Input` | Standard text input |
| `Select` | Dropdown with static options |
| `AsyncSelect` | Dropdown with API-loaded options |
| `Textarea` | Multi-line text |
| `Checkbox` | Boolean checkbox |
| `DatePicker` | Date selection |

## License

MIT
