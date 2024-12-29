import { isAbsolute } from 'node:path';
import type { Plugin } from 'vite';

import { rescaleModule } from './rescaleModule';
import { processModule } from './processModule';

export function imagePlugin({
  initialScale: defaultInitialScale = 3,
  scales = [1, 2, 3],
}: {
  /**
   * Initial images' scale. This value determines how much the processed images are scaled
   * relative to their initial representation.
   * @default 3
   */
  initialScale?: number;
  /**
   * Scales to use while creating srcSet property.
   * @default [1, 2, 3]
   */
  scales?: number[];
} = {}): Plugin {
  if (defaultInitialScale <= 0) {
    throw new Error('"initialScale" must be positive');
  }
  if (!scales.length) {
    throw new Error('"scales" is empty');
  }

  // Sort scales in ascending order.
  scales = Array.from(new Set(scales).values()).sort((a, b) => a - b);

  let isBuild: boolean;

  return {
    name: 'image',
    // The plugin must be run before the Vite's plugins, because Vite processes images as usual
    // static assets.
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    async load(id) {
      // We should have an absolute module path, so we could load it.
      if (!isAbsolute(id)) {
        return;
      }

      // Require using "process" query parameter to avoid collisions with other plugins.
      const match = id.match(/^(.+)\?(.+)$/);
      if (!match) {
        return;
      }
      const [, path, query] = match;
      const searchParams = new URLSearchParams(query);
      if (!path.endsWith('.png') || !searchParams.has('process')) {
        return;
      }

      // Calculate the initial scale. We need this to understand how to rescale the image.
      let initialScale = defaultInitialScale;
      if (searchParams.has('initialScale')) {
        initialScale = parseInt(searchParams.get('initialScale'));
      }
      if (!scales.includes(initialScale)) {
        throw new Error(`Initial scale must be in array [${scales.join(', ')}]`);
      }

      // If the "scale" query parameter was passed, it means, that the image must be rescaled.
      if (searchParams.has('scale')) {
        const scale = parseInt(searchParams.get('scale'));
        if (!scale) {
          throw new Error('"scale" must be an integer');
        }
        return rescaleModule({ path, scale, initialScale, isBuild });
      }

      // Otherwise, it is just an image process request.
      return processModule({ path, initialScale, isBuild, scales });
    },
    configureServer(server) {
      server.middlewares.use('/process-image', (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        console.log(url);
        return next();
      });
    },
  };
}