import type { Loc } from './types'

// Карточки в окне «~/проекты». icon — ключ из ~/data/icons (pr-*). badge — статус.
// slug — публичный ключ для deep-link URL (?project=slug); см. useDeepLinks.
export interface Project { slug: string; icon: string; href: string; title: Loc; sub: Loc; meta: Loc; badge: 'prod' | 'wip' | 'arch' }

export const projects: Project[] = [
  { slug: 'finbase',   icon: 'pr-finbase',   href: 'https://t.me/akarmain', title: { ru: 'finbase — лендинг', en: 'finbase — landing' },   sub: { ru: 'next.js · vercel · 7 дней', en: 'next.js · vercel · 7 days' },  meta: { ru: 'конверсия +30%', en: 'conversion +30%' }, badge: 'prod' },
  { slug: 'parser',    icon: 'pr-parser',    href: 'https://t.me/akarmain', title: { ru: 'парсер каталога', en: 'catalog parser' },        sub: { ru: 'fastapi · postgres · 10 дней', en: 'fastapi · postgres · 10 days' }, meta: { ru: '40k стр/сутки', en: '40k pages/day' }, badge: 'prod' },
  { slug: 'dashboard', icon: 'pr-dashboard', href: 'https://t.me/akarmain', title: { ru: 'дашборд логистики', en: 'logistics dashboard' }, sub: { ru: 'react · supabase · realtime', en: 'react · supabase · realtime' }, meta: { ru: 'в работе', en: 'in progress' }, badge: 'wip' },
  { slug: 'bot',       icon: 'pr-bot',       href: 'https://t.me/akarmain', title: { ru: 'бот записи', en: 'booking bot' },                 sub: { ru: 'grammY · cron · 5 дней', en: 'grammY · cron · 5 days' },     meta: { ru: '−80% рутины', en: '−80% routine' }, badge: 'prod' },
  { slug: 'crm',       icon: 'pr-crm',       href: 'https://t.me/akarmain', title: { ru: 'mini crm', en: 'mini crm' },                     sub: { ru: 'fastapi · react · docker', en: 'fastapi · react · docker' }, meta: { ru: 'канбан + роли', en: 'kanban + roles' }, badge: 'arch' },
]
