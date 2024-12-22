import { type AsyncOptions, CancelablePromise, cloudStorage } from '@telegram-apps/sdk-solid';

/**
 * @returns An item using its key from the storage.
 * @param key - key name.
 * @param options - additional options.
 */
export function getStorageItem(key: string, options?: AsyncOptions): CancelablePromise<string> {
  return CancelablePromise.withFn((abortSignal) => {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      // Local storage may be inaccessible. That's why we catch the error and try to use
      // the cloud storage.
      return cloudStorage.isSupported()
        ? cloudStorage.getItem(key, { abortSignal })
        : '';
    }
  }, options);
}

/**
 * Saves the value in the storage using its key.
 * @param key - key name.
 * @param value - key value.
 * @param options - additional options.
 */
export function setStorageItem(
  key: string,
  value: string,
  options?: AsyncOptions,
): CancelablePromise<void> {
  return CancelablePromise.withFn((abortSignal) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Local storage may be inaccessible. That's why we catch the error and try to use
      // the cloud storage.
      return cloudStorage.isSupported()
        ? cloudStorage.setItem(key, value, { abortSignal })
        : undefined;
    }
  }, options);
}