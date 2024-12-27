import { Match, Switch } from 'solid-js';
import type { Platform } from '@telegram-apps/sdk-solid';

import { PageInvalidAppID } from '@/components/PageInvalidAppID/PageInvalidAppID.js';
import { Bootstrapper } from '@/components/Bootstrapper/Bootstrapper.js';

import './App.scss';

export interface AppProps {
  appId?: Maybe<number>;
  baseUrl: string;
  initData?: Maybe<string>;
  launchParams: string;
  platform: Platform;
}

export function App(props: AppProps) {
  return (
    <main
      classList={{
        'app': true,
        'app--mobile': ([
          'android',
          'android_x',
          'ios',
        ] satisfies Platform[]).includes(props.platform),
      }}
    >
      <Switch>
        <Match when={!props.appId}>
          <PageInvalidAppID/>
        </Match>
        <Match when={props.appId}>
          {appId => (
            <Bootstrapper
              appId={appId()}
              baseUrl={props.baseUrl}
              launchParams={props.launchParams}
              initData={props.initData}
            />
          )}
        </Match>
      </Switch>
    </main>
  );
}
