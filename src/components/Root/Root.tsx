import { ErrorBoundary, Switch, Match } from 'solid-js';
import type { Platform } from '@telegram-apps/sdk-solid';

import { InvalidAppID } from '@/components/InvalidAppID/InvalidAppID.js';
import { InvalidInitData } from '@/components/InvalidInitData/InvalidInitData.js';
import { BootstrapApp } from '@/components/BootstrapApp.js';

function ErrorBoundaryError(error: unknown) {
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

export function Root(props: {
  appId?: Maybe<number>;
  baseUrl: string;
  initData?: Maybe<string>;
  launchParams: string;
  platform: Platform;
}) {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <main
        classList={{
          'root': true,
          'root--mobile': ([
            'android',
            'android_x',
            'ios',
          ] satisfies Platform[]).includes(props.platform),
        }}
      >
        <Switch>
          <Match when={!props.appId}>
            <InvalidAppID/>
          </Match>
          <Match when={!props.initData}>
            <InvalidInitData/>
          </Match>
          <Match
            when={props.appId && props.initData
              ? [props.appId, props.initData] as const
              : false}
          >
            {tuple => (
              <BootstrapApp
                appId={tuple()[0]}
                baseUrl={props.baseUrl}
                launchParams={props.launchParams}
                initData={tuple()[1]}
              />
            )}
          </Match>
        </Switch>
      </main>
    </ErrorBoundary>
  );
}
