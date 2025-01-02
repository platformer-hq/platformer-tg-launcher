import { type Accessor, createMemo, Show } from 'solid-js';

import { GetAuthToken } from '@/components/requests/GetAuthToken.js';
import { GetAppURL } from '@/components/requests/GetAppURL.js';
import { AppContainer } from '@/components/AppContainer/AppContainer.js';
import { AppLoading } from '@/components/AppLoading/AppLoading.js';
import { AppNotFound } from '@/components/AppNotFound.js';
import { RequestError } from '@/components/RequestError.js';
import { AppNoURL } from '@/components/AppNoURL/AppNoURL.js';
import { createAbortSignal } from '@/async/createAbortSignal.js';
import type { GqlRequestError } from '@/api/gqlRequest.js';

/**
 * Performs complete application load lifecycle.
 */
export function BootstrapApp(props: {
  apiBaseURL: string;
  appID: number;
  fallbackURL?: Maybe<string>;
  initData: string;
  initTimeout: number;
  launchParams: string;
  loadTimeout: number;
}) {
  const initAbortSignal = createAbortSignal(() => props.initTimeout);
  const renderAppContainer = (url: Accessor<string>) => (
    <AppContainer
      url={url()}
      loadTimeout={props.loadTimeout}
    />
  );
  const sharedProps = createMemo(() => ({
    abortSignal: initAbortSignal,
    appNotFound: <AppNotFound/>,
    error(error: Accessor<GqlRequestError>) {
      return (
        <Show when={props.fallbackURL} fallback={<RequestError error={error()}/>}>
          {renderAppContainer}
        </Show>
      );
    },
    loading: <AppLoading/>,
  }));

  return (
    <GetAuthToken {...props} {...sharedProps()}>
      {authToken => (
        <GetAppURL
          {...props}
          {...sharedProps()}
          authToken={authToken().token}
          noURL={<AppNoURL/>}
        >
          {renderAppContainer}
        </GetAppURL>
      )}
    </GetAuthToken>
  );
}