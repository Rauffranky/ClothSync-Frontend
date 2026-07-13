# Internal Project Codebase Context

This is the durable, project-specific orientation guide for AI work. Read it
completely before planning a change. It describes the current repository, but it
does not replace source-code inspection: verify files involved in each task
because the application is actively evolving.

## 1. Product and portals

The application is the frontend for **ClothSync / RFID Laundry**, a multi-portal
system for laundry assets, RFID tags, scanners, categories, linked laundries,
staff, dispatch/inventory activity, exceptions, and reporting.

| Portal key | URL prefix | Intended user |
| --- | --- | --- |
| `superadmin` | `/superadmin` | Platform administration |
| `business` | `/business` | Business/tenant owners and staff |
| `laundry` | `/laundry` | Laundry users/staff |

A polished screen is not proof that its backend integration exists. Determine
whether a feature uses a live API, local sample data, or placeholder handlers
before changing it.

## 2. Technology baseline

- React 19 with JSX and React Strict Mode; this is not a TypeScript project.
- Vite 8 for development and production builds.
- React Router DOM 7 with declarative `<Routes>` and `<Route>` APIs.
- Tailwind CSS 4 via `@tailwindcss/vite` plus CSS custom properties.
- Axios 1 through a shared client and convenience wrapper.
- Formik 2 and Yup 1 for established validated forms.
- Lucide React is the primary icon package; React Icons is also installed.
- `react-helmet-async` is provided, while pages usually call `usePageMeta`.
- ESLint 10 with JavaScript, React Hooks, and Vite refresh rules.
- ESM package format (`"type": "module"`).

Do not add or replace framework, state, form, style, request, or icon libraries
without explicit user approval and architectural justification.

## 3. Runtime entry and provider tree

`src/main.jsx` mounts this tree into `#root`:

```text
React.StrictMode
  HelmetProvider
    BrowserRouter
      ToastProvider
        App
```

`src/App.jsx` applies the stored theme and renders `AppRoutes`.
`src/Routes/index.jsx` declares routes and lazy-loads route pages.

Consequences:

- Do not add another router, toast root, or application root provider in a
  feature.
- Strict Mode exposes unsafe effects during development. Requests, timers, and
  effects require cleanup and stale-result protection.
- Keep route-level pages lazy-loaded unless a verified need requires otherwise.

## 4. Source ownership map

```text
src/
|-- main.jsx                 global providers and mount
|-- App.jsx                  theme initialization and routes
|-- Routes/                  routes and redirects
|-- Page/                    thin route wrappers and metadata
|-- Section/                 portal/domain feature implementations
|   |-- SuperAdmin/
|   |-- Tenant/              business portal features
|   |-- Laundry/
|   `-- landing/
|-- Components/
|   |-- UI/                  reusable product primitives
|   |-- Layout/              landing/dashboard/portal shells
|   `-- Toast/               global toast renderer
|-- Auth/                    login/signup flows
|-- axios/                   endpoints, client, and domain services
|-- Hooks/                   reusable React behavior
|-- Config/                  navigation/application configuration
|-- Utils/                   dates, theme, toasts, and helpers
`-- assets/                  bundled static assets
```

New-code rules:

- Pages compose Sections and metadata; Pages do not own feature business logic.
- Portal-specific code stays inside its portal Section.
- Move code into `Components/UI` only when it is genuinely reusable and has no
  portal-specific dependency.
- Domain requests belong in `src/axios/<domain>` and use constants/builders from
  `src/axios/endpoint.js`.
- Preserve current casing. Tenant assets currently lives at lowercase
  `src/Section/Tenant/assets`; do not mix a casing migration into other work.

## 5. Active route map

The final source of truth is `src/Routes/index.jsx`.

Authentication and landing:

- `/login` -> `/business/login`; `/signup` -> `/business/signup`.
- `/superadmin/login`.
- `/business/login`, `/business/signup`.
- `/laundry/login`, `/laundry/signup`.
- `/` -> landing home through `LandingLayout`.
- `/404`; unmatched routes redirect there.

Dashboard routes:

- Super Admin: `/superadmin/dashboard`.
- Business: `/business/dashboard`, `/business/linked-laundries`,
  `/business/categories`, `/business/categories/:id`, `/business/assets`,
  `/business/assets/:id`, `/business/scanners`, `/business/scanners/:id`,
  `/business/staff`, `/business/tags`, and `/business/tags/:id`.
- Laundry: `/laundry/dashboard`.
- Each portal root redirects to its dashboard.

`src/Components/Layout/Dashboard/nav.js` contains additional future links with no
corresponding route. Do not mistake navigation entries for completed pages. When
adding/removing a screen, reconcile the route, Page, Section, sidebar entry,
portal permissions, links, and 404 behavior.

There is currently no route guard around `DashboardLayout`. Do not describe the
dashboard as route-protected until a real guard is implemented and verified.

## 6. Portal and layout behavior

`DashboardLayout` derives portal context from the URL: `/business` selects
`business`, `/laundry` selects `laundry`, and other dashboard paths select
`superadmin`. It owns mobile sidebar visibility and desktop collapse state, then
renders `SideBar`, `Header`, and `<Outlet>`.

`src/Components/Layout/Dashboard/nav.js` owns `NAV`, `portalGroups`, and
`getFlatPortalItems`. `src/Auth/authConfig.jsx` separately owns Business/Laundry
auth tabs and dashboard destinations. Inspect both when portal names or paths
change. Shared behavior must derive links from portal context rather than
hardcoding one portal prefix.

## 7. Current feature/data status

Re-check these facts in source during every related task.

Confirmed API-backed areas:

- Business login calls `loginTenant` and stores session information.
- The Business signup Account step calls `POST /tenant-auth/signup` with
  `fullName`, `email`, `password`, and `confirmPassword`, then advances to email
  verification after the backend accepts the request and sends an OTP.
- Business signup verifies the email with `POST /tenant-auth/verify-otp` using
  `email` and a six-digit `otp`. It can request a new code with
  `POST /tenant-auth/resend-otp` using `email`; the UI applies a 10-minute OTP
  expiry countdown and restarts it after a successful resend.
- After verification, Business signup saves the business profile with
  `POST /tenant-auth/complete-profile`, using the verified response's `userId`,
  business details, an internationalized phone number, and the browser timezone.
  A successful save currently skips pricing and opens Done, where business name
  and type come from the completion response (falling back to submitted values)
  and status defaults to Active when the response omits it.
- Non-sensitive signup progress and the completion display fields are stored in
  `sessionStorage` so Account, Verify, Profile, and Done survive a same-tab page
  refresh; passwords and OTP values are never persisted.
- Tenant categories list, create, details, update, and status actions use tenant
  category services.
- Tenant scanner creation calls `POST /tenant-scanners/create` from the Add
  Scanner modal with device configuration and English/Arabic translation data;
  the scanner list, stats, edit, status, and details flows still use local data.
- Tenant linked laundries and pending laundry invitations use separate paginated
  GET services. Linked-list search, status, and default filters and pending-list
  search are sent as backend query parameters. Linked laundry status filters send
  backend values `active`/`suspend`, displayed as Connected/Suspend in the UI.

Partial or placeholder areas:

- Laundry login navigates without a backend request.
- Super Admin login navigates without a backend request.
- Forgot-password email, OTP, and reset steps are UI-only.
- Business signup completion presentation remains UI-only. Pricing is currently
  hidden entirely, and profile completion opens Done directly. Laundry signup
  remains UI-only.
- Many Tenant features import local `data.js`, including assets, scanners,
  staff, tags, and asset-detail subviews. Treat them as
  sample data unless the same feature also calls a domain service.

When integrating a placeholder feature, do not retain hidden mock fallback data
unless the user explicitly requests offline/sample behavior.

## 8. API and authentication architecture

```text
Section/Auth consumer
  -> src/axios/<domain> service
    -> src/axios/api.js wrapper
      -> src/axios/interceptor.js Axios instance
        -> backend
```

Shared client facts:

- Base URL is `import.meta.env.VITE_API_BASE_URL || ""`.
- Default content type is `application/json`.
- The request interceptor reads `accessToken` from `sessionStorage` and attaches a
  Bearer authorization header.
- The response interceptor currently passes responses/errors through.
- `src/axios/api.js` returns `response.data`, not the full Axios response.
- `getApiErrorMessage` checks server `message`, server `error`, JavaScript error
  message, and then a supplied fallback.

Because the wrapper already unwraps Axios responses, verify the backend envelope
before adding/removing `.data` at a consumer.

Current endpoints:

- `POST /tenant-auth/login`.
- `POST /tenant-auth/signup` (currently consumed by the Business signup Account
  step to start signup and send an email OTP).
- `POST /tenant-auth/verify-otp` with `{ email, otp }`.
- `POST /tenant-auth/resend-otp` with `{ email }`.
- `POST /tenant-auth/complete-profile` with `{ userId, businessName,
  businessType, phone, address, city, state, country, postalCode, timezone }` in
  the current frontend integration.
- `GET /tenant-auth/logout`.
- `GET /tenant-auth/me`.
- `GET /tenant-categories/show`.
- `POST /tenant-categories/create`.
- `GET /tenant-categories/show/:id`.
- `PUT /tenant-categories/update/:id`.
- `PUT /tenant-categories/update-status/:id` with `{ status }`.
- `POST /tenant-scanners/create` with `{ scannerId, scannerType, scannerMode,
  assignedOperatorId?, status, signalStatus, firmwareVersion, batteryLevel,
  translations: { en, ar } }`.
- `GET /tenant-laundries/show` with optional `page`, `limit`, `keywords`,
  `status`, `dispatchMode`, and `isDefault` query parameters.
- `GET /tenant-laundries/pending-invites` with optional `page`, `limit`, and
  `keywords` query parameters.
- Category services send `x-language`, defaulting to `en`.

These facts are not permission to guess future contracts. Use the exact method,
path, key names, values, pagination parameters, envelope, headers, and identifier
provided by the user/backend.

Business login accepts `accessToken`, `access_token`, or `token`, then stores:

- `accessToken`.
- `refreshToken` when returned.
- `authUser` as JSON when returned.

All three authentication values use `sessionStorage`, so they are scoped to the
current browser tab/session and are cleared when that tab closes. Legacy auth
keys are removed from `localStorage`; `clearTenantSession` removes the session
values as well. Theme preference is separately stored as `theme-mode` in
`localStorage`. Never print or expose stored values.

There is currently no automatic refresh-token flow or global 401 redirect. Do
not claim these behaviors exist; design them explicitly when requested.

## 9. Shared UI system

Reuse `src/Components/UI` before creating feature-local replacements:

- Overlays/actions: `ActionDropdown`, `Dropdown`, `Modal`, `SlideOver`, `Tooltip`.
- Inputs/navigation: `Input`, `Tabs`, `Pagination`, `BusinessSelector`.
- Data display: `Table`, `TableSkeleton`, `Badge`, `Card`, `Alert`, `ProgressBar`.
- Identity/icons: `Avatar`, `InitialsAvatar`, `IconWrapper`.
- Primary action primitive: `Button`.

Important contracts:

- `Input.onChange` receives `(value, event)`, not only a native event. It supports
  errors/helper text, icons, passwords, multiline, and numeric constraints.
- `Dropdown` normally consumes `{ label, value }` options, emits selected values,
  supports search/multiple selection, and portals its menu.
- `Button` defaults to `type="button"` and supports variants, custom sizes,
  icons, loading, disabled state, and polymorphic rendering.
- `Modal` portals to `document.body`, closes on Escape, locks body scroll, and can
  close on backdrop. Inspect and improve focus behavior when a task requires it.
- `Pagination` is zero-based: `forcePage` is zero-based and it emits
  `onPageChange({ selected })`. Convert to one-based API pages at the boundary.
- `Table` supports declarative columns, sorting, actions, row clicks, skeletons,
  empty state, nested accessors, and horizontal overflow. Trace every consumer
  before changing this shared component.
- `ActionDropdown` portals its menu and expects labeled item callbacks. Keep item
  labels unique within the menu.
- Use `toast` from `src/Utils/toast`; `ToastProvider` is already mounted.

Always read a primitive's source for its full prop contract before using or
editing it. Do not infer props from component names.

## 10. Styling and theme conventions

`src/index.css` imports Tailwind and defines the product tokens.

- Use existing `--theme-*`, component, status, portal, and gradient variables
  before adding literal colors.
- The design language uses Aurora teal/aqua. Portal accents are Business/Tenant
  blue, Laundry teal, and Super Admin purple.
- Light/dark aliases are controlled through `data-theme` on the document root.
- `src/Utils/themeMode.js` persists `theme-mode`, defaulting to light.
- Match existing Tailwind 4 custom-property syntax such as
  `text-(--theme-text-primary)` and `border-(--theme-border)`.
- Reuse established spacing, radius, glass surfaces, shadows, and status styles.
- Avoid inline `<style>` blocks for routine feature work; exceptional existing
  usages are not the default pattern.

## 11. Forms, state, tables, and async behavior

- Formik + Yup is the established validated-form pattern. Match the nearest
  working form and shared Input contract.
- Prefer derived values over duplicated state; keep state close to consumers.
- Preserve separate server/display identifiers when normalization needs both.
- Search/filter changes reset pagination. UI pages are zero-based; verify backend
  indexing and parameter names separately.
- `useSortableTableData` is client-side sorting and supports nested accessors plus
  month-name date parsing. It is not server sorting.
- Async effects require unmount and stale-result protection. Clean up debounce
  timers and subscriptions.
- Mutation controls prevent duplicate submission and show success only after the
  real operation succeeds.
- Optimistic updates require rollback; otherwise use confirmed results/refetch.

## 12. Metadata, utilities, and feedback

- Route pages commonly call `usePageMeta` for title/meta tags.
- `usePageMeta` appends/removes tags in an effect; provide stable arrays where
  possible to avoid unnecessary effect churn.
- Reuse `formatDate` from `src/Utils/date.js` for current date display behavior.
- Use the global toast utility for transient operation feedback.
- Do not duplicate theme, toast, sorting, date, or metadata helpers in features.

## 13. Navigation, roles, and permissions

- Portal context and hidden controls are not sufficient authorization.
- Align sidebar visibility, direct-route access, page rendering, action
  visibility, action execution, and expected backend authorization.
- Direct routes must not bypass a restriction enforced only in navigation.
- Shared UI must not import a specific portal role. Keep policy in route/feature
  layers or pass a capability into the primitive.
- Re-check auth/route code before promising frontend permission enforcement.

## 14. Common change map

| Request | Inspect together |
| --- | --- |
| Add dashboard page | routes, Page wrapper, matching Section, dashboard nav, portal permissions |
| Change auth | `Auth/*`, `Page/Auth/*`, auth config, auth service/endpoints, interceptor, routes |
| Integrate API | endpoint constants, domain service, wrapper/interceptor, consuming Section, errors/toasts |
| Change table | feature table, shared Table, sorting hook, pagination, all shared consumers |
| Change form/modal | owner, Input/Dropdown/Button/Modal, Formik/Yup, mutation state, focus/keyboard flow |
| Change portal nav | dashboard nav, SideBar, Header, routes, Page/Section existence, portal derivation |
| Change theme | `index.css`, primitive, light/dark modes, all token consumers |
| Add detail screen | list link, ID route, Page/meta, detail Section, details API, loading/error/not-found |

## 15. Environment and repository safety

- `.env` is local. Never copy it into output/docs or commit it.
- `.env.example` documents variable names only; never put credentials, tokens, or
  private deployment values in it.
- Frontend configuration uses `VITE_API_BASE_URL`. All `VITE_*` values are exposed
  to browser code and are not secrets.
- Preserve unrelated changes shown by `git status`.
- Do not edit `dist` or `node_modules` as source.
- Do not use destructive Git/filesystem operations without explicit authority.

## 16. Commands and verification

Run at the Windows/PowerShell repository root:

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run preview
```

Verification order:

1. Inspect the diff and run `git diff --check`.
2. Run the narrowest relevant validation.
3. Run `npm.cmd run build` for implementation changes.
4. Run `npm.cmd run lint` when practical.
5. Separate new failures from unrelated pre-existing failures.
6. Review relevant happy, loading, empty, validation, error, permission, retry,
   mobile, keyboard, and mutation paths.

There is no test script in `package.json`. Do not say tests passed when only build
or lint ran. Obtain approval before adding a test framework/dependency.

## 17. AI comprehension protocol

For every prompt, the AI must:

1. Extract the exact requested outcome and fixed endpoints, methods, fields,
   statuses, labels, colors, roles, routes, and validation rules.
2. Trace the real route -> Page -> Section -> shared UI/API path.
3. Determine API-backed vs sample-data vs placeholder status from imports and
   handlers, not appearance.
4. Inspect at least one matching working pattern.
5. Search every consumer of a shared file/export before changing its contract.
6. Select lead/supporting specialist profiles and define verification.
7. Implement the smallest complete real flow.
8. Run all four specialist review gates and proportional checks.
9. Update this file when durable routes, boundaries, contracts, shared primitives,
   commands, dependencies, or implementation status change.

Never invent missing backend contracts, permissions, files, or completed
behavior. Prefer direct source evidence over assumptions or generic patterns.

