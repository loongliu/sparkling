import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import {
  createDevLynxConfig,
  createTempLynxConfig,
} from '../config'
import { pluginSparklingProviderPreEntry } from '../provider-preentry'
import {
  discoverPackagePreEntries,
  mergePackagePreEntries,
} from '../provider-preentry-core'

function writeJson(file: string, value: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2))
}

describe('Sparkling provider preEntry discovery', () => {
  let cwd: string

  beforeEach(() => {
    cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'sparkling-preentry-'))
    writeJson(path.join(cwd, 'package.json'), {
      dependencies: {
        '@lynx-js/storage': '1.0.0',
        'sparkling-storage': '2.0.0',
        'unrelated-package': '1.0.0',
      },
    })
    writeJson(path.join(cwd, 'node_modules/sparkling-storage/package.json'), {
      name: 'sparkling-storage',
      sparkling: { preEntry: './register' },
    })
    writeJson(path.join(cwd, 'node_modules/@lynx-js/storage/package.json'), {
      name: '@lynx-js/storage',
    })
    writeJson(path.join(cwd, 'node_modules/unrelated-package/package.json'), {
      name: 'unrelated-package',
      exports: { './register': './register.js' },
    })
    fs.writeFileSync(path.join(cwd, 'app.config.ts'), 'export default { lynxConfig: {} }')
  })

  afterEach(() => {
    fs.rmSync(cwd, { recursive: true, force: true })
  })

  it('discovers only explicitly declared direct dependency entries', () => {
    expect(discoverPackagePreEntries(cwd)).toEqual(['sparkling-storage/register'])
  })

  it('installs the shared plugin into build and dev wrappers', () => {
    const buildConfig = fs.readFileSync(
      createTempLynxConfig(cwd, path.join(cwd, 'app.config.ts')),
      'utf8',
    )
    const devConfig = fs.readFileSync(
      createDevLynxConfig(cwd, path.join(cwd, 'app.config.ts'), 5969),
      'utf8',
    )

    expect(buildConfig).toContain("from 'sparkling-app-cli/provider-preentry'")
    expect(devConfig).toContain("from 'sparkling-app-cli/provider-preentry'")
    expect(buildConfig).toContain(`pluginSparklingProviderPreEntry({ cwd: ${JSON.stringify(cwd)} })`)
    expect(devConfig).toContain(`pluginSparklingProviderPreEntry({ cwd: ${JSON.stringify(cwd)} })`)
    expect(buildConfig).not.toContain('sparklingAutoPreEntries')
    expect(devConfig).not.toContain('sparklingAutoPreEntries')
  })

  it('merges discovered and configured entries once with stable precedence', () => {
    expect(mergePackagePreEntries(
      ['sparkling-storage/register', './shared'],
      ['./business-preentry', './shared'],
    )).toEqual([
      'sparkling-storage/register',
      './shared',
      './business-preentry',
    ])
  })

  it('injects the same entries through the Rsbuild/Rspeedy plugin', () => {
    let modifier: ((config: { source?: { preEntry?: string | string[] } }) => void) | undefined
    const plugin = pluginSparklingProviderPreEntry({ cwd })

    plugin.setup({
      context: { rootPath: cwd },
      modifyRsbuildConfig(callback) {
        modifier = callback as typeof modifier
      },
    })

    const config = { source: { preEntry: ['./business-preentry'] } }
    modifier?.(config)

    expect(config.source.preEntry).toEqual([
      'sparkling-storage/register',
      './business-preentry',
    ])
  })
})
