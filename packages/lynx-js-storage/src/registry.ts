import type { StorageProvider } from './provider';

let currentProvider: StorageProvider | undefined;

export function registerStorageProviderInternal(provider: StorageProvider): void {
  if (currentProvider && currentProvider !== provider) {
    throw new Error('A different StorageProvider is already registered');
  }
  currentProvider = provider;
}

export function getStorageProvider(): StorageProvider {
  if (!currentProvider) {
    throw new Error('StorageProvider is not registered');
  }
  return currentProvider;
}
