import BackgroundFX from './BackgroundFX'

// Глобальный фон для всех страниц: фиксированный canvas с низкой интенсивностью
const GlobalBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden>
      <div className="absolute inset-0 opacity-[0.22]">
        <BackgroundFX intensity={0.45} />
      </div>
      {/* добавить мягкие радиальные пятна, чтобы чёрный не был плоским */}
      <div className="absolute inset-0" style={{
        background:
          'radial-gradient(1400px 800px at 15% 20%, rgba(255,26,26,0.08), transparent 60%), radial-gradient(1000px 700px at 85% 75%, rgba(255,26,26,0.06), transparent 60%)',
      }} />
    </div>
  )
}

export default GlobalBackground


