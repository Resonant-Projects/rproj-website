import { readFileSync } from 'node:fs';

interface FontVariant {
  src: [string];
  weight: string;
  style: 'normal';
  unicodeRange: [string, ...string[]];
}

/**
 * Build `fontProviders.local()` variants from an installed `@fontsource-variable/*` package.
 *
 * The Astro Fonts API `npm` provider hands back file:// URLs for locally installed packages that
 * Astro's own font fetcher then fails to read, so the font files are referenced by path instead.
 * Subsets and `unicode-range` values are read from the package's own `index.css`, so they stay in
 * sync with whatever version is installed.
 */
export function fontsourceVariableVariants(
  packageName: string,
  subsets: readonly string[]
): [FontVariant, ...FontVariant[]] {
  const packageDir = `node_modules/@fontsource-variable/${packageName}`;
  const css = readFileSync(`${packageDir}/index.css`, 'utf8');
  const variants: FontVariant[] = [];

  const blockPattern = new RegExp(
    `/\\*\\s*${packageName}-([a-z-]+)-wght-normal\\s*\\*/\\s*@font-face\\s*\\{([^}]*)\\}`,
    'g'
  );

  for (const [, subset, block] of css.matchAll(blockPattern)) {
    if (!subset || !block || !subsets.includes(subset)) continue;
    const file = /url\(\.\/(files\/[^)]+\.woff2)\)/.exec(block)?.[1];
    const weight = /font-weight:\s*([^;]+);/.exec(block)?.[1]?.trim();
    const ranges = /unicode-range:\s*([^;]+);/
      .exec(block)?.[1]
      ?.split(',')
      .map(range => range.trim());
    if (!file || !weight || !ranges?.length) {
      throw new Error(`Could not parse the ${subset} @font-face in ${packageDir}/index.css`);
    }
    variants.push({
      src: [`./${packageDir}/${file}`],
      weight,
      style: 'normal',
      unicodeRange: ranges as [string, ...string[]],
    });
  }

  if (variants.length !== subsets.length) {
    throw new Error(`Expected subsets ${subsets.join(', ')} in ${packageDir}/index.css, found ${variants.length}`);
  }
  return variants as [FontVariant, ...FontVariant[]];
}
