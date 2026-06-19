import type { Loc } from './types'

// Окно «услуги.md».
export interface Service { title: Loc; desc: Loc }

export const services: Service[] = [
  { title: { ru: 'Backend и REST API', en: 'Backend & REST API' },        desc: { ru: 'архитектура, авторизация, документация', en: 'architecture, auth, documentation' } },
  { title: { ru: 'Telegram-боты', en: 'Telegram bots' },                   desc: { ru: 'от записи клиентов до сложных сценариев', en: 'from client booking to complex flows' } },
  { title: { ru: 'Парсеры и автоматизация', en: 'Parsers & automation' },  desc: { ru: 'рутинные задачи — на автопилот', en: 'routine tasks on autopilot' } },
  { title: { ru: 'MVP под ключ', en: 'Turnkey MVP' },                      desc: { ru: 'идея → работающий продукт за дни', en: 'idea → working product in days' } },
  { title: { ru: 'Docker и деплой', en: 'Docker & deploy' },               desc: { ru: 'настройка, CI, перенос на сервер', en: 'setup, CI, server migration' } },
  { title: { ru: 'Доработка проектов', en: 'Project improvements' },       desc: { ru: 'интеграции, фиксы, новые фичи', en: 'integrations, fixes, new features' } },
]
