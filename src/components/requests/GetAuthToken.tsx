import {
  type Component,
  createEffect,
  createResource,
  type JSXElement,
  onCleanup,
  Show,
  splitProps,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { getAuthToken, saveAuthToken } from '@/storage/auth-token.js';
import { authenticate } from '@/api/authenticate.js';
import { GqlResponseResource } from '@/components/requests/GqlResponseResource.js';
import type { GqlRequestError } from '@/api/gqlRequest.js';

/**
 * Retrieves the auth token and passes it to the children.
 */
export function GetAuthToken(props: {
  AppNotFound: Component;
  Loading: Component;
  UnknownError: Component<{ error: GqlRequestError }>;
  apiBaseURL: string;
  appID: number;
  children: (authToken: () => {
    token: string;
    expiresAt: Date;
  }) => JSXElement;
  initData: string;
}) {
  const [pickedProps] = splitProps(props, ['appID', 'apiBaseURL', 'initData']);
  const [resource] = createResource(
    () => pickedProps,
    async (meta) => {
      // Try to retrieve previously saved token.
      const authToken = await getAuthToken({ timeout: 5000 }).catch((e) => {
        console.error('getAuthToken returned error:', e);
      });

      return authToken
        ? [true, authToken] as [true, typeof authToken]
        // Authenticate using Platformer API.
        : authenticate(meta.apiBaseURL, meta.appID, meta.initData);
    },
  );

  createEffect(() => {
    if (resource.state === 'ready') {
      const data = resource();
      if (data[0]) {
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

        return (
          <Show
            when={isAppNotFound()}
            fallback={<Dynamic component={props.UnknownError} error={error()}/>
          }>
            <Dynamic component={props.AppNotFound}/>
          </Show>
        );
      }}
      resource={resource}
    />
  );
}