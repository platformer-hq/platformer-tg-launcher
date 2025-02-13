import {
  setDebug,
  initData,
  mountThemeParams,
  init as initSDK,
  bindThemeParamsCssVars,
  mountViewport,
  bindViewportCssVars,
} from '@telegram-apps/sdk-solid';

import { camelToKebab } from '@/helpers/camelToKebab.js';

export async function init(debug: boolean) {
  setDebug(debug);
  initSDK();

  // Init Mixpanel.
  import('mixpanel-browser')
    .then(({ default: mixpanel }) => {
      mixpanel.init('cd00b1f58f9d1fab5d5407fadcf2fba9', {
        debug,
        track_pageview: true,
        persistence: 'localStorage',
      });
    })
    .catch(e => {
      console.error('Something went wrong with Mixpanel:', e);
    });

  // Init Sentry.
  import('./sentry.js')
    .then(({ init }) => {
      init({
        dsn: 'https://8888815a88eb8e06bd1ac55195df9ab0@o992980.ingest.us.sentry.io/4508812774473728',
        environment: import.meta.env.MODE,
        debug,
      });
    })
    .catch(e => {
      console.error('Something went wrong with Sentry:', e);
    });

  // Add Eruda if needed.
  debug && import('eruda')
    .then(({ default: eruda }) => {
      eruda.init();
      eruda.position({ x: window.innerWidth - 50, y: 0 });
    })
    .catch(console.error);

  // Initialize required components.
  initData.restore();

  await Promise.all([
    mountThemeParams().then(() => {
      bindThemeParamsCssVars();
    }),
    mountViewport().then(() => {
      bindViewportCssVars(prop => {
        const kebabed = camelToKebab(prop);
        return prop.startsWith('safeArea') || prop.startsWith('contentSafeArea')
          ? `--${kebabed}`
          : `--viewport-${kebabed}`;
      });
    }),
  ]);
}