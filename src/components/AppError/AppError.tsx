import { type JSXElement, Show } from 'solid-js';

import image from './sad.png?process';
import './AppError.scss';

export function AppError(props: {
  title: JSXElement;
  subtitle?: JSXElement;
}) {
  const { webp, height, width, png } = image;
  const size = { width, height };

  return (
    <div class="app-error">
      <picture>
        <source class="app-error__image" type="image/webp" {...webp} {...size}/>
        <img class="app-error__image" alt="Something went wrong" {...png} {...size}/>
      </picture>
      <h1 class="app-error__title">
        {props.title}
      </h1>
      <Show when={props.subtitle}>
        <p class="app-error__subtitle">
          {props.subtitle}
        </p>
      </Show>
    </div>
  );
}