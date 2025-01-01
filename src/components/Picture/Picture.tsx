import { createMemo, mergeProps, splitProps } from 'solid-js';
import { mergeClassNames } from '@telegram-apps/sdk-solid';

import './Picture.scss';

interface ImageVariant {
  src: string;
  srcSet: string;
}

/**
 * Displays webp/png image.
 */
export function Picture(props: {
  class?: string;
  classes?: {
    root?: string;
    image?: string;
  };
  alt?: string;
  width: number;
  height: number;
  webp: ImageVariant;
  png: ImageVariant;
}) {
  const classes = createMemo(() => {
    return mergeClassNames({ root: ['picture', props.class] }, props.classes);
  });
  const sharedProps = createMemo(() => {
    const [size] = splitProps(props, ['width', 'height']);
    return mergeProps(size, { class: classes().image });
  });

  return (
    <picture class={classes().root}>
      <source {...sharedProps()} type="image/webp" {...props.webp}/>
      <img {...sharedProps()} alt={props.alt} {...props.png}/>
    </picture>
  );
}