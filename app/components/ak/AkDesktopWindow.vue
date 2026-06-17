<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  winId: string
  title: string
  defaultWidth?: string
  nopad?: boolean
}>()

const { wins, focusWin, closeWin, toggleMin, isInteracting } = useWindows()
const win = computed(() => wins[props.winId])

const el = ref<HTMLElement>()
const pos = reactive({ left: '100px', top: '100px', width: props.defaultWidth ?? '340px', height: '' })
const moved = ref(false)
const interacting = ref(false)
const animClass = ref('')
const beforeMaximize = ref<typeof pos | null>(null)

const MIN_W = 280, MIN_H = 180

function centerWin() {
  if (!el.value || window.innerWidth < 760) return
  const ww = el.value.offsetWidth || parseInt(props.defaultWidth ?? '340')
  const wh = el.value.offsetHeight || 320
  pos.left = Math.max(14, window.innerWidth / 2 - ww / 2) + 'px'
  pos.top  = Math.max(54, (window.innerHeight - 56) / 2 - wh / 2 + 8) + 'px'
}

function maximize() {
  if (!el.value) return
  const bar  = document.querySelector('.ak-menubar')
  const dock = document.querySelector('.ak-dock')
  const barH = bar  ? bar.getBoundingClientRect().bottom : 0
  const dockT = dock ? dock.getBoundingClientRect().top  : window.innerHeight
  const top = Math.max(20, barH + 20)
  const h   = Math.max(180, Math.min(window.innerHeight - 20, dockT - 20) - top)
  beforeMaximize.value = { ...pos }
  pos.left = '20px'; pos.top = top + 'px'
  pos.width = (window.innerWidth - 40) + 'px'; pos.height = h + 'px'
}

function restore() {
  if (beforeMaximize.value) { Object.assign(pos, beforeMaximize.value); beforeMaximize.value = null }
}

defineExpose({ maximize, restore })

function startDrag(e: MouseEvent) {
  if ((e.target as Element).closest('button')) return
  if (window.innerWidth < 760) return
  e.preventDefault()
  focusWin(props.winId)
  interacting.value = true
  isInteracting.value = true
  const sl = el.value!.offsetLeft, st = el.value!.offsetTop
  const ox = e.clientX, oy = e.clientY
  // ponytail: transform skips layout+paint entirely (compositor-only); commit left/top only on mouseup
  let raf = 0, ddx = 0, ddy = 0, latestX = ox, latestY = oy
  const mv = (ev: MouseEvent) => {
    moved.value = true
    latestX = ev.clientX; latestY = ev.clientY
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0
      ddx = Math.max(-sl, Math.min(window.innerWidth  - 120 - sl, latestX - ox))
      ddy = Math.max(42 - st, Math.min(window.innerHeight - 60 - st, latestY - oy))
      el.value!.style.transform = `translate(${ddx}px,${ddy}px)`
    })
  }
  const up = () => {
    cancelAnimationFrame(raf)
    pos.left = (sl + ddx) + 'px'
    pos.top  = (st + ddy) + 'px'
    nextTick(() => { if (el.value) el.value.style.transform = '' })
    interacting.value = false
    isInteracting.value = false
    removeEventListener('mousemove', mv); removeEventListener('mouseup', up)
  }
  addEventListener('mousemove', mv); addEventListener('mouseup', up)
}

function startResize(e: MouseEvent, dir: string) {
  if (window.innerWidth < 760) return
  e.preventDefault(); e.stopPropagation()
  focusWin(props.winId); moved.value = true; interacting.value = true
  isInteracting.value = true
  const sx = e.clientX, sy = e.clientY
  const sw = el.value!.offsetWidth, sh = el.value!.offsetHeight
  const sl = el.value!.offsetLeft,  st = el.value!.offsetTop
  document.body.style.cursor = getComputedStyle(e.target as Element).cursor
  let raf = 0, latest = e
  const mv = (ev: MouseEvent) => {
    latest = ev
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0
      const dx = latest.clientX - sx, dy = latest.clientY - sy
      let nw = sw, nh = sh, nl = sl, nt = st
      if (dir.includes('e')) nw = Math.max(MIN_W, sw + dx)
      if (dir.includes('w')) { const ad = Math.min(dx, sw - MIN_W); nw = sw - ad; nl = sl + ad }
      if (dir.includes('s')) nh = Math.max(MIN_H, sh + dy)
      if (dir.includes('n')) { const ad = Math.min(dy, sh - MIN_H); nh = sh - ad; nt = Math.max(42, st + ad) }
      nl = Math.max(0, Math.min(window.innerWidth - 100, nl))
      nt = Math.max(42, nt)
      nw = Math.min(window.innerWidth - nl - 8, nw)
      nh = Math.min(window.innerHeight - nt - 8, nh)
      // ponytail: direct DOM writes bypass Vue reconciliation during resize
      el.value!.style.left = nl + 'px'; el.value!.style.top = nt + 'px'
      el.value!.style.width = nw + 'px'; el.value!.style.height = nh + 'px'
    })
  }
  const up = () => {
    cancelAnimationFrame(raf)
    pos.left = el.value!.offsetLeft + 'px'; pos.top = el.value!.offsetTop + 'px'
    pos.width = el.value!.offsetWidth + 'px'; pos.height = el.value!.offsetHeight + 'px'
    document.body.style.cursor = ''
    interacting.value = false
    isInteracting.value = false
    removeEventListener('mousemove', mv); removeEventListener('mouseup', up)
  }
  addEventListener('mousemove', mv); addEventListener('mouseup', up)
}

onMounted(() => {
  if (!win.value.closed && !moved.value) nextTick(centerWin)
})

watch(() => win.value?.closed, (now, before) => {
  if (before && !now) {
    animClass.value = ''
    nextTick(() => {
      animClass.value = 'anim-in'
      if (!moved.value) centerWin()
      setTimeout(() => animClass.value = '', 220)
    })
  }
})
</script>

<template>
  <section
    v-show="!win.closed"
    ref="el"
    :class="['ak-window', 'ak-notch', animClass, { min: win.min, 'is-interacting': interacting }]"
    :data-focus="win.focused ? 'true' : 'false'"
    :style="{ left: pos.left, top: pos.top, width: pos.width, height: pos.height || undefined, zIndex: win.z }"
    @mousedown="focusWin(winId)"
  >
    <div class="ak-window__head" @mousedown="startDrag">
      <span>{{ title }}</span>
      <span class="ak-dither grow" />
      <button class="ak-window__wbtn" :aria-label="win.min ? 'Развернуть' : 'Свернуть'" @click.stop="toggleMin(winId)">{{ win.min ? '+' : '—' }}</button>
      <button class="ak-window__wbtn" aria-label="Закрыть" @click.stop="closeWin(winId)">×</button>
    </div>

    <slot name="body">
      <div :class="['ak-window__body', { 'ak-window__body--nopad': nopad }]">
        <slot />
      </div>
    </slot>

    <div v-for="d in ['n','s','e','w','nw','ne','sw','se']" :key="d"
         :class="`ak-win-edge ${d}`" aria-hidden="true"
         @mousedown.prevent="startResize($event, d)" />
  </section>
</template>
