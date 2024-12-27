import { ErrorBoundary, Switch, Match } from 'solid-js';

import { App, type AppProps } from '@/components/App/App.js';

function ErrorBoundaryError(error: unknown, reset: () => void) {
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

export function Root(props: AppProps) {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <App {...props} />
    </ErrorBoundary>
  );
}
