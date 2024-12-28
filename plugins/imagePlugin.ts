import { isAbsolute } from 'node:path';
import { readFileSync } from 'node:fs';

import type { Plugin } from 'vite';
import sharp, { type Sharp } from 'sharp';

interface Result {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  mime: 'image/png';
  blurDataURL: string;
}

function rescaleSharp({ image, scale, initial }: {
  image: Sharp,
  scale: number;
  initial: {
    scale: number;
    width: number;
    height: number;
  }
}) {
  const width = initial.width * scale / initial.scale | 0;
  const height = initial.height * scale / initial.scale | 0;

  return [
    image.clone().resize({ width, height }).png({
      compressionLevel: 6,
      quality: 60,
    }),
    { width, height },
  ] as const;
}

async function process({ initialScale, isBuild, path, scales }: {
  path: string;
  initialScale: number;
  isBuild: boolean;
  scales: number[]
}) {
  const image = sharp(readFileSync(path));
  const imageMeta = await image.metadata();

  const images = scales.map(scale => {
    const width = imageMeta.width * scale / initialScale | 0;
    const height = imageMeta.height * scale / initialScale | 0;

    return [
      image.clone().resize({ width, height }).png({
        compressionLevel: 6,
        quality: 60,
      }),
      { width, height },
    ] as const;
  });

  // The image which was supposed to be used as the initial, the smallest one.
  const [initialImage, initialImageMeta] = images[0];

  // Create blurDataURL using the smallest image.
  const blurBuffer = await initialImage
    .clone()
    .blur()
    .resize(10)
    .toBuffer();

  return `export default ${JSON.stringify({
    src: isBuild ? 'TODO' : `${path}${new URLSearchParams([
      ['process', ''],
      ['initialScale', `${initialScale}`],
      ['scale', '1'],
    ]).toString()}`,
    srcSet: '',
    width: initialImageMeta.width,
    height: initialImageMeta.height,
    mime: 'image/png',
    blurDataURL: `data:image/png;base64,${blurBuffer.toString('base64')}`,
  })};`;
}

export async function rescale({ initialScale, isBuild, path, scale }: {
  path: string;
  scale: number;
  initialScale: number;
  isBuild: boolean;
}) {
  const image = sharp(readFileSync(path));
  const imageMeta = await image.metadata();

  const width = imageMeta.width * scale / initialScale | 0;
  const height = imageMeta.height * scale / initialScale | 0;
  // const rescaled =

  const images = scales.map(scale => {
    const width = imageMeta.width * scale / initialScale | 0;
    const height = imageMeta.height * scale / initialScale | 0;

    return [
      image.clone().resize({ width, height }).png({
        compressionLevel: 6,
        quality: 60,
      }),
      { width, height },
    ] as const;
  });

  // The image which was supposed to be used as the initial, the smallest one.
  const [initialImage, initialImageMeta] = images[0];

  // Create blurDataURL using the smallest image.
  const blurBuffer = await initialImage
    .clone()
    .blur()
    .resize(10)
    .toBuffer();

  return `export default ${JSON.stringify({
    src: isBuild ? 'TODO' : `${path}${new URLSearchParams([
      ['process', ''],
      ['initialScale', `${initialScale}`],
      ['scale', '1'],
    ]).toString()}`,
    srcSet: '',
    width: initialImageMeta.width,
    height: initialImageMeta.height,
    mime: 'image/png',
    blurDataURL: `data:image/png;base64,${blurBuffer.toString('base64')}`,
  })};`;
}

export function imagePlugin(): Plugin {
  let isBuild: boolean;
  const scales = [1, 2, 3];

  return {
    name: 'image',
    // The plugin must be run before the Vite's plugins, because Vite processes images as usual
    // static assets.
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    async load(id) {
      // Work only with local files.
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

      let initialScale = 3;
      if (searchParams.has('initialScale')) {
        initialScale = parseInt(searchParams.get('initialScale'));
      }

      if (!scales.includes(initialScale)) {
        throw new Error(`Initial scale must be in array [${scales.join(', ')}]`);
      }

      if (searchParams.has('scale')) {
        const scale = parseInt(searchParams.get('scale'));
        if (!scale) {
          throw new Error('rescale must be integer');
        }
        return rescale({ path, scale, initialScale, isBuild });
      }
      return process({ path, initialScale, isBuild, scales });
    },
  };
}