# Промт: создание бэкенда `orion-bank-api`

Скопируйте всё, что ниже линии, в Claude Code, запущенный в пустом репозитории `orion-bank-api`.

---

Создай с нуля бэкенд-проект **orion-bank-api** — REST API и базу данных для демо-кошелька Orion (фиат + крипта). Фронтенд уже существует в отдельном репозитории `/Users/dmitriyonischenko/Work/orion-bank` (Next.js + RTK Query). Его можно и нужно **читать** как источник контрактов, но **не изменять**.

Работаем поэтапно: сейчас делаем **Фазу 1 (каркас)** и **Фазу 2 (auth)**. После каждой фазы остановись, дай короткий отчёт (что сделано, как запустить, что проверено) и дождись моего «ок». Остальной домен (счета, заявки, KYC и т.д.) пока не реализуй.

## Контекст и ограничения

- Это **демо**: никаких реальных платежей и KYC, документы не храним. Данные пользователей тестовые.
- **Никаких реальных секретов в репозитории**: только `.env.example`, реальные значения лежат в `.env` (git-ignored).
- Никаких внешних сетевых запросов из кода (кроме своей БД).
- Не добавляй библиотеки сверх списка ниже без моего согласия.
- Полный план архитектуры: `/Users/dmitriyonischenko/Work/orion-bank/docs/architecture-plan.md`. Прочитай его в первую очередь (разделы 3–7).

## Стек

- **Python 3.13+**, менеджер зависимостей **uv** (`pyproject.toml` + `uv.lock`)
- **FastAPI** (`fastapi[standard]`), **Pydantic v2**, **pydantic-settings**
- **PostgreSQL 17** (Docker Compose) + **SQLAlchemy 2.0 async** (`sqlalchemy[asyncio]`, `asyncpg`) + **Alembic** (async `env.py`, autogenerate)
- **pwdlib[argon2]** — хэш паролей
- Dev: **pytest**, **pytest-asyncio**, **httpx** (`AsyncClient` + `ASGITransport`), **ruff** (lint + format), **mypy --strict**

Перед написанием кода сверь актуальный API FastAPI, SQLAlchemy 2.0, Alembic, pwdlib и pydantic-settings через Context7 (если доступен) или официальную документацию. Не полагайся на память о старых версиях.

## Структура

```
orion-bank-api/
  pyproject.toml, uv.lock, alembic.ini, Makefile
  migrations/                  # env.py (async), versions/
  app/
    main.py                    # create_app(): роутеры с префиксом /api/v1, обработчики ошибок, lifespan
    core/
      config.py                # Settings: DATABASE_URL, SESSION_TTL_DAYS=30, SESSION_COOKIE="orion_sid",
                               #   COOKIE_SECURE, WEB_ORIGIN, ADMIN_EMAIL, ADMIN_PASSWORD, ENV
      db.py                    # engine, async_sessionmaker(expire_on_commit=False), get_db_session
      security.py              # hash/verify пароля, генерация токена (secrets.token_urlsafe(32)), sha256 токена
      deps.py                  # DbSession, CurrentUser, OptionalUser, require_permission(...), check_origin
      errors.py                # DomainError + обработчики → единый формат ошибок
      schemas.py               # ApiModel: базовая Pydantic-модель с camelCase-алиасами
      ids.py                   # new_id(prefix) → "usr_<ulid/uuid hex>"
    domain/
      errors.py                # коды DomainError (см. ниже)
      permissions.py           # Permission (StrEnum), ROLE_PERMISSIONS
    models/                    # Base(DeclarativeBase), user.py, session.py, audit.py
    modules/
      health/router.py
      auth/  router.py  schemas.py  service.py
    cli.py                     # python -m app.cli seed | reset | openapi
  tests/
    conftest.py                # тестовая БД, откат транзакции на каждый тест, client fixture
    api/test_health.py, api/test_auth.py
    unit/test_security.py, unit/test_permissions.py
  Dockerfile
  docker-compose.yml           # db (5432), db-test (5433), api
  .env.example, .gitignore, README.md, CLAUDE.md
```

## Контракты (должны совпадать с фронтом)

**JSON — camelCase.** В Python всё в snake_case, а в API модели наследуются от `ApiModel` (`alias_generator=to_camel`, `populate_by_name=True`, ответы сериализуются `by_alias`).

**Формат ошибки** — всегда:
```json
{ "error": { "code": "emailTaken", "fields": { "email": "email" } } }
```
- Бизнес-ошибки: `code` — один из кодов фронта `domainErrors.*`: `notFound, forbidden, invalidCredentials, emailTaken, kycRequired, kycAlreadySubmitted, insufficientFunds, invalidAmount, currencyDisabled, methodUnavailable, currencyMismatch, sameAccount, sameCurrency, recipientNotFound, recipientSelf, reasonRequired, invariant`. Добавь новые: `unauthorized`, `accountBlocked`, `rateLimited`, `lastAdmin`, `selfDemotion`.
- Ошибки валидации (422): `code: "validation"`, `fields` — карта `camelCasePath → ключ` из фронтовых `validation.*`: `required, email, passwordMin, passwordMismatch, …`. Для auth нужны `required`, `email`, `passwordMin`. Переопредели обработчик `RequestValidationError`.
- Маппинг статусов: `notFound` 404, `forbidden` 403, `unauthorized` 401, `invalidCredentials` 401, `accountBlocked` 403, `emailTaken` 409, `rateLimited` 429, валидация 422, прочие бизнес-ошибки 400/409.

**ID** — строки с префиксом сущности: `usr_…`, `ses_…`, `aud_…` (как в фронтовом seed: `usr_admin`, `usr_demo`).

**Даты** — ISO 8601 UTC (`2026-10-02T10:00:00Z`), колонки `timestamptz`.

**Деньги** (для будущих фаз, заложи хелпер уже сейчас): целые minor units, колонки `Numeric(38, 0)`, в Python `int`, в API — строка. `float` запрещён.

**Типы фронта** для сверки: `/Users/dmitriyonischenko/Work/orion-bank/src/domain/types.ts` (`User`, `Role`, `KycStatus`), `src/types/index.ts` (`SessionUser`), `src/features/auth/service.ts` и `schemas.ts` (текущая логика sign-up/sign-in), `src/data/seed.ts` (демо-данные), `src/i18n/messages/en.json` (ключи `domainErrors`, `validation`).

## Фаза 1 — каркас

1. `uv init`, зависимости, настройки ruff (line-length 100, правила `E,F,I,UP,B,SIM,ASYNC`) и mypy strict в `pyproject.toml`.
2. `docker-compose.yml`: `db` и `db-test` (postgres:17, healthcheck), `api` (Dockerfile на базе uv). `.env.example` со всеми переменными и безопасными демо-значениями без реальных секретов.
3. `core/config.py`, `core/db.py`, `core/schemas.py`, `core/errors.py`, `core/ids.py`.
4. Модели:
   - `users`: `id`, `email` (unique, хранится в lower-case), `name`, `password_hash`, `role` (`user|admin`), `status` (`active|blocked`), `blocked_reason?`, `kyc_status` (`none|pending|approved|rejected`), `last_login_at?`, `created_at`, `updated_at`, `deleted_at?`; индексы `created_at`, `(role, status)`.
   - `sessions`: `id` (= sha256 hex токена; сам токен в БД не хранится), `user_id` FK ON DELETE CASCADE + индекс, `created_at`, `expires_at`, `last_seen_at`, `user_agent?`, `ip?`.
   - `audit_log`: `id`, `actor_id?`, `action`, `entity` (`user|session|…`), `entity_id`, `before` JSONB?, `after` JSONB?, `reason?`, `created_at`; индекс `entity_id`.
   - Enum'ы храни как `String` + CHECK constraint (`native_enum=False`): так проще миграции.
5. Alembic: async `env.py`, `target_metadata = Base.metadata`, naming convention для constraints, первая миграция через autogenerate (проверь её глазами).
6. `GET /api/v1/health` → `{ "status": "ok", "db": "ok" }` (выполняет `SELECT 1`).
7. OpenAPI: `/api/docs`, `/api/openapi.json`. Указывай `operation_id` у каждого роута (`signUp`, `signIn`, `getMe`, …) — из них фронт сгенерирует имена хуков RTK Query.
8. Тесты: фикстура БД на `db-test` (миграции один раз за сессию, на каждый тест — транзакция с откатом), `client` через `httpx.AsyncClient(transport=ASGITransport(app))`, тест health.
9. `Makefile`: `up`, `down`, `dev` (`uv run fastapi dev app/main.py --port 8000`), `lint`, `format`, `typecheck`, `test`, `migrate`, `revision m=...`, `seed`, `reset`, `openapi` (пишет `openapi.json` в корень).
10. `README.md` (запуск за 5 команд) и **`CLAUDE.md`** (стек, команды, структура, контракты из этого промта, правила: деньги только `int`/`Numeric`, бизнес-изменения в одной транзакции, каждое админское действие → audit, «перед завершением: `make lint typecheck test`»).

**Критерий готовности:** `make up && make migrate && make dev` → `/api/docs` открывается, `/api/v1/health` отвечает `ok`; `make lint typecheck test` зелёные.

→ **Стоп, отчёт, ждать «ок».**

## Фаза 2 — аутентификация

Эндпоинты (`modules/auth`):

| Метод | Путь | Тело | Ответ |
|---|---|---|---|
| POST | `/api/v1/auth/sign-up` | `{ name, email, password }` | 201 `{ user, permissions }` + Set-Cookie |
| POST | `/api/v1/auth/sign-in` | `{ email, password }` | 200 `{ user, permissions }` + Set-Cookie |
| POST | `/api/v1/auth/sign-out` | — | 204, сессия удалена, кука очищена |
| GET | `/api/v1/auth/me` | — | 200 `{ user, permissions }` / 401 `unauthorized` |
| POST | `/api/v1/auth/forgot-password` | `{ email }` | 204 всегда (демо, ничего не отправляет и не раскрывает, существует ли email) |

`user` = `SessionUser` фронта: `{ id, email, name, role }` + `status`, `kycStatus`. Пароль, хэш и сессии в ответ никогда не попадают.

Правила:
- Валидация как во фронте: `name` — обязательное поле после trim, ≤ 70 символов; `email` — валидный (`EmailStr`), нормализуется `strip().lower()`; `password` — ≥ 8 символов (ошибка `passwordMin`). `confirmPassword` проверяет только фронт, на бэкенд он не приходит.
- **Sign-up** выполняется в одной транзакции: проверка уникальности email (`emailTaken`, плюс ловить `IntegrityError` на гонке), создание пользователя (`role=user`, `kyc_status=none`), запись в audit (`user.registered`), создание сессии. Создание фиатных счетов — TODO для фазы счетов, оставь явный хук `on_user_registered(session, user)`.
- **Sign-in:** неверный email или пароль → одинаковый `invalidCredentials` (выполняй verify и для несуществующего пользователя, против timing-атак); `status=blocked` или `deleted_at` → `accountBlocked`; обновить `last_login_at`; если `pwdlib` говорит, что хэш нужно обновить, — перехэшировать.
- **Сессия:** токен `secrets.token_urlsafe(32)` → в куку; в БД `id = sha256(token)`. Кука: `orion_sid`, `httponly=True`, `samesite="lax"`, `secure=settings.COOKIE_SECURE`, `path="/"`, `max_age = SESSION_TTL_DAYS`. `CurrentUser` dependency: кука → сессия не истекла → пользователь `active` и не удалён → обновить `last_seen_at` (не чаще раза в 5 минут). Иначе 401 `unauthorized`.
- **Права:** `Permission` StrEnum: `users.read, users.update, users.block, users.changeRole, users.revokeSessions, kyc.review, requests.review, settings.manage`. `user` → пусто, `admin` → все. `require_permission(p)` возвращает dependency (403 `forbidden`). `/auth/me` отдаёт `permissions: string[]`.
- **CSRF:** dependency `check_origin` на всех не-GET запросах: если заголовок `Origin` есть и не совпадает с `WEB_ORIGIN` → 403 `forbidden`.
- **Rate limit:** простой in-memory лимитер (скользящее окно; ключ IP+email; например, 10 попыток за 15 минут) на `sign-in`, `sign-up`, `forgot-password` → 429 `rateLimited`. Оформи его за интерфейсом, чтобы позже заменить на Redis.
- **Seed** (`make seed`, идемпотентный): admin из `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`id=usr_admin`); демо-пользователи как в фронтовом `src/data/seed.ts` (те же id, email, имена и KYC-статусы), пароль из env `DEMO_PASSWORD`. `make reset` — truncate + seed.

Тесты (минимум):
- sign-up: успех (кука установлена, `/me` возвращает пользователя), дубликат email в другом регистре → 409 `emailTaken`, короткий пароль → 422 с `fields.password = "passwordMin"`;
- sign-in: успех, неверный пароль, несуществующий email (одинаковый ответ), заблокированный → 403 `accountBlocked`;
- `/me` без куки, с мусорной кукой, с истёкшей сессией → 401;
- sign-out удаляет сессию (повторный `/me` → 401);
- `require_permission`: user → 403, admin → 200 (на тестовом роуте или через `/auth/me` + unit-тест);
- `check_origin`: чужой `Origin` → 403;
- rate limit → 429;
- unit: hash/verify, sha256 токена, ROLE_PERMISSIONS.

**Критерий готовности:** `make lint typecheck test` зелёные; `make openapi` выдаёт `openapi.json` с операциями `signUp, signIn, signOut, getMe, forgotPassword, health`; ручная проверка через `/api/docs` (sign-up → me → sign-out → me 401).

→ **Стоп, отчёт:** что сделано; какие решения принял сам и почему; что осталось TODO; как фронт должен подключиться (`rewrites` на `http://localhost:8000`, имя куки, формат ошибок).

## Стиль кода

- Типизация везде, mypy strict без `Any` и `type: ignore` без комментария.
- Роутеры тонкие: парсинг → сервис → ответ. Логика и транзакции живут в `service.py`, сервисы принимают `AsyncSession` и не знают о FastAPI (кроме исключений домена).
- `async with session.begin():` — одна транзакция на команду.
- Комментарии — только там, где логика неочевидна.
- Коммиты небольшие, по шагам, сообщения на английском.
