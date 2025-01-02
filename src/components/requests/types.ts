import type { ResourceProps } from '@/components/Resource.js';
import type { GqlRequestError } from '@/api/gqlRequest.js';

export type RequestComponentProps<Data, Props> = Omit<ResourceProps<
  Data,
  GqlRequestError
>, 'source' | 'fetcher'> & Props;