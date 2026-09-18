# Lutra

Frontend for a website where people add, import and review meal kits (verspakketten).

The interface is Dutch; domain types and technical infrastructure are English.

## Stack

- **Vue 3** with the Composition API and `<script setup>`
- **TypeScript** in strict mode
- **Vite** for development and production builds
- **Vue Router** for navigation
- **vite-plugin-pwa** for the manifest and generated service worker
- **openapi-typescript** to generate API types from the backend contract
- **Vitest** + Vue Test Utils for unit tests
- **Playwright** for browser flows
- **ESLint** + **Prettier** for static analysis and formatting
- **npm** with a committed `package-lock.json`

No state-management, i18n or authentication library is installed yet. Server data stays in
feature-level views and API modules until genuinely shared client state appears.

## Features and routes

| Route                         | Screen                                                        |
| ----------------------------- | ------------------------------------------------------------- |
| `/`                           | Homepage: top 10 verspakketten by taste score, with sorting   |
| `/verspakketten`              | Overview with search, sorting and "Meer laden" pagination     |
| `/verspakketten/toevoegen`    | Create a verspakket                                           |
| `/verspakketten/importeren`   | Import from a retailer product page and follow the job status |
| `/verspakketten/:id`          | Detail: photos, ingredients, nutrition, allergens, reviews    |
| `/verspakketten/:id/bewerken` | Edit an existing verspakket                                   |
| `/supermarkten`               | Manage supermarkten                                           |

The global search in the header navigates to `/verspakketten?q=…`; the overview keeps `q`,
`veld` and `richting` in the URL so results are shareable.

## Project structure

```text
src/
├── app/                          # root component, router, not-found view
├── features/
│   ├── verspakketten/            # api, components, model, views
│   ├── supermarkten/             # api, model, views
│   └── background-commands/      # api, model (import job status)
└── shared/
    ├── api/                      # httpClient, ApiError, contract aliases, generated types
    ├── components/               # header, footer, search box, status block
    ├── styles/                   # design tokens and base styles
    └── utils/                    # formatting, query serialization, photo data URLs
```

Feature folders do not have to contain every subfolder; add one only when it has content.

## API contract

The backend owns the contract. `C:\Git\lutra-API` generates `Lutra.API/OpenApi/lutra-v1.json`
at build time, and this repository consumes it:

```bash
npm run api:sync       # copy the contract from the API repository
npm run api:generate   # regenerate src/shared/api/generated/schema.d.ts
npm run api:update     # both of the above
```

- `openapi/lutra-v1.json` is a versioned snapshot. It is committed so builds and type checks do
  not require the backend.
- `src/shared/api/generated/schema.d.ts` is generated and must never be edited by hand.
- `src/shared/api/contract.ts` re-exports the generated schemas under feature-friendly names so
  generated code does not leak into components.
- When the API contract changes, run `npm run api:update` and commit both files.

### Typed HTTP boundary

All application code talks to relative paths through `src/shared/api/httpClient.ts`:

```ts
const { verspakketten } = await verspakkettenApi.list({ take: 10, sortField: 2, sortDirection: 1 })
```

The client prepends `/api`, so the browser always calls the same origin. It provides typed
bodies, an `ApiError` built from problem details, `AbortSignal` support, correct `204`/empty-body
handling and one insertion point for OAuth bearer tokens via `setAccessTokenProvider`.

### Wire-format notes

- Enums are numeric on the wire. `src/features/*/model/*.ts` maps them to unions and Dutch
  labels (`Eenheid`, `Allergeen`, `VoedingswaardeBasis`, `BackgroundCommandStatus`).
- The API returns photos as base64 without a media type. `src/shared/utils/image.ts` sniffs the
  magic bytes and falls back to a placeholder.
- `GET /api/verspakketten` accepts `skip`, `take`, `search` (case-insensitive name match),
  `sortField` and `sortDirection`. The list endpoint returns no total count, so pagination uses
  "Meer laden".

## Local development

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm run dev
```

The Vite dev server proxies `/api` to `VITE_API_BASE_URL` (default `http://localhost:5000`).
There is no fixed API port baked into the application.

`.npmrc` sets `legacy-peer-deps=true` because `openapi-typescript` declares a TypeScript 5 peer
while this project uses TypeScript 6. The tool only runs at generation time, so the mismatch is
safe; remove the setting once `openapi-typescript` supports TypeScript 6.

### Running through Aspire

The AppHost in `C:\Git\lutra-API` already starts this repository with `AddViteApp` and injects
`VITE_API_BASE_URL` from the API's HTTPS endpoint:

```csharp
builder.AddViteApp("frontend", "../../../lutra-Vue")
    .WithReference(apiService)
    .WithEnvironment("VITE_API_BASE_URL", apiService.GetEndpoint("https"))
    .WithExternalHttpEndpoints();
```

The browser still calls `/api`; Aspire only supplies the dev-server proxy target. `AddViteApp`
sets `PORT`, which `vite.config.ts` respects.

> `VITE_*` values are baked in at build time. Here that is fine because the value is only the
> **server-side proxy target**. Runtime browser configuration (such as an OAuth client ID) must
> come from an API config endpoint instead.

## Scripts

| Script                   | Purpose                               |
| ------------------------ | ------------------------------------- |
| `npm run dev`            | Start the Vite dev server             |
| `npm run build`          | Type-check and build for production   |
| `npm run preview`        | Serve the production build locally    |
| `npm run type-check`     | Run `vue-tsc`                         |
| `npm run lint`           | Run ESLint with zero warnings allowed |
| `npm run format`         | Format with Prettier                  |
| `npm run test:unit`      | Run Vitest                            |
| `npm run test:e2e`       | Build and run the Playwright flows    |
| `npm run api:update`     | Sync and regenerate the API types     |
| `npm run icons:generate` | Regenerate PWA icons                  |

Run `npm run test:e2e:install` once to download the Playwright browser.

## Testing

- Unit specs live next to the code as `src/**/*.spec.ts` and cover formatting, query
  serialization, photo type detection, sort options and the API modules.
- Playwright flows live in `e2e/` and intercept `/api` with `page.route`, so they run without a
  backend. Service workers are blocked in `playwright.config.ts` to keep interception reliable.

## PWA

The service worker makes Lutra installable and caches versioned application assets so the shell
works after it has been loaded once. It deliberately does **not** cache `/api` responses and
performs no offline writes or synchronization.

The icons in `public/` are temporary and generated by `scripts/generate-icons.mjs`. Replace them
once branding exists.

## Docker

The production image builds the frontend and serves it from an unprivileged Nginx container that
also proxies `/api` to `API_UPSTREAM`, preserving the same-origin model.

```bash
docker build -t lutra-frontend .
docker run --rm -p 8080:8080 -e API_UPSTREAM=http://host.docker.internal:5000 lutra-frontend
```

`API_UPSTREAM` must be an origin without a path or trailing slash. The container listens on
`8080`, runs as a non-root user and exposes `GET /healthz` for health checks.

## Conventions

- Keep domain code inside `src/features/<concept>`; promote to `src/shared` only when a second
  feature needs it.
- Prefer relative imports inside a feature and the `@/` alias across features.
- Never edit generated files (`src/shared/api/generated`) or the PWA PNGs by hand.
- Run `npm run lint && npm run format:check && npm run test:unit && npm run test:e2e` before
  opening a pull request.
