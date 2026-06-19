# Контент и переводы

> Все пути ниже — относительно `frontend/` (например `app/data/projects.ts` → `frontend/app/data/projects.ts`).

Весь текст живёт в данных, а не в шаблонах. Два механизма:

| Что | Где | Как читать |
|-----|-----|-----------|
| Списки контента (проекты, ссылки, услуги, стек, опыт, окна, терминал) | `app/data/*.ts` | поле `{ ru, en }` + helper `useLoc()` |
| Короткие UI-строки (подсказки, настройки, имя/роль/био, hint) | `i18n/locales/{ru,en}.json` | `$t('key')` |

**Правило: любой переводимый текст обязан иметь и `ru`, и `en`.**

## Модель данных

`app/data/types.ts`:

```ts
export type Loc = { ru: string; en: string }          // переводимое поле
export type Localizable = string | Loc                 // строка либо перевод
```

`useLoc()` (`app/composables/useLoc.ts`) возвращает функцию, выбирающую строку под
текущую локаль: `const loc = useLoc(); loc(project.title)`.

## Частые правки

**Добавить проект** → `app/data/projects.ts`: новый объект массива. Поля `title/sub/meta`
переводимые, `icon` — ключ из `app/data/icons.ts` (префикс `pr-`), `badge` — `prod|wip|arch`.

**Добавить ссылку** → `app/data/links.ts` (`socialLinks` для кнопок в карточке, `bentoLinks`
для сетки «ещё ссылки»). `icon` — ключ из `icons.ts`. `cls` у bento: размер (`lg`/`tall`) +
категория (`work`/`code`/`hobby`).

**Добавить иконку** → `app/data/icons.ts`: ключ → строка `<svg>…</svg>`. Простые иконки —
`fill="currentColor"` (цвет от CSS). Рендер: `<AkIcon name="ключ" />`.

**Добавить окно** → `app/data/windows.ts` (id, `title` {ru,en}, `icon`, `defaultWidth`,
`open?`). Окно/док/иконка рабочего стола подхватятся автоматически. Контент окна добавь в
`app/pages/index.vue` в блок `<div class="stage">`.

**Изменить услуги / стек / опыт** → `app/data/{services,stack,experience}.ts`.

**Команды терминала** → `app/data/terminal.ts` (тексты по локали + таблица алиасов).

**UI-строки и имя/роль/био** → `i18n/locales/ru.json` и `en.json` (одинаковый набор ключей).

## i18n / роутинг

- Конфиг: `nuxt.config.ts` → `i18n`. Стратегия `prefix_except_default`: ru на `/`, en на `/en`.
- По умолчанию всегда русский (`detectBrowserLanguage: false`).
- Переключение языка — кнопки в окне «настройки.cfg» (`setLocale('ru'|'en')`).
- Экран загрузки (`server/plugins/boot-overlay.ts`) выбирает язык по пути запроса (`/en` → en).

## Стили

CSS-переменные `--ak-*` в `app/assets/css/tokens.css` (цвета/шрифты/тема — здесь же светлая).
Компонентные классы `.ak-*` в `components.css`. Мобильная вёрстка — медиазапрос `max-width: 759px`
там же (полноэкранные окна, док-переключатель). Tailwind не используется.
