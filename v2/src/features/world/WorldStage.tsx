import { useEffect, useRef, useState } from 'react'
import type { Application as PixiApplication } from 'pixi.js'

type Props = {
  level: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export function WorldStage({ level }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [renderer, setRenderer] = useState('initializing')
  const levelRef = useRef(level)

  useEffect(() => { levelRef.current = level }, [level])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let app: PixiApplication | null = null

    const boot = async () => {
      // Pixi/WebGL is deliberately loaded only when DNA is actually mounted.
      // Portfolio/Analytics/Income should never pay the runtime cost on first load.
      const { Application, Container, Graphics } = await import('pixi.js')
      if (disposed) return

      const resolution = clamp(window.devicePixelRatio || 1, 1, window.innerWidth < 900 ? 1.35 : 1.75)
      const next = new Application()
      await next.init({
        resizeTo: host,
        antialias: true,
        autoDensity: true,
        resolution,
        background: '#071613',
        preference: 'webgl',
        powerPreference: 'high-performance',
      })

      if (disposed) {
        next.destroy(true)
        return
      }

      app = next
      host.appendChild(next.canvas)
      setRenderer(next.renderer.type === 1 ? 'webgl' : 'gpu')

      const world = new Container()
      next.stage.addChild(world)

      const sky = new Graphics()
        .rect(0, 0, 1600, 900)
        .fill({ color: 0x081d2a })
      world.addChild(sky)

      const horizon = new Graphics()
        .poly([0, 520, 180, 390, 330, 470, 520, 330, 740, 470, 940, 350, 1180, 500, 1380, 380, 1600, 510, 1600, 900, 0, 900])
        .fill({ color: 0x0c3034 })
      world.addChild(horizon)

      const ground = new Graphics()
        .rect(0, 585, 1600, 315)
        .fill({ color: 0x07130f })
      world.addChild(ground)

      const development = new Graphics()
      world.addChild(development)

      const lamp = new Graphics()
        .circle(0, 0, 13)
        .fill({ color: 0x66ffe2, alpha: 0.9 })
      lamp.position.set(400, 560)
      world.addChild(lamp)

      let lastLevel = -1
      const renderLevel = (current: number) => {
        if (current === lastLevel) return
        lastLevel = current
        development.clear()

        development.rect(80, 500, 210, 85).fill({ color: 0x3b2b20 })
        development.rect(105, 455, 160, 45).fill({ color: 0x8f5d38 })

        if (current >= 2) development.rect(360, 515, 150, 70).fill({ color: 0x4b3225 })
        if (current >= 3) development.rect(540, 485, 180, 100).fill({ color: 0x62402b })
        if (current >= 4) development.rect(750, 450, 210, 135).fill({ color: 0x2b3834 })
        if (current >= 5) development.rect(1010, 410, 230, 175).fill({ color: 0x36433a })
        if (current >= 7) development.rect(1280, 345, 210, 240).fill({ color: 0x4d382a })
        if (current >= 9) development.rect(930, 270, 42, 180).fill({ color: 0x605244 })
        if (current >= 11) development.circle(1360, 250, 95).fill({ color: 0x26b9ac, alpha: 0.18 })
      }

      next.ticker.maxFPS = window.innerWidth < 900 ? 45 : 60
      next.ticker.minFPS = 20
      next.ticker.add(() => {
        renderLevel(levelRef.current)
        lamp.alpha = 0.72 + Math.sin(performance.now() / 550) * 0.16
      })

      const fit = () => {
        const w = Math.max(1, host.clientWidth)
        const h = Math.max(1, host.clientHeight)
        const scale = Math.min(w / 1600, h / 900)
        world.scale.set(scale)
        world.position.set((w - 1600 * scale) / 2, (h - 900 * scale) / 2)
      }
      fit()
      const ro = new ResizeObserver(fit)
      ro.observe(host)
      ;(next as PixiApplication & { __pulseResizeObserver?: ResizeObserver }).__pulseResizeObserver = ro

      const onVisibility = () => {
        if (!app) return
        if (document.hidden) app.stop()
        else app.start()
      }
      document.addEventListener('visibilitychange', onVisibility)
      ;(next as PixiApplication & { __pulseVisibility?: () => void }).__pulseVisibility = onVisibility
    }

    void boot()

    return () => {
      disposed = true
      if (app) {
        const typed = app as PixiApplication & { __pulseResizeObserver?: ResizeObserver, __pulseVisibility?: () => void }
        typed.__pulseResizeObserver?.disconnect()
        if (typed.__pulseVisibility) document.removeEventListener('visibilitychange', typed.__pulseVisibility)
        app.destroy(true, { children: true })
      }
      host.replaceChildren()
    }
  }, [])

  return (
    <div className="world-stage" ref={hostRef}>
      <div className="world-stage__diagnostic">DNA ENGINE · {renderer.toUpperCase()}</div>
    </div>
  )
}
