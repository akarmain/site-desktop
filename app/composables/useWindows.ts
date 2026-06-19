import { reactive, computed, ref } from 'vue'
import { windows as WIN_DEFS } from '~/data/windows'

interface WinState { closed: boolean; min: boolean; z: number; focused: boolean }

// shared flag — set true during drag/resize so canvas skips expensive frames
const isInteracting = ref(false)

// build initial state from the data registry (~/data/windows.ts)
const wins = reactive<Record<string, WinState>>(
  Object.fromEntries(
    WIN_DEFS.map((w, i) => [w.id, { closed: !w.open, min: false, z: 12 + i, focused: !!w.open }])
  )
)

let _z = Math.max(...WIN_DEFS.map((_, i) => 12 + i))

function focusWin(id: string) {
  for (const k in wins) wins[k].focused = false
  if (wins[id]) { wins[id].focused = true; wins[id].z = ++_z }
}

function openWin(id: string) {
  if (!wins[id]) return
  wins[id].closed = false
  wins[id].min = false
  focusWin(id)
}

function closeWin(id: string) {
  if (!wins[id]) return
  wins[id].closed = true
  wins[id].focused = false
}

function toggleMin(id: string) {
  if (!wins[id]) return
  wins[id].min = !wins[id].min
}

const anyOpen = computed(() => Object.values(wins).some(w => !w.closed))

export function useWindows() {
  return { wins, focusWin, openWin, closeWin, toggleMin, anyOpen, isInteracting }
}
