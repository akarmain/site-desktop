import { ref, onMounted } from 'vue'

type AkTheme = 'dark' | 'light'
const STORAGE_KEY = 'akos-theme'

// shared across components
const theme = ref<AkTheme>('dark')
let mediaListenerAttached = false

function systemTheme(): AkTheme {
  if (!import.meta.client) return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function setTheme(next: AkTheme) {
  theme.value = next
  if (!import.meta.client) return
  const root = document.documentElement
  if (next === 'light') root.setAttribute('data-theme', 'light')
  else root.removeAttribute('data-theme')
}

function applyTheme(next: AkTheme) {
  setTheme(next)
  if (!import.meta.client) return
  try { localStorage.setItem(STORAGE_KEY, next) } catch { /* ignore */ }
}

function savedTheme(): AkTheme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'light' || saved === 'dark' ? saved : null
  } catch {
    return null
  }
}

export function useAkTheme() {
  onMounted(() => {
    const saved = savedTheme()
    setTheme(saved ?? systemTheme())

    if (!mediaListenerAttached) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
      mediaQuery.addEventListener('change', () => {
        if (!savedTheme()) setTheme(systemTheme())
      })
      mediaListenerAttached = true
    }
  })

  const toggleTheme = () => applyTheme(theme.value === 'light' ? 'dark' : 'light')

  return { theme, applyTheme, toggleTheme }
}
