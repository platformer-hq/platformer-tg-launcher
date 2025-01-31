import {
  createEffect, createMemo, createRenderEffect,
  createSignal,
  Match,
  mergeProps, onMount,
  Show, splitProps,
  Switch,
} from 'solid-js';

import { AppContainer } from '@/components/AppContainer/AppContainer.js';
import { AppNotFound } from '@/components/AppNotFound/AppNotFound.js';
import { AppLoadError, type AppLoadErrorError } from '@/components/AppLoadError/AppLoadError.js';
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
  abortSignal: AbortSignal;
  apiBaseURL: string;
  appID: number;
  fallbackURL?: Maybe<string>;
  initData: string;
  launchParams: string;
  loadTimeout: number;
  onError: (error: AppLoadErrorError, fallback?: boolean) => void;
  onReady: (fallback?: boolean) => void;
}) {
  const [$error, setError] = createSignal<AppLoadErrorError>();

  // Retrieve Platformer authorization token.
  const [$authToken] = createExecutionResource(props, async options => {
    const token = getAuthTokenFromStorage();
    return token ? [true, token] : authenticate(options);
  }, { onError: setError });

  // Retrieve application data.
  const [$app] = createExecutionResource(() => {
    const authToken = $authToken.state === 'ready' ? $authToken().token : undefined;
    return authToken ? mergeProps(props, { authToken }) : false;
  }, getAppUrl, { onError: setError });

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
          <Switch>
            <Match when={props.fallbackURL}>
              {$url => (
                <BootstrappedContainer
                  {...props}
                  url={$url()}
                  onReady={() => {
                    props.onReady(true);
                  }}
                  onError={error => {
                    props.onError(error, true);
                  }}
                />
              )}
            </Match>
            <Match when={true}>
              {(v) => {
                // We don't have a fallback URL. It means that the application failed to load,
                // and we have nothing to display instead of the error screen.
                onMount(() => {
                  props.onError($err());
                });
                return <AppLoadError error={$err()}/>;
              }}
            </Match>
          </Switch>
        )}
      </Match>
      <Match when={$app()}>
        {$tuple => (
          <Switch fallback={<AppNoURL/>}>
            <Match when={!$tuple()[0]}>
              <AppNotFound/>
            </Match>
            <Match when={$tuple()[1]}>
              {$url => (
                <BootstrappedContainer
                  {...props}
                  url={$url()}
                  onError={setError}
                />
              )}
            </Match>
          </Switch>
        )}
      </Match>
    </Switch>
  );
}

// /**
//  * Performs complete application load lifecycle.
//  */
// export function BootstrapApp(props: {
//   apiBaseURL: string;
//   appID: number;
//   fallbackURL?: Maybe<string>;
//   initData: string;
//   initTimeout: number;
//   launchParams: string;
//   loadTimeout: number;
//   onReady: () => void;
// }) {
//   // Contains an error, occurred during designed application bootstrapping flow.
//   const [$designedFlowError, setDesignedFlowError] =
//     createSignal<AppLoadErrorError>();
//   const [$fatalError, setFatalError] = createSignal<AppLoadErrorError>();
//   const $abortSignal = createTimeoutSignal(() => props.initTimeout);
//
//   // Retrieve Platformer authorization token.
//   const [$authToken] = createExecutionResource(
//     () => mergeProps(props, { abortSignal: $abortSignal() }),
//     async options => {
//       const token = getAuthTokenFromStorage();
//       return token ? [true, token] : authenticate(options);
//     },
//   );
//
//   // Retrieve application data.
//   const [$app] = createExecutionResource(
//     () => {
//       const authToken = $authToken.state === 'ready'
//         ? $authToken().token
//         : undefined;
//       return authToken ? mergeProps(props, { authToken }) : false;
//     },
//     getAppUrl,
//   );
//
//   // Set error in case something went wrong performing basic operations.
//   createEffect(() => {
//     [$app, $authToken].forEach($s => {
//       $s.state === 'errored' && setDesignedFlowError($s.error);
//     });
//   });
//
//   // When a fatal error occurs,
//   createEffect(() => {
//     $fatalError() && props.onReady();
//   });
//
//   createEffect(() => {
//     $designedFlowError() && !props.fallbackURL && setFatalError($designedFlowError());
//   });
//
//   return (
//     <Switch>
//       <Match when={$fatalError()}>
//         {$error => <AppLoadError error={$error()}/>}
//       </Match>
//       <Match when={$designedFlowError()}>
//         {$error => (
//           <Show when={props.fallbackURL} fallback={<AppLoadError error={$error()}/>}>
//             {$fallbackURL => {
//               // Create a correct fallback URL. As long as it may have a hash part, we should
//               // properly append launch parameters.
//               const url = new URL($fallbackURL());
//               let hash: string;
//               if (url.hash) {
//                 // We should use launch params and merge them with parameters, defined in
//                 // the URL hash.
//                 const qp = new URLSearchParams(props.launchParams);
//                 new URLSearchParams(url.hash.slice(1)).forEach((v, k) => {
//                   qp.set(k, v);
//                 });
//                 hash = qp.toString();
//               } else {
//                 hash = props.launchParams;
//               }
//               url.hash = `#${hash}`;
//
//               const fallbackURL = url.toString();
//               console.error('Failed to load application:', $error(), `Using fallback: ${fallbackURL}`);
//               return (
//                 <AppContainer
//                   url={fallbackURL}
//                   onReady={props.onReady}
//                   onError={() => {
//                     setDesignedFlowError(['iframe']);
//                   }}
//                   onTimeout={() => {
//                     setDesignedFlowError(['iframe', true]);
//                   }}
//                   loadTimeout={props.loadTimeout}
//                 />
//               );
//             }}
//           </Show>
//         )}
//       </Match>
//       <Match when={$app()}>
//         {$tuple => (
//           <Switch fallback={<AppNoURL/>}>
//             <Match when={!$tuple()[0]}>
//               <AppNotFound/>
//             </Match>
//             <Match when={$tuple()[1]}>
//               {$url => (
//                 <AppContainer
//                   url={$url()}
//                   onReady={props.onReady}
//                   onError={() => {
//                     setDesignedFlowError(['iframe']);
//                   }}
//                   onTimeout={() => {
//                     setDesignedFlowError(['iframe', true]);
//                   }}
//                   loadTimeout={props.loadTimeout}
//                 />
//               )}
//             </Match>
//           </Switch>
//         )}
//       </Match>
//     </Switch>
//   );
// }

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
  onReady: () => void;
}) {
  const [$error, setError] =
    createSignal<AppLoadErrorError>();
  const $abortSignal = createTimeoutSignal(() => props.initTimeout);

  return (
    <Switch>
      <Match when={$error()}>
        {$err => <AppLoadError error={$err()}/>}
      </Match>
      <Match when={true}>
        <BasicBootstrap
          abortSignal={$abortSignal()}
          {...props}
          onError={(error, fallback) => {
            fallback && console.error('Fallback URL failed to load:', props.fallbackURL);
            setError(error);
            props.onReady();
          }}
          onReady={(fallback) => {
            fallback && console.warn('Platformer failed to load. Used fallback:', props.fallbackURL);
            props.onReady();
          }}
        />
      </Match>
    </Switch>
  );
}