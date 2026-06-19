import { ref, watch, onMounted } from 'vue'
import { windows as WIN_DEFS } from '~/data/windows'
import { projects } from '~/data/projects'

// Deep links: URL ↔ состояние окон. Публичные ключи в ~/data/windows.ts (key)
// и ~/data/projects.ts (slug) — технические win-id наружу не светим.
const KEY_TO_ID: Record<string, string> = {}
const ID_TO_KEY: Record<string, string> = {}
for (const w of WIN_DEFS) { KEY_TO_ID[w.key] = w.id; ID_TO_KEY[w.id] = w.key }

// Выделенный проект в окне «~/проекты» (?project=slug). Одно на сайт — как и окна.
const activeProject = ref<string | null>(null)

// Вызывается один раз из app/pages/index.vue: читает query на старте и держит URL
// в актуальном состоянии при кликах. Неизвестный query тихо игнорируется (грузимся как обычно).
export function useDeepLinks() {
  const { wins, openWin } = useWindows()
  const route = useRoute()
  const router = useRouter()

  // верхнее видимое окно (по z); закрытые и свёрнутые не считаются
  function topWinId(): string | null {
    let id: string | null = null, z = -1
    for (const k in wins) {
      const w = wins[k]
      if (!w.closed && !w.min && w.z > z) { z = w.z; id = k }
    }
    return id
  }

  // ЧТЕНИЕ: query → открыть окно/проект
  function applyQuery(q = route.query) {
    const slug = typeof q.project === 'string' ? q.project : ''
    const key = typeof q.window === 'string' ? q.window : ''
    if (slug && projects.some(p => p.slug === slug)) {
      activeProject.value = slug
      openWin('winWork')
    } else if (key && KEY_TO_ID[key]) {
      openWin(KEY_TO_ID[key])
    }
  }

  // ЗАПИСЬ: верхнее окно (или выделенный проект) → URL. router.replace = navigateTo
  // в replace-режиме без рисков с Nuxt-контекстом внутри watch; локаль (/en) сохраняем через route.path.
  function syncUrl() {
    const top = topWinId()
    const query: Record<string, string> = {}
    if (top === 'winWork' && activeProject.value) query.project = activeProject.value
    else if (top && ID_TO_KEY[top]) query.window = ID_TO_KEY[top]
    router.replace({ path: route.path, query })
  }

  function selectProject(slug: string) {
    activeProject.value = slug
    openWin('winWork')
  }

  // только на клиенте: wins/activeProject — модульные синглтоны, на сервере их не трогаем,
  // иначе deep-link одного запроса протёк бы в SSR соседнего. Окно открывается за boot-оверлеем.
  onMounted(() => {
    applyQuery()
    watch([topWinId, activeProject], syncUrl)
  })

  return { activeProject, selectProject }
}
