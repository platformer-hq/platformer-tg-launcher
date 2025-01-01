import { createResource, type JSXElement, Match, splitProps, Switch } from 'solid-js';

import { getAppUrl } from '@/api/getAppUrl.js';
import {
  GqlResponseResource,
  type GqlResponseResourceProps,
} from '@/components/requests/GqlResponseResource.js';

interface Props extends Pick<
  GqlResponseResourceProps<string>,
  'error' | 'loading' | 'children'
> {
  apiBaseURL: string;
  appID: number;
  appNotFound: JSXElement;
  authToken: string;
  launchParams: string;
  noURL: JSXElement;
}

/**
 * Retrieves the application URL.
 */
export function GetAppURL(props: Props) {
  const [picked] = splitProps(props, ['appID', 'apiBaseURL', 'authToken', 'launchParams']);
  const [resource] = createResource(
    () => picked,
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
        <Switch fallback={props.noURL}>
          <Match when={!data()[0]}>
            {props.appNotFound}
          </Match>
          <Match when={data()[1]}>
            {props.children}
          </Match>
        </Switch>
      )}
    </GqlResponseResource>
  );
}