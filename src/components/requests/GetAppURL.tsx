import { type JSXElement, Match, Switch } from 'solid-js';

import { getAppUrl, type GetAppURLOptions } from '@/api/getAppUrl.js';
import { Resource } from '@/components/Resource.js';
import type { RequestComponentProps } from '@/components/requests/types.js';

/**
 * Retrieves the application URL.
 */
export function GetAppURL(
  props: RequestComponentProps<string, GetAppURLOptions & {
    appNotFound: JSXElement;
    noURL: JSXElement;
  }>,
) {
  return (
    <Resource {...props} source={props} fetcher={getAppUrl}>
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
    </Resource>
  );
}