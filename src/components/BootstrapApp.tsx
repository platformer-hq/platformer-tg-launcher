import { type Accessor, createMemo } from 'solid-js';

import { GetAuthToken } from '@/components/requests/GetAuthToken.js';
import { GetAppURL } from '@/components/requests/GetAppURL.js';
import { AppContainer } from '@/components/AppContainer/AppContainer.js';
import { AppLoading } from '@/components/AppLoading/AppLoading.js';
import { AppNotFound } from '@/components/AppNotFound.js';
import { RequestError } from '@/components/RequestError.js';
import { AppNoURL } from '@/components/AppNoURL/AppNoURL.js';
import type { GqlRequestError } from '@/api/gqlRequest.js';

/**
 * Performs complete application load lifecycle.
 */
export function BootstrapApp(props: {
  appID: number;
  apiBaseURL: string;
  initData: string;
  launchParams: string;
}) {
  const shared = createMemo(() => ({
    loading: <AppLoading/>,
    error: (error: Accessor<GqlRequestError>) => <RequestError error={error()}/>,
    appNotFound: <AppNotFound/>,
  }));

  return (
    <GetAuthToken {...props} {...shared()}>
      {authToken => (
        <GetAppURL
          {...props}
          {...shared()}
          authToken={authToken().token}
          noURL={<AppNoURL/>}
        >
          {url => <AppContainer url={url()}/>}
        </GetAppURL>
      )}
    </GetAuthToken>
  );
}