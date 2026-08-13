// Copyright (c) 2026 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import fs from 'node:fs'
import path from 'node:path'

interface SparklingPackageManifest {
  sparkling?: {
    preEntry?: string | string[]
  }
}

function dependencyPackageJsonPath(cwd: string, packageName: string): string {
  return path.join(cwd, 'node_modules', ...packageName.split('/'), 'package.json')
}

/**
 * Discover side-effect registration entries declared by direct app dependencies.
 *
 * Only dependencies and optionalDependencies are scanned. A transitive package
 * cannot silently register a Provider in the application runtime.
 */
export function discoverPackagePreEntries(cwd: string): string[] {
  const appPackageJsonPath = path.join(cwd, 'package.json')
  if (!fs.existsSync(appPackageJsonPath)) return []

  let appManifest: Record<string, unknown>
  try {
    const parsed = JSON.parse(fs.readFileSync(appPackageJsonPath, 'utf8')) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return []
    appManifest = parsed as Record<string, unknown>
  } catch {
    return []
  }

  const dependencyNames = new Set<string>()
  for (const field of ['dependencies', 'optionalDependencies']) {
    const dependencies = appManifest[field]
    if (!dependencies || typeof dependencies !== 'object' || Array.isArray(dependencies)) continue
    for (const packageName of Object.keys(dependencies as Record<string, unknown>)) {
      dependencyNames.add(packageName)
    }
  }

  const discovered: string[] = []
  for (const packageName of Array.from(dependencyNames).sort()) {
    const manifestPath = dependencyPackageJsonPath(cwd, packageName)
    if (!fs.existsSync(manifestPath)) continue

    let manifest: SparklingPackageManifest
    try {
      const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as unknown
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue
      manifest = parsed as SparklingPackageManifest
    } catch {
      continue
    }

    const declared = manifest.sparkling?.preEntry
    const entries = typeof declared === 'string' ? [declared] : Array.isArray(declared) ? declared : []
    for (const entry of entries) {
      const trimmed = entry.trim()
      if (!trimmed) continue
      if (trimmed === '.') {
        discovered.push(packageName)
      } else if (trimmed.startsWith('./')) {
        discovered.push(`${packageName}/${trimmed.slice(2)}`)
      }
    }
  }

  return Array.from(new Set(discovered))
}

export function mergePackagePreEntries(
  discovered: readonly string[],
  configured?: string | string[],
): string[] {
  const configuredEntries = configured == null
    ? []
    : Array.isArray(configured)
      ? configured
      : [configured]

  return Array.from(new Set([...discovered, ...configuredEntries]))
}
