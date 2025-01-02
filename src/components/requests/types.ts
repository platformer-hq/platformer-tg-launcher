import type { ResourceProps } from '@/components/Resource.js';
import type { GqlRequestError } from '@/api/gqlRequest.js';

export type RequestComponentProps<Data, Source, Props = object> = Omit<ResourceProps<
  Data,
  GqlRequestError,
  Source
>, 'fetcher'> & Props;