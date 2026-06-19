import type { Loc, Localizable } from './types'

// Окно «стек.json». chips — строки (язык-нейтральные) либо { ru, en } для переводимых.
export interface StackGroup { name: Loc; chips: Localizable[] }

export const stack: StackGroup[] = [
  { name: { ru: 'backend', en: 'backend' },   chips: ['python', 'fastapi', 'rest api', 'sqlalchemy', 'pydantic'] },
  { name: { ru: 'frontend', en: 'frontend' }, chips: ['typescript', 'react', 'tailwind', 'html/css'] },
  { name: { ru: 'базы данных', en: 'databases' }, chips: ['postgresql', 'sqlite', 'redis'] },
  { name: { ru: 'devops', en: 'devops' },     chips: ['docker', 'compose', 'git', 'linux', 'nginx'] },
  { name: { ru: 'ai / автоматизация', en: 'ai / automation' }, chips: [
    { ru: 'ai-агенты', en: 'ai agents' },
    { ru: 'telegram-боты', en: 'telegram bots' },
    { ru: 'интеграции api', en: 'api integrations' },
  ] },
]
