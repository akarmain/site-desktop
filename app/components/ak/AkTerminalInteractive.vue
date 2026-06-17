<script setup lang="ts">
import { ref, nextTick } from 'vue'

const { openWin } = useWindows()

interface Line { html: string; cls?: string }

const INIT: Line[] = [
  { html: '<span class="c"># процесс — структурно, не хаотично</span>' },
  { html: '<span class="p">1</span> обсуждение задачи и требований' },
  { html: '<span class="p">2</span> прототип или MVP — демо каждый день' },
  { html: '<span class="p">3</span> разработка + тесты' },
  { html: '<span class="p">4</span> деплой на прод' },
  { html: '<span class="ok">✓ поддержка и доработка — ключи и код у тебя</span>' },
  { html: '<span class="c">введите <span class="cmd">help</span> и нажмите Enter</span>' },
]

const lines   = ref<Line[]>([...INIT])
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
  const line: Line = { html: '', cls }
  lines.value.push(line); let i = 0; busy.value = true
  const step = () => {
    if (i <= text.length) { line.html = esc(text.slice(0, i++)); scroll(); setTimeout(step, 7) }
    else { busy.value = false; cb?.() }
  }
  step()
}

function typeLines(lns: (string | Line)[], cb?: () => void) {
  let i = 0
  const next = () => {
    if (i >= lns.length) { busy.value = false; cb?.(); return }
    const ln = lns[i++]
    if (typeof ln === 'object') { addLine(ln.html, ln.cls); next() }
    else typeOut(ln, undefined, next)
  }
  next()
}

const ALIAS: Record<string,string> = {
  помощь:'help', команды:'help', обо:'about', мне:'about',
  проекты:'projects', стек:'stack', услуги:'services',
  опыт:'experience', связь:'contact', контакт:'contact',
  очистить:'clear', дата:'date', кто:'whoami',
}

function run(line: string) {
  const raw = line.trim()
  addLine(`<span class="ps">akarmain@os:~$</span> <span class="cmd">${esc(line)}</span>`)
  if (!raw) return
  const parts = raw.split(/\s+/)
  const cmd = (ALIAS[parts[0].toLowerCase()] ?? parts[0]).toLowerCase()
  const arg = raw.slice(parts[0].length).trim()

  switch (cmd) {
    case 'help': case '?':
      typeLines([
        'доступные команды:',
        { html: '<span class="p">whoami</span>   — кто я            <span class="p">projects</span> — открыть проекты' },
        { html: '<span class="p">about</span>    — обо мне          <span class="p">stack</span>    — технологии' },
        { html: '<span class="p">services</span> — услуги           <span class="p">experience</span> — опыт' },
        { html: '<span class="p">contact</span>  — как связаться    <span class="p">social</span>   — ссылки' },
        { html: '<span class="p">ls</span> · <span class="p">date</span> · <span class="p">neofetch</span> · <span class="p">echo</span> · <span class="p">clear</span>' },
      ]); break
    case 'whoami': typeOut('akarmain — fullstack-разработчик. backend, автоматизация, AI-инструменты.'); break
    case 'about':    openWin('winAbout');  typeOut('→ открываю обо_мне.txt'); break
    case 'projects': openWin('winWork');   typeOut('→ 5 избранных проектов, всего сдано 19. открываю ~/проекты'); break
    case 'stack':    openWin('winStack');  typeOut('→ python · fastapi · react · docker · postgres … открываю стек.json'); break
    case 'services': openWin('winSvc');    typeOut('→ backend, боты, парсеры, MVP под ключ. открываю услуги.md'); break
    case 'experience':openWin('winExp');   typeOut('→ открываю опыт.log'); break
    case 'contact':
      openWin('winAbout')
      typeLines(['связаться можно так:',
        { html: '<span class="ok">telegram</span> <a href="https://t.me/akarmain" target="_blank" rel="noopener">@akarmain</a>   <span class="ok">github</span> <a href="https://github.com/akarmain" target="_blank" rel="noopener">/akarmain</a>' },
        { html: '<span class="ok">почта</span>    <a href="mailto:hi@akarmain.dev">hi@akarmain.dev</a>   ответ ~20 минут' },
      ]); break
    case 'social': case 'links':
      addLine('<a href="https://t.me/akarmain" target="_blank" rel="noopener">telegram →</a>   <a href="https://github.com/akarmain" target="_blank" rel="noopener">github →</a>   <a href="mailto:hi@akarmain.dev">почта →</a>')
      break
    case 'ls':  typeOut('обо_мне.txt   проекты/   стек.json   услуги.md   опыт.log'); break
    case 'date': typeOut(new Date().toLocaleString('ru-RU', { dateStyle:'full', timeStyle:'short' })); break
    case 'echo': typeOut(arg || ''); break
    case 'sudo': typeOut('пароль не требуется — доступ открыт :)', 'ok'); break
    case 'neofetch':
      typeLines([
        { html: '<span class="p">akarmain@os</span>' },
        { html: '<span class="c">-----------</span>' },
        'system:  akarmain', 'shell:   возьму твою задачу',
        'uptime:  19 проектов · 0 срывов', 'theme:   midnight / px',
        'CPU:     python · typescript · docker',
      ]); break
    case 'clear': case 'cls': lines.value = []; break
    default: typeOut(`команда не найдена: ${parts[0]} — наберите help`, 'err')
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
             aria-label="Командная строка" placeholder="help" @keydown="onKey" />
    </div>
  </div>
</template>
