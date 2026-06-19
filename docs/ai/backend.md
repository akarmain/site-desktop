# Бэкенд

Минимальный FastAPI, пока заглушка. Два файла:

```
backend/
  main.py            # приложение: CORS + GET /api/health
  requirements.txt   # fastapi, uvicorn[standard], httpx (для self-check)
```

## Запуск

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python main.py                 # self-check: печатает "ok", если /api/health работает
uvicorn main:app --reload      # сервер на http://localhost:8000
curl localhost:8000/api/health # {"status":"ok"}
```

В Docker бэкенд поднимается как сервис `api`, nginx из `web` проксирует на него `/api/*`.

## Как добавить эндпоинт

В `main.py`:

```python
@app.get("/api/projects")
def projects():
    return [...]
```

Держи все пути под префиксом `/api/` — nginx (`nginx.conf`) проксирует именно его.

## Что осознанно НЕ сделано (ponytail)

- CORS открыт для всех (`allow_origins=["*"]`) — сузить до домена при деплое.
- Нет БД, аутентификации, конфигов, слоёв сервисов — добавлять по мере реальной нужды, не заранее.
- Self-check вместо тест-фреймворка: одна проверка в `if __name__ == "__main__"`.
