export const FREQUENCY_GITHUB_RAW = 'https://raw.githubusercontent.com/Resonant-Projects/frequency-music/main';

export const FREQUENCY_EXPORTS_DIR: string | null = (() => {
  const localExportDir = process.env.FREQUENCY_LOCAL_EXPORT_DIR;
  if (!localExportDir) return null;
  return localExportDir;
})();

export function getEssayManifestUrl(): URL {
  return new URL(`${FREQUENCY_GITHUB_RAW}/exports/blog/manifest.json`);
}

export function getEssayContentBaseUrl(): URL {
  return new URL(`${FREQUENCY_GITHUB_RAW}/exports/blog/`);
}

export function getEditorialManifestUrl(): URL {
  return new URL(`${FREQUENCY_GITHUB_RAW}/exports/public-editorial/v1/manifest.json`);
}

export function getEditorialContentBaseUrl(): URL {
  return new URL(`${FREQUENCY_GITHUB_RAW}/exports/public-editorial/v1/`);
}
