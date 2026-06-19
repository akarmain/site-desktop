<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()
const isViewportResizing = ref(false)
let rafId = 0
let cleanupAmbient: (() => void) | undefined
const { anyOpen, isInteracting } = useWindows()

onMounted(() => {
  const c = canvas.value!
  const ctx = c.getContext('2d', { alpha: true })!
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  let W = 0, H = 0, CW = 0, CH = 0, PIXEL = 3
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, vx: 0, vy: 0, active: 0 }
  let currents: { x:number; y:number; born:number; power:number; dir:number }[] = []
  const t0 = performance.now(); let last = 0
  const IDLE_FRAME = 1000 / 18
  const ACTIVE_FRAME = 1000 / 30

  function readColor(name: string, fallback: string) {
    let hex = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    if (!hex || hex[0] !== '#') hex = fallback
    hex = hex.replace(/^#/, '')
    if (hex.length === 3) hex = hex.replace(/./g, (x: string) => x + x)
    const n = parseInt(hex, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number,number,number]
  }

  // cached per-frame values — refreshed once per paint(), not per-line
  let cachedAccent: [number,number,number] = [139,126,248]
  let cachedLine:   [number,number,number] = [46,46,56]
  let cachedGreen:  [number,number,number] = [127,212,154]
  let cachedFields: ReturnType<typeof windowFields> = []
  let colorAge = 0, fieldsAge = 0

  const eddies = [
    { x:.22, y:.78, r:.30, amp:1.9, spin:.18,  phase:.4 },
    { x:.66, y:.58, r:.28, amp:1.7, spin:-.16, phase:2.3 },
    { x:.86, y:.82, r:.24, amp:2.1, spin:.20,  phase:4.1 },
  ]

  function resize() {
    W = innerWidth; H = innerHeight
    PIXEL = W < 680 ? 3 : 4
    CW = Math.ceil(W / PIXEL); CH = Math.ceil(H / PIXEL)
    c.width = CW; c.height = CH
    ctx.setTransform(1,0,0,1,0,0); ctx.imageSmoothingEnabled = false
    fieldsAge = 0
  }

  let resizeTimer: ReturnType<typeof setTimeout> | undefined
  let resizeRaf = 0
  function scheduleResize() {
    isViewportResizing.value = true
    if (!resizeRaf) {
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0
        resize()
        last = 0
      })
    }
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      resizeTimer = undefined
      isViewportResizing.value = false
    }, 160)
  }

  function pulseAt(px: number, py: number, power: number) {
    if (reduce) return
    currents.push({ x: px / PIXEL, y: py / PIXEL, born: performance.now(), power: Math.min(.75, power || .42), dir: Math.random() > .5 ? 1 : -1 })
    if (currents.length > 5) currents.shift()
  }
  (window as any).akarmainAmbientPulse = pulseAt

  function rgba([r,g,b]: [number,number,number], a: number) {
    return `rgba(${r},${g},${b},${a})`
  }

  function hash2(a: number, b: number) {
    const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n)
  }

  function windowFields() {
    const fields: any[] = []
    document.querySelectorAll<HTMLElement>('.ak-window').forEach(w => {
      if (w.classList.contains('min') || getComputedStyle(w).display === 'none') return
      const r = w.getBoundingClientRect()
      if (r.width < 40 || r.height < 40) return
      fields.push({
        x: (r.left + r.width * .5) / PIXEL,  y: (r.top + r.height * .5) / PIXEL,
        left: r.left / PIXEL,  right: (r.left + r.width) / PIXEL,
        top: r.top / PIXEL,    bottomEdge: (r.top + r.height) / PIXEL,
        rx: Math.max(34, r.width * .62 / PIXEL), ry: Math.max(24, r.height * .56 / PIXEL),
      })
    })
    return fields
  }

  function paint(now: number) {
    rafId = requestAnimationFrame(paint)
    const interactiveFrame = isInteracting.value || isViewportResizing.value
    if (!CW || !CH || now - last < (interactiveFrame ? ACTIVE_FRAME : IDLE_FRAME)) return
    last = now
    const t = (now - t0) / 1000
    const px = mouse.x, py = mouse.y
    mouse.x += (mouse.tx - mouse.x) * .22; mouse.y += (mouse.ty - mouse.y) * .22
    mouse.vx = (mouse.x - px) / PIXEL;    mouse.vy = (mouse.y - py) / PIXEL
    mouse.active += ((mouse.tx > -1000 ? 1 : 0) - mouse.active) * .20
    currents = currents.filter(r => now - r.born < 2200)
    ctx.clearRect(0, 0, CW, CH)

    // ponytail: cache colors every 90 frames (~3s) — theme changes are rare
    if (colorAge++ % 90 === 0) {
      cachedAccent = readColor('--ak-accent', '#8b7ef8')
      cachedLine   = readColor('--ak-line-2', '#2e2e38')
      cachedGreen  = readColor('--ak-success', '#7fd49a')
    }
    // While dragging/resizing windows, read rects on every painted frame so the field follows the window.
    if (interactiveFrame || fieldsAge++ % 4 === 0) cachedFields = windowFields()
    const accent = cachedAccent, line = cachedLine, green = cachedGreen
    const fields = cachedFields
    const spacing = Math.max(4, Math.round(CH / (interactiveFrame ? 74 : 86)))
    const slope = .54, drift = reduce ? 0 : t * 2.1
    const start = -24 - (CW + 18) * slope, end = CH + 30
    const xStep = interactiveFrame ? 4 : 3
    let lineIndex = 0

    for (let offset = start; offset <= end; offset += spacing) {
      const bright = lineIndex % 7 === 0
      const baseColor = bright ? accent : lineIndex % 11 === 0 ? green : line
      const baseAlpha = bright ? .16 : lineIndex % 11 === 0 ? .07 : .10
      let lineHeat = 0, lineGravity = 0
      ctx.beginPath()
      let first = true
      const dust: any[] = [], hotDust: any[] = []

      for (let x = -18; x <= CW + 18; x += xStep) {
        const base = offset + x * slope
        let yy = base
          + Math.sin(x * .030 + offset * .021 + drift * .14) * 2.4
          + Math.sin(x * .012 - offset * .035 - drift * .20) * 3.1
          + Math.sin((x + offset) * .052 + drift * .08) * .9
        let xx = x
        let pointHeat = 0, pointGravity = 0

        for (const e of eddies) {
          const cx = e.x * CW, cy = e.y * CH
          const dx = x - cx, dy = base - cy
          const rr = Math.max(18, e.r * Math.min(CW, CH))
          const dist = Math.sqrt(dx*dx + dy*dy) + .001
          const fall = Math.exp(-(dist*dist) / (rr*rr))
          const angle = Math.atan2(dy, dx)
          const curl = Math.sin(angle * 3.0 + dist * .105 - drift * e.spin + e.phase)
          yy += curl * e.amp * fall
          xx += Math.cos(angle + Math.PI * .5) * curl * fall * 1.2
        }

        if (!reduce && mouse.x > -1000) {
          const mx = mouse.x / PIXEL, my = mouse.y / PIXEL
          const dxm = x - mx, dym = base - my
          const md2 = dxm*dxm + dym*dym, md = Math.sqrt(md2) + .001
          const hole = Math.exp(-md2 / 520) * mouse.active
          const ring = Math.exp(-Math.pow(md - 17, 2) / 170) * mouse.active
          const drag = Math.min(.62, Math.sqrt(mouse.vx*mouse.vx + mouse.vy*mouse.vy) * .055)
          xx += (dxm/md) * (hole*5.8 - ring*1.4) + Math.max(-3.2, Math.min(3.2, mouse.vx*drag)) * hole
          yy += (dym/md) * (hole*4.9 - ring*1.1) + Math.max(-3.6, Math.min(3.6, mouse.vy*drag)) * hole
          pointHeat = Math.max(pointHeat, ring*.68 + hole*.14)
          lineHeat  = Math.max(lineHeat, pointHeat)
        }

        for (const cr of currents) {
          const age = (now - cr.born) / 2200
          const dx = x - cr.x, dy = base - cr.y
          const cd = Math.sqrt(dx*dx + dy*dy) + .001
          const cFall = Math.exp(-(cd*cd) / 2400)
          const cFade = Math.sin(Math.PI * Math.max(0, Math.min(1, age)))
          yy += Math.sin(Math.atan2(dy,dx)*3 + cd*.07 - age*5) * cFall * cFade * cr.power * cr.dir * 3.4
          xx += Math.cos(cd*.06 - age*4) * cFall * cFade * cr.power * 1.0
          pointHeat = Math.max(pointHeat, cFall*cFade*.18)
          lineHeat  = Math.max(lineHeat, pointHeat)
        }

        for (const f of fields) {
          const insideX = x >= f.left && x <= f.right
          const insideY = base >= f.top && base <= f.bottomEdge
          const dxOut = Math.max(f.left - x, 0, x - f.right)
          const dyOut = Math.max(f.top - base, 0, base - f.bottomEdge)
          const outsideDist = Math.sqrt(dxOut*dxOut + dyOut*dyOut)
          const innerEdge = insideX && insideY ? Math.min(x-f.left, f.right-x, base-f.top, f.bottomEdge-base) : 999
          const edgeDist = insideX && insideY ? innerEdge : outsideDist
          const bw = Math.max(1.1, 2.6 / PIXEL)
          const frameFall = Math.exp(-Math.pow(edgeDist / bw, 2))
          const below = Math.max(0, base - f.bottomEdge)
          const sideGap = insideX ? 0 : Math.min(Math.abs(x-f.left), Math.abs(x-f.right))
          const vBand = base >= f.top - Math.max(4,12/PIXEL) && base <= f.bottomEdge + Math.max(8,28/PIXEL)
          const nearSide   = vBand && sideGap <= Math.max(5,18/PIXEL)
          const nearTop    = base <= f.top && Math.max(0,f.top-base) <= Math.max(4,14/PIXEL) && x >= f.left-Math.max(4,12/PIXEL) && x <= f.right+Math.max(4,12/PIXEL)
          const nearBottom = base >= f.bottomEdge && below <= Math.max(9,34/PIXEL) && x >= f.left-Math.max(6,20/PIXEL) && x <= f.right+Math.max(6,20/PIXEL)
          const frameMask = (insideX || insideY || nearTop || nearBottom || nearSide) ? 1 : 0
          const hSpan = insideX ? 1 : Math.exp(-Math.pow(sideGap / Math.max(6,22/PIXEL), 2))
          const underside = base >= f.bottomEdge ? Math.exp(-Math.pow(below / Math.max(10,42/PIXEL), 2)) * hSpan : 0
          const activeFrame = frameFall * frameMask * (insideX && insideY ? .52 : 1)
          if (activeFrame > .02 || underside > .02) {
            const cxPull = (f.x - x) / Math.max(1, f.rx)
            const bPull  = Math.max(0, 1 - Math.abs(x-f.x) / Math.max(1, f.rx))
            xx += cxPull * activeFrame * .55
            yy += activeFrame * .58 + underside * (8.0 + bPull * 5.2)
            pointGravity  = Math.max(pointGravity, activeFrame*.34 + underside*.34)
            lineGravity   = Math.max(lineGravity, pointGravity)
          }
        }

        if (first) { ctx.moveTo(xx, yy); first = false } else ctx.lineTo(xx, yy)
        if (hash2(lineIndex, Math.round(x/3)) > .955 - pointHeat*.06 - pointGravity*.11)
          dust.push({ x:xx, y:yy, heat:pointHeat, gravity:pointGravity })
        if (pointHeat > .16 || pointGravity > .18)
          hotDust.push({ x:xx, y:yy, heat:pointHeat, gravity:pointGravity })
      }

      const alpha = Math.min(.24, baseAlpha + lineHeat*.06 + lineGravity*.018)
      ctx.strokeStyle = rgba(baseColor, alpha)
      ctx.lineWidth = bright ? 1.12 : 1
      ctx.lineJoin = 'miter'; ctx.lineCap = 'butt'; ctx.stroke()

      for (const p of dust) {
        const dc = p.gravity > p.heat && p.gravity > .11 ? green : baseColor
        ctx.fillStyle = rgba(dc, Math.min(.26, (bright?.10:.055) + p.heat*.15 + p.gravity*.20))
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1)
      }
      for (const hp of hotDust) {
        ctx.fillStyle = rgba(hp.heat > hp.gravity ? accent : green, Math.min(.42, .075 + hp.heat*.42 + hp.gravity*.26))
        ctx.fillRect(Math.round(hp.x), Math.round(hp.y), 1, 1)
      }
      lineIndex++
    }
  }

  resize()
  const onMouseMove = (e: MouseEvent) => { mouse.tx = e.clientX; mouse.ty = e.clientY }
  const onMouseLeave = () => { mouse.tx = -9999; mouse.ty = -9999 }
  const onMouseDown = (e: MouseEvent) => { if (e.button === 0) pulseAt(e.clientX, e.clientY, .7) }
  const fieldTouch = (e: TouchEvent) => {
    if (anyOpen.value) return
    const target = e.target as Element | null
    if (target?.closest('.ak-dock, .ak-menubar, button, a, input, textarea, select')) return
    const touch = e.touches[0]
    if (!touch) return
    e.preventDefault()
    mouse.tx = touch.clientX
    mouse.ty = touch.clientY
    return touch
  }
  const onTouchStart = (e: TouchEvent) => {
    const touch = fieldTouch(e)
    if (touch) pulseAt(touch.clientX, touch.clientY, .62)
  }
  const onTouchMove = (e: TouchEvent) => { fieldTouch(e) }
  const onTouchEnd = () => { mouse.tx = -9999; mouse.ty = -9999 }
  addEventListener('resize', scheduleResize)
  addEventListener('mousemove', onMouseMove, { passive: true })
  addEventListener('mouseleave', onMouseLeave)
  addEventListener('mousedown', onMouseDown, { passive: true })
  addEventListener('touchstart', onTouchStart, { passive: false })
  addEventListener('touchmove', onTouchMove, { passive: false })
  addEventListener('touchend', onTouchEnd, { passive: true })
  addEventListener('touchcancel', onTouchEnd, { passive: true })
  rafId = requestAnimationFrame(paint)

  cleanupAmbient = () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    cancelAnimationFrame(resizeRaf)
    removeEventListener('resize', scheduleResize)
    removeEventListener('mousemove', onMouseMove)
    removeEventListener('mouseleave', onMouseLeave)
    removeEventListener('mousedown', onMouseDown)
    removeEventListener('touchstart', onTouchStart)
    removeEventListener('touchmove', onTouchMove)
    removeEventListener('touchend', onTouchEnd)
    removeEventListener('touchcancel', onTouchEnd)
    delete (window as any).akarmainAmbientPulse
  }
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  cleanupAmbient?.()
})
</script>

<template>
  <canvas ref="canvas" :class="['ak-ambient-noise', { 'is-resizing': isViewportResizing, 'is-interacting': isInteracting }]" aria-hidden="true" style="position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;image-rendering:pixelated;" />
</template>
