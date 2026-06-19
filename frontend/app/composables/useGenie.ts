// Genie minimize/restore: fly any element to/from a dock target with a FLIP
// transform. We animate the *live* node, so its current content (expanded list,
// collapsed card, whatever) is what shrinks into the dock — no snapshotting.
//
// Reusable for any icon: pass the element to fly and the dock target to land on.
//   await genie(windowEl, dockIconEl, 'out')   // window → dock
//   await genie(windowEl, dockIconEl, 'in')    // dock → window
// then clearGenie(windowEl) to drop the inline styles.

const GENIE_MS = 360
const EASE = 'cubic-bezier(.4, 0, .2, 1)'

export function genie(el: HTMLElement, target: HTMLElement, mode: 'out' | 'in'): Promise<void> {
  const w = el.getBoundingClientRect()
  const d = target.getBoundingClientRect()
  // uniform scale to dock width keeps the preview undistorted; top-left origin
  // makes the math trivial (scaled width == dock width ⇒ already centered).
  const scale = d.width / w.width
  const cx = d.left + d.width / 2 - (w.left + (w.width * scale) / 2)
  const collapsed = `translate(${cx}px, ${d.top - w.top}px) scale(${scale})`
  const open = 'translate(0px, 0px) scale(1)'
  const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : GENIE_MS

  el.style.transformOrigin = 'top left'
  el.style.willChange = 'transform, opacity'
  el.style.pointerEvents = 'none'
  el.style.transition = 'none'
  el.style.transform = mode === 'out' ? open : collapsed
  el.style.opacity = mode === 'out' ? '1' : '0'
  el.getBoundingClientRect() // force reflow so the start state sticks

  return new Promise(resolve => {
    el.style.transition = `transform ${ms}ms ${EASE}, opacity ${ms}ms ease`
    el.style.transform = mode === 'out' ? collapsed : open
    el.style.opacity = mode === 'out' ? '0' : '1'
    if (ms === 0) resolve()
    else setTimeout(resolve, ms)
  })
}

// Fill a dock preview box with a static, scaled clone of the live window, so the
// tray thumbnail mirrors whatever the window looked like (expanded list, card, …).
// ponytail: clones DOM, not pixels — <canvas> (terminal) won't carry its drawing;
// rasterize with html2canvas if a faithful terminal thumb ever matters.
export function snapshotInto(box: HTMLElement, el: HTMLElement) {
  const w = el.getBoundingClientRect()
  const clone = el.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  clone.style.cssText = ''
  clone.style.position = 'absolute'
  clone.style.left = '0'
  clone.style.top = '0'
  clone.style.width = w.width + 'px'
  clone.style.height = w.height + 'px'
  clone.style.pointerEvents = 'none'
  const scale = Math.min(box.clientWidth / w.width, box.clientHeight / w.height)
  clone.style.transformOrigin = 'top left'
  clone.style.transform = `translate(${(box.clientWidth - w.width * scale) / 2}px, ${(box.clientHeight - w.height * scale) / 2}px) scale(${scale})`
  box.replaceChildren(clone)
}

export function clearGenie(el: HTMLElement) {
  for (const p of ['transition', 'transform', 'opacity', 'transformOrigin', 'willChange', 'pointerEvents'] as const)
    el.style[p] = ''
}
