// Copyright (c) 2026 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import {
  discoverPackagePreEntries,
  mergePackagePreEntries,
} from './provider-preentry-core'

interface SourceConfigLike {
  preEntry?: string | string[]
  [key: string]: unknown
}

interface RsbuildConfigLike {
  source?: SourceConfigLike
  [key: string]: unknown
}

interface RsbuildPluginApiLike {
  context: {
    rootPath: string
  }
  modifyRsbuildConfig(
    callback: (config: RsbuildConfigLike) => RsbuildConfigLike | void,
  ): void
}

export interface SparklingProviderPreEntryPlugin {
  name: string
  enforce: 'pre'
  setup(api: RsbuildPluginApiLike): void
}

export interface SparklingProviderPreEntryOptions {
  /** Override the app root used to inspect direct dependencies. */
  cwd?: string
}

/**
 * Rsbuild/Rspeedy plugin for automatic Sparkling Provider registration.
 *
 * It uses the same package.json discovery contract as sparkling-app-cli and
 * prepends every discovered registration module to source.preEntry.
 */
export function pluginSparklingProviderPreEntry(
  options: SparklingProviderPreEntryOptions = {},
): SparklingProviderPreEntryPlugin {
  return {
    name: 'sparkling:provider-preentry',
    enforce: 'pre',
    setup(api) {
      api.modifyRsbuildConfig((config) => {
        const discovered = discoverPackagePreEntries(options.cwd ?? api.context.rootPath)
        if (discovered.length === 0) return

        config.source = {
          ...config.source,
          preEntry: mergePackagePreEntries(discovered, config.source?.preEntry),
        }
      })
    },
  }
}
