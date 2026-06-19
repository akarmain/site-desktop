# Деплой akarmain.ru

Короткая публичная памятка по деплою **статической сборки** сайта (rsync статики за nginx).
Альтернатива «всё в контейнерах» — `docker compose up --build` (см. `Dockerfile`,
`docker-compose.yml`, `nginx.conf`); тонкую настройку прод-сервера (домен, TLS, бэкенд `/api`)
выполняет деплой-агент.

## Переменные окружения

Перед командами ниже задать значения для своего сервера:

```bash
export DEPLOY_HOST="user@example.com"
export DEPLOY_PATH="/var/www/akarmain.ru/dist"
export BACKUP_PATH="/var/backups/akarmain-deploy"
export APP_CONTAINER="akarmain"
export COMPOSE_FILE="/var/www/akarmain.ru/docker-compose.yml"
```

## Обычный деплой

Из корня проекта:

```bash
pnpm install --frozen-lockfile
pnpm generate
```

Проверить, что сборка есть:

```bash
test -f .output/public/index.html
test -d .output/public/_nuxt
```

Сделать бэкап текущего прода:

```bash
stamp=$(date +%Y%m%d%H%M%S)
ssh "$DEPLOY_HOST" "mkdir -p '$BACKUP_PATH' && cp -a '$DEPLOY_PATH' '$BACKUP_PATH/akarmain.ru.dist.before-deploy.$stamp'"
```

Выложить новую статику:

```bash
rsync -az --delete .output/public/ "$DEPLOY_HOST:$DEPLOY_PATH/"
ssh "$DEPLOY_HOST" "find '$DEPLOY_PATH' -type d -exec chmod 755 {} + && find '$DEPLOY_PATH' -type f -exec chmod 644 {} +"
```

Перезагрузить nginx внутри контейнера:

```bash
ssh "$DEPLOY_HOST" "docker exec '$APP_CONTAINER' nginx -t && docker exec '$APP_CONTAINER' nginx -s reload"
```

Если менялись `docker-compose.yml`, volume или nginx-конфиг, лучше пересоздать контейнер:

```bash
ssh "$DEPLOY_HOST" "docker compose -f '$COMPOSE_FILE' -p akarmainru up -d --force-recreate '$APP_CONTAINER'"
```

## Проверка после деплоя

```bash
curl -I http://akarmain.ru
curl -I https://akarmain.ru
curl -I https://akarmain.ru/projects
curl https://akarmain.ru/projects | rg "_nuxt|akm-boot"
curl -I https://old.akarmain.ru
curl https://old.akarmain.ru/projects | rg "Akarmain App|QR bot"
```

HTTP должен отдавать редирект на HTTPS, `akarmain.ru` должен содержать `_nuxt`/`akm-boot`, а `old.akarmain.ru` должен оставаться старым приложением.

Проверить один актуальный hashed asset из HTML:

```bash
asset=$(curl -s https://akarmain.ru/ | rg -o '/_nuxt/[^"]+' -m 1)
curl -I "https://akarmain.ru$asset"
```

Проверка сертификатов:

```bash
openssl s_client -connect akarmain.ru:443 -servername akarmain.ru </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
openssl s_client -connect old.akarmain.ru:443 -servername old.akarmain.ru </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

## Старый service worker

Старая версия была PWA и могла кешировать `/projects` через service worker. Поэтому в новом сайте есть:

- `public/sw.js`
- `public/registerSW.js`
- cleanup-скрипт в `nuxt.config.ts`

На сервере для `/sw.js` и `/registerSW.js` в nginx стоит `Cache-Control: no-store`. Если браузер все еще показывает старый сайт, открыть `https://akarmain.ru/sw.js`, затем сделать `Cmd + Shift + R` или закрыть и открыть вкладку заново.

Проверка:

```bash
curl -I https://akarmain.ru/sw.js
curl -I https://akarmain.ru/registerSW.js
```

## Откат

Посмотреть бэкапы:

```bash
ssh "$DEPLOY_HOST" "ls -1dt '$BACKUP_PATH'/akarmain.ru.dist.* | head"
```

Восстановить выбранный бэкап:

```bash
backup="$BACKUP_PATH/akarmain.ru.dist.before-deploy.YYYYMMDDHHMMSS"
ssh "$DEPLOY_HOST" "rsync -a --delete '$backup/' '$DEPLOY_PATH/' && docker exec '$APP_CONTAINER' nginx -s reload"
```

После отката снова прогнать проверки из раздела выше.
