import type { Loc } from './types'

// Окно «опыт.log» — таймлайн.
export interface Exp { year: Loc; title: Loc; desc: Loc }

export const experience: Exp[] = [
  { year: { ru: '2024–2026', en: '2024–2026' }, title: { ru: 'Обучение в сфере IT', en: 'IT studies' },              desc: { ru: 'backend, frontend, devops — самостоятельно и в командах', en: 'backend, frontend, devops — solo and in teams' } },
  { year: { ru: '2025', en: '2025' },           title: { ru: 'Фриланс и pet-проекты', en: 'Freelance & pet projects' }, desc: { ru: 'боты, парсеры, лендинги — первые боевые заказы', en: 'bots, parsers, landings — first real orders' } },
  { year: { ru: '2025–2026', en: '2025–2026' }, title: { ru: 'Хакатоны и командные проекты', en: 'Hackathons & team projects' }, desc: { ru: 'работа по спринтам, git-flow, код-ревью', en: 'sprints, git-flow, code review' } },
  { year: { ru: 'сейчас', en: 'now' },          title: { ru: 'Коммерческие заказы', en: 'Commercial work' },         desc: { ru: '19 проектов сдано, фокус — MVP и автоматизация', en: '19 projects shipped, focus — MVP & automation' } },
]
