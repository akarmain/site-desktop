<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AkDesktopWindow from '~/components/ak/AkDesktopWindow.vue'
import { windows } from '~/data/windows'
import { socialLinks, bentoLinks } from '~/data/links'
import { projects } from '~/data/projects'
import { services } from '~/data/services'
import { stack } from '~/data/stack'
import { experience } from '~/data/experience'

const { theme, toggleTheme } = useAkTheme()
const { wins, openWin, closeWin, anyOpen } = useWindows()
const { locale, setLocale } = useI18n()
const loc = useLoc()

const dockMain = windows.filter(w => w.id !== 'winSettings')

// ── clock ──
const clock = ref('--:--')
let clockTick: ReturnType<typeof setInterval>
onMounted(() => {
  const tick = () => {
    const d = new Date()
    clock.value = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  tick(); clockTick = setInterval(tick, 15000)
})
onUnmounted(() => clearInterval(clockTick))

// ── ambient: off on mobile / reduced-motion (canvas is the heaviest thing on the page) ──
const enableAmbient = ref(false)
onMounted(() => {
  // ponytail: evaluated once on mount — a mid-session resize across the breakpoint won't re-toggle it.
  enableAmbient.value = !matchMedia('(max-width: 759px)').matches
    && !matchMedia('(prefers-reduced-motion: reduce)').matches
})

// ── hint ──
const hintOpacity = ref(1)
onMounted(() => setTimeout(() => hintOpacity.value = 0, 9000))

// ── bento expand ──
const showBento = ref(false)
const winAboutRef = ref<InstanceType<typeof AkDesktopWindow>>()
function toggleBento() {
  showBento.value = !showBento.value
  if (showBento.value) winAboutRef.value?.maximize()
  else winAboutRef.value?.restore()
}

// ── settings / theme cfg ──
const cfgTheme = computed(() => theme.value === 'light' ? 'cfg_theme_light' : 'cfg_theme_dark')

// ── dock magnification ──
const dockEl = ref<HTMLElement>()
// ponytail: cache button centers — recomputed only on resize, not every mousemove
let dockBtnCache: { el: HTMLElement; cx: number }[] = []
function refreshDockCache() {
  if (!dockEl.value) return
  dockBtnCache = Array.from(dockEl.value.querySelectorAll<HTMLElement>('button')).map(btn => {
    const r = btn.getBoundingClientRect()
    return { el: btn, cx: r.left + r.width / 2 }
  })
}
let _magRaf = 0, _magEv: MouseEvent | null = null
function magnifyDock(e: MouseEvent) {
  _magEv = e
  if (!_magRaf) _magRaf = requestAnimationFrame(() => {
    _magRaf = 0
    const ev = _magEv!
    if (!dockBtnCache.length) refreshDockCache()
    for (const { el, cx } of dockBtnCache) {
      const d = Math.abs(ev.clientX - cx)
      const mag = d < 90 ? 1 + (1 - d / 90) * 0.42 : 1
      el.style.setProperty('--mag', mag.toFixed(3))
      el.style.transform = `scale(${mag.toFixed(3)})`
    }
  })
}
function resetDock() {
  dockEl.value?.querySelectorAll<HTMLElement>('button').forEach(btn => {
    btn.style.setProperty('--mag', '1'); btn.style.transform = ''
  })
  dockBtnCache = [] // reset cache on leave so next enter re-reads positions
}

// dock indicator classes per window
function dockCls(id: string) {
  const w = wins[id]
  if (!w || w.closed) return ''
  return w.min ? 'mini' : 'open'
}

// ── ESC closes focused window ──
function handleEsc(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if ((document.activeElement as HTMLElement)?.id === 'termIn') return
  const entry = Object.entries(wins).find(([, w]) => w.focused && !w.closed)
  if (entry) closeWin(entry[0])
}
onMounted(() => window.addEventListener('keydown', handleEsc))
onUnmounted(() => window.removeEventListener('keydown', handleEsc))
</script>

<template>
  <div
    :class="['akos-desktop', { 'all-closed': !anyOpen }]"
    style="width:100vw;height:100vh;overflow:hidden;position:relative;user-select:none;"
  >
    <!-- ambient noise canvas (client-only, desktop + motion-ok only) -->
    <ClientOnly><AkAmbientNoise v-if="enableAmbient" /></ClientOnly>

    <!-- ── menubar ── -->
    <nav class="ak-menubar">
      <span class="ak-menubar__logo">
        <span class="ak-menubar__brand-mark">
          <img src="/assets/logo.png" alt="" class="ak-logo-default" />
          <img src="/assets/logo2.png" alt="" class="ak-logo-hover" />
        </span>
        akarmain
      </span>
      <div class="ak-menubar__right">
        <span>{{ clock }}</span>
        <button class="ak-settings-gear" :title="$t('settings_title')" :aria-label="$t('settings_title')" @click="openWin('winSettings')">
          <svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" fill="currentColor">
            <rect x="7" y="1" width="2" height="3"/><rect x="7" y="12" width="2" height="3"/>
            <rect x="1" y="7" width="3" height="2"/><rect x="12" y="7" width="3" height="2"/>
            <rect x="4" y="3" width="2" height="2"/><rect x="10" y="3" width="2" height="2"/>
            <rect x="4" y="11" width="2" height="2"/><rect x="10" y="11" width="2" height="2"/>
            <rect x="5" y="5" width="6" height="6"/>
            <rect x="7" y="7" width="2" height="2" fill="var(--ak-panel)"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- ── windows ── -->
    <div class="stage">

      <!-- контакты.vcf -->
      <AkDesktopWindow ref="winAboutRef" win-id="winAbout" :title="loc(windows[0].title)" default-width="340px">
        <div class="contact-layout">
          <div class="contact-profile" :class="{ expanded: showBento }">
            <div class="profile-hero">
              <div class="avatar-wrap">
                <img class="avatar" src="/assets/akarmain-avatar.jpeg" :alt="$t('profile_name')" width="192" height="192"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                <div style="display:none;width:100%;height:100%;background:var(--ak-panel-2);align-items:center;justify-content:center;font:600 28px/1 var(--ak-font-sans);color:var(--ak-accent);">АК</div>
              </div>
              <span class="profile-status" :title="$t('profile_online')" />
            </div>
            <div class="profile-name">{{ $t('profile_name') }}</div>
            <div class="profile-role">{{ $t('profile_role') }}</div>
            <p class="profile-bio">{{ $t('profile_bio_1') }}<br><b>{{ $t('profile_bio_strong') }}</b>{{ $t('profile_bio_tail') }}</p>
            <div class="social-row">
              <a v-for="s in socialLinks" :key="s.icon" class="social-btn" :href="s.href"
                 :target="s.href.startsWith('http') ? '_blank' : undefined" rel="noopener" :title="loc(s.title)">
                <AkIcon :name="s.icon" />
              </a>
            </div>
            <button class="more-links-btn" @click="toggleBento">{{ showBento ? $t('less_links') : $t('more_links') }}</button>
          </div>

          <!-- bento panel -->
          <div class="bento-panel" :class="{ show: showBento }">
            <div class="bento-grid">
              <a v-for="b in bentoLinks" :key="b.icon" class="bento-item" :class="b.cls" :href="b.href" target="_blank" rel="noopener">
                <AkIcon :name="b.icon" />
                <span>{{ loc(b.label) }}</span>
              </a>
            </div>
          </div>
        </div>
      </AkDesktopWindow>

      <!-- ~/проекты -->
      <AkDesktopWindow win-id="winWork" :title="loc(windows[1].title)" default-width="470px">
        <div class="files">
          <a v-for="p in projects" :key="p.title.ru" class="file" :href="p.href" target="_blank" rel="noopener">
            <AkIcon :name="p.icon" />
            <span class="nm"><b>{{ loc(p.title) }}</b><span>{{ loc(p.sub) }}</span></span>
            <span class="meta">{{ loc(p.meta) }}</span><span class="badge" :class="p.badge">{{ p.badge }}</span>
          </a>
        </div>
      </AkDesktopWindow>

      <!-- стек.json -->
      <AkDesktopWindow win-id="winStack" :title="loc(windows[2].title)" default-width="430px">
        <div v-for="g in stack" :key="g.name.ru" class="stack-grp">
          <h3><i>{{ loc(g.name) }}</i></h3>
          <div class="chips"><span v-for="c in g.chips" :key="loc(c)" class="ak-chip">{{ loc(c) }}</span></div>
        </div>
      </AkDesktopWindow>

      <!-- услуги.md -->
      <AkDesktopWindow win-id="winSvc" :title="loc(windows[3].title)" default-width="450px">
        <div class="svc">
          <div v-for="s in services" :key="s.title.ru"><span class="sq"/><div><b>{{ loc(s.title) }}</b><span>{{ loc(s.desc) }}</span></div></div>
        </div>
      </AkDesktopWindow>

      <!-- опыт.log -->
      <AkDesktopWindow win-id="winExp" :title="loc(windows[4].title)" default-width="420px">
        <div class="tl">
          <div v-for="e in experience" :key="e.title.ru"><span class="yr">{{ loc(e.year) }}</span><div><b>{{ loc(e.title) }}</b><span>{{ loc(e.desc) }}</span></div></div>
        </div>
      </AkDesktopWindow>

      <!-- терминал -->
      <AkDesktopWindow win-id="winTerm" :title="loc(windows[5].title)" default-width="460px" nopad>
        <template #body>
          <AkTerminalInteractive />
        </template>
      </AkDesktopWindow>

      <!-- настройки.cfg -->
      <AkDesktopWindow win-id="winSettings" :title="loc(windows[6].title)" default-width="310px">
        <div class="cfg">
          <div class="cfg-row">
            <div><div class="cfg-label">{{ $t('cfg_theme') }}</div></div>
            <button :class="['cfg-toggle', { on: theme === 'light' }]" @click="toggleTheme">{{ $t(cfgTheme) }}</button>
          </div>
          <div class="cfg-row">
            <div><div class="cfg-label">{{ $t('cfg_lang') }}</div><div class="cfg-desc">{{ $t('cfg_lang_desc') }}</div></div>
            <div class="cfg-choice">
              <button :class="{ on: locale === 'ru' }" @click="setLocale('ru')">{{ $t('cfg_lang_ru') }}</button>
              <button :class="{ on: locale === 'en' }" @click="setLocale('en')">{{ $t('cfg_lang_en') }}</button>
            </div>
          </div>
          <div class="cfg-row">
            <div><div class="cfg-label">© 2022-{{ new Date().getFullYear() }} akarmain</div></div>
          </div>
        </div>
      </AkDesktopWindow>

    </div><!-- /stage -->

    <!-- ── desktop icons ── -->
    <div class="ak-desktop-icons">
      <a class="ak-desktop-icon" href="https://github.com/akarmain" target="_blank" rel="noopener">
        <span class="ak-desktop-icon__box"><AkIcon name="desktop-github" /></span>
        <span>github</span>
      </a>
      <button v-for="w in dockMain.slice(1)" :key="w.id" class="ak-desktop-icon" @click="openWin(w.id)">
        <span class="ak-desktop-icon__box"><AkIcon :name="w.icon" /></span>
        <span>{{ loc(w.title) }}</span>
      </button>
    </div>

    <!-- ── dock ── -->
    <div ref="dockEl" class="ak-dock ak-notch" @mousemove="magnifyDock" @mouseleave="resetDock">
      <button v-for="w in dockMain" :key="w.id"
              :class="[dockCls(w.id), { 'ak-dock-attention': !anyOpen && w.id === 'winAbout' }]"
              :data-tip="loc(w.title)" :aria-label="loc(w.title)" @click="openWin(w.id)">
        <AkIcon :name="w.icon" />
      </button>
      <span class="ak-dock-sep" />
      <button :class="dockCls('winSettings')" :data-tip="loc(windows[6].title)" :aria-label="loc(windows[6].title)" @click="openWin('winSettings')">
        <AkIcon name="win-settings" />
      </button>
    </div>

    <!-- ── overlays ── -->
    <div class="hint" :style="{ opacity: hintOpacity }">{{ $t('hint') }}</div>
  </div>
</template>
