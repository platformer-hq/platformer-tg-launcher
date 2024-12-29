import { publicUrl } from '@/helpers/publicUrl.js';

export function createImgSources(baseUrl: string, ext: string, width: number, height: number) {
  const src = publicUrl(baseUrl + ext);
  return {
    src,
    srcSet: [1, 2, 3]
      .map(size => size === 1 ? src : publicUrl(`${baseUrl}@${size}x${ext} ${size}x`))
      .join(', '),
    width: `${width}px`,
    height: `${height}px`,
  };
}