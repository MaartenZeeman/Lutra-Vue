# AGENTS.md

Lutra: Vue 3 + TypeScript SPA for meal kits (verspakketten). Frontend only; it talks to a REST API
at same-origin `/api`. The companion backend lives at `C:\Git\lutra-API`.

## Verify before finishing

There is no CI for this repository, so run the gate yourself. `npm run test:e2e` already runs
`npm run type-check && vite build`, so:

```
npm run lint && npm run format:check && npm run test:unit && npm run test:e2e
```

- `lint` uses `--max-warnings 0`.
- Prettier is authoritative: no semicolons, single quotes, 100 cols. Run `npm run format` instead
  of hand-formatting.
- If you touched the API, also build and test that repository (see "Backend companion" below).

## Commands that are easy to get wrong

- Unit tests: `npm run test:unit`. One file: `npm run test:unit -- src/shared/api/httpClient.spec.ts`. One case: append `-t "name"`.
- Unit specs must match `src/**/*.spec.ts`; `vitest.config.ts` includes only that glob and excludes `e2e/`.
- E2E lives in `e2e/**` and uses `@playwright/test`, not Vitest. `npm run test:e2e:install` is required once per machine.
- `npm run test:e2e` rebuilds first. To iterate without rebuilding, run `npx playwright test e2e/home.spec.ts` (the `preview` server needs an existing `dist/`).
- `npm run icons:generate` regenerates `public/*.png`. Never hand-edit those PNGs.
- `npm run api:update` syncs the OpenAPI snapshot and regenerates types. See "Generated API contract".

## Generated API contract

- The backend generates `Lutra.API/OpenApi/lutra-v1.json` at build time. `npm run api:sync` copies it to `openapi/lutra-v1.json` and `npm run api:generate` writes `src/shared/api/generated/schema.d.ts`.
- **Never hand-edit `openapi/lutra-v1.json` or `src/shared/api/generated/schema.d.ts`.** Both are build artefacts.
- `src/shared/api/contract.ts` re-exports the generated schemas under feature-friendly names. Import API types from there (or from a feature `model/` file that re-exports them), never directly from `generated/schema`.
- Regenerate and commit both files whenever the API contract changes; the API CI fails if its own copy is stale.
- `.npmrc` sets `legacy-peer-deps=true` because `openapi-typescript` declares a TypeScript 5 peer while this project uses TypeScript 6. The tool only runs at generation time, so this is safe. Remove it when `openapi-typescript` supports TypeScript 6.

### Wire format

- Response wrappers: list is `{ verspakketten: [...] }`, detail is `{ verspakket: {...} }`, create/import/review return `{ id }` (import also returns `status`, `attemptCount`, `nextAttemptAt`, `existing`).
- Enums are **numeric** on the wire, so generated types use `number`. Feature `model/` files define the union constants and Dutch labels; label maps are typed `Record<number, string>` so contract numbers can index them.
- Photos are base64 **without a media type**. `src/shared/utils/image.ts` sniffs magic bytes; do not assume jpeg/png. Never log or duplicate raw base64.
- `GET /api/verspakketten` supports `skip`, `take`, `search` (case-insensitive **name** match, trimmed, max 255), `sortField`, `sortDirection`. The filter runs before pagination and ordering is deterministic (Id tie-breaker); unrated/unpriced items sort last.
- List endpoints return **no total count**, so pagination is "Meer laden" (load next page), not numbered pages.

## Toolchain gotchas

- `@/*` → `src/*` is defined in **three** files: `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`. Add new aliases to all three.
- TS is strict plus `noUncheckedIndexedAccess`, so array/record indexing is `| undefined`.
- `verbatimModuleSyntax` is on (from `@vue/tsconfig`): use `import type` for type-only imports or the build fails.
- ESLint ignores unused identifiers only when prefixed `_`.
- `tsconfig.json` intentionally has no `baseUrl` (deprecated in TS 6); `paths` resolve relative to the tsconfig.
- Dev `/api` proxy target comes from `VITE_API_BASE_URL` (Aspire injects it; fallback `http://localhost:5000`) and the dev server honors `PORT`. Never hard-code an API port.
- `vitest.config.ts` is separate and does not load `vite-plugin-pwa`, so don't unit-test modules importing `virtual:pwa-register` (e.g. `src/main.ts`).
- E2E blocks service workers (`serviceWorkers: 'block'` in `playwright.config.ts`) because the PWA would otherwise serve precached responses and bypass `page.route`. Keep it that way.
- Playwright flows intercept `/api` with `page.route` and `route.fulfill({ json })`; match a specific path before a broad one and use `getByText(..., { exact: true })` when a status word also appears inside a longer message.

## Architecture conventions

- Feature slices live in `src/features/<concept>/` (`api`, `components`, `model`, `views`). Promote code to `src/shared/` only when a second feature needs it; add a subfolder only when it has content.
- Relative imports inside a feature, `@/` across features and shared.
- All HTTP goes through `src/shared/api/httpClient.ts`, which prepends `/api`. Non-2xx becomes `ApiError` (problem details); use `foutmelding(error)` for user-facing messages.
- Routes are lazy-loaded in `src/app/router.ts` with Dutch `meta.titel`, which drives `document.title`. Register static paths (for example `/verspakketten/toevoegen`) **before** `/verspakketten/:id` so they are not shadowed.
- Dutch domain names and all visible text; English technical names. Enum labels live in the feature `model/`, not in components.
- Preserve the restrained visual language: leafy green primary, warm off-white surfaces, muted yellow for ratings/allergens, red only for errors or negative status. Avoid oversized hero panels, loud gradients, excessive pills, and decorative copy.
- No state-management, i18n, or auth dependency is installed on purpose; justify adding one first.
- The create/edit form (`VerspakketForm.vue`) owns its validation and emits a `VerspakketFormUitvoer`; views map it to `CreateVerspakketRequest` or `UpdateVerspakketRequest`. In edit mode `fotos: null` means "leave photos untouched".
- Avoid swapping the whole screen to a loading state during background refreshes: the detail view keeps existing content visible while reloading so success messages are not torn down.

## Backend companion (`C:\Git\lutra-API`)

- The HTTP API reference is `C:\Git\lutra-API\docs\api.md` (the backend's single source of truth for
  every endpoint, request/response body, enum, limit and error mapping). Read it before changing
  anything that touches `/api`, and when the API surface changes update it there alongside the
  backend, then regenerate this repo's contract with `npm run api:update`.
- The API is a .NET 10 Clean Architecture solution; run commands from `Lutra/`. Follow its own `AGENTS.md` (feature partials, `Cortex.Mediator`, warning-free build, `Changelog.md` entry per change).
- Tests run via `dotnet run --project <test project>` (xUnit v3 / Microsoft.Testing.Platform); `dotnet test` is not supported on the .NET 10 SDK. Filter with xUnit flags, e.g. `-- -class "*VerspakkettenControllerTests*"`.
- Building `Lutra.API` fails while the API is running (`Lutra.API` / Visual Studio lock `bin`). Stop the API first, or build a single project such as `dotnet build Lutra.Application/Lutra.Application.csproj`, or build to a separate output directory with `-o`.
- `Lutra.AppHost` starts this repository with `AddViteApp` and sets `VITE_API_BASE_URL` from the API's HTTPS endpoint. `Aspire.Hosting.JavaScript` must stay at the same version as the other Aspire packages.

## Docker

- Multi-stage `Dockerfile`: Node 24 build (runs type-check + build), served by unprivileged Nginx on `8080`.
- `/api` is proxied at container start from the `API_UPSTREAM` env var (origin only, no path or trailing slash) substituted into `docker/nginx/default.conf.template` via nginx `envsubst`. Health check: `GET /healthz`.
