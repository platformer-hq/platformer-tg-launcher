import { onCleanup, onMount } from 'solid-js';
import { postEvent } from '@telegram-apps/sdk-solid';
import { any, create, string, type } from 'superstruct';

import './AppContainer.scss';

/**
 * Displays the application and configures
 */
export function AppContainer(props: {
  url: string;
  loadTimeout: number;
}) {
  let iframe!: HTMLIFrameElement;

  // TODO: Use loadTimeout

  // Proxy all Mini Apps events:
  // 1. From the Telegram client to the mini app.
  // 2. From the mini app to the Telegram client.
  onMount(() => {
    const { contentWindow } = iframe;
    if (!contentWindow) {
      console.error('contentWindow is missing');
      return;
    }

    const onMessage = ({ data, source }: MessageEvent) => {
      try {
        payload = create(JSON.parse(data), type({
          eventType: string(),
          eventData: any(),
        }));
        if (source === contentWindow) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (postEvent as any)(payload.eventType, payload.eventData);
        } else {
          contentWindow.postMessage(data, '*');
        }
      } catch (e) { /* empty */
        console.error(e);
      }
    };
    window.addEventListener('message', onMessage);
    onCleanup(() => {
      window.removeEventListener('message', onMessage);
    });
  });

  return <iframe ref={iframe} class="app-container" src={props.url}/>;
}