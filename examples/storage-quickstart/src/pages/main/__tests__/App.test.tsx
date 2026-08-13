import '@testing-library/jest-dom'
import { getQueriesForElement, render } from '@lynx-js/react/testing-library'
import { expect, test } from 'vitest'

import { App } from '../App.js'

test('renders the minimal Sparkling page', async () => {
  render(<App />)

  const { findByText } = getQueriesForElement(elementTree.root!)
  expect(await findByText('Hello from Android')).toBeInTheDocument()
})
