import type { Loc } from './types'

// Реестр окон. Заголовок локализован. icon — ключ из ~/data/icons (win-*).
// open: true — окно открыто при загрузке. Порядок задаёт z-index по умолчанию (см. useWindows).
export interface WinDef {
  id: string
  title: Loc
  icon: string
  defaultWidth: string
  nopad?: boolean
  open?: boolean
}

export const windows: WinDef[] = [
  { id: 'winAbout',    icon: 'win-about',    title: { ru: 'контакты.vcf', en: 'contacts.vcf' },   defaultWidth: '340px', open: true },
  { id: 'winWork',     icon: 'win-work',     title: { ru: '~/проекты', en: '~/projects' },        defaultWidth: '470px' },
  { id: 'winStack',    icon: 'win-stack',    title: { ru: 'стек.json', en: 'stack.json' },        defaultWidth: '430px' },
  { id: 'winSvc',      icon: 'win-svc',      title: { ru: 'услуги.md', en: 'services.md' },        defaultWidth: '450px' },
  { id: 'winExp',      icon: 'win-exp',      title: { ru: 'опыт.log', en: 'experience.log' },      defaultWidth: '420px' },
  { id: 'winTerm',     icon: 'win-term',     title: { ru: 'терминал — как я работаю', en: 'terminal — how I work' }, defaultWidth: '460px', nopad: true },
  { id: 'winSettings', icon: 'win-settings', title: { ru: 'настройки.cfg', en: 'settings.cfg' },   defaultWidth: '310px' },
]
