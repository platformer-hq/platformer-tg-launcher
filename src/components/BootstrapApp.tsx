import { GetAuthToken } from '@/components/GetAuthToken.js';
import { GetAppURL } from '@/components/GetAppURL.js';
import { AppContainer } from '@/components/AppContainer/AppContainer.js';

/**
 * Performs complete application load lifecycle.
 */
export function BootstrapApp(props: {
  appID: number;
  apiBaseURL: string;
  initData: string;
  launchParams: string;
}) {
  return (
    <GetAuthToken
      {...props}
      Loading={() => 'Loading'}
      AppNotFound={() => 'app not found'}
      UnknownError={() => 'unknown error'}
    >
      {authToken => (
        <GetAppURL
          {...props}
          authToken={authToken().token}
          AppNotFound={() => 'app not found'}
          Error={() => 'Some error'}
          Loading={() => 'Loading'}
          NoURL={() => 'No URL'}
        >
          {url => <AppContainer url={url()}/>}
        </GetAppURL>
      )}
    </GetAuthToken>
  );
}