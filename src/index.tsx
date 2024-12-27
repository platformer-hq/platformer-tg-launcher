/* @refresh reload */
import { render } from 'solid-js/web';
import { retrieveLaunchParams, serializeLaunchParams } from '@telegram-apps/sdk-solid';

import { Root } from '@/components/Root.js';
import { init } from '@/init.js';

import './index.scss';
import './mockEnv.js';

init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

const lp = retrieveLaunchParams();
const searchParams = new URLSearchParams(window.location.search);
// const appId = parseInt(searchParams.get('app_id') || '', 10);
const appId = 1;
// const baseUrl = searchParams.get('api_base_url') || 'https://platformer.tg/api/gql';
const baseUrl = 'http://localhost:10000/gql';

render(() => (
  <Root
    appId={appId}
    baseUrl={baseUrl}
    platform={lp.platform}
    // TODO: We should use launch params raw representation. Otherwise, we may lose some
    //  useful data.
    launchParams={serializeLaunchParams(lp)}
    initData={lp.initDataRaw}
  />
), document.getElementById('root')!);

