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

## Design Context

### Users

People arriving via discovery or referral — they've heard about Resonant Projects through word of mouth or a portfolio piece and are evaluating whether Keith is the right creative partner. They're typically independent musicians, filmmakers, or photographers looking for finishing services (mixing, mastering, color, post), or businesses exploring technology consulting. Their mindset is **evaluative**: they want to quickly sense competence, taste, and fit before reaching out.

### Brand Personality

**Calm. Refined. Intentional.**

The site should evoke quiet confidence and sophistication — the feeling of walking into a well-designed studio where every detail has been considered. Not flashy, not trendy, not corporate. The work speaks for itself; the interface simply gets out of the way and lets visitors focus on what matters.

### Aesthetic Direction

**Minimal elegance with functional precision.** A blend of editorial sophistication (generous whitespace, serif headlines, photography-forward) and technical clarity (clean lines, tight grid, restrained palette). The signature violet/royal purple (#6e2765) stays as a meaningful brand anchor rooted in the original logo — used deliberately as an accent, never overwhelming.

The current design foundation is solid but feels generic in places. The goal is to refine it toward something more distinctive and ownable — less "template," more "curated studio presence."

**Anti-patterns to avoid:**

- Overly decorative or busy layouts
- Generic SaaS/startup aesthetics
- Gratuitous animation or motion for its own sake
- Dark mode as the default (light mode should feel primary and intentional)

### Design Principles

1. **Restraint over decoration** — Every element earns its place. If it doesn't serve the user or reinforce the brand, remove it.
2. **Let the work breathe** — Generous spacing, clear hierarchy, and quiet backgrounds so portfolio pieces and content take center stage.
3. **Precision in the details** — Consistent spacing, aligned grids, intentional typography. The craft is in what you almost don't notice.
4. **Violet as signature, not theme** — The royal purple is a deliberate accent that punctuates key moments (CTAs, focus states, highlights), not a wash across every surface.
5. **Accessible by default** — WCAG AA minimum. Reduced motion support, high contrast mode, and keyboard navigation are non-negotiable.
