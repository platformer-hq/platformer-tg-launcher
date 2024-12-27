/* @refresh reload */
import { render } from 'solid-js/web';
import { retrieveLaunchParams, serializeLaunchParams } from '@telegram-apps/sdk-solid';

import { Root } from '@/components/Root/Root.js';
import { init } from '@/init.js';

import './index.scss';
import './mockEnv.js';

const lp = retrieveLaunchParams();
const searchParams = new URLSearchParams(
  // Telegram API has a bug replacing & with &amp; for some reason. We are replacing it back.
  window.location.search.replace(/&amp;/g, '&'),
);

// Compute the base URL for API requests. It can either be a relative or absolute path.
const baseUrl = new URL(
  searchParams.get('api_base_url') || 'https://platformer.tg/api/gql',
  window.location.origin,
).toString();

init(lp.startParam === 'debug' || import.meta.env.DEV);

render(() => (
  <Root
    appId={parseInt(searchParams.get('app_id') || '', 10)}
    baseUrl={baseUrl}
    platform={lp.platform}
    // TODO: We should use launch params raw representation. Otherwise, we may lose some
    //  useful data.
    launchParams={serializeLaunchParams(lp)}
    initData={lp.initDataRaw}
  />
), document.getElementById('root')!);

