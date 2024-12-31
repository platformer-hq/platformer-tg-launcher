import {
  type Component,
  createEffect,
  createResource,
  type JSXElement,
  onCleanup,
  Show,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { getAuthToken, saveAuthToken } from '@/storage/auth-token.js';
import { authenticate } from '@/api/authenticate.js';
import { GqlResponseResource } from '@/components/GqlResponseResource.js';

/**
 * Retrieves the auth token and passes it to the children.
 */
export function GetAuthToken(props: {
  AppNotFound: Component;
  Loading: Component;
  UnknownError: Component;
  appID: number;
  apiBaseURL: string;
  children: (authToken: () => {
    token: string;
    expiresAt: Date;
  }) => JSXElement;
  initData: string;
}) {
  const [resource] = createResource(
    () => ({ appID: props.appID, apiBaseURL: props.apiBaseURL, initData: props.initData }),
    async (meta) => {
      // Try to retrieve previously saved token.
      const authToken = await getAuthToken({ timeout: 5000 }).catch((e) => {
        console.error('getAuthToken returned error:', e);
      });

      return authToken
        ? ['ok', authToken] as ['ok', typeof authToken]
        // Authenticate using Platformer API.
        : authenticate(meta.apiBaseURL, meta.appId, meta.initData);
    },
  );

  createEffect(() => {
    if (resource.state === 'ready') {
      const data = resource();
      if (data[0] === 'ok') {
        // We don't wait for the token to be saved, it is not really important.
        const promise = saveAuthToken(data[1].token, data[1].expiresAt).catch(e => {
          console.error('saveAuthToken returned error:', e);
        });

        onCleanup(() => {
          promise.cancel();
        });
      }
    }
  });

  return (
    <GqlResponseResource
      {...props}
      Error={error => {
        const isAppNotFound = () => {
          const v = error();
          return v[0] === 'gql' && v[1].some(err => err.code === 'ERR_APP_NOT_FOUND');
        };

        console.warn(error())

        return (
          <Show when={isAppNotFound()} fallback={<Dynamic component={props.UnknownError}/>}>
            <Dynamic component={props.AppNotFound}/>
          </Show>
        );
      }}
      resource={resource}
    />
  );
}