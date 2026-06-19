import type { Localizable } from '~/data/types'

// Выбирает строку под текущую локаль из data-файлов (см. ~/data/*).
// Принимает либо { ru, en }, либо обычную строку (одинаковую для всех языков).
export function useLoc() {
  const { locale } = useI18n()
  return (f: Localizable) =>
    typeof f === 'string' ? f : f[locale.value as 'ru' | 'en'] ?? f.ru
}
