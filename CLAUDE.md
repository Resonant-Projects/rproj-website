# CLAUDE.md

Astro 5 creative studio website deployed on Vercel.

**Use bun** (never npm/yarn/pnpm). Node 22.x required.

## Commands

```bash
bun run dev      # Start dev server
bun run build    # Type check + build
bun run check    # Lint + format check
bun run fix      # Auto-fix issues
```

## Path Alias

All imports use `~` prefix: `~/components/`, `~/utils/`

## Required Environment

- `NOTION_TOKEN`, `NOTION_RR_RESOURCES_ID` - Content from Notion
- `PUBLIC_CLOUDINARY_CLOUD_NAME` - Image delivery

## Context Files

- [Architecture](./docs/claude/architecture.md) - Content collections, components, build
- [Testing](./docs/claude/testing.md) - Accessibility, CSS validation, scripts
- [Environment Setup](./docs/environment-setup.md) - Full credential setup
- [Tailwind Patterns](./docs/best-tailwind-practices.md) - Styling conventions
