import { createEffect, createResource, Match, onCleanup, Show, Switch } from 'solid-js';

import { getAuthToken, saveAuthToken } from '@/storage/auth-token.js';
import { authenticate } from '@/api/authenticate.js';
import { getAppUrl } from '@/api/getAppUrl.js';

interface AbcProps {
  launchParams: string;
  appId: number;
  baseUrl: string;
  authToken: string;
}

function Abc(props: AbcProps) {
  const [data] = createResource(
    () => ({
      appId: props.appId,
      baseUrl: props.baseUrl,
      authToken: props.authToken,
      launchParams: props.launchParams,
    }),
    (meta) => getAppUrl(
      meta.baseUrl,
      meta.authToken,
      meta.appId,
      meta.launchParams,
      { timeout: 5000 },
    ));
}

interface BootstrapperProps extends Omit<AbcProps, 'authToken'> {
  initData: string;
}

export function Bootstrapper(props: BootstrapperProps) {
  // Retrieve the auth token from the storage. We are going to use this token
  // to retrieve the application information.
  const [resource] = createResource(
    () => ({
      appId: props.appId,
      baseUrl: props.baseUrl,
      initData: props.initData,
    }),
    async (meta) => {
      // Try to retrieve previously saved token.
      const authToken = await getAuthToken({ timeout: 5000 }).catch((e) => {
        console.error('getAuthToken returned error:', e);
      });

      return authToken
        ? ['ok', authToken] as ['ok', typeof authToken]
        // Authenticate using Platformer API.
        : authenticate(meta.baseUrl, meta.appId, meta.initData);
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
    <Show when={resource.state === 'ready' ? resource() : undefined} fallback={'App is loading'}>
      {data => {
        const okData = () => {
          const v = data();
          return v[0] === 'ok' ? v[1] : null;
        };

        const errData = () => {
          const v = data();
          return v[0] !== 'ok' ? v : null;
        };

        return (
          <Switch>
            <Match when={okData()}>
              {authToken => <Abc {...props} authToken={authToken().token} />}
            </Match>
            <Match when={errData()}>
              {error => {
                const isAppNotFound = () => {
                  const v = error();
                  return v[0] === 'gql' && v[1].some(err => err.code === 'ERR_APP_NOT_FOUND');
                };

                return (
                  <Switch fallback={'Unknown error'}>
                    <Match when={isAppNotFound()}>
                      App not found
                    </Match>
                  </Switch>
                );
              }}
            </Match>
          </Switch>
        );
      }}
    </Show>
  );
}