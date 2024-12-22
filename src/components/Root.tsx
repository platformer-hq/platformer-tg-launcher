import { ErrorBoundary, Switch, Match } from 'solid-js';
import {
  retrieveLaunchParams,
  serializeLaunchParams,
} from '@telegram-apps/sdk-solid';

import { App } from '@/components/App/App.js';

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

export function Root() {
  const lp = retrieveLaunchParams();
  const searchParams = new URLSearchParams(window.location.search);
  // const appId = parseInt(searchParams.get('app_id') || '', 10);
  const appId = 1;
  // const baseUrl = searchParams.get('api_base_url') || 'https://platformer.tg/api/gql';
  const baseUrl = 'http://localhost:10000/gql';

  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <App
        appId={appId}
        baseUrl={baseUrl}
        platform={lp.platform}
        // TODO: We should use launch params raw representation. Otherwise, we may lose some
        //  useful data.
        launchParams={serializeLaunchParams(lp)}
        initData={lp.initDataRaw || ''}
      />
    </ErrorBoundary>
  );
}
