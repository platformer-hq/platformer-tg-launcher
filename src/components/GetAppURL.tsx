import { type Component, createResource, type JSXElement, Match, Switch } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { getAppUrl } from '@/api/getAppUrl.js';
import { GqlResponseResource } from '@/components/GqlResponseResource.js';

/**
 * Retrieves the application URL.
 */
export function GetAppURL(props: {
  AppNotFound: Component;
  Error: Component;
  Loading: Component;
  NoURL: Component;
  appID: number;
  authToken: string;
  apiBaseURL: string;
  children: (url: () => string) => JSXElement;
  launchParams: string;
}) {
  const [resource] = createResource(
    () => ({
      appID: props.appID,
      apiBaseURL: props.apiBaseURL,
      authToken: props.authToken,
      launchParams: props.launchParams,
    }),
    (meta) => getAppUrl(
      meta.apiBaseURL,
      meta.authToken,
      meta.appID,
      meta.launchParams,
      { timeout: 5000 },
    ));

  return (
    <GqlResponseResource {...props} resource={resource}>
      {data => (
        <Switch fallback={<Dynamic component={props.NoURL}/>}>
          <Match when={!data()[0]}>
            <Dynamic component={props.AppNotFound}/>
          </Match>
          <Match when={data()[1]}>
            {props.children}
          </Match>
        </Switch>
      )}
    </GqlResponseResource>
  );
}