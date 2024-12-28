import { ErrorBoundary, Switch, Match } from 'solid-js';
import type { Platform } from '@telegram-apps/sdk-solid';

import { InvalidAppID } from '@/components/InvalidAppID.js';
import { InvalidInitData } from '@/components/InvalidInitData.js';
import { BootstrapApp } from '@/components/BootstrapApp.js';

import './Root.scss';

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
  /**
   * The application identifier to display.
   */
  appId?: Maybe<number>;
  /**
   * API base URL.
   */
  baseUrl: string;
  /**
   * Fallback URL to use in case something went wrong with Platformer.
   */
  fallbackUrl?: Maybe<string>;
  /**
   * Mini app init data.
   */
  initData?: Maybe<string>;
  /**
   * Mini app launch parameters.
   */
  launchParams: string;
  /**
   * Mini Apps platform name.
   */
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
