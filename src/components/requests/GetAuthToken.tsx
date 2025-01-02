import { createEffect, type JSXElement, Show } from 'solid-js';
import type { CancelablePromise } from '@telegram-apps/sdk-solid';

import { getAuthToken, saveAuthToken } from '@/storage/auth-token.js';
import { authenticate, type AuthenticateOptions } from '@/api/authenticate.js';
import { Resource } from '@/components/Resource.js';
import type { RequestComponentProps } from '@/components/requests/types.js';

/**
 * Retrieves the auth token and passes it to the children.
 */
export function GetAuthToken(
  props: RequestComponentProps<{ token: string; expiresAt: Date }, AuthenticateOptions, {
    appNotFound: JSXElement;
  }>,
) {
  return (
    <Resource
      {...props}
      fetcher={(source, options) => {
        // Try to retrieve previously saved token.
        return getAuthToken(options)
          .catch((e) => {
            console.error('getAuthToken returned error:', e);
          })
          .then(authToken => authToken
            ? [true, authToken] as [true, typeof authToken]
            // Authenticate using Platformer API.
            : authenticate(source, options));
      }}
      error={error => {
        const isAppNotFound = () => {
          const v = error();
          return v[0] === 'gql' && v[1].some(err => err.code === 'ERR_APP_NOT_FOUND');
        };

        return (
          <Show when={isAppNotFound()} fallback={props.error && props.error(error)}>
            {props.appNotFound}
          </Show>
        );
      }}
    >
      {data => {
        createEffect<CancelablePromise<unknown>>((promise) => {
          promise && promise.cancel();

          return saveAuthToken(data().token, data().expiresAt).catch(e => {
            console.error('saveAuthToken returned error:', e);
          });
        });

        return props.children(data);
      }}
    </Resource>
  );
}