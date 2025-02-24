import {
  createEffect,
  createSignal,
  Match,
  mergeProps,
  onMount,
  Show,
  splitProps,
  Switch,
} from 'solid-js';

import { AppContainer } from '@/components/AppContainer/AppContainer.js';
import { AppNotFound } from '@/components/AppNotFound/AppNotFound.js';
import {
  LauncherLoadError,
  type AppLoadErrorError,
} from '@/components/LauncherLoadError/LauncherLoadError.js';
import { AppNoURL } from '@/components/AppNoURL/AppNoURL.js';
import { createTimeoutSignal } from '@/async/createTimeoutSignal.js';
import { getAuthTokenFromStorage } from '@/storage/auth-token.js';
import { authenticate } from '@/api/authenticate.js';
import { getAppUrl } from '@/api/getAppUrl.js';
import { createExecutionResource } from '@/helpers/createExecutionResource.js';

function BootstrappedContainer(props: {
  loadTimeout: number;
  onError: (error: AppLoadErrorError) => void;
  onReady: () => void;
  url: string;
}) {
  const [picked] = splitProps(props, ['url', 'loadTimeout', 'onReady']);
  return (
    <AppContainer
      {...picked}
      onError={() => {
        props.onError(['iframe']);
      }}
      onTimeout={() => {
        props.onError(['iframe', true]);
      }}
    />
  );
}

function BasicBootstrap(props: {
  apiBaseURL: string;
  appID: number;
  fallbackURL?: Maybe<string>;
  initDataSanitized: string;
  initTimeout: number;
  launchParams: string;
  launchParamsSanitized: string;
  loadTimeout: number;
  onError: (error: AppLoadErrorError, fallbackURL?: string) => void;
  onReady: (fallbackURL?: string) => void;
}) {
  const $abortSignal = createTimeoutSignal(() => props.initTimeout);
  const [$error, setError] = createSignal<AppLoadErrorError>();
  const requestsOptions = () => mergeProps(props, {
    abortSignal: $abortSignal(),
    launchParams: props.launchParamsSanitized,
    initData: props.initDataSanitized,
  });

  // Retrieve Platformer authorization token.
  const [$authToken] = createExecutionResource(requestsOptions, async options => {
    const token = getAuthTokenFromStorage();
    return token ? [true, token] : authenticate(options);
  }, { onError: setError });

  // Retrieve application data.
  const [$app] = createExecutionResource(
    () => {
      const authToken = $authToken.state === 'ready' ? $authToken().token : undefined;
      return authToken ? mergeProps(requestsOptions(), { authToken }) : false;
    },
    getAppUrl,
    { onError: setError },
  );

  // If some error occurred, and we have no fallback URL specified, we should notify the parent
  // component about the error.
  createEffect(() => {
    const e = $error();
    e && !props.fallbackURL && props.onError(e);
  });

  return (
    <Switch>
      <Match when={$error()}>
        {$err => (
          <Show
            when={props.fallbackURL}
            fallback={(() => {
              // We don't have a fallback URL. It means that the application failed to load,
              // and we have nothing to display instead of the error screen.
              onMount(() => {
                props.onError($err());
              });
              return <LauncherLoadError error={$err()}/>;
            })()}
          >
            {$url => (
              <BootstrappedContainer
                {...props}
                url={$url()}
                onReady={() => {
                  props.onReady($url());
                }}
                onError={error => {
                  props.onError(error, $url());
                }}
              />
            )}
          </Show>
        )}
      </Match>
      <Match when={$app()}>
        {$tuple => (
          <Switch fallback={<AppNoURL/>}>
            <Match when={$tuple()[1]}>
              {$url => (
                <BootstrappedContainer
                  {...props}
                  url={$url()}
                  onError={setError}
                />
              )}
            </Match>
            <Match
              when={
                !$tuple()[1]
                  ? $tuple()[0]
                    ? 'no-url'
                    : 'no-app'
                  : false
              }
            >
              {$type => {
                onMount(() => {
                  props.onReady();
                });

                return (
                  <Show when={$type() === 'no-app'} fallback={<AppNoURL/>}>
                    <AppNotFound/>
                  </Show>
                );
              }}
            </Match>
          </Switch>
        )}
      </Match>
    </Switch>
  );
}

/**
 * Performs complete application load lifecycle.
 */
export function BootstrapApp(props: {
  apiBaseURL: string;
  appID: number;
  fallbackURL?: Maybe<string>;
  initDataSanitized: string;
  initTimeout: number;
  launchParams: string;
  launchParamsSanitized: string;
  loadTimeout: number;
  onReady: () => void;
}) {
  const [$error, setError] = createSignal<AppLoadErrorError>();

  return (
    <Switch>
      <Match when={$error()}>
        {$err => <LauncherLoadError error={$err()}/>}
      </Match>
      <Match when={true}>
        <BasicBootstrap
          {...props}
          onError={(error, fallbackURL) => {
            fallbackURL && console.error('Fallback URL failed to load:', fallbackURL);
            setError(error);
            props.onReady();
          }}
          onReady={(fallbackURL) => {
            fallbackURL && console.warn('Platformer failed to load. Used fallback:', fallbackURL);
            props.onReady();
          }}
        />
      </Match>
    </Switch>
  );
}