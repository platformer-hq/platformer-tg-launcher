declare module '*.png?process' {
  interface ImageMeta {
    src: string;
    srcSet: string;
    width: number;
    height: number;
    mime: 'image/png';
    blurDataURL: string;
  }

  const meta: ImageMeta;
  export default meta;
}