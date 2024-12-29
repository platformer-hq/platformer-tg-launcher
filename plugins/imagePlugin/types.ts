export interface ProcessedImage {
  src: string;
  srcSet: string;
  width: number;
  height: number;
  mime: 'image/png';
  blurDataURL: string;
}