import { createMemo, createResource, createSignal, ErrorBoundary, Show } from 'solid-js';
import {
  type Platform,
  retrieveLaunchParams,
  retrieveRawLaunchParams,
  retrieveRawInitData,
  transformQueryUsing,
} from '@telegram-apps/sdk-solid';
import {
  instance,
  looseObject,
  optional,
  pipe,
  string,
  transform,
  parse,
  ValiError,
  union,
} from 'valibot';

import { BootstrapApp } from '@/components/BootstrapApp/BootstrapApp.js';
import { RootErrorBoundary } from '@/components/RootErrorBoundary/RootErrorBoundary.js';
import { positiveIntFromStr } from '@/validation/positiveIntFromStr.js';
import { splitExecutionTuple } from '@/helpers/splitExecutionTuple.js';
import { LauncherError } from '@/components/LauncherError/LauncherError.js';
import { init } from '@/components/Root/init.js';
import { AppLoading } from '@/components/AppLoading/AppLoading.js';

import './Root.scss';

function useLauncherOptions() {
  return splitExecutionTuple<{
    appID: number;
    apiBaseURL: string;
    fallbackURL?: Maybe<string>;
    initTimeout: number;
    loadTimeout: number;
  }, string>(() => {
    try {
      const argsObject = parse(
        pipe(
          union([instance(URLSearchParams), string()]),
          transformQueryUsing(
            looseObject({
              app_id: positiveIntFromStr(),
              api_base_url: optional(
                pipe(
                  string(),
                  transform(v => new URL(v, window.location.origin).toString()),
                ),
                'https://platformer.tg/api/gql',
              ),
              fallback_url: optional(string()),
              init_timeout: optional(positiveIntFromStr(), '5000'),
              load_timeout: optional(positiveIntFromStr(), '10000'),
            }),
          ),
        ),
        new URLSearchParams(
          // Telegram API has a bug replacing & with &amp; for some reason. We are replacing it back.
          window.location.search.replace(/&amp;/g, '&'),
        ),
      );
      return [true, {
        appID: argsObject.app_id,
        apiBaseURL: argsObject.api_base_url,
        fallbackURL: argsObject.fallback_url,
        initTimeout: argsObject.init_timeout,
        loadTimeout: argsObject.load_timeout,
      }];
    } catch (e) {
      return [false, (e as ValiError<never>).message];
    }
  });
}

function Inner() {
  const [$options, $error] = useLauncherOptions();
  const {
    tgWebAppPlatform: platform,
    tgWebAppStartParam: startParam,
  } = retrieveLaunchParams();

  // Initialize the SDK.
  const [resource] = createResource(() => {
    return init((startParam || '').includes('platformer_debug') || import.meta.env.DEV);
  });

  // Wait for the bootstrapper to load.
  const [bootstrapperReady, setBootstrapperReady] = createSignal(false);

  // We are sanitizing the hash property for security purposes, so Platformer could not use this
  // init data to impersonate user.
  // Instead, Platformer uses the "signature" property allowing third parties to validate the
  // init data.
  const sanitizedInitDataQuery = new URLSearchParams(retrieveRawInitData() || '');
  sanitizedInitDataQuery.set('hash', '');
  const sanitizedInitData = sanitizedInitDataQuery.toString();

  // We also do the same with the launch parameters which are also sent to Platformer.
  const rawLaunchParams = retrieveRawLaunchParams();
  const sanitizedLaunchParamsQuery = new URLSearchParams(retrieveRawLaunchParams());
  sanitizedLaunchParamsQuery.set('tgWebAppData', sanitizedInitData);
  const sanitizedLaunchParams = sanitizedLaunchParamsQuery.toString();

  return (
    <main
      classList={{
        'root': true,
        // TODO: We should probably not add this class only when the platform is mobile. We
        //  should do it only if the platform is mobile and the wrapped mini app wants to solve
        //  the problem, solved by this class.
        'root--mobile': (['android', 'android_x', 'ios'] satisfies Platform[]).includes(platform),
      }}
    >
      <Show
        when={$options.ok() && $options()}
        fallback={<LauncherError title="Configuration is invalid" subtitle={$error()}/>}
      >
        {$data => (
          <Show
            when={sanitizedInitData}
            fallback={
              <LauncherError
                title="Init data is missing"
                subtitle="For some reason, init data is missing. It is the most likely that the application was launched improperly"
              />
            }
          >
            {$initData => {
              // Compute fallback URL in case something went wrong with Platformer.
              const $fallbackURL = createMemo(() => {
                const { fallbackURL } = $data();
                if (!fallbackURL) {
                  return;
                }

                // Create a correct fallback URL.
                // As long as it may have a hash part, we should properly append launch parameters.
                const url = new URL(fallbackURL);
                let hash: string;
                if (url.hash) {
                  // We should use launch params and merge them with parameters, defined in
                  // the URL hash.
                  const qp = new URLSearchParams(sanitizedLaunchParams);
                  new URLSearchParams(url.hash.slice(1)).forEach((v, k) => {
                    qp.set(k, v);
                  });
                  hash = qp.toString();
                } else {
                  hash = sanitizedLaunchParams;
                }
                url.hash = `#${hash}`;

                return url.toString();
              });

              return (
                <>
                  <Show when={!bootstrapperReady() || resource.loading}>
                    <AppLoading/>
                  </Show>
                  <BootstrapApp
                    {...$data()}
                    fallbackURL={$fallbackURL()}
                    initDataSanitized={$initData()}
                    launchParams={rawLaunchParams}
                    launchParamsSanitized={sanitizedLaunchParams}
                    onReady={() => {
                      setBootstrapperReady(true);
                    }}
                  />
                </>
              );
            }}
          </Show>
        )}
      </Show>
    </main>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={RootErrorBoundary}>
      <Inner/>
    </ErrorBoundary>
  );
}
