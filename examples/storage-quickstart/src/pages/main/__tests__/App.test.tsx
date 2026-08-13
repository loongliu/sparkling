import '@testing-library/jest-dom'
import { getQueriesForElement, render } from '@lynx-js/react/testing-library'
import { beforeEach, expect, test, vi } from 'vitest'

import { App } from '../App.js'

const values = new Map<string, unknown>()

vi.mock('@lynx-js/storage', () => ({
  storage: {
    getItem: vi.fn(async (key: string) => values.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: unknown) => {
      values.set(key, value)
    }),
  },
}))

beforeEach(() => {
  values.clear()
})

test('runs the storage round trip through the standard facade', async () => {
  render(<App />)

  const { findByText } = getQueriesForElement(elementTree.root!)
  expect(await findByText('Storage Quickstart')).toBeInTheDocument()
  expect(await findByText('PASS')).toBeInTheDocument()
})
