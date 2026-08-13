import {
  registerStorageProvider,
  type StorageProvider,
} from '@lynx-js/storage/provider';
import { getItem, setItem } from './index';

const sparklingStorageProvider: StorageProvider = {
  getItem(key: string) {
    return new Promise((resolve, reject) => {
      getItem({ key }, (result) => {
        if (result.code === 1) {
          resolve(result.data?.data ?? null);
          return;
        }
        reject(new Error(result.msg));
      });
    });
  },

  setItem(key: string, value: unknown) {
    return new Promise<void>((resolve, reject) => {
      setItem({ key, data: value }, (result) => {
        if (result.code === 1) {
          resolve();
          return;
        }
        reject(new Error(result.msg));
      });
    });
  },
};

registerStorageProvider(sparklingStorageProvider);
