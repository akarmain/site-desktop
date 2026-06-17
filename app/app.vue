<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { theme, toggleTheme } = useAkTheme()
const { wins, openWin, closeWin, focusWin, anyOpen } = useWindows()

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
const cfgTheme = computed(() => theme.value === 'light' ? 'светлая' : 'тёмная')
const activeLang = ref('рус')

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

// ── import for expose typing ──
import AkDesktopWindow from '~/components/ak/AkDesktopWindow.vue'
</script>

<template>
  <div
    :class="['akos-desktop', { 'all-closed': !anyOpen }]"
    style="width:100vw;height:100vh;overflow:hidden;position:relative;user-select:none;"
  >
    <!-- ambient noise canvas (client-only) -->
    <ClientOnly><AkAmbientNoise /></ClientOnly>

    <!-- ── menubar ── -->
    <nav class="ak-menubar">
      <span class="ak-menubar__logo">
        <span class="ak-menubar__brand-mark">
          <svg width="14" height="14" viewBox="0 0 14 14" shape-rendering="crispEdges" fill="var(--ak-accent)">
            <rect x="3" y="1" width="8" height="2"/><rect x="1" y="3" width="12" height="8"/>
            <rect x="3" y="11" width="8" height="2"/>
            <rect x="4" y="4" width="6" height="6" fill="var(--ak-bg)"/>
            <rect x="5" y="5" width="4" height="4" fill="var(--ak-accent)"/>
          </svg>
        </span>
        akarmain
      </span>
      <div class="ak-menubar__right">
        <span>{{ clock }}</span>
        <button class="ak-settings-gear" title="Настройки" aria-label="Настройки" @click="openWin('winSettings')">
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
      <AkDesktopWindow ref="winAboutRef" win-id="winAbout" title="контакты.vcf" default-width="340px">
        <div class="contact-layout">
          <div class="contact-profile" :class="{ expanded: showBento }">
            <div class="profile-hero">
              <div class="avatar-wrap">
                <img class="avatar" src="/assets/akarmain-avatar.jpeg" alt="akarmain" width="192" height="192"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
                <div style="display:none;width:100%;height:100%;background:var(--ak-panel-2);align-items:center;justify-content:center;font:600 28px/1 var(--ak-font-sans);color:var(--ak-accent);">АК</div>
              </div>
              <span class="profile-status" title="online" />
            </div>
            <div class="profile-name">Андрей Кармаев</div>
            <div class="profile-role">fullstack-разработчик</div>
            <p class="profile-bio">Моя жизнь в стиле «Мяу»<br><b>От идеи до прода</b> — за дни, не месяцы.</p>
            <div class="social-row">
              <a class="social-btn" href="https://t.me/akarmain" target="_blank" rel="noopener" title="Telegram">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 2.1 1.2 7.4c-.8.3-.8.9 0 1.1l3.3 1 1.3 4c.2.5.6.6 1 .3l1.8-1.5 3.5 2.6c.6.4 1.1.2 1.3-.6l2.4-11c.2-.9-.3-1.4-1.3-1.2zM5.7 8.9l5.9-3.6c.3-.2.5 0 .3.2l-4.9 4.4-.2 2.1-1.1-3.1z"/></svg>
              </a>
              <a class="social-btn" href="mailto:hi@akarmain.dev" title="Почта">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 4v8h14V4H1zm12.3 1L8 8.5 2.7 5h10.6zM2 11V6l6 4 6-4v5H2z"/></svg>
              </a>
              <a class="social-btn" href="https://github.com/akarmain" target="_blank" rel="noopener" title="GitHub">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .5a7.5 7.5 0 0 0-2.4 14.6c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.5-1-2.5-1-.3-.9-.8-1.1-.8-1.1-.7-.5 0-.5 0-.5.7.1 1.1.8 1.1.8.6 1.1 1.7.8 2.1.6 0-.5.2-.8.4-1-1.7-.2-3.4-.8-3.4-3.7 0-.8.3-1.5.8-2 0-.2-.3-1 .1-2 0 0 .6-.2 2 .8a7 7 0 0 1 3.6 0c1.4-1 2-.8 2-.8.4 1 .2 1.8.1 2 .5.5.8 1.2.8 2 0 2.9-1.7 3.5-3.4 3.7.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A7.5 7.5 0 0 0 8 .5z"/></svg>
              </a>
            </div>
            <button class="more-links-btn" @click="toggleBento">{{ showBento ? '← свернуть' : 'ещё ссылки →' }}</button>
          </div>

          <!-- bento panel -->
          <div class="bento-panel" :class="{ show: showBento }">
            <div class="bento-grid">
              <a class="bento-item lg work" href="https://t.me/akarmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M14.5 2.1 1.2 7.4c-.8.3-.8.9 0 1.1l3.3 1 1.3 4c.2.5.6.6 1 .3l1.8-1.5 3.5 2.6c.6.4 1.1.2 1.3-.6l2.4-11c.2-.9-.3-1.4-1.3-1.2zM5.7 8.9l5.9-3.6c.3-.2.5 0 .3.2l-4.9 4.4-.2 2.1-1.1-3.1z"/></svg>
                <span>telegram</span>
              </a>
              <a class="bento-item work" href="https://github.com/akarmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 .5a7.5 7.5 0 0 0-2.4 14.6c.4.1.5-.2.5-.4v-1.4c-2.1.5-2.5-1-2.5-1-.3-.9-.8-1.1-.8-1.1-.7-.5 0-.5 0-.5.7.1 1.1.8 1.1.8.6 1.1 1.7.8 2.1.6 0-.5.2-.8.4-1-1.7-.2-3.4-.8-3.4-3.7 0-.8.3-1.5.8-2 0-.2-.3-1 .1-2 0 0 .6-.2 2 .8a7 7 0 0 1 3.6 0c1.4-1 2-.8 2-.8.4 1 .2 1.8.1 2 .5.5.8 1.2.8 2 0 2.9-1.7 3.5-3.4 3.7.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A7.5 7.5 0 0 0 8 .5z"/></svg>
                <span>github</span>
              </a>
              <a class="bento-item tall code" href="https://gitlab.com/akarmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="m8 14.5-3.2-9.8h6.4L8 14.5zm-4-9.8L2.5 9.4l-.9 2.8c-.1.3 0 .6.3.8L8 14.5 4 4.7zm8 0 1.5 4.7.9 2.8c.1.3 0 .6-.3.8L8 14.5l4-9.8zm-8 0h6.4L8 1.5 6 4.7H4z"/></svg>
                <span>gitlab</span>
              </a>
              <a class="bento-item lg code" href="https://www.linkedin.com/in/akarmain/" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 3.5A1.5 1.5 0 1 1 5 3.5 1.5 1.5 0 0 1 2 3.5zM2 6h3v8H2V6zm5 0h2.8v1.1h0c.4-.7 1.3-1.4 2.7-1.4 2.9 0 3.4 1.9 3.4 4.4V14h-3v-3.5c0-.8 0-1.9-1.2-1.9s-1.4.9-1.4 1.8V14H7V6z"/></svg>
                <span>linkedin</span>
              </a>
              <a class="bento-item code" href="https://t.me/akarmain_log" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM4 4h8v1H4V4zm0 2h8v1H4V6zm0 2h5v1H4V8z"/></svg>
                <span>блог</span>
              </a>
              <a class="bento-item code" href="https://t.me/akarmain_live" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/><circle cx="8" cy="8" r="1.5"/></svg>
                <span>live</span>
              </a>
              <a class="bento-item hobby" href="https://discordapp.com/users/636565416260534302" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M13.5 3S12 1.5 9.8 1.5l-.2.3c2 .5 2.9 1.2 3.9 2.1-1.7-.8-3.3-1.4-5.5-1.4s-3.8.6-5.5 1.4c1-.9 2-1.6 3.9-2.1l-.2-.3C4 1.5 2.5 3 2.5 3S.5 5.6.5 9.5c1.7 2 4.3 2 4.3 2l.5-.7c-.9-.3-1.9-.8-2.8-1.8 1 .8 2.6 1.5 5.5 1.5s4.5-.7 5.5-1.5c-.9 1-1.9 1.5-2.8 1.8l.5.7s2.6 0 4.3-2C15.5 5.6 13.5 3 13.5 3zM5.7 8.5c-.7 0-1.2-.6-1.2-1.4s.5-1.4 1.2-1.4 1.2.6 1.2 1.4-.5 1.4-1.2 1.4zm4.6 0c-.7 0-1.2-.6-1.2-1.4s.5-1.4 1.2-1.4 1.2.6 1.2 1.4-.5 1.4-1.2 1.4z"/></svg>
                <span>discord</span>
              </a>
              <a class="bento-item hobby" href="https://www.youtube.com/@akrmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M14.4 4.6c-.2-.6-.7-1.1-1.3-1.3C11.9 3 8 3 8 3s-3.9 0-5.1.3c-.6.2-1.1.7-1.3 1.3C1.3 5.8 1.3 8 1.3 8s0 2.2.3 3.4c.2.6.7 1.1 1.3 1.3 1.2.3 5.1.3 5.1.3s3.9 0 5.1-.3c.6-.2 1.1-.7 1.3-1.3.3-1.2.3-3.4.3-3.4s0-2.2-.3-3.4zM6.6 10.2V5.8L10.2 8l-3.6 2.2z"/></svg>
                <span>youtube</span>
              </a>
              <a class="bento-item hobby" href="https://steamcommunity.com/profiles/76561199222030536/" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 0 0-6.9 5.8l3.7 1.5a2 2 0 0 1 1.1-.3l1.8-2.5v-.1a2.6 2.6 0 1 1 2.6 2.6h-.1L7.7 9.8a2 2 0 0 1-2 2.2 2 2 0 0 1-2-1.5L1.2 9.4A7 7 0 1 0 8 1zm-2.3 10a1.2 1.2 0 0 0 1.7-.5 1.2 1.2 0 0 0-.5-1.6l-.8-.3a1.5 1.5 0 0 1 1.9.2 1.5 1.5 0 0 1-1.3 2.5l-1-.3zm4.8-5a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4z"/></svg>
                <span>steam</span>
              </a>
              <a class="bento-item work" href="https://kwork.ru/user/akarmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 4h12v8H2V4zm1 1v6h10V5H3zm2 1h2v4H5V6zm3 0h2v4H8V6zm3 0h1v4h-1V6z"/></svg>
                <span>kwork</span>
              </a>
              <a class="bento-item lg work" href="https://s3.akarmain.ru/S/CV.pdf" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 1v14h8V4l-3-3H4zm7 3H9V2l2 2zM5 14V2h3v3h3v9H5z"/></svg>
                <span>резюме (CV)</span>
              </a>
              <a class="bento-item code" href="https://wakatime.com/@akarmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 12.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM8 4v4l3 2-.6.9L7 8.5V4h1z"/></svg>
                <span>wakatime</span>
              </a>
              <a class="bento-item hobby" href="https://www.tiktok.com/@akar_main" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M10.5 1h-2v9.5a2 2 0 1 1-2-2v-2a4 4 0 1 0 4 4V5.5c.6.3 1.3.5 2 .5v-2c-1.1 0-2-.9-2-2V1z"/></svg>
                <span>tiktok</span>
              </a>
              <a class="bento-item hobby" href="https://www.twitch.tv/akarmain" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 1 1 4v9.5h3.5V15H6l1.5-1.5h2.5L14 9.5V1H2.5zm10 8L10 11.5H7L5.5 13v-1.5H3V2.5h9.5V9zM10 5v3h-1.5V5H10zm-3 0v3H5.5V5H7z"/></svg>
                <span>twitch</span>
              </a>
              <a class="bento-item" href="https://t.me/anonquebot?start=tv3n9" target="_blank" rel="noopener">
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm0 10c-1.7 0-3.2-.8-4.2-2 1-1.2 2.5-2 4.2-2s3.2.8 4.2 2c-1 1.2-2.5 2-4.2 2z"/></svg>
                <span>анонимка</span>
              </a>
            </div>
          </div>
        </div>
      </AkDesktopWindow>

      <!-- ~/проекты -->
      <AkDesktopWindow win-id="winWork" title="~/проекты" default-width="470px">
        <div class="files">
          <a class="file" href="https://t.me/akarmain" target="_blank" rel="noopener">
            <svg class="ak-px-icon" width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="1" y="3" width="6" height="1"/><rect x="1" y="4" width="14" height="1"/><rect x="1" y="5" width="14" height="8"/></g><rect x="2" y="6" width="12" height="6" fill="#131318"/><rect x="2" y="7" width="12" height="5" fill="#8b7ef8"/></svg>
            <span class="nm"><b>finbase — лендинг</b><span>next.js · vercel · 7 дней</span></span>
            <span class="meta">конверсия +30%</span><span class="badge prod">prod</span>
          </a>
          <a class="file" href="https://t.me/akarmain" target="_blank" rel="noopener">
            <svg class="ak-px-icon" width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="1" y="2" width="14" height="12"/></g><rect x="2" y="3" width="12" height="10" fill="#0a0a0d"/><g fill="#7fd49a"><rect x="3" y="5" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="3" y="7" width="1" height="1"/><rect x="6" y="9" width="4" height="1"/></g></svg>
            <span class="nm"><b>парсер каталога</b><span>fastapi · postgres · 10 дней</span></span>
            <span class="meta">40k стр/сутки</span><span class="badge prod">prod</span>
          </a>
          <a class="file" href="https://t.me/akarmain" target="_blank" rel="noopener">
            <svg class="ak-px-icon" width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="1" y="1" width="14" height="14"/></g><rect x="2" y="2" width="12" height="12" fill="#131318"/><g fill="#8b7ef8"><rect x="2" y="2" width="12" height="3"/><rect x="2" y="6" width="3" height="8"/></g></svg>
            <span class="nm"><b>дашборд логистики</b><span>react · supabase · realtime</span></span>
            <span class="meta">в работе</span><span class="badge wip">wip</span>
          </a>
          <a class="file" href="https://t.me/akarmain" target="_blank" rel="noopener">
            <svg class="ak-px-icon" width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="2" y="2" width="12" height="9"/><rect x="4" y="11" width="3" height="2"/><rect x="3" y="13" width="2" height="1"/></g><rect x="3" y="3" width="10" height="7" fill="#0d0d10"/><g fill="#8b7ef8"><rect x="5" y="5" width="2" height="1"/><rect x="5" y="7" width="6" height="1"/></g></svg>
            <span class="nm"><b>бот записи</b><span>grammY · cron · 5 дней</span></span>
            <span class="meta">−80% рутины</span><span class="badge prod">prod</span>
          </a>
          <a class="file" href="https://t.me/akarmain" target="_blank" rel="noopener">
            <svg class="ak-px-icon" width="22" height="22" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="1" y="2" width="14" height="12"/></g><rect x="2" y="3" width="12" height="10" fill="#131318"/><g fill="#8b7ef8"><rect x="4" y="5" width="8" height="1"/><rect x="4" y="7" width="8" height="1"/><rect x="4" y="9" width="5" height="1"/></g></svg>
            <span class="nm"><b>mini crm</b><span>fastapi · react · docker</span></span>
            <span class="meta">канбан + роли</span><span class="badge arch">arch</span>
          </a>
        </div>
      </AkDesktopWindow>

      <!-- стек.json -->
      <AkDesktopWindow win-id="winStack" title="стек.json" default-width="430px">
        <div class="stack-grp"><h3><i>backend</i></h3><div class="chips"><span class="ak-chip">python</span><span class="ak-chip">fastapi</span><span class="ak-chip">rest api</span><span class="ak-chip">sqlalchemy</span><span class="ak-chip">pydantic</span></div></div>
        <div class="stack-grp"><h3><i>frontend</i></h3><div class="chips"><span class="ak-chip">typescript</span><span class="ak-chip">react</span><span class="ak-chip">tailwind</span><span class="ak-chip">html/css</span></div></div>
        <div class="stack-grp"><h3><i>базы данных</i></h3><div class="chips"><span class="ak-chip">postgresql</span><span class="ak-chip">sqlite</span><span class="ak-chip">redis</span></div></div>
        <div class="stack-grp"><h3><i>devops</i></h3><div class="chips"><span class="ak-chip">docker</span><span class="ak-chip">compose</span><span class="ak-chip">git</span><span class="ak-chip">linux</span><span class="ak-chip">nginx</span></div></div>
        <div class="stack-grp"><h3><i>ai / автоматизация</i></h3><div class="chips"><span class="ak-chip">ai-агенты</span><span class="ak-chip">telegram-боты</span><span class="ak-chip">интеграции api</span></div></div>
      </AkDesktopWindow>

      <!-- услуги.md -->
      <AkDesktopWindow win-id="winSvc" title="услуги.md" default-width="450px">
        <div class="svc">
          <div><span class="sq"/><div><b>Backend и REST API</b><span>архитектура, авторизация, документация</span></div></div>
          <div><span class="sq"/><div><b>Telegram-боты</b><span>от записи клиентов до сложных сценариев</span></div></div>
          <div><span class="sq"/><div><b>Парсеры и автоматизация</b><span>рутинные задачи — на автопилот</span></div></div>
          <div><span class="sq"/><div><b>MVP под ключ</b><span>идея → работающий продукт за дни</span></div></div>
          <div><span class="sq"/><div><b>Docker и деплой</b><span>настройка, CI, перенос на сервер</span></div></div>
          <div><span class="sq"/><div><b>Доработка проектов</b><span>интеграции, фиксы, новые фичи</span></div></div>
        </div>
      </AkDesktopWindow>

      <!-- опыт.log -->
      <AkDesktopWindow win-id="winExp" title="опыт.log" default-width="420px">
        <div class="tl">
          <div><span class="yr">2024–2026</span><div><b>Обучение в сфере IT</b><span>backend, frontend, devops — самостоятельно и в командах</span></div></div>
          <div><span class="yr">2025</span><div><b>Фриланс и pet-проекты</b><span>боты, парсеры, лендинги — первые боевые заказы</span></div></div>
          <div><span class="yr">2025–2026</span><div><b>Хакатоны и командные проекты</b><span>работа по спринтам, git-flow, код-ревью</span></div></div>
          <div><span class="yr">сейчас</span><div><b>Коммерческие заказы</b><span>19 проектов сдано, фокус — MVP и автоматизация</span></div></div>
        </div>
      </AkDesktopWindow>

      <!-- терминал -->
      <AkDesktopWindow win-id="winTerm" title="терминал — как я работаю" default-width="460px" nopad>
        <template #body>
          <AkTerminalInteractive />
        </template>
      </AkDesktopWindow>

      <!-- настройки.cfg -->
      <AkDesktopWindow win-id="winSettings" title="настройки.cfg" default-width="310px">
        <div class="cfg">
          <div class="cfg-row">
            <div><div class="cfg-label">тема</div></div>
            <button :class="['cfg-toggle', { on: theme === 'light' }]" @click="toggleTheme">{{ cfgTheme }}</button>
          </div>
          <div class="cfg-row">
            <div><div class="cfg-label">язык</div><div class="cfg-desc">пока тестовый выбор</div></div>
            <div class="cfg-choice">
              <button :class="{ on: activeLang === 'рус' }" @click="activeLang = 'рус'">русский</button>
              <button :class="{ on: activeLang === 'eng' }" @click="activeLang = 'eng'">english</button>
            </div>
          </div>
          <div class="cfg-row">
            <div>
              <div class="cfg-label">© 2026 akarmain</div>
            </div>
          </div>
        </div>
      </AkDesktopWindow>


    </div><!-- /stage -->

    <!-- ── desktop icons ── -->
    <div class="ak-desktop-icons">
      <a class="ak-desktop-icon" href="https://github.com/akarmain" target="_blank" rel="noopener">
        <span class="ak-desktop-icon__box">
          <svg class="ak-px-icon" width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="5" y="1" width="6" height="1"/><rect x="3" y="2" width="2" height="1"/><rect x="11" y="2" width="2" height="1"/><rect x="2" y="3" width="1" height="5"/><rect x="13" y="3" width="1" height="5"/><rect x="3" y="8" width="2" height="2"/><rect x="11" y="8" width="2" height="2"/><rect x="5" y="10" width="6" height="1"/><rect x="5" y="11" width="1" height="4"/><rect x="10" y="11" width="1" height="4"/><rect x="4" y="13" width="1" height="1"/><rect x="3" y="12" width="1" height="1"/></g><g fill="#8b7ef8"><rect x="5" y="4" width="2" height="2"/><rect x="9" y="4" width="2" height="2"/></g></svg>
        </span>
        <span>github</span>
      </a>
      <button class="ak-desktop-icon" @click="openWin('winStack')">
        <span class="ak-desktop-icon__box">
          <svg class="ak-px-icon" width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="2" y="2" width="12" height="3"/><rect x="2" y="6" width="12" height="3"/><rect x="2" y="10" width="12" height="3"/></g><g fill="#0d0d10"><rect x="3" y="3" width="10" height="1"/><rect x="3" y="7" width="10" height="1"/><rect x="3" y="11" width="10" height="1"/></g></svg>
        </span>
        <span>стек.json</span>
      </button>
      <button class="ak-desktop-icon" @click="openWin('winSvc')">
        <span class="ak-desktop-icon__box">
          <svg class="ak-px-icon" width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="3" y="1" width="8" height="1"/><rect x="3" y="2" width="1" height="13"/><rect x="11" y="1" width="1" height="3"/><rect x="11" y="4" width="2" height="1"/><rect x="12" y="4" width="1" height="11"/><rect x="4" y="14" width="9" height="1"/><rect x="5" y="4" width="4" height="1"/><rect x="5" y="7" width="6" height="1"/><rect x="5" y="9" width="6" height="1"/><rect x="5" y="11" width="4" height="1"/></g></svg>
        </span>
        <span>услуги.md</span>
      </button>
      <button class="ak-desktop-icon" @click="openWin('winExp')">
        <span class="ak-desktop-icon__box">
          <svg class="ak-px-icon" width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="7" y="1" width="2" height="14"/><rect x="3" y="3" width="4" height="1"/><rect x="3" y="3" width="1" height="3"/><rect x="9" y="7" width="4" height="1"/><rect x="12" y="7" width="1" height="3"/><rect x="3" y="11" width="4" height="1"/><rect x="3" y="11" width="1" height="3"/></g></svg>
        </span>
        <span>опыт.log</span>
      </button>
      <button class="ak-desktop-icon" @click="openWin('winExp')">
        <span class="ak-desktop-icon__box">
          <svg class="ak-px-icon" width="26" height="26" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="7" y="1" width="2" height="14"/><rect x="3" y="3" width="4" height="1"/><rect x="3" y="3" width="1" height="3"/><rect x="9" y="7" width="4" height="1"/><rect x="12" y="7" width="1" height="3"/><rect x="3" y="11" width="4" height="1"/><rect x="3" y="11" width="1" height="3"/></g></svg>
        </span>
        <span>опыт.log</span>
      </button>
    </div>

    <!-- ── dock ── -->
    <div ref="dockEl" class="ak-dock ak-notch" @mousemove="magnifyDock" @mouseleave="resetDock">
      <button :class="[dockCls('winAbout'), { 'ak-dock-attention': !anyOpen }]" data-tip="обо_мне.txt" aria-label="Обо мне" @click="openWin('winAbout')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="6" y="2" width="4" height="1"/><rect x="5" y="3" width="6" height="4"/><rect x="6" y="7" width="4" height="1"/><rect x="4" y="9" width="8" height="1"/><rect x="3" y="10" width="10" height="4"/></g></svg>
      </button>
      <button :class="dockCls('winWork')" data-tip="~/проекты" aria-label="Проекты" @click="openWin('winWork')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="1" y="3" width="6" height="1"/><rect x="1" y="4" width="14" height="1"/><rect x="1" y="5" width="14" height="8"/></g><rect x="2" y="6" width="12" height="6" fill="#131318"/><rect x="2" y="7" width="12" height="5" fill="#8b7ef8"/></svg>
      </button>
      <button :class="dockCls('winStack')" data-tip="стек.json" aria-label="Стек" @click="openWin('winStack')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="2" y="2" width="12" height="3"/><rect x="2" y="6" width="12" height="3"/><rect x="2" y="10" width="12" height="3"/></g><g fill="#131318"><rect x="3" y="3" width="10" height="1"/><rect x="3" y="7" width="10" height="1"/><rect x="3" y="11" width="10" height="1"/></g></svg>
      </button>
      <button :class="dockCls('winSvc')" data-tip="услуги.md" aria-label="Услуги" @click="openWin('winSvc')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="3" y="1" width="8" height="1"/><rect x="3" y="2" width="1" height="13"/><rect x="11" y="1" width="1" height="3"/><rect x="11" y="4" width="2" height="1"/><rect x="12" y="4" width="1" height="11"/><rect x="4" y="14" width="9" height="1"/><rect x="5" y="4" width="4" height="1"/><rect x="5" y="7" width="6" height="1"/><rect x="5" y="9" width="6" height="1"/><rect x="5" y="11" width="4" height="1"/></g></svg>
      </button>
      <button :class="dockCls('winExp')" data-tip="опыт.log" aria-label="Опыт" @click="openWin('winExp')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="7" y="1" width="2" height="14"/><rect x="3" y="3" width="4" height="1"/><rect x="3" y="3" width="1" height="3"/><rect x="9" y="7" width="4" height="1"/><rect x="12" y="7" width="1" height="3"/><rect x="3" y="11" width="4" height="1"/><rect x="3" y="11" width="1" height="3"/></g></svg>
      </button>
      <button :class="dockCls('winTerm')" data-tip="терминал" aria-label="Терминал" @click="openWin('winTerm')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="1" y="2" width="14" height="12"/></g><rect x="2" y="3" width="12" height="10" fill="#0a0a0d"/><g fill="#7fd49a"><rect x="3" y="5" width="1" height="1"/><rect x="4" y="6" width="1" height="1"/><rect x="3" y="7" width="1" height="1"/><rect x="6" y="9" width="4" height="1"/></g></svg>
      </button>
      <span class="ak-dock-sep" />
      <button :class="dockCls('winSettings')" data-tip="настройки.cfg" aria-label="Настройки" @click="openWin('winSettings')">
        <svg class="ak-px-icon" width="32" height="32" viewBox="0 0 16 16" shape-rendering="crispEdges"><g fill="#8b7ef8"><rect x="2" y="3" width="12" height="1"/><rect x="2" y="7" width="12" height="1"/><rect x="2" y="11" width="12" height="1"/><rect x="4" y="2" width="3" height="3"/><rect x="9" y="6" width="3" height="3"/><rect x="5" y="10" width="3" height="3"/></g><rect x="5" y="3" width="1" height="1" fill="#0d0d10"/><rect x="10" y="7" width="1" height="1" fill="#0d0d10"/><rect x="6" y="11" width="1" height="1" fill="#0d0d10"/></svg>
      </button>
    </div>

    <!-- ── overlays ── -->
    <div class="hint" :style="{ opacity: hintOpacity }">окна можно таскать за заголовок · тянуть за угол · открывать в доке</div>
  </div>
</template>
