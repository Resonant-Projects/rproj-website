# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resonant Projects .ART is a creative technology studio website built with Astro 5, deployed on Vercel. It features services for audio mixing/mastering, photography, short film finishing, and technology consulting.

## Commands

```bash
# Development
bun run dev          # Start dev server with Pagefind and debug mode
bun run build        # Type check + build (astro check && astro build)
bun run preview      # Preview production build

# Code Quality
bun run check        # Run astro check + lint + format
bun run fix          # Auto-fix lint and format issues
bun run lint         # ESLint only
bun run format       # Prettier check only

# Testing
bun run test:all                    # Contrast + CSS validation + visual verify
bun run test:accessibility          # Puppeteer + axe-core accessibility tests
bun run test:complete               # test:all + test:accessibility
bun run validate:css                # CSS variable validation
bun run validate:notion             # Notion config validation
```

## Architecture

### Content System
- **Astro Content Collections** with three sources:
  - `post`: Local MDX files from `src/data/post/`
  - `til`: "Today I Learned" entries from `src/content/til/`
  - `resources`: External resources from Notion database via `notionLoader`
- **Notion Integration**: Uses vendored `notion-astro-loader` in `vendor/` for live content sync
- Requires `NOTION_TOKEN` and `NOTION_RR_RESOURCES_ID` environment variables

### Path Aliases
All imports use `~` prefix (e.g., `~/components/`, `~/utils/`). Configured in both `tsconfig.json` and `astro.config.ts`.

### Key Directories
- `src/components/` - Organized by feature: `blog/`, `ui/`, `widgets/`, `resources/`, `til/`
- `src/layouts/` - Page layout templates
- `src/pages/` - File-based routing with dynamic `[...blog]/` for posts
- `src/utils/` - Utilities including `images-optimization.ts`, `internal-linking.ts`, `readability-analyzer.ts`
- `vendor/` - Forked dependencies: `integration/` (astrowind), `notion-astro-loader/`

### Styling
- Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Custom styles in `src/components/CustomStyles.astro`
- Uses `tailwind-variants` for component variant styling

### Build & Deploy
- Server-side rendering via `@astrojs/vercel` adapter
- Experimental `liveContentCollections` enabled for Notion sync
- Pagefind for client-side search (builds to `public/pagefind/`)
- Compression via `astro-compress` for CSS, HTML, and JavaScript

## Configuration Files

- `src/config.yaml` - Site metadata, SEO defaults, blog settings, analytics
- `astro.config.ts` - Integrations, image optimization, markdown plugins
- `.env` - Required: `NOTION_TOKEN`, `NOTION_RR_RESOURCES_ID`
