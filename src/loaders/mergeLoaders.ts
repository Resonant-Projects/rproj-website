import type { Loader } from 'astro/loaders';

export function mergeLoaders(...loaders: Loader[]): Loader {
  return {
    name: loaders.map(loader => loader.name).join('+'),
    load: async context => {
      for (const loader of loaders) {
        await loader.load(context);
      }
    },
  };
}
