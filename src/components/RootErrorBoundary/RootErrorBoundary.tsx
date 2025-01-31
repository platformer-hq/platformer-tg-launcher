import { AppLoadError } from '@/components/AppLoadError/AppLoadError.js';

/**
 * Error boundary used in the application's root.
 */
export function RootErrorBoundary(error: unknown) {
  return <AppLoadError error={['unknown', error]}/>;
}