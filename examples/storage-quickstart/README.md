# Storage Quickstart

This is a standalone Sparkling application generated from `create-sparkling-app`. It demonstrates the complete user journey for the standard Lynx Storage API:

1. Create a new Sparkling application.
2. Install the container-independent `@lynx-js/storage` package.
3. Install the Sparkling implementation package, `sparkling-storage`.
4. Build a real Lynx bundle without importing a Provider register module in business code.
5. Run the bundle in the generated Android application.

## 1. Create an application

For a published release, a user starts with:

```bash
pnpm create sparkling-app storage-quickstart
cd storage-quickstart
```

This checked-in example was generated from the repository template so it can validate unreleased changes.

## 2. Install Storage

A published user installs the standard API and the Sparkling implementation:

```bash
pnpm add @lynx-js/storage sparkling-storage
```

The checked-in example uses `workspace:*` for those two packages. That is the local equivalent of installing their future published versions.

The two packages have different responsibilities:

- `@lynx-js/storage` exposes the container-independent `storage.getItem` and `storage.setItem` API.
- `sparkling-storage` supplies both the Android/iOS NativeModule implementation and the Sparkling Storage Provider.

## 3. Write business code

Business code imports only the standard API:

```ts
import { storage } from '@lynx-js/storage'

await storage.setItem('greeting', 'hello')
const greeting = await storage.getItem('greeting')
```

There is deliberately no `import 'sparkling-storage/register'` in this application.

## 4. Build the Lynx bundle

From the repository root:

```bash
pnpm --filter storage-quickstart build
```

During the build, `sparkling-app-cli` inspects direct application dependencies. It finds this package metadata in `sparkling-storage`:

```json
{
  "sparkling": {
    "preEntry": "./register"
  }
}
```

The CLI adds `sparkling-storage/register` to the generated Rspeedy `source.preEntry`. The register module executes before the page entry and installs the Sparkling implementation into the `@lynx-js/storage` Provider Registry.

The build creates `dist/main.lynx.bundle` and copies it into the generated native applications.

## 5. Run Android

Start an emulator, then run:

```bash
pnpm --filter storage-quickstart run:android
```

The command autolinks the native `sparkling-storage` package, builds and installs the Android application, and opens `main.lynx.bundle`. The page performs one Storage round trip on startup and displays `PASS` when the Provider and NativeModule path both work.

## Expected execution path

```text
Application dependency
  sparkling-storage metadata
    → sparkling-storage/register preEntry
      → register StorageProvider
        → business storage.setItem / storage.getItem
          → Sparkling storage NativeModule
            → Android SharedPreferences
```
