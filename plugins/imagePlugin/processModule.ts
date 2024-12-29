import sharp from 'sharp';
import { readFileSync } from 'node:fs';

import { rescale } from './rescale';
import type { ProcessedImage } from './types';

export async function processModule({ initialScale, isBuild, path, scales }: {
  path: string;
  initialScale: number;
  isBuild: boolean;
  scales: number[];
}) {
  const image = sharp(readFileSync(path));
  const imageMeta = await image.metadata();
  const [initialImage, initialImageMeta] = rescale({
    image: image,
    scale: scales[0],
    initial: {
      scale: initialScale,
      width: imageMeta.width,
      height: imageMeta.height,
    },
  });

  // Create blurDataURL using the smallest image.
  const blurBuffer = await initialImage
    .clone()
    .blur()
    .resize(10)
    .toBuffer();

  const pathWithRescale = (scale: number) => {
    return `/process-image?${new URLSearchParams([
      ['path', path],
      ['initialScale', `${initialScale}`],
      ['scale', `${scale}`],
    ]).toString()}`;
  };

  return `export default ${JSON.stringify({
    src: isBuild ? 'TODO' : pathWithRescale(1),
    srcSet: isBuild ? '' : scales
      .map(scale => `${pathWithRescale(scale)} ${scale}x`)
      .join(', '),
    width: initialImageMeta.width,
    height: initialImageMeta.height,
    mime: 'image/png',
    blurDataURL: `data:image/png;base64,${blurBuffer.toString('base64')}`,
  } satisfies ProcessedImage)};`;
}