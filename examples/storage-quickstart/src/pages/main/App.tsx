import { useEffect } from '@lynx-js/react'

import './App.css'

export function App() {
  useEffect(() => {
    'background only'
    console.log('[storage-quickstart] minimal Sparkling application mounted')
  }, [])

  return (
    <view className="page">
      <view className="card">
        <text className="eyebrow">SPARKLING · LYNX</text>
        <text className="title">Hello from Android</text>
        <text className="description">
          This minimal page verifies that a generated Sparkling application can build, install, and run a Lynx bundle.
        </text>
      </view>
    </view>
  )
}
