import path from 'path';
import { fileURLToPath } from 'url';

import { unified } from '@astrojs/markdown-remark';
import { defineConfig, envField, fontProviders } from 'astro/config';
import { config } from 'dotenv';

// Load environment variables explicitly
config();

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import react from '@astrojs/react';

import astrowind from './vendor/integration';
import vercelServerless from '@astrojs/vercel';
import pagefind from './src/utils/pagefind';

import { fontsourceVariableVariants } from './src/utils/fontsource-variants';
import { lazyImagesRehypePlugin, readingTimeRemarkPlugin, responsiveTablesRehypePlugin } from './src/utils/frontmatter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FONT_SUBSETS = ['latin', 'latin-ext'] as const;

export default defineConfig({
  output: 'server',
  adapter: vercelServerless({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 30,
    isr: {
      // Writing and blog pages fetch Frequency exports at request time.
      // One hour is fresher than the previous 8-hour full production rebuild,
      // without spending build minutes.
      expiration: 60 * 60,
      ...(process.env.ISR_BYPASS_TOKEN ? { bypassToken: process.env.ISR_BYPASS_TOKEN } : {}),
      exclude: ['/til/board', '/api/revalidate', /^\/api\/.+/],
    },
  }),

  build: {
    format: 'file',
  },

  // Typed, validated environment variables (import from `astro:env/server` / `astro:env/client`).
  // Everything is optional so a build without secrets (forks, CI without access to secrets) still
  // succeeds: features degrade at runtime (for example the contact action reports a configuration
  // error) instead of failing the build.
  env: {
    schema: {
      // Server-only secrets
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      NOTION_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      NOTION_DATABASE_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      NOTION_RR_RESOURCES_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      CLOUDINARY_API_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      ISR_BYPASS_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Public values (safe for the client bundle)
      PUBLIC_CLOUDINARY_CLOUD_NAME: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_CLOUDINARY_API_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },

  integrations: [
    react(),
    pagefind(),
    sitemap(),
    mdx(),
    icon({
      // No local SVGs are used (all icons come from the Iconify sets below). Point at the existing assets/icons
      // folder so astro-icon stops warning that the default src/icons directory is missing.
      iconDir: 'src/assets/icons',
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),
    partytown({
      config: { forward: ['dataLayer.push'] },
    }),
    compress({
      // Minify with lightningcss, not csso. Tailwind v4 emits every responsive
      // variant inside CSS Media Queries Level 4 range syntax — `@media
      // (width>=64rem)` — which csso 5 cannot parse, so it silently deletes the
      // whole block. That stripped every `sm:`/`md:`/`lg:` utility from the
      // build and rendered the site at base (mobile) sizes on all viewports.
      CSS: {
        csso: false,
        lightningcss: { minify: true },
      },
      // Vercel already brotli/gzip's HTML at the edge. Minifying 1,300+ HTML
      // files here was taking ~2 of every 4-minute production build.
      HTML: false,
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }),
    astrowind({
      config: './src/config.yaml',
    }),
  ],

  // Astro Fonts API, fed from the already-installed @fontsource-variable/* packages (same font files and
  // subsets as the old CSS @imports, no network at build time) so Astro can add preload links,
  // metric-matched fallbacks and serve the files from /_astro/fonts. Only the latin + latin-ext subsets
  // are shipped; the Cyrillic/Greek/Vietnamese files the old @imports bundled are not used by site content.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Source Sans 3 Variable',
      cssVariable: '--font-source-sans-3',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: { variants: fontsourceVariableVariants('source-sans-3', FONT_SUBSETS) },
    },
    {
      provider: fontProviders.local(),
      name: 'Playfair Display Variable',
      cssVariable: '--font-playfair-display',
      fallbacks: ['ui-serif', 'Georgia', 'serif'],
      options: { variants: fontsourceVariableVariants('playfair-display', FONT_SUBSETS) },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter Variable',
      cssVariable: '--font-inter',
      fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      options: { variants: fontsourceVariableVariants('inter', FONT_SUBSETS) },
    },
  ],

  image: {
    domains: ['cdn.pixabay.com', 'images.unsplash.com', 'images.pexels.com', 'res.cloudinary.com'],
    responsiveStyles: true,
    layout: 'constrained',
    // Several posts/heroes use local SVG assets that `adaptOpenGraphImages` rasterizes to JPEG
    // for Open Graph tags. Astro >=6.3 refuses to process SVG sources unless this is opted in.
    dangerouslyProcessSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },

  markdown: {
    // Astro 7 defaults to the Rust-based Satteri processor. These are unified (remark/rehype) plugins,
    // so select the unified processor explicitly instead of the deprecated top-level plugin options.
    processor: unified({
      remarkPlugins: [readingTimeRemarkPlugin],
      rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
    }),
  },

  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
        '@src': path.resolve(__dirname, './src'),
      },
    },
  },
} as const);
