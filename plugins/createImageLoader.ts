import sharp, { type Sharp } from 'sharp';
import { readFileSync } from 'node:fs';

/**
 * Creates a key for cache.
 * @param path - original image absolute path
 * @param initialScale - original image initial scale
 * @param scale - target image scale
 */
function formatKey(path: string, initialScale: number, scale: number): string {
  return `${path}-${initialScale}-${scale}`;
}

/**
 * @returns A function loading images from filesystem, rescaling and compressing them.
 */
export function createImageLoader() {
  const initials = new Map<string, [image: Sharp, meta: {
    width: number;
    height: number;
  }]>();
  const processed = new Map<string, [image: Sharp, meta: {
    width: number;
    height: number;
    buffer: Buffer;
  }]>();

  return async function loadImage(path: string, initialScale: number, scale: number) {
    // Step 1: Retrieve a cached value.
    const key = formatKey(path, initialScale, scale);
    const cached = processed.get(key);
    if (cached) {
      return cached;
    }

    // Step 2: Retrieve the initial image.
    const initialKey = formatKey(path, initialScale, initialScale);
    let initialTuple = initials.get(initialKey);
    if (!initialTuple) {
      const initialSharp = sharp(readFileSync(path));
      const { width, height } = await initialSharp.metadata();
      initialTuple = [initialSharp, { width, height }];
      initials.set(initialKey, initialTuple);
    }

    // Step 3: Compress and rescale the image.
    const [initial, initialMeta] = initialTuple;
    const width = initialMeta.width * scale / initialScale | 0;
    const height = initialMeta.height * scale / initialScale | 0;
    const resized = initial
      .clone()
      .resize({ width, height })
      .png({ compressionLevel: 6, quality: 60 });

    const result = [resized, {
      width,
      height,
      buffer: await resized.toBuffer(),
    }] as [Sharp, { width: number; height: number; buffer: Buffer }];
    processed.set(formatKey(path, initialScale, scale), result);

    return result;
  };
}