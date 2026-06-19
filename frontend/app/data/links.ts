import type { Loc } from './types'

// Соц-кнопки в карточке контактов.
export interface SocialLink { icon: string; href: string; title: Loc }
export const socialLinks: SocialLink[] = [
  { icon: 'telegram', href: 'https://t.me/akarmain',     title: { ru: 'Telegram', en: 'Telegram' } },
  { icon: 'mail',     href: 'mailto:hi@akarmain.dev',    title: { ru: 'Почта', en: 'Email' } },
  { icon: 'github',   href: 'https://github.com/akarmain', title: { ru: 'GitHub', en: 'GitHub' } },
]

// Bento-сетка «ещё ссылки». cls: размер (lg/tall) + категория (work/code/hobby) → цвет рамки.
export interface BentoLink { icon: string; href: string; label: Loc; cls?: string }
export const bentoLinks: BentoLink[] = [
  { icon: 'telegram', href: 'https://t.me/akarmain',                              label: { ru: 'telegram', en: 'telegram' }, cls: 'lg work' },
  { icon: 'github',   href: 'https://github.com/akarmain',                        label: { ru: 'github', en: 'github' },     cls: 'work' },
  { icon: 'gitlab',   href: 'https://gitlab.com/akarmain',                        label: { ru: 'gitlab', en: 'gitlab' },     cls: 'tall code' },
  { icon: 'linkedin', href: 'https://www.linkedin.com/in/akarmain/',             label: { ru: 'linkedin', en: 'linkedin' },  cls: 'lg code' },
  { icon: 'blog',     href: 'https://t.me/akarmain_log',                          label: { ru: 'блог', en: 'blog' },          cls: 'code' },
  { icon: 'live',     href: 'https://t.me/akarmain_live',                         label: { ru: 'live', en: 'live' },          cls: 'code' },
  { icon: 'discord',  href: 'https://discordapp.com/users/636565416260534302',   label: { ru: 'discord', en: 'discord' },    cls: 'hobby' },
  { icon: 'youtube',  href: 'https://www.youtube.com/@akrmain',                   label: { ru: 'youtube', en: 'youtube' },    cls: 'hobby' },
  { icon: 'steam',    href: 'https://steamcommunity.com/profiles/76561199222030536/', label: { ru: 'steam', en: 'steam' },   cls: 'hobby' },
  { icon: 'kwork',    href: 'https://kwork.ru/user/akarmain',                     label: { ru: 'kwork', en: 'kwork' },        cls: 'work' },
  { icon: 'cv',       href: 'https://s3.akarmain.ru/S/CV.pdf',                    label: { ru: 'резюме (CV)', en: 'resume (CV)' }, cls: 'lg work' },
  { icon: 'wakatime', href: 'https://wakatime.com/@akarmain',                     label: { ru: 'wakatime', en: 'wakatime' },  cls: 'code' },
  { icon: 'tiktok',   href: 'https://www.tiktok.com/@akar_main',                  label: { ru: 'tiktok', en: 'tiktok' },      cls: 'hobby' },
  { icon: 'twitch',   href: 'https://www.twitch.tv/akarmain',                     label: { ru: 'twitch', en: 'twitch' },      cls: 'hobby' },
  { icon: 'anon',     href: 'https://t.me/anonquebot?start=tv3n9',                label: { ru: 'анонимка', en: 'anon' } },
]
