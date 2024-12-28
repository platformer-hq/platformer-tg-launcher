import { type JSXElement, Show } from 'solid-js';

import { createImgSources } from '@/helpers/createImgSources.js';

import './AppError.scss';

export function AppError(props: {
  title: JSXElement;
  subtitle?: JSXElement;
}) {
  return (
    <div class="app-error">
      <img
        class="app-error__image"
        alt="Something went wrong"
        {...createImgSources('/img/sad/sad', '.png', 176, 176)}
      />
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