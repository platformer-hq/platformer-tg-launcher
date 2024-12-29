import type { Sharp } from 'sharp';

export function rescale({ image, scale, initial }: {
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