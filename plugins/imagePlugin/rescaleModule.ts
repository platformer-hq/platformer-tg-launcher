import sharp from 'sharp';
import { readFileSync } from 'node:fs';

export async function rescaleModule({ initialScale, isBuild, path, scale }: {
  path: string;
  scale: number;
  initialScale: number;
  isBuild: boolean;
}) {
  return;
  // const image = sharp(readFileSync(path));
  // const imageMeta = await image.metadata();
  //
  // const width = imageMeta.width * scale / initialScale | 0;
  // const height = imageMeta.height * scale / initialScale | 0;
  // // const rescaled =
  //
  // const images = scales.map(scale => {
  //   const width = imageMeta.width * scale / initialScale | 0;
  //   const height = imageMeta.height * scale / initialScale | 0;
  //
  //   return [
  //     image.clone().resize({ width, height }).png({
  //       compressionLevel: 6,
  //       quality: 60,
  //     }),
  //     { width, height },
  //   ] as const;
  // });
  //
  // // The image which was supposed to be used as the initial, the smallest one.
  // const [initialImage, initialImageMeta] = images[0];
  //
  // // Create blurDataURL using the smallest image.
  // const blurBuffer = await initialImage
  //   .clone()
  //   .blur()
  //   .resize(10)
  //   .toBuffer();
  //
  // return `export default ${JSON.stringify({
  //   src: isBuild ? 'TODO' : `${path}${new URLSearchParams([
  //     ['process', ''],
  //     ['initialScale', `${initialScale}`],
  //     ['scale', '1'],
  //   ]).toString()}`,
  //   srcSet: '',
  //   width: initialImageMeta.width,
  //   height: initialImageMeta.height,
  //   mime: 'image/png',
  //   blurDataURL: `data:image/png;base64,${blurBuffer.toString('base64')}`,
  // })};`;
}