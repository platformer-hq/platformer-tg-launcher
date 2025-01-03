import { Match, Switch } from 'solid-js';

import type { GqlRequestError } from '@/api/gqlRequest.js';
import { AppError } from '@/components/AppError/AppError.js';

/**
 * Used to handle all kinds of GQL request errors.
 */
export function RequestError(props: { error: GqlRequestError }) {
  const networkErrTitle = 'Network error';

  function withError<T>(fn: (err: GqlRequestError) => T) {
    return () => fn(props.error);
  }

  const whenFetch = withError(e => e[0] === 'fetch' ? e[1] : false);
  const whenGql = withError(e => e[0] === 'gql' ? e[1] : false);
  const whenHttp = withError(e => e[0] === 'http' ? [e[1], e[2]] as [number, string] : false);
  const whenInvalidData = withError(e => e[0] === 'invalid-data' ? e[1] : false);

  return (
    <Switch>
      <Match when={whenFetch()}>
        <AppError
          title={networkErrTitle}
          subtitle="Unable to send request to the server. The server is unreachable"
        />
      </Match>
      <Match when={whenGql()}>
        {errors => (
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
      </Match>
      <Match when={whenHttp()}>
        {err => (
          <AppError
            title={networkErrTitle}
            subtitle={`Server responded with status ${err()[0]}: ${err()[1]}`}
          />
        )}
      </Match>
      <Match when={whenInvalidData()}>
        <AppError
          title="Oops!"
          subtitle="Server returned unexpected response"
        />
      </Match>
    </Switch>
  );
}