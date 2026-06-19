// Контент интерактивного терминала, по локали. Логика (ввод/история/печать) — в
// AkTerminalInteractive.vue; здесь только тексты и алиасы команд.

export interface TermLine { html: string; cls?: string }

export interface TermContent {
  init: TermLine[]
  help: (string | TermLine)[]
  whoami: string
  about: string
  projects: string
  stack: string
  services: string
  experience: string
  contact: (string | TermLine)[]
  social: string
  ls: string
  sudo: string
  neofetch: (string | TermLine)[]
  notFound: (cmd: string) => string
}

// Русские алиасы → каноничная команда. En-пользователи пишут английские команды.
export const termAlias: Record<string, string> = {
  помощь: 'help', команды: 'help', обо: 'about', мне: 'about',
  проекты: 'projects', стек: 'stack', услуги: 'services',
  опыт: 'experience', связь: 'contact', контакт: 'contact',
  очистить: 'clear', дата: 'date', кто: 'whoami',
}

export const terminal: Record<'ru' | 'en', TermContent> = {
  ru: {
    init: [
      { html: '<span class="c"># процесс — структурно, не хаотично</span>' },
      { html: '<span class="p">1</span> обсуждение задачи и требований' },
      { html: '<span class="p">2</span> прототип или MVP — демо каждый день' },
      { html: '<span class="p">3</span> разработка + тесты' },
      { html: '<span class="p">4</span> деплой на прод' },
      { html: '<span class="ok">✓ поддержка и доработка — ключи и код у тебя</span>' },
      { html: '<span class="c">введите <span class="cmd">help</span> и нажмите Enter</span>' },
    ],
    help: [
      'доступные команды:',
      { html: '<span class="p">whoami</span>   — кто я            <span class="p">projects</span> — открыть проекты' },
      { html: '<span class="p">about</span>    — обо мне          <span class="p">stack</span>    — технологии' },
      { html: '<span class="p">services</span> — услуги           <span class="p">experience</span> — опыт' },
      { html: '<span class="p">contact</span>  — как связаться    <span class="p">social</span>   — ссылки' },
      { html: '<span class="p">ls</span> · <span class="p">date</span> · <span class="p">neofetch</span> · <span class="p">echo</span> · <span class="p">clear</span>' },
    ],
    whoami: 'akarmain — fullstack-разработчик. backend, автоматизация, AI-инструменты.',
    about: '→ открываю обо_мне.txt',
    projects: '→ 5 избранных проектов, всего сдано 19. открываю ~/проекты',
    stack: '→ python · fastapi · react · docker · postgres … открываю стек.json',
    services: '→ backend, боты, парсеры, MVP под ключ. открываю услуги.md',
    experience: '→ открываю опыт.log',
    contact: [
      'связаться можно так:',
      { html: '<span class="ok">telegram</span> <a href="https://t.me/akarmain" target="_blank" rel="noopener">@akarmain</a>   <span class="ok">github</span> <a href="https://github.com/akarmain" target="_blank" rel="noopener">/akarmain</a>' },
      { html: '<span class="ok">почта</span>    <a href="mailto:hi@akarmain.dev">hi@akarmain.dev</a>   ответ ~20 минут' },
    ],
    social: '<a href="https://t.me/akarmain" target="_blank" rel="noopener">telegram →</a>   <a href="https://github.com/akarmain" target="_blank" rel="noopener">github →</a>   <a href="mailto:hi@akarmain.dev">почта →</a>',
    ls: 'обо_мне.txt   проекты/   стек.json   услуги.md   опыт.log',
    sudo: 'пароль не требуется — доступ открыт :)',
    neofetch: [
      { html: '<span class="p">akarmain@os</span>' },
      { html: '<span class="c">-----------</span>' },
      'system:  akarmain', 'shell:   возьму твою задачу',
      'uptime:  19 проектов · 0 срывов', 'theme:   midnight / px',
      'CPU:     python · typescript · docker',
    ],
    notFound: (cmd) => `команда не найдена: ${cmd} — наберите help`,
  },
  en: {
    init: [
      { html: '<span class="c"># process — structured, not chaotic</span>' },
      { html: '<span class="p">1</span> discuss the task and requirements' },
      { html: '<span class="p">2</span> prototype or MVP — demo every day' },
      { html: '<span class="p">3</span> development + tests' },
      { html: '<span class="p">4</span> deploy to production' },
      { html: '<span class="ok">✓ support and iteration — keys and code are yours</span>' },
      { html: '<span class="c">type <span class="cmd">help</span> and press Enter</span>' },
    ],
    help: [
      'available commands:',
      { html: '<span class="p">whoami</span>   — who I am          <span class="p">projects</span> — open projects' },
      { html: '<span class="p">about</span>    — about me          <span class="p">stack</span>    — technologies' },
      { html: '<span class="p">services</span> — services          <span class="p">experience</span> — experience' },
      { html: '<span class="p">contact</span>  — get in touch      <span class="p">social</span>   — links' },
      { html: '<span class="p">ls</span> · <span class="p">date</span> · <span class="p">neofetch</span> · <span class="p">echo</span> · <span class="p">clear</span>' },
    ],
    whoami: 'akarmain — fullstack developer. backend, automation, AI tooling.',
    about: '→ opening about.txt',
    projects: '→ 5 featured projects, 19 shipped total. opening ~/projects',
    stack: '→ python · fastapi · react · docker · postgres … opening stack.json',
    services: '→ backend, bots, parsers, turnkey MVP. opening services.md',
    experience: '→ opening experience.log',
    contact: [
      'reach me here:',
      { html: '<span class="ok">telegram</span> <a href="https://t.me/akarmain" target="_blank" rel="noopener">@akarmain</a>   <span class="ok">github</span> <a href="https://github.com/akarmain" target="_blank" rel="noopener">/akarmain</a>' },
      { html: '<span class="ok">email</span>    <a href="mailto:hi@akarmain.dev">hi@akarmain.dev</a>   reply in ~20 min' },
    ],
    social: '<a href="https://t.me/akarmain" target="_blank" rel="noopener">telegram →</a>   <a href="https://github.com/akarmain" target="_blank" rel="noopener">github →</a>   <a href="mailto:hi@akarmain.dev">email →</a>',
    ls: 'about.txt   projects/   stack.json   services.md   experience.log',
    sudo: 'no password needed — access is open :)',
    neofetch: [
      { html: '<span class="p">akarmain@os</span>' },
      { html: '<span class="c">-----------</span>' },
      'system:  akarmain', 'shell:   I will take your task',
      'uptime:  19 projects · 0 failures', 'theme:   midnight / px',
      'CPU:     python · typescript · docker',
    ],
    notFound: (cmd) => `command not found: ${cmd} — type help`,
  },
}
