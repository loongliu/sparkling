// @ts-nocheck
import { defineConfig } from '@lynx-js/rspeedy'
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'
import type { AppConfig } from 'sparkling-app-cli'

const lynxConfig = defineConfig({
  source: {
    entry: {
      main: './src/pages/main/index.tsx',
    },
  },
  output: {
    assetPrefix: 'asset:///',
    filename: {
      bundle: '[name].lynx.bundle'
    },
  },
  plugins: [
    pluginQRCode({
      schema(url: string): string {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginReactLynx(),
  ],
})

const config: AppConfig = {
  lynxConfig,
  dev: {
    server: {
      port: 5969,
    },
  },
  // Keep this checked-in Android baseline independent from DevTool artifacts.
  devtool: false,
  appName: 'storage-quickstart',
  platform: {
    android: {
      packageName: 'com.example.sparkling.storagequickstart',
    },
    ios: {
      bundleIdentifier: 'com.example.sparkling.storagequickstart',
    },
  },
  paths: {
    androidAssets: 'android/app/src/main/assets',
    iosAssets: 'ios/LynxResources',
  },
  appIcon: './resource/app_icon.png',
  router: {
    main: {
      path: './lynxPages/main',
    },
  },
  plugin: [
    [
      'splash-screen',
      {
        backgroundColor: '#232323',
        image: './resource/app_icon.png',
        dark: {
          image: './resource/app_icon.png',
          backgroundColor: '#000000',
        },
        imageWidth: 200,
      },
    ],
  ],
};

export default config
