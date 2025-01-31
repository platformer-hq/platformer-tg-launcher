import { Match, Switch } from 'solid-js';

/**
 * Error boundary used in the application's root.
 */
export function RootErrorBoundary(error: unknown) {
  return (
    <div>
      <p>ErrorBoundary handled error:</p>
      <blockquote>
        <code>
          <Switch fallback={JSON.stringify(error)}>
            <Match when={typeof error === 'string' ? error : false}>
              {v => v()}
            </Match>
            <Match when={error instanceof Error ? error.message : false}>
              {v => v()}
            </Match>
          </Switch>
        </code>
      </blockquote>
    </div>
  );
}