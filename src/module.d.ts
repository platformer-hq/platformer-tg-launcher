declare module '*.png?process' {
  export default {} as {
    blurDataURL: string;
    height: number;
    mime: 'image/png';
    src: string;
    srcSet: string;
    width: number;
  };
}