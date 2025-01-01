import { type JSXElement, Show } from 'solid-js';

import { Picture } from '@/components/Picture/Picture.js';

import image from './sad.png?process';
import './AppError.scss';

export function AppError(props: {
  title: JSXElement;
  subtitle?: JSXElement;
}) {
  return (
    <div class="app-error">
      <Picture {...image} class="app-error__image"/>
      <h1 class="app-error__title">{props.title}</h1>
      <Show when={props.subtitle}>
        <p class="app-error__subtitle">
          {props.subtitle}
        </p>
      </Show>
    </div>
  );
}