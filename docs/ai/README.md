# Инструкции для AI-агентов · akarmain.dev

Эта папка — точка входа для агентов и контрибьюторов. Прочитай её перед изменениями.

## Что это

Сайт-визитка в стиле desktop-OS: интерактивный «рабочий стол» с окнами (контакты,
проекты, стек, услуги, опыт, терминал, настройки), доком и анимированным фоном.

- **Фронтенд:** Nuxt 4 + Vue 3 (`app/`), статическая сборка (`nuxt generate`).
- **Бэкенд:** FastAPI-заглушка (`backend/`) — пока только `/api/health`.
- **i18n:** русский по умолчанию на `/`, английский на `/en` (модуль `@nuxtjs/i18n`).
- **Деплой:** Docker + nginx + docker-compose (тонкую настройку прод-сервера делает отдельный агент, см. `docs/deploy.md`).

## Золотые правила (ponytail)

1. **Меньше кода — лучше.** Не добавляй абстракции/зависимости без явной необходимости.
2. **Одна система стилей** — CSS-переменные `--ak-*` (`app/assets/css/`). Tailwind/shadcn убраны, не возвращай.
3. **Контент — в data-файлах**, не в шаблонах. Текст правится в `app/data/*` и `i18n/locales/*`, а не в `.vue`.
4. Нетривиальная логика оставляет одну проверку (см. `backend/main.py` — self-check в `__main__`).

## Карта репозитория

```
app/
  app.vue                 # только <NuxtPage/>
  pages/index.vue         # вся оболочка рабочего стола (меню-бар, окна, док, иконки)
  components/ak/
    AkDesktopWindow.vue   # перетаскиваемое/ресайзимое окно
    AkAmbientNoise.vue    # фоновый canvas (выключен на мобиле / reduced-motion)
    AkTerminalInteractive.vue  # интерактивный терминал (контент из data/terminal.ts)
    AkIcon.vue            # рендер SVG по имени из data/icons.ts
  composables/
    useWindows.ts         # состояние окон (строится из data/windows.ts)
    useAkTheme.ts         # тема светлая/тёмная (localStorage)
    useLoc.ts             # выбор строки {ru,en} под текущую локаль
  data/                   # ВЕСЬ контент (см. content.md)
  assets/css/             # tokens / base / utilities / components
i18n/locales/{ru,en}.json # короткие UI-строки (через $t)
server/plugins/boot-overlay.ts  # экран загрузки (локализуется по пути запроса)
backend/                  # FastAPI (см. backend.md)
Dockerfile, nginx.conf, docker-compose.yml  # контейнеры
```

## Запуск

```bash
pnpm install
pnpm dev        # http://localhost:3000  (en на /en)
pnpm generate   # статика в .output/public
```

Полный стек в Docker:

```bash
docker compose up --build      # сайт → http://localhost, API → http://localhost/api/health
```

## Дальше

- Как править контент и переводы → [content.md](content.md)
- Как устроен и расширяется бэкенд → [backend.md](backend.md)
