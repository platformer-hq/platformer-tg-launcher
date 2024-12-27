import {
  $debug,
  initData,
  themeParams,
  viewport,
  init as initSDK,
} from '@telegram-apps/sdk-solid';

import { camelToKebab } from '@/helpers/camelToKebab.js';

export function init(debug: boolean) {
  // Set @telegram-apps/sdk-solid debug mode.
  $debug.set(debug);

  // Initialize special event handlers for Telegram Desktop, Android, iOS, etc.
  // Also, configure the package.
  initSDK();

  // Initialize required components.
  themeParams.mount();
  themeParams.bindCssVars();
  initData.restore();
  viewport.mount().then(() => {
    viewport.bindCssVars(prop => {
      const kebabed = camelToKebab(prop);
      return prop.startsWith('safeArea') || prop.startsWith('contentSafeArea')
        ? `--${kebabed}`
        : `--tg-viewport-${kebabed}`;
    });
  });

  // Add Eruda if needed.
  debug && import('eruda')
    .then(({ default: eruda }) => {
      eruda.init();
      eruda.position({
        x: window.innerWidth - 50,
        y: 0,
      });
    })
    .catch(console.error);
}