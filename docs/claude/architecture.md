# Architecture

Detailed architecture reference for Claude Code when working on this codebase.

## Content Collections

Three collections defined in `src/content/config.ts`:

| Collection | Source | Loader |
|------------|--------|--------|
| **post** | `src/data/post/` | Local MDX via glob loader |
| **til** | `src/content/til/` | "Today I Learned" markdown |
| **resources** | Notion database | Vendored `notion-astro-loader` (filters Status = "Up-to-Date") |

The vendored loader in `vendor/notion-astro-loader/` is a local fork. Modify there for Notion integration changes.

## Component Organization

```
src/components/
├── starwind/     # Headless UI primitives (button, dialog, sheet, pagination, breadcrumb)
├── widgets/      # Page section components (Hero, CallToAction, Footer, Header)
├── blog/         # Blog feature components
├── til/          # TIL feature components
├── resources/    # Resources feature components
├── ui/           # Shared UI elements (Button, Headline, ItemGrid)
└── seo/          # SEO optimization components
```

## Styling

**Tailwind CSS v4** with Vite plugin (`@tailwindcss/vite`):
- CSS-first configuration approach
- `tailwind-variants` for component variant styling

## Image Optimization

Allowed remote image domains in `astro.config.ts`:
- `cdn.pixabay.com`
- `images.unsplash.com`
- `images.pexels.com`
- `res.cloudinary.com`
- `**.amazonaws.com` (AWS S3 pattern)

## Build & Deploy

- **SSR**: `@astrojs/vercel` adapter with 10s max duration
- **Live Content**: Experimental `liveContentCollections` for Notion sync
- **Search**: Pagefind index builds to `public/pagefind/`
- **Compression**: `astro-compress` (CSS, HTML, JS only - not images/SVG)

## Configuration Files

| File | Purpose |
|------|---------|
| `src/config.yaml` | Site metadata, SEO defaults, blog settings, analytics (GA: G-LMTZTMFM0W) |
| `astro.config.ts` | Integrations, image optimization, markdown plugins |
| `.env` | Environment variables (see root CLAUDE.md) |
