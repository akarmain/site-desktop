<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { terminal, termAlias, type TermLine } from '~/data/terminal'

const { openWin } = useWindows()
const { locale } = useI18n()
const t = computed(() => terminal[(locale.value as 'ru' | 'en')] ?? terminal.ru)

const lines   = ref<TermLine[]>([...t.value.init])
const input   = ref('')
const busy    = ref(false)
const termOut = ref<HTMLElement>()
const termIn  = ref<HTMLInputElement>()
const hist: string[] = []
let hIdx = 0

const scroll = () => nextTick(() => { if (termOut.value) termOut.value.scrollTop = termOut.value.scrollHeight })
const esc    = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')

function addLine(html: string, cls?: string) { lines.value.push({ html, cls }); scroll() }

function typeOut(text: string, cls?: string, cb?: () => void) {
  const line: TermLine = { html: '', cls }
  lines.value.push(line); let i = 0; busy.value = true
  const step = () => {
    if (i <= text.length) { line.html = esc(text.slice(0, i++)); scroll(); setTimeout(step, 7) }
    else { busy.value = false; cb?.() }
  }
  step()
}

function typeLines(lns: (string | TermLine)[], cb?: () => void) {
  let i = 0
  const next = () => {
    if (i >= lns.length) { busy.value = false; cb?.(); return }
    const ln = lns[i++]
    if (typeof ln === 'object') { addLine(ln.html, ln.cls); next() }
    else typeOut(ln, undefined, next)
  }
  next()
}

function run(line: string) {
  const raw = line.trim()
  const c = t.value
  addLine(`<span class="ps">akarmain@os:~$</span> <span class="cmd">${esc(line)}</span>`)
  if (!raw) return
  const parts = raw.split(/\s+/)
  const cmd = (termAlias[parts[0].toLowerCase()] ?? parts[0]).toLowerCase()
  const arg = raw.slice(parts[0].length).trim()

  switch (cmd) {
    case 'help': case '?': typeLines(c.help); break
    case 'whoami': typeOut(c.whoami); break
    case 'about':    openWin('winAbout');  typeOut(c.about); break
    case 'projects': openWin('winWork');   typeOut(c.projects); break
    case 'stack':    openWin('winStack');  typeOut(c.stack); break
    case 'services': openWin('winSvc');    typeOut(c.services); break
    case 'experience': openWin('winExp');  typeOut(c.experience); break
    case 'contact': openWin('winAbout'); typeLines(c.contact); break
    case 'social': case 'links': addLine(c.social); break
    case 'ls':  typeOut(c.ls); break
    case 'date': typeOut(new Date().toLocaleString(locale.value === 'en' ? 'en-US' : 'ru-RU', { dateStyle: 'full', timeStyle: 'short' })); break
    case 'echo': typeOut(arg || ''); break
    case 'sudo': typeOut(c.sudo, 'ok'); break
    case 'neofetch': typeLines(c.neofetch); break
    case 'clear': case 'cls': lines.value = []; break
    default: typeOut(c.notFound(parts[0]), 'err')
  }
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (busy.value) { e.preventDefault(); return }
    const v = input.value; input.value = ''
    if (v.trim()) { hist.push(v); hIdx = hist.length }
    run(v)
  } else if (e.key === 'ArrowUp') {
    if (hist.length) { hIdx = Math.max(0, hIdx - 1); input.value = hist[hIdx] || ''; e.preventDefault() }
  } else if (e.key === 'ArrowDown') {
    if (hist.length) { hIdx = Math.min(hist.length, hIdx + 1); input.value = hist[hIdx] || ''; e.preventDefault() }
  }
}

function clickWrap(e: MouseEvent) {
  if (!(e.target as Element).closest('a, button')) nextTick(() => termIn.value?.focus())
}
</script>

<template>
  <div class="term-wrap" @mousedown="clickWrap">
    <div ref="termOut" class="term-body">
      <div v-for="(ln, i) in lines" :key="i" :class="ln.cls" v-html="ln.html" />
    </div>
    <div class="term-input-line">
      <span class="ps">akarmain@os:~$</span>
      <input ref="termIn" v-model="input" type="text"
             autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"
             aria-label="terminal" placeholder="help" @keydown="onKey" />
    </div>
  </div>
</template>
