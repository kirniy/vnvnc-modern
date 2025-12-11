import { memo } from 'react'

const GlobalBackground = memo(() => {
  return (
    <div className="fixed inset-0 z-[-50] bg-black pointer-events-none" />
  )
})

GlobalBackground.displayName = 'GlobalBackground'

export default GlobalBackground
