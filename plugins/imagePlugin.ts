import { isAbsolute, parse } from 'node:path';
import type { Plugin } from 'vite';

import { createImageLoader } from './createImageLoader';

export interface ProcessedImage {
  blurDataURL: string;
  height: number;
  mime: 'image/png';
  src: string;
  srcSet: string;
  width: number;
}

export function imagePlugin({
  assetsBaseUrl,
  initialScale: defaultInitialScale = 3,
  scales: defaultScales = [1, 2, 3],
}: {
  /**
   * A base URL that can be used to serve processed images.
   *
   * This value will be used by Vite's dev server to serve generated images. It has no effect
   * in build mode.
   * @default "/__processed-images"
   */
  assetsBaseUrl?: string;
  /**
   * Default initial images' scale.
   *
   * This value determines how much the processed images are scaled relative to their initial
   * representation. In the plugin, this value will be used to rescale the loaded image and provide
   * other sizes.
   *
   * This option can be overridden in specific imports.
   * @default 3
   */
  initialScale?: number;
  /**
   * Default scales to use while creating "srcSet" property.
   *
   * This option can be overridden in specific imports.
   * @default [1, 2, 3]
   */
  scales?: number[];
} = {}): Plugin {
  assetsBaseUrl ||= '/__processed-images';

  // Validate all options.
  if (defaultInitialScale <= 0) {
    throw new Error('"initialScale" is invalid');
  }

  if (!defaultScales.length || defaultScales.some(scale => scale <= 0)) {
    throw new Error('"scales" is invalid');
  }

  if (!assetsBaseUrl.startsWith('/')) {
    throw new Error('"assetsBaseUrl" should start with "/"');
  }

  // Sort scales in ascending order.
  defaultScales = Array
    .from(new Set(defaultScales).values())
    .sort((a, b) => a - b);

  let isBuild: boolean;
  const loadImage = createImageLoader();

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

      // Extract the full file path along with its query parameters.
      const match = id.match(/^(.+)\?(.+)$/);
      if (!match) {
        return;
      }
      const [, path, query] = match;
      const searchParams = new URLSearchParams(query);
      if (!path.endsWith('.png') || !searchParams.has('process')) {
        return;
      }

      const onError = (message: string): never => {
        this.error(`Failed to process "${id}" module: ${message}`);
      };

      // Calculate the initial scale. We need this to understand how to rescale the image.
      let initialScale = defaultInitialScale;
      if (searchParams.has('initialScale')) {
        initialScale = parseFloat(searchParams.get('initialScale'));
        if (!initialScale) {
          onError('"initialScale" is invalid');
        }
      }

      // Calculate the scales' list. This value is required to understand in which sizes
      // the image should be represented.
      let scales = defaultScales;
      if (searchParams.has('scales')) {
        scales = (searchParams.get('scales') || '')
          .split(',')
          .map((item, idx) => {
            const scale = parseFloat(item);
            if (scale <= 0) {
              onError(`"scale" is invalid: ${idx} index contains invalid value "${item}"`);
            }
            return scale;
          });

        if (!scales.length) {
          onError('"scale" is invalid: the list is empty');
        }
      }

      let src: string;
      let srcSet: string;
      const [image, imageMeta] = await loadImage(path, initialScale, scales[0]);

      if (isBuild) {
        // In build mode we should create Rollup file URL references. To do this, we
        // are using Rollup's emitFile function to generate new static assets to reference
        // them in the future.

        const { name, ext } = parse(path);

        // We are inserting a raw non-escaped value, because Rollup will replace it with an
        // escaped string.
        src = `import.meta.ROLLUP_FILE_URL_${this.emitFile({
          type: 'asset',
          name: `${name}${ext}`,
          source: await image.toBuffer(),
        })}`;

        // Here, we are doing the same as we did above, but as long as srcSet is a string,
        // we should add some more raw JS code to properly generate the value.
        srcSet = `[${await Promise
          .all(
            scales.map(async scale => {
              const [, { buffer }] = await loadImage(path, initialScale, scale);
              return `import.meta.ROLLUP_FILE_URL_${this.emitFile({
                type: 'asset',
                name: `${name}@${scale}x${ext}`,
                source: buffer,
              })} + ' ${scale}x'`;
            }),
          )
          .then(items => items.join(', '))}].join(', ')`;
      } else {
        const pathWithRescale = (scale: number) => {
          return `${assetsBaseUrl}?${new URLSearchParams([
            ['path', path],
            ['initialScale', `${initialScale}`],
            ['scale', `${scale}`],
          ]).toString()}`;
        };

        // In dev mode we are just making URLs referencing to the plugin's dev server.
        src = JSON.stringify(pathWithRescale(1));
        srcSet = JSON.stringify(
          scales
            .map(scale => `${pathWithRescale(scale)} ${scale}x`)
            .join(', '),
        );
      }

      return `export default { 
        ...${JSON.stringify({
        width: imageMeta.width,
        height: imageMeta.height,
        mime: 'image/png',
        blurDataURL: `data:image/png;base64,${await image
          .clone()
          .blur()
          .resize(10)
          .toBuffer()
          .then(buffer => buffer.toString('base64'))}`,
      } satisfies Omit<ProcessedImage, 'src' | 'srcSet'>)}, 
        src: ${src}, 
        srcSet: ${srcSet},
       };`;
    },
    configureServer(server) {
      // Define dev-server route middleware to server processed images.
      server.middlewares.use(
        assetsBaseUrl,
        async (req, res) => {
          const { searchParams } = new URL(req.url, 'http://a');

          const path = searchParams.get('path');
          if (!path) {
            throw new Error('"path" is invalid');
          }

          const scale = parseFloat(searchParams.get('scale'));
          if (scale <= 0) {
            throw new Error('"scale" is invalid');
          }

          const initialScale = parseFloat(searchParams.get('initialScale'));
          if (initialScale <= 0) {
            throw new Error('"initialScale" is invalid');
          }

          const [, { buffer }] = await loadImage(path, initialScale, scale);
          res.writeHead(200, { 'Content-Type': 'image/png' });
          res.end(buffer);
        },
      );
    },
  };
}