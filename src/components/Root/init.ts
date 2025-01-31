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