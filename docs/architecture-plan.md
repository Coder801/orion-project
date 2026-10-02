# План: отдельный бэкенд (Python, БД + API) и админка пользователей

Статус: черновик · 2026-10-02
Спецификация страниц админки будет в отдельном md-файле. Здесь описаны архитектура и порядок шагов.

---

## 1. Принятые решения

| # | Решение | Комментарий |
|---|---|---|
| R1 | **Бэкенд — отдельный git-репозиторий** `orion-bank-api` | Этот репозиторий (`orion-bank`) становится чистым фронтендом без ORM и без доступа к БД |
| R2 | **Python + FastAPI** | API, проверка данных (Pydantic) и OpenAPI-контракт из коробки |
| R3 | **ORM из экосистемы Python** (выбор — D1) | ORM есть только на бэкенде; фронт работает с API |
| R4 | **PostgreSQL** | Локально в Docker Compose |
| R5 | **Бэкенд владеет всеми данными**, а не только пользователями | Пользователи связаны со счетами, проводками, KYC и заявками. Регистрация (пользователь + счета) и блокировка выполняются в одной транзакции |

> ⚠️ **Правила проекта.** В `.claude/CLAUDE.md` записано: «Demo only — no real backend», «Data comes from an in-browser mock repository». Их нужно обновить: «данные и API — в репозитории `orion-bank-api` (FastAPI); данные демо-пользователей тестовые; KYC-документы не храним; баннер Demo остаётся; секреты только в `.env`, в репозитории лежит `.env.example`».

## 2. Решения, которые ещё нужно принять

### D1 — ORM

| ORM | Популярность | Плюсы | Минусы |
|---|---|---|---|
| **SQLAlchemy 2.0** (+ Alembic) | Стандарт в Python | Зрелая, полный контроль SQL, async через `asyncpg`, типизированные модели (`Mapped[...]`), `with_for_update()` для ledger | Многословнее остальных |
| **SQLModel** | Средняя | От автора FastAPI: одна модель и для таблицы, и для Pydantic-схемы | Надстройка над SQLAlchemy; смешивает модель БД и API-контракт, в сложных случаях всё равно приходится спускаться в SQLAlchemy |
| **Tortoise ORM** | Нишевая | Стиль Django ORM, изначально async | Меньше сообщество, слабее типизация, свои миграции (Aerich) |
| **Django ORM** | Очень высокая (в Django) | Удобная, есть готовая админка | Тянет за собой Django; с FastAPI не используется |
| **Piccolo** | Нишевая | Async, своя админка | Маленькое сообщество |

**Рекомендация: SQLAlchemy 2.0 (async) + Alembic.** Для денег и ledger важны транзакции, блокировки строк и предсказуемый SQL, и здесь SQLAlchemy надёжнее всех.

### Остальные решения

| # | Вопрос | Рекомендация | Альтернатива |
|---|---|---|---|
| D2 | Сессии | **Сессии в БД** (таблица `sessions`) + непрозрачный токен в куке `httpOnly; Secure; SameSite=Lax`. Позволяют мгновенно разлогинить или заблокировать пользователя | JWT — нельзя отозвать без чёрного списка |
| D3 | Хэш паролей | **`pwdlib[argon2]`** (рекомендуется в документации FastAPI) | `argon2-cffi` напрямую |
| D4 | Как фронт обращается к API | **Через `rewrites` в `next.config.ts`**: `/api/*` → `API_URL`. Кука остаётся на домене фронта, CORS не нужен, `proxy.ts` видит куку | Прямые запросы на другой домен: CORS + `credentials: "include"` + `SameSite=None` |
| D5 | Контракт между репозиториями | **OpenAPI** от FastAPI → фронт генерирует хуки RTK Query (`@rtk-query/codegen-openapi`) | Писать TS-типы вручную |
| D6 | Регистр ключей JSON | **camelCase в API** (Pydantic `alias_generator=to_camel`), snake_case в Python. Фронт не меняется | snake_case в API — придётся переименовать поля во фронте |
| D7 | Инструменты | **uv** (зависимости), **ruff** (lint + format), **mypy --strict** или **pyright**, **pytest** + `pytest-asyncio` + `httpx` | poetry, black + flake8 |

---

## 3. Архитектура системы

```
┌───────────────────────── orion-bank (этот репозиторий, TS) ───────────────────────┐
│ Browser: components → RTK Query (fetchBaseQuery, хуки из OpenAPI, теги)           │
│              │ fetch /api/v1/...  (cookie orion_sid — httpOnly, first-party)        │
│ Next.js:  proxy.ts — оптимистичный редирект: есть ли кука                         │
│           server layouts app/, admin/ — GET /api/v1/auth/me с кукой → роль/redirect │
│           next.config.ts rewrites: /api/:path* → ${API_URL}/api/:path*            │
└──────────────┬─────────────────────────────────────────────────────────────────────┘
               ▼
┌───────────────────────── orion-bank-api (новый репозиторий, Python) ──────────────┐
│ FastAPI: routers (APIRouter на модуль) — Pydantic-схемы запроса и ответа           │
│          deps: get_db_session, CurrentUser, require_permission("users.block")     │
│          exception handlers: DomainError → { error: { code } }                    │
│ services: бизнес-сценарии, одна транзакция на команду                             │
│ domain:   чистые правила (money, ledger, review, rules) — порт из фронта           │
│ SQLAlchemy 2.0 async (asyncpg) + Alembic → PostgreSQL                             │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Принципы:
- **Источник правды — бэкенд.** Права, балансы, статусы и валидация проверяются там. Guard'ы фронта и `proxy.ts` отвечают только за UX.
- **Домен переписывается на Python.** `domain/ledger.ts`, `review.ts`, `rules.ts`, `money.ts`, `audit.ts` портируются в `app/domain/`. **Тесты (`*.test.ts`) — это спецификация:** их сценарии переносятся в pytest один к одному. На фронте остаётся только нужное для отображения: форматирование денег, предпросмотр комиссии. Курс конвертации фронт получает через API (`POST /convert/quote`).
- **Валидация в двух местах:** Pydantic на сервере (источник правды), zod во фронте (только UX форм). Коды ошибок общие: `validation.*`, `domainErrors.*`.
- **Ошибки:** `{ "error": { "code": "emailTaken", "details": ... } }` + HTTP-статус. Фронт переводит `code` через существующий `domainErrors.*`.
- **Версия API:** префикс `/api/v1`.

---

## 4. Репозиторий `orion-bank-api`

```
orion-bank-api/
  pyproject.toml, uv.lock
  alembic.ini
  migrations/                  # env.py (async), versions/
  app/
    main.py                    # create_app(): routers, exception handlers, lifespan (engine dispose)
    core/
      config.py                # Settings (pydantic-settings): DATABASE_URL, SESSION_TTL_DAYS, WEB_ORIGIN…
      db.py                    # create_async_engine, async_sessionmaker, get_db_session (Depends)
      security.py              # хэш паролей, генерация и хэш токена сессии
      deps.py                  # CurrentUser, require_permission(...)
      errors.py                # DomainError → JSON, RequestValidationError → validation.*
      schemas.py               # базовая модель Pydantic: camelCase-алиасы
    domain/                    # money, ledger, review, rules, audit, permissions, errors (без FastAPI)
    models/                    # SQLAlchemy: user, session, account, transaction, request, kyc, …
    modules/
      auth/      router.py schemas.py service.py
      me/        профиль, настройки, уведомления
      accounts/  transactions/  requests/  convert/  kyc/  products/  support/
      admin/
        users/   router.py schemas.py service.py
        kyc/ requests/ credits/ card_orders/ settings/
    cli.py                     # seed, reset, export-openapi
  tests/
    conftest.py                # тестовая БД, откат транзакции на каждый тест, httpx.AsyncClient
    domain/  api/
  Dockerfile
  docker-compose.yml           # postgres, postgres-test, api
  .env.example
```

**Зависимости:** `fastapi[standard]`, `pydantic-settings`, `sqlalchemy[asyncio]`, `asyncpg`, `alembic`, `pwdlib[argon2]`; dev: `pytest`, `pytest-asyncio`, `httpx`, `ruff`, `mypy`.

**Команды** (через `uv run` / Makefile): `dev` (`fastapi dev app/main.py`), `lint` (`ruff check && ruff format --check`), `typecheck`, `test`, `db-migrate` (`alembic upgrade head`), `db-revision` (`alembic revision --autogenerate`), `seed`, `reset`, `openapi` (экспорт `openapi.json`).

### Модели: ключевые места

```python
class Role(StrEnum): user = "user"; admin = "admin"
class UserStatus(StrEnum): active = "active"; blocked = "blocked"
class KycStatus(StrEnum): none = "none"; pending = "pending"; approved = "approved"; rejected = "rejected"

class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(primary_key=True)            # префикс "usr_" + uuid/ulid
    email: Mapped[str] = mapped_column(unique=True)              # хранится в нижнем регистре
    name: Mapped[str]
    password_hash: Mapped[str]
    role: Mapped[Role] = mapped_column(default=Role.user)
    status: Mapped[UserStatus] = mapped_column(default=UserStatus.active)
    blocked_reason: Mapped[str | None]
    kyc_status: Mapped[KycStatus] = mapped_column(default=KycStatus.none)
    last_login_at: Mapped[datetime | None]
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[datetime | None]                          # soft delete

class Session(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(primary_key=True)            # sha256 от токена; сам токен лежит только в куке
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    created_at, expires_at, last_seen_at: Mapped[datetime]
    user_agent: Mapped[str | None]; ip: Mapped[str | None]

class Account(Base):
    __tablename__ = "accounts"
    id: Mapped[str] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    currency: Mapped[str]                                         # у пользователя может быть несколько счетов в одной валюте
    balance: Mapped[Decimal] = mapped_column(Numeric(38, 0), default=0)   # minor units
    hold: Mapped[Decimal] = mapped_column(Numeric(38, 0), default=0)
# Transaction, Request (payload JSONB), KycSubmission, CreditApplication, CardOrder,
# SupportTicket, Notification, AuditEntry, PlatformSettings (одна строка, JSONB) — по domain/types.ts
```

- **Деньги:** `Numeric(38,0)` в minor units. В домене хранятся как `int` (в Python точность не ограничена), в API передаются строкой (`"12500"`), как сейчас во фронте. `float` не используем.
- **Ledger:** `applyRequest` выполняется в `async with session.begin():`. Строки счетов блокируются через `select(Account).where(...).with_for_update()`. Идемпотентность: `update(Request).where(Request.id == id, Request.status == "pending").returning(...)`, и если строк нет, заявка уже обработана.

---

## 5. Админка: управление пользователями

### 5.1 Роли и права

```python
# app/domain/permissions.py
class Permission(StrEnum):
    users_read = "users.read"; users_update = "users.update"; users_block = "users.block"
    users_change_role = "users.changeRole"; users_revoke_sessions = "users.revokeSessions"
    kyc_review = "kyc.review"; requests_review = "requests.review"; settings_manage = "settings.manage"

ROLE_PERMISSIONS: dict[Role, frozenset[Permission]] = {
    Role.user: frozenset(),
    Role.admin: frozenset(Permission),
}
```

- Бэкенд: `dependencies=[Depends(require_permission(Permission.users_block))]` на каждом админском роуте.
- `GET /auth/me` возвращает `permissions[]`. Хук фронта `useCan("users.block")` только прячет кнопки.

### 5.2 Маршруты фронта

| Маршрут | Назначение |
|---|---|
| `/admin/users` | Список: поиск, фильтры, сортировка, пагинация |
| `/admin/users/[id]` | Карточка пользователя (вкладки ниже) |
| `/admin/registrations` | Остаётся **очередью KYC**. Вкладку «Users» отсюда убираем |

Обновить `config/navigation.ts` (пункт `users`), `messages/en.json` (`nav.users`, `admin.users.*`), `ROUTES`.

### 5.3 Список `/admin/users`

- Фильтры хранятся в URL: `?q=&role=&status=&kyc=&sort=createdAt:desc&page=1&pageSize=20`.
- Поиск (`ILIKE` по email/имени), фильтрация и пагинация выполняются на сервере. Ответ: `{ items: AdminUserRow[], total, page, pageSize }`.
- Колонки: email, имя, роль, статус, KYC, дата регистрации, последний вход, меню действий.

### 5.4 Карточка `/admin/users/[id]`

Шапка: имя, email, бейджи (роль, статус, KYC), кнопки действий.

| Вкладка | Содержимое | API |
|---|---|---|
| Profile | Данные, даты, редактирование имени и email | `GET /admin/users/{id}` |
| Accounts | Счета: balance / hold / available | `GET /admin/users/{id}/accounts` |
| KYC | Текущая и прошлые заявки, переход к ревью | `GET /admin/users/{id}/kyc` |
| Requests | Заявки пользователя со ссылками на ревью | `GET /admin/users/{id}/requests` |
| Sessions | Активные сессии, «завершить все» | `GET /admin/users/{id}/sessions` |
| Activity | Записи audit log по пользователю | `GET /admin/users/{id}/audit` |

### 5.5 Действия и правила

| Действие | Правила |
|---|---|
| Block / Unblock | Причина обязательна; при блокировке удаляются все сессии; вход возвращает `403 accountBlocked` |
| Change role | Нельзя понизить себя; нельзя оставить систему без активного admin |
| Revoke sessions | Удаляет все сессии пользователя |
| Edit profile | Имя; email — с проверкой уникальности |
| Delete | Только soft delete (`deleted_at`) + блокировка |

Каждое действие выполняется в одной транзакции и создаёт **AuditEntry** (кто, что, до и после, причина) и **Notification** пользователю.

### 5.6 API (admin)

```
GET    /api/v1/admin/users?q&role&status&kyc&sort&page&pageSize
GET    /api/v1/admin/users/{id}
PATCH  /api/v1/admin/users/{id}                 { name?, email? }
POST   /api/v1/admin/users/{id}/block           { reason }
POST   /api/v1/admin/users/{id}/unblock
POST   /api/v1/admin/users/{id}/role            { role }
DELETE /api/v1/admin/users/{id}/sessions
GET    /api/v1/admin/users/{id}/{accounts|kyc|requests|sessions|audit}
```

Действия оформлены отдельными командами: у каждой своё право, свой аудит и своя валидация.

### 5.7 UI-компоненты (фронт)

Переиспользуем: `Panel` (`flush`), `Table`, `AsyncContent`, `Tabs`, `Badge`/`StatusBadge`, `Dialog`, `FormField`, `sonner`.
Новые (в `features/admin/users/`): `UsersTable`, `UsersToolbar`, `Pagination` (в `components/ui`), `UserHeader`, `UserTabs`, `ConfirmActionDialog` (с полем «причина»), `useUsersSearchParams`.

---

## 6. Регистрация и вход

```
POST /api/v1/auth/sign-up          { name, email, password }  → 201 + Set-Cookie
POST /api/v1/auth/sign-in          { email, password }        → 200 + Set-Cookie | 401 invalidCredentials | 403 accountBlocked
POST /api/v1/auth/sign-out                                    → 204, сессия удалена
GET  /api/v1/auth/me                                          → { user, permissions } | 401
POST /api/v1/auth/forgot-password  { email }                  → 204 всегда (демо-заглушка)
```

- Sign-up в одной транзакции: пользователь + фиатные счета + audit + сессия.
- Кука ставится через `response.set_cookie("orion_sid", token, httponly=True, secure=..., samesite="lax", max_age=...)`.
- Rate limit на `sign-in` / `sign-up`: простой in-memory лимитер (окно + счётчик по IP+email) как dependency. Позже — Redis или `slowapi`.
- Мутирующие запросы проверяют `Origin` (= `WEB_ORIGIN`). Это защита от CSRF в дополнение к `SameSite=Lax`.
- Первый admin создаётся командой `seed` из `ADMIN_EMAIL` / `ADMIN_PASSWORD`. В репозиториях паролей нет.

**Изменения во фронте:**
- `next.config.ts`: `rewrites` `/api/:path*` → `${API_URL}/api/:path*`; `API_URL` в `.env.local`.
- `store/api.ts`: `fetchBaseQuery({ baseUrl: "/api/v1" })`, хуки генерируются из `openapi.json`, теги остаются.
- `authSlice` гидрируется из `/auth/me`. Серверные layout'ы `app/` и `admin/` вызывают `/auth/me`, пробрасывая куку, и делают `redirect()` по роли.
- `proxy.ts` проверяет только наличие куки `orion_sid`. Удалить JSON-куку `orion-session` и `parseSessionCookie`.
- Удалить `src/data/*` (mock), `withLatency`, `features/*/service.ts`. Убрать из фронта портированную на бэкенд логику `domain/*`, оставив форматирование и предпросмотр.

---

## 7. Шаги

Каждый шаг заканчивается зелёными lint / typecheck / test в затронутом репозитории и коротким отчётом об изменениях.

### Фаза 0 — решения
- [ ] Принять D1–D7
- [ ] Обновить `.claude/CLAUDE.md` фронта (нет mock-слоя; API в `orion-bank-api`; команды)
- [ ] Написать спецификацию страниц админки (отдельный md)

### Фаза 1 — каркас `orion-bank-api`
- [ ] `git init`, `uv init`, ruff, mypy, pytest
- [ ] Docker Compose (postgres, postgres-test), `.env.example`, `core/config.py`
- [ ] `create_app()`: обработчики ошибок, camelCase-схемы, `GET /api/v1/health`
- [ ] SQLAlchemy async engine + `get_db_session`; Alembic с async `env.py`; модели `User`, `Session`
- [ ] `CLAUDE.md` для нового репозитория (стек, команды, правила денег и транзакций)

**Готово, когда:** `docker compose up -d && uv run alembic upgrade head && uv run fastapi dev app/main.py` поднимает API, а `/docs` открывается.

### Фаза 2 — auth на бэкенде
- [ ] `security.py` (pwdlib/argon2, токены), `deps.py` (`CurrentUser`, `require_permission`)
- [ ] `/auth/sign-up | sign-in | sign-out | me | forgot-password`, rate limit, проверка `Origin`
- [ ] Команда `seed`: admin из env + демо-пользователи (порт `src/data/seed.ts`)
- [ ] Тесты: регистрация, дубликат email, неверный пароль, заблокированный пользователь, истёкшая и отозванная сессия

### Фаза 3 — фронт на настоящем auth
- [ ] `rewrites`, `fetchBaseQuery`, генерация хуков из OpenAPI (`@rtk-query/codegen-openapi` — новая dev-зависимость)
- [ ] `SignInForm` / `SignUpForm` на новые мутации, гидрация `authSlice` из `/auth/me`
- [ ] Серверная проверка роли в layout'ах, упрощённый `proxy.ts`, удаление `orion-session`

**Готово, когда:** пользователя, зарегистрированного в одном браузере, видно при входе из другого; подмена куки не даёт доступ в админку.

### Фаза 4 — админка пользователей
- [ ] Бэкенд: `modules/admin/users` (п. 5.6) + AuditEntry / Notification
- [ ] Тесты: последний admin, понижение себя, блокировка удаляет сессии, аудит на каждое действие
- [ ] Фронт: `/admin/users`, `/admin/users/[id]`, навигация, i18n, `useCan`
- [ ] Из `/admin/registrations` убрать вкладку Users

### Фаза 5 — домен и остальные фичи
- [ ] Портировать `domain/*` на Python; перенести сценарии `money.test.ts`, `ledger.test.ts`, `review.test.ts` в pytest
- [ ] Модели и миграции: Account, Transaction, Request, KYC, Credit, CardOrder, Ticket, Notification, Audit, PlatformSettings
- [ ] Пользовательские модули: accounts, deposit/withdraw (поля методов из `config/methods.ts` → в настройки на бэкенде), transfer, convert (quote + lock), verification, credit, cards, support, settings
- [ ] Остальные разделы админки — по спецификации из отдельного md
- [ ] Фронт: перевести экраны на API, удалить mock-слой

### Фаза 6 — укрепление
- [ ] Единый формат ошибок, структурированное логирование, health/readiness
- [ ] CI в обоих репозиториях; проверка, что OpenAPI-клиент фронта соответствует текущему API
- [ ] e2e: регистрация → KYC → одобрение → депозит → одобрение → баланс

---

## 8. Открытые вопросы

1. Нужно ли подтверждение email? (Демо — скорее нет, но поле `email_verified_at` можно заложить сразу.)
2. Может ли админ создавать пользователей и других админов из UI или только через seed?
3. Нужны ли в ближайшее время роли кроме `user`/`admin` (support, compliance)?
4. Где будут жить API и Postgres при деплое (Railway / Render / Fly / VPS + Neon / Supabase)? От этого зависят `API_URL` и схема кук.
5. Оставляем ли кнопку «Reset demo data» в админке (= `reset` через API)?
6. Конфиг валют и методов оплаты (`config/currencies.ts`, `config/methods.ts`): источником правды становится бэкенд (`PlatformSettings`), а фронт получает их через API. Согласны?
