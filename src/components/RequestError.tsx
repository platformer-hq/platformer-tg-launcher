import type { GqlRequestError } from '@/api/gqlRequest.js';
import { GqlResponseError } from '@/components/requests/GqlResponseError.js';

import { AppError } from '@/components/AppError/AppError.js';

/**
 * Used to handle all kinds of GQL request errors.
 */
export function RequestError(props: { error: GqlRequestError }) {
  const networkErrTitle = 'Network error';

  return (
    <GqlResponseError
      error={props.error}
      fetch={() => (
        <AppError
          title={networkErrTitle}
          subtitle="Unable to send request to the server. The server is unreachable"
        />
      )}
      gql={(errors) => (
        <AppError
          title="Oops!"
          subtitle={`Server returned errors: ${errors().map((error, idx) => {
            return (
              <>
                {idx ? ', ' : ''}{error.message}&nbsp;
                <b>(${error.code})</b>
              </>
            );
          })}`}
        />
      )}
      http={(err) => (
        <AppError
          title={networkErrTitle}
          subtitle={`Server responded with status ${err()[0]}: ${err()[1]}`}
        />
      )}
      invalidData={() => (
        <AppError
          title="Oops!"
          subtitle="Server returned unexpected response"
        />
      )}
    />
  );
}