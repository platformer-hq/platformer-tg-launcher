import { onCleanup, onMount } from 'solid-js';
import { postEvent } from '@telegram-apps/sdk-solid';
import { any, create, string, type } from 'superstruct';

import './AppContainer.scss';

/**
 * Container displaying and configuring wrapped mini application.
 */
export function AppContainer(props: {
  /**
   * Timeout in milliseconds determining how much time the wrapped mini application has
   * to load.
   */
  loadTimeout: number;
  /**
   * Will be called whenever the iframe failed to load.
   */
  onError(): void;
  /**
   * Will be called whenever the application notified about being ready.
   */
  onReady(): void;
  /**
   * Will be called whenever the application failed to load due to timeout.
   */
  onTimeout(): void;
  /**
   * URL of the mini application to open.
   */
  url: string;
}) {
  let iframe!: HTMLIFrameElement;

  // Give some time the mini application to load.
  // When the timeout is reached, notify the parent component about it.
  const timeoutID = setTimeout(props.onTimeout, props.loadTimeout);

  onMount(() => {
    const { contentWindow } = iframe;
    if (!contentWindow) {
      console.error('contentWindow is missing');
      return;
    }

    // Define iframe listeners to proxy all methods' calls to the Telegram client.
    // Also, do the same to proxy events from the Telegram client to the mini application.
    const onMessage = ({ data, source }: MessageEvent) => {
      let payload: { eventType: string; eventData?: any } | undefined;
      try {
        payload = create(JSON.parse(data), type({
          eventType: string(),
          eventData: any(),
        }));
      } catch (e) { /* empty */
      }

      if (payload) {
        if (source === contentWindow) {
          // Whenever the mini app notifies about it being ready, we should also notify the parent
          // component.
          if (payload.eventType === 'web_app_ready') {
            clearTimeout(timeoutID);
            props.onReady();
          }

          (postEvent as any)(payload.eventType, payload.eventData);
        } else {
          // TODO: Set target origin?
          contentWindow.postMessage(data, '*');
        }
      }
    };

    window.addEventListener('message', onMessage);
    onCleanup(() => {
      window.removeEventListener('message', onMessage);
    });
  });

  return (
    <iframe
      class="app-container"
      ref={iframe}
      src={props.url}
      onError={() => {
        clearTimeout(timeoutID);
        props.onError();
      }}
    />
  );
}