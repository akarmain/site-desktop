import type { Loc } from './types'

// Реестр окон. Заголовок локализован. icon — ключ из ~/data/icons (win-*).
// key — публичный ключ для deep-link URL (?window=key); маппит на технический id (см. useDeepLinks).
// open: true — окно открыто при загрузке. Порядок задаёт z-index по умолчанию (см. useWindows).
export interface WinDef {
  id: string
  key: string
  title: Loc
  icon: string
  defaultWidth: string
  nopad?: boolean
  open?: boolean
}

export const windows: WinDef[] = [
  { id: 'winAbout',    key: 'contacts',   icon: 'win-about',    title: { ru: 'контакты.vcf', en: 'contacts.vcf' },   defaultWidth: '340px', open: true },
  { id: 'winWork',     key: 'projects',   icon: 'win-work',     title: { ru: '~/проекты', en: '~/projects' },        defaultWidth: '470px' },
  { id: 'winStack',    key: 'stack',      icon: 'win-stack',    title: { ru: 'стек.json', en: 'stack.json' },        defaultWidth: '430px' },
  { id: 'winSvc',      key: 'services',   icon: 'win-svc',      title: { ru: 'услуги.md', en: 'services.md' },        defaultWidth: '450px' },
  { id: 'winExp',      key: 'experience', icon: 'win-exp',      title: { ru: 'опыт.log', en: 'experience.log' },      defaultWidth: '420px' },
  { id: 'winTerm',     key: 'terminal',   icon: 'win-term',     title: { ru: 'терминал — как я работаю', en: 'terminal — how I work' }, defaultWidth: '460px', nopad: true },
  { id: 'winSettings', key: 'settings',   icon: 'win-settings', title: { ru: 'настройки.cfg', en: 'settings.cfg' },   defaultWidth: '310px' },
]
