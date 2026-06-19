"""Минимальный FastAPI-бэкенд для akarmain.dev — пока заглушка.

Запуск:    uvicorn main:app --reload
Self-check: python main.py   (поднимает TestClient и проверяет /api/health)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="akarmain.dev api")

# ponytail: на время заглушки открыт для всех источников —
# при настройке деплоя сузить до домена сайта (allow_origins=["https://akarmain.ru"]).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    # обязательная проверка (ponytail): падает, если /api/health сломан
    from fastapi.testclient import TestClient

    res = TestClient(app).get("/api/health")
    assert res.status_code == 200 and res.json() == {"status": "ok"}, res.text
    print("ok")
