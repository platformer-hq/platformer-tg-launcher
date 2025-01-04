import { ErrorBoundary, Show, For } from 'solid-js';
import {
  type Platform,
  retrieveLaunchParams,
  serializeLaunchParams,
} from '@telegram-apps/sdk-solid';
import {
  coerce,
  create,
  defaulted,
  instance,
  string,
  type StructError,
  type,
} from 'superstruct';

import { BootstrapApp } from '@/components/BootstrapApp.js';
import { RootErrorBoundary } from '@/components/RootErrorBoundary.js';
import { PositiveIntFromStr } from '@/validation/PositiveIntFromStr.js';
import { maybe } from '@/validation/maybe.js';
import { splitExecutionTuple } from '@/helpers/splitExecutionTuple.js';
import { AppError } from '@/components/AppError/AppError.js';

import './Root.scss';

function Inner() {
  const lp = retrieveLaunchParams();
  const [args, error] = splitExecutionTuple<{
    appID: number;
    apiBaseURL: string;
    fallbackURL?: Maybe<string>;
    initTimeout: number;
    loadTimeout: number;
  }, [field: string, reason: string][]>(() => {
    try {
      const argsObj = create(
        new URLSearchParams(
          // Telegram API has a bug replacing & with &amp; for some reason. We are replacing it back.
          window.location.search.replace(/&amp;/g, '&'),
        ),
        coerce(
          type({
            app_id: PositiveIntFromStr,
            api_base_url: defaulted(string(), 'https://platformer.tg/api/gql'),
            fallback_url: maybe(string()),
            init_timeout: defaulted(PositiveIntFromStr, 5000),
            load_timeout: defaulted(PositiveIntFromStr, 10000),
          }),
          instance(URLSearchParams),
          searchParams => Object.fromEntries(searchParams.entries()),
        ),
      );
      return [true, {
        appID: argsObj.app_id,
        apiBaseURL: new URL(argsObj.api_base_url, window.location.origin).toString(),
        fallbackURL: argsObj.fallback_url,
        initTimeout: argsObj.init_timeout,
        loadTimeout: argsObj.load_timeout,
      }];
    } catch (e) {
      return [false, (e as StructError).failures().map(f => [f.key, f.message])];
    }
  });

  return (
    <main
      classList={{
        'root': true,
        // TODO: We should probably not add this class only when the platform is mobile. We
        //  should do it only if the platform is mobile and the wrapped mini app wants to solve
        //  the problem, solved by this class.
        'root--mobile': ([
          'android',
          'android_x',
          'ios',
        ] satisfies Platform[]).includes(lp.platform),
      }}
    >
      <Show
        when={args.ok() && args()}
        fallback={
          <AppError
            title="Configuration is invalid"
            subtitle={
              <For each={error()}>
                {(item, idx) => (
                  <>
                    {idx() ? ', ' : ''}
                    <b>{item[0]}</b>
                    &nbsp;
                    <i>({item[1]})</i>
                  </>
                )}
              </For>
            }
          />
        }
      >
        {data => (
          <Show
            when={lp.initDataRaw}
            fallback={
              <AppError
                title="Init data is missing"
                subtitle="For some reason, init data is missing. It is more likely that the application was launched improperly"
              />
            }
          >
            {initData => (
              <BootstrapApp
                {...data()}
                // TODO: We should use launch params raw representation. Otherwise, we may lose some
                //  useful data.
                launchParams={serializeLaunchParams(lp)}
                initData={initData()}
              />
            )}
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
