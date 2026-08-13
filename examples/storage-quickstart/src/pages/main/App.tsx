import { useEffect, useState } from '@lynx-js/react'
import { storage } from '@lynx-js/storage'

import './App.css'

type OperationState =
  | { phase: 'idle'; detail: string }
  | { phase: 'running'; detail: string }
  | { phase: 'passed'; detail: string }
  | { phase: 'failed'; detail: string }

const DEFAULT_KEY = 'storage-quickstart-key'
const DEFAULT_VALUE = 'Hello from the standard Storage API'

export function App() {
  const [operation, setOperation] = useState<OperationState>({
    phase: 'idle',
    detail: 'Save a value, then read it back through the standard API.',
  })

  const save = async () => {
    'background only'

    setOperation({ phase: 'running', detail: `Saving ${DEFAULT_KEY}…` })
    try {
      await storage.setItem(DEFAULT_KEY, DEFAULT_VALUE)
      setOperation({ phase: 'passed', detail: `Saved ${DEFAULT_KEY}` })
      console.log(`[storage-quickstart] saved ${DEFAULT_KEY}`)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      setOperation({ phase: 'failed', detail })
      console.error(`[storage-quickstart] save failed: ${detail}`)
    }
  }

  const read = async () => {
    'background only'

    setOperation({ phase: 'running', detail: `Reading ${DEFAULT_KEY}…` })
    try {
      const actual = await storage.getItem(DEFAULT_KEY)
      setOperation({ phase: 'passed', detail: `Read ${DEFAULT_KEY}: ${String(actual)}` })
      console.log(`[storage-quickstart] read ${DEFAULT_KEY}: ${String(actual)}`)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      setOperation({ phase: 'failed', detail })
      console.error(`[storage-quickstart] read failed: ${detail}`)
    }
  }

  useEffect(() => {
    'background only'

    console.log(
      '[storage-quickstart] business bundle started without importing sparkling-storage/register',
    )

    void (async () => {
      setOperation({ phase: 'running', detail: 'Running the first storage round trip…' })
      try {
        await storage.setItem(DEFAULT_KEY, DEFAULT_VALUE)
        const actual = await storage.getItem(DEFAULT_KEY)
        if (actual !== DEFAULT_VALUE) {
          throw new Error(`Expected ${DEFAULT_VALUE}, received ${String(actual)}`)
        }

        const detail = `Round trip passed: ${DEFAULT_KEY} = ${String(actual)}`
        setOperation({ phase: 'passed', detail })
        console.log(`[storage-quickstart] PASS: ${detail}`)
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error)
        setOperation({ phase: 'failed', detail })
        console.error(`[storage-quickstart] FAIL: ${detail}`)
      }
    })()
  }, [])

  return (
    <scroll-view className="page" scroll-orientation="vertical">
      <view className="hero">
        <text className="eyebrow">LYNX STANDARD API · SPARKLING</text>
        <text className="title">Storage Quickstart</text>
        <text className="subtitle">
          Business code imports only @lynx-js/storage. Sparkling discovers and registers its Provider automatically.
        </text>
      </view>

      <view className={`result result--${operation.phase}`}>
        <text className="result-label">
          {operation.phase === 'running' ? 'RUNNING' : operation.phase === 'passed' ? 'PASS' : operation.phase === 'failed' ? 'FAIL' : 'READY'}
        </text>
        <text className="result-detail">{operation.detail}</text>
      </view>

      <view className="card">
        <text className="card-title">Try it</text>
        <view className="sample-row">
          <text className="sample-label">Key</text>
          <text className="sample-value">{DEFAULT_KEY}</text>
        </view>
        <view className="sample-row">
          <text className="sample-label">Value</text>
          <text className="sample-value">{DEFAULT_VALUE}</text>
        </view>
        <view className="actions">
          <view className="button button--primary" bindtap={save}>
            <text className="button-text button-text--primary">Save value</text>
          </view>
          <view className="button" bindtap={read}>
            <text className="button-text">Read value</text>
          </view>
        </view>
      </view>

      <view className="card">
        <text className="card-title">What happens automatically</text>
        <text className="flow-step">1. sparkling-app-cli finds sparkling-storage metadata</text>
        <text className="flow-step">2. sparkling-storage/register becomes a preEntry</text>
        <text className="flow-step">3. The Provider is ready before this page runs</text>
        <text className="flow-step">4. Storage calls reach the Android NativeModule</text>
      </view>
    </scroll-view>
  )
}
