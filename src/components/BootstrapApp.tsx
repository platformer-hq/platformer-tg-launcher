import {
  createEffect,
  createSignal,
  Match,
  mergeProps,
  Show,
  Switch,
} from 'solid-js';

import { AppContainer } from '@/components/AppContainer/AppContainer.js';
import { AppLoading } from '@/components/AppLoading/AppLoading.js';
import { AppNotFound } from '@/components/AppNotFound.js';
import { AppLoadError, type AppLoadErrorError } from '@/components/AppLoadError.js';
import { AppNoURL } from '@/components/AppNoURL/AppNoURL.js';
import { createAbortSignal } from '@/async/createAbortSignal.js';
import { createExecutionResource } from '@/helpers/createExecutionResource.js';
import { getStoredAuthToken, saveAuthToken } from '@/storage/auth-token.js';
import { authenticate } from '@/api/authenticate.js';
import { getAppUrl } from '@/api/getAppUrl.js';

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
  const [error, setError] = createSignal<AppLoadErrorError>();
  const [loading, setLoading] = createSignal(true);
  const abortSignal = createAbortSignal(props.initTimeout);

  // Hide the loader when an error occurred.
  createEffect(() => {
    error() && setLoading(false);
  });

  //#region Authorization token.
  const [authToken, setAuthToken] = createSignal<{ token: string; expiresAt: Date }>();
  createExecutionResource(
    props,
    (source, options) => {
      return getStoredAuthToken(options)
        .catch((e) => {
          console.error('getAuthToken returned error:', e);
        })
        .then(authToken => authToken
          ? [true, authToken] as [true, typeof authToken]
          : authenticate(source, options));
    },
    {
      abortSignal,
      onError: setError,
      onData(data) {
        setAuthToken(data);

        // Save the auth token for future usage.
        saveAuthToken(data.token, data.expiresAt).catch(e => {
          console.error('saveAuthToken returned error:', e);
        });
      },
    },
  );
  //#endregion

  //#region Application data.
  const [app, setApp] = createSignal<[
    found: boolean,
    url?: Maybe<string>
  ]>();
  createExecutionResource(
    () => {
      const token = authToken();
      return token ? mergeProps(props, { authToken: token.token }) : false;
    },
    getAppUrl,
    { abortSignal, onError: setError, onData: setApp },
  );
  //#endregion

  const onIframeError = (timeout?: boolean) => {
    setError(['iframe', timeout]);
  };
  const renderAppContainer = (url: string) => (
    <AppContainer
      url={url}
      onReady={() => {
        setLoading(false);
      }}
      onError={onIframeError}
      onTimeout={() => {
        onIframeError(true);
      }}
      loadTimeout={props.loadTimeout}
    />
  );

  return (
    <>
      <Show when={loading()}>
        <AppLoading/>
      </Show>
      <Show
        when={error()}
        fallback={
          <Show when={app()}>
            {v => (
              <Switch fallback={<AppNoURL/>}>
                <Match when={!v()[0]}>
                  <AppNotFound/>
                </Match>
                <Match when={v()[1]}>
                  {url => renderAppContainer(url())}
                </Match>
              </Switch>
            )}
          </Show>
        }
      >
        {err => (
          <Show when={props.fallbackURL} fallback={<AppLoadError error={err()}/>}>
            {url => {
              // TODO: Properly append launch params to URL. It may contain hash part.
              const fallbackURL = `${url()}#${props.launchParams}`;
              console.error('Failed to load application:', err(), `Using fallback: ${fallbackURL}`);
              return renderAppContainer(fallbackURL);
            }}
          </Show>
        )}
      </Show>
    </>
  );
}