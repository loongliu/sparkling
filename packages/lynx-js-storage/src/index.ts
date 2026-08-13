import { getStorageProvider } from './registry';

export const storage = {
  getItem(key: string): Promise<unknown | null> {
    return getStorageProvider().getItem(key);
  },

  setItem(key: string, value: unknown): Promise<void> {
    return getStorageProvider().setItem(key, value);
  },
};
