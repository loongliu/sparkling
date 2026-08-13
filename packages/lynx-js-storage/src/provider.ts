import { registerStorageProviderInternal } from './registry';

export interface StorageProvider {
  getItem(key: string): Promise<unknown | null>;
  setItem(key: string, value: unknown): Promise<void>;
}

export function registerStorageProvider(provider: StorageProvider): void {
  registerStorageProviderInternal(provider);
}
