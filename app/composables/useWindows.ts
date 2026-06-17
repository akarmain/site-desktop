import { reactive, computed, ref } from 'vue'

interface WinState { closed: boolean; min: boolean; z: number; focused: boolean }

// shared flag — set true during drag/resize so canvas skips expensive frames
const isInteracting = ref(false)

const wins = reactive<Record<string, WinState>>({
  winAbout:    { closed: false, min: false, z: 30, focused: true },
  winWork:     { closed: true,  min: false, z: 12, focused: false },
  winStack:    { closed: true,  min: false, z: 13, focused: false },
  winSvc:      { closed: true,  min: false, z: 14, focused: false },
  winExp:      { closed: true,  min: false, z: 15, focused: false },
  winTerm:     { closed: true,  min: false, z: 16, focused: false },
  winSettings: { closed: true,  min: false, z: 20, focused: false },
})

let _z = 30

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
