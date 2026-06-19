# akarmain.dev

Сайт-визитка Андрея Кармаева: интерактивный рабочий стол в стиле `akarmainOS` —
окна контактов, проектов, стека, услуг, опыта и терминала, док и анимированный фон.

## Стек

- **Nuxt 4 / Vue 3 / TypeScript** — фронтенд, статическая сборка
- **@nuxtjs/i18n** — два языка: русский на `/`, английский на `/en`
- **FastAPI** — минимальный бэкенд (`backend/`), пока заглушка
- **Docker + nginx** — контейнеры и docker-compose
- Стили — CSS-переменные `--ak-*` (без Tailwind/UI-фреймворков)

Структура: `frontend/` — Nuxt-сайт, `backend/` — FastAPI, `docs/` — документация.

## Запуск (фронтенд)

```bash
cd frontend
pnpm install
pnpm dev        # http://localhost:3000  (английский — на /en)
pnpm generate   # статическая сборка в .output/public
```

## Бэкенд

```bash
cd backend
pip install -r requirements.txt
python main.py                 # self-check (печатает "ok")
uvicorn main:app --reload      # http://localhost:8000/api/health
```

## Весь стек в Docker

```bash
docker compose up --build      # сайт → http://localhost, API → http://localhost/api/health
```

## Документация

- Контент, переводы, архитектура для агентов → [`docs/ai/`](docs/ai/README.md)
- Деплой на сервер → [`docs/deploy.md`](docs/deploy.md)
