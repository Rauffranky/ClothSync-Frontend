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

`src/App.jsx` applies the stored theme, renders `AppRoutes`, and shows the shared
ClothSync startup splash as a fixed overlay once per browser-tab session. A
session-storage marker prevents it from replaying on refresh or route changes;
the splash exits after its short intro while routes remain mounted underneath.
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
- `/business/staff/verify-email?token=...` verifies a staff invitation email
  outside the dashboard shell and redirects successful verification to the
  Business login.
- `/laundry/login`, `/laundry/signup`.
- `/laundry/staff/verify-email?token=...` verifies a Laundry staff invitation
  email outside the dashboard shell and redirects successful verification to
  the Laundry login.
- `/laundry/invite?token=...` handles a public laundry invitation outside the
  dashboard shell; `/laundry/handle-invite` is a compatible alias.
- `/` -> landing home through `LandingLayout`.
- `/404`; unmatched routes redirect there.

Dashboard routes:

- Super Admin: `/superadmin/dashboard`.
- Business: `/business/dashboard`, `/business/linked-laundries`,
  `/business/categories`, `/business/categories/:id`, `/business/assets`,
  `/business/assets/:id`, `/business/scanners`, `/business/scanners/:id`,
  `/business/scanners/warnings`, `/business/staff`, `/business/staff-roles`,
  `/business/tags`, `/business/tags/:id`, and `/business/settings`.
  Reports & Analytics is available at `/business/reports-analytics`.
- Laundry: `/laundry/dashboard`, `/laundry/linked-businesses`, connected
  business details at `/laundry/linked-businesses/:id`, `/laundry/staff`, and
  `/laundry/staff-roles`, and `/laundry/settings`.
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
hardcoding one portal prefix. In the Business sidebar, Staff is an expandable
group containing All Staff and Staff Roles; its active submenu uses the same
single-dot behavior as the Scanners group.

## 7. Current feature/data status

Re-check these facts in source during every related task.

Confirmed API-backed areas:

- Business and Laundry logins call their respective login APIs and store session information.
- Laundry staff login permissions are read from the stored authenticated user.
  The Laundry sidebar shows only modules whose permission has `view: true`, and
  implemented Laundry routes enforce the same module-level view permission.
  Laundry owners/admins whose auth response has no permissions matrix retain
  full portal access.
- The Business signup Account step calls `POST /tenant-auth/signup` with
  `fullName`, `email`, `password`, and `confirmPassword`, then advances to email
  verification after the backend accepts the request and sends an OTP.
- Business signup verifies the email with `POST /tenant-auth/verify-otp` using
  `email` and a six-digit `otp`. It can request a new code with
  `POST /tenant-auth/resend-otp` using `email`; the UI applies a 10-minute OTP
  expiry countdown and restarts it after a successful resend.
- Laundry signup uses `POST /laundry-auth/signup`, verifies the email through
  `POST /laundry-auth/verify-otp`, and completes the profile through
  `POST /laundry-auth/complete-profile`. Authentication data returned by its
  verify or profile-completion response is stored in the shared current-tab
  session before entering the Laundry dashboard.
- Public Laundry invitations read `token` from the frontend route query and call
  `GET /tenant-laundries/handle-invite`. An existing Laundry profile is linked
  immediately when the response action is `linked`; the backend message is shown
  without requesting profile data. An action of `signup_required` with
  `requiresProfile: true` opens the public profile form, which submits the token
  plus the exact new-laundry profile fields to
  `POST /tenant-laundries/accept-invite`.
- The Laundry portal Linked Businesses screen uses
  `GET /laundry-tenants/show` for paginated connected businesses, backend
  dashboard counts, `keywords`, `status` (`active`/`suspend`), and
  `businessType` (`hotel`/`hospital`) filters. Connected business details use
  `GET /laundry-tenants/show/:id` on a dedicated detail route. The detail
  response is normalized from `data.business`, including nested `contact` data
  and nested `operations` counts for incoming batches, in-laundry items, sent
  items, delayed items, open exceptions, and last activity. Its Pending Requests
  tab uses
  `GET /laundry-tenants/pending-requests` with server pagination/search; the
  row action dropdown accepts through
  `PUT /laundry-tenants/pending-requests/:id/accept` or rejects through
  `PUT /laundry-tenants/pending-requests/:id/reject` with optional
  `rejectionReason`.
- Laundry Staff reuses the established Staff and Staff Roles interface with
  Laundry-scoped request functions. Staff create/list/detail/update/status use
  `/laundry-staff`; role create/list/detail/update/status use
  `/laundry-staff-roles`; permission sections use
  `GET /laundry-access-sections/show`. Laundry role cards consume counts from
  the role-list response when supplied, otherwise they derive counts from the
  returned roles; no separate Laundry role-summary request is made. Public staff
  email verification is available at `/laundry/staff/verify-email?token=...`;
  after a successful API response, the shared verification screen redirects to
  the Laundry login. The Tenant equivalent redirects to the Business login.
- Laundry Settings reuses the established General, Notifications, and Security
  interface at `/laundry/settings`. General settings use
  `GET /laundry-settings/timezones`, `GET /laundry-settings/date-formats`,
  `GET /laundry-settings/profile`, and `PUT /laundry-settings/profile` with
  `companyName`, nullable string `avatar`, `language`, `timezone`, and
  `dateFormat`. Notification preferences use
  `GET /laundry-notification-preferences/show` and
  `PUT /laundry-notification-preferences/update` with the exact
  `{ preferences: [{ notificationKey, inAppEnabled, emailEnabled }] }` payload.
  Laundry Security uses the existing Laundry change-password service.
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
  category services. The list sends backend `page`, `limit`, `keywords`,
  `status`, and `use` (`in use`/`not in use`) filters; the inactive All Usage
  option is omitted from the request. The list consumes `data.items`,
  `data.pagination`, and the four-card `{ key, label, count }[]` summary under
  `data.counts`; no separate category summary request is made. Category
  normalization/pagination lives in the feature data boundary, while add, edit,
  and status mutations use separate feature modals coordinated by the Categories
  section.
- Tenant scanners list through `GET /tenant-scanners/show` with backend
  pagination and optional `keywords`, `scannerType`, `scannerMode`, `status`,
  and `assignedOperatorId` filters. The operator filter loads only active staff
  from `GET /tenant-staff/show?status=active`. Scanner creation uses
  `POST /tenant-scanners/create`, and edit uses
  `PUT /tenant-scanners/update/:id` with the backend scanner UUID preserved as
  `apiId`. Create and edit send device configuration plus English/Arabic
  translation data. Their optional assigned-operator dropdown loads active staff
  from `GET /tenant-staff/show`; the selected staff UUID is sent as
  `assignedOperatorId`. The dedicated `/business/scanners/warnings` screen uses
  `GET /tenant-scanners/warnings` with separate pagination and is available
  beneath Scanners in the business sidebar. Scanner summary cards share the
  scanner-list request and use the `{ key, label, count }[]` returned in
  `GET /tenant-scanners/show` under `data.counts`; no separate summary request
  is made.
  Scanner details use `GET /tenant-scanners/show/:id` and render the returned
  scanner identity/configuration, reads, zone, notes, tenant/laundry ownership,
  the nested `createdByUser` identity/role, and the nested operator's `user.id`,
  `user.name`, and `user.email`. Fields not present in the current detail contract, such as
  battery, firmware, and signal status, are not fabricated in the UI. Scanner detail routes
  keep All Scanners selected in the sidebar, while the warning route selects
  Scanner Warnings and uses the `Scanners / Warnings` header. Activate/deactivate actions use
  `PUT /tenant-scanners/update-status/:id`. Mock scan logs are no longer shown
  on the live detail screen because no scanner-log API contract is integrated.
- Tenant linked laundries, pending invitations, and closed invitations use
  separate paginated GET services. Pending records remain in Pending Requests,
  accepted invitations are represented by the linked-laundries service, and
  rejected/expired/cancelled records appear in Rejected Laundries. Linked-list
  search, status, and default filters and invitation searches are sent as backend
  query parameters. Linked laundry status filters send backend values
  `active`/`suspend`, displayed as Connected/Suspend in the UI.
  Non-default linked laundries can be unlinked through the live unlink service;
  the UI blocks unlinking the current default until another laundry is set as
  default.
- Tenant General Settings loads its settings profile, IANA time zones, and
  supported date formats from the tenant settings APIs. Updating a selected
  logo first uploads the file through the shared multipart upload service, then
  sends the returned file string as `avatar` in the profile update payload. The
- The Business dashboard header refreshes the authenticated user through
  `GET /tenant-auth/me`; `GET /tenant-settings/profile` is scoped to the General
  Settings screen instead of running on every Business route. Settings profile
  updates merge into the tenant session, and tenant API-backed date/time
  displays use the shared preference-aware formatter in `src/Utils/date.js`. That formatter
  applies the saved IANA `timezone` and exact `dateFormat` contract globally;
  the related hook also reacts to same-tab tenant-profile updates.
- Tenant Notification Settings loads the server-defined preference rows from
  `GET /tenant-notification-preferences/show`. In-app and email switches edit
  those rows locally until Save Changes sends the exact `preferences` array to
  `PUT /tenant-notification-preferences/update`; Discard restores the last
  server-authoritative values.
- Tenant Security Settings changes the authenticated tenant password through
  `POST /tenant-auth/change-password` with `currentPassword`, `newPassword`, and
  `confirmNewPassword`. The form validates confirmation locally, blocks repeat
  submission, and clears password fields only after backend success.

Partial or placeholder areas:

- Super Admin login navigates without a backend request.
- Forgot-password email, OTP, and reset steps are UI-only.
- Business signup completion presentation remains UI-only. Pricing is currently
  hidden entirely, and profile completion opens Done directly.
- Many Tenant features import local `data.js`, including assets, scanners,
  tags, and asset-detail subviews. Treat them as
  sample data unless the same feature also calls a domain service.
- Tenant Settings is available at `/business/settings` and uses the shared
  global `Tabs` component for General, Notifications, and Security. The active
  non-default tab is stored in the `tab` URL query parameter so it survives a
  refresh and can be linked directly; missing or invalid values select General.
  Active-session controls clearly report that their APIs are not connected.
- Tenant Reports & Analytics is available at `/business/reports-analytics` and
  uses the shared global `Tabs`, `Alert`, table, and chart primitives. Its
  All report tabs—Overview, Sent vs Returned, Delayed Items, Missing / Lost,
  Turnaround Time, Wash Cycle Summary, Category Wise, and Laundry Wise—currently
  render responsive local sample-data charts, summary cards, and tables; report
  detail and export actions remain unavailable until backend contracts are
  integrated. Delayed Items and Missing / Lost link their sample rows to the
  existing asset-detail route. Laundry Wise and Wash Cycle Summary actions lead
  to the corresponding existing linked-laundries and category screens.

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
- The request interceptor reads the active Business or Laundry portal's shared
  `accessToken` from `sessionStorage` and attaches a Bearer authorization header.
- The response interceptor clears the stored authentication session when an
  authenticated request returns `401`, then replaces the current URL with the
  active portal's login route (`/business/login`, `/laundry/login`, or
  `/superadmin/login`). It does not attempt token refresh.
- Business and Laundry logout call their portal logout endpoint when an access
  token exists, then always clear the current-tab session and return to the
  matching login route. A stale dashboard session with no token is cleared
  locally without making an unauthenticated logout request.
- `src/axios/api.js` returns `response.data`, not the full Axios response.
- Concurrent identical GET requests are deduplicated in the shared API wrapper,
  including the current access-token context. This prevents React development
  Strict Mode remounts from sending the same GET request twice; callers can opt
  out with `{ dedupe: false }`, and signalled requests bypass deduplication.
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
- `POST /tenant-auth/change-password` with
  `{ currentPassword, newPassword, confirmNewPassword }`.
- `GET /tenant-settings/timezones` lists valid IANA time zones for General
  Settings.
- `GET /tenant-settings/date-formats` lists supported profile date formats.
- `GET /tenant-settings/profile` returns `data.profile` for General Settings.
- `PUT /tenant-settings/profile` updates required `businessName`, `language`,
  `timezone`, and `dateFormat`, plus nullable string `avatar`.
- `GET /tenant-notification-preferences/show` returns the tenant's ordered
  notification preference rows, including `notificationKey`, display metadata,
  `inAppEnabled`, and `emailEnabled`.
- `PUT /tenant-notification-preferences/update` accepts
  `{ preferences: [{ notificationKey, inAppEnabled, emailEnabled }] }` and
  returns the server-authoritative preference collection.
- `POST /file-upload/single` accepts multipart `file` and optional `folder`; the
  General Settings flow uploads a selected logo first and sends its returned
  file string in the subsequent profile update.
- `GET /tenant-categories/show` with `page`, `limit`, optional `keywords`,
  optional `status` (`active`/`inactive`), and optional `use`
  (`in use`/`not in use`). It returns `data.items`, `data.pagination`, and
  `data.counts` for `totalCategories`, `activeCategories`,
  `inactiveCategories`, and `categoriesInUse`.
- `POST /tenant-categories/create`.
- `GET /tenant-categories/show/:id`.
- `PUT /tenant-categories/update/:id`.
- `PUT /tenant-categories/update-status/:id` with `{ status }`.
- `POST /tenant-scanners/create` with `{ scannerId, scannerType, scannerMode,
  assignedOperatorId?, status, translations: { en, ar } }`.
- `GET /tenant-scanners/show` returns `data.items`, `data.pagination`, and
  `data.counts` for the six scanner summary cards. It accepts `page`, `limit`,
  and optional `keywords`,
  `scannerType` (`fixed`/`portable`), `scannerMode`
  (`entry`/`exit`/`manual`/`auto`), `status`
  (`active`/`inactive`/`warning`), `signalStatus`
  (`online`/`offline`/`low_signal`/`warning`), and `assignedOperatorId`.
- `PUT /tenant-scanners/update/:id` uses the scanner UUID and the scanner create
  request shape.
- `GET /tenant-scanners/warnings` with `page` and `limit` returns scanners that
  require attention for the Scanner warnings panel.
- `GET /tenant-scanners/show/:id` loads one scanner by its backend UUID for the
  scanner details screen.
- `PUT /tenant-scanners/update-status/:id` updates one scanner by UUID with
  `{ status }`, where the integrated UI sends `active` or `inactive`.
- `GET /tenant-laundries/show` with optional `page`, `limit`, `keywords`,
  `status`, `dispatchMode`, and `isDefault` query parameters.
- `GET /tenant-laundries/show/:id` returns the linked-laundry relationship,
  relationship counters and dates, plus nested laundry profile and user account
  records. The linked laundry detail page renders this response without a mock
  detail fallback.
- `GET /tenant-staff-roles/show` lists tenant staff roles for the Staff Roles
  screen with backend `page`/`limit` pagination, optional `keywords`, `status`,
  and `accessLevel` filters, and the six-card `{ key, label, count }[]` summary
  under `data.counts`.
  The list and summary share this request.
  `GET /tenant-staff-roles/show/:id` powers the role details and edit flows,
  returning role metadata plus `modulePermissions` rows with the six supported
  permission booleans.
  `PUT /tenant-staff-roles/update/:id` updates role details and module
  permissions using the same `StaffRoleRequest` shape as create, while
  `PUT /tenant-staff-roles/update-status/:id` activates or deactivates a role
  with `{ status }`. Delete remains disabled because no delete contract is
  integrated.
- Tenant Staff uses `POST /tenant-staff/create`, `GET /tenant-staff/show`,
  `GET /tenant-staff/show/:id`, `PUT /tenant-staff/update/:id`, and
  `PUT /tenant-staff/update-status/:id`. Create/update follow `StaffRequest`:
  required `fullName`, `email`, `phone`, and `staffRoleId`, with optional
  `locationId`, `locationName`, `language`, `status`, and `sendInvite`.
  `GET /tenant-staff/verify-email?token=...` powers the public staff verification
  route. The list sends `page`, `limit`, and optional `status` (`active`,
  `inactive`, `suspend`), `staffRoleId`, and `keywords`, then consumes the
  returned pagination and the `{ key, label, count }[]` summary under
  `data.counts`; the list and Staff summary cards share this request. The role
  filter and Staff form share one `GET /tenant-staff-roles/show` request; active
  Add Staff options are derived from that collection, while inactive roles
  remain available when editing an existing staff member. In the shared Tenant
  and Laundry edit form, the existing email address is read-only and status is
  editable as `active`, `inactive`, or `suspend`. Staff details include
  identity, role/access information, email verification, status, creation date,
  and a module-keyed permissions object; the profile modal displays enabled
  actions for every returned module.
- `GET /tenant-access-sections/show` supplies the module permission sections for
  the Staff Roles create modal. `POST /tenant-staff-roles/create` creates an
  active role with `name`, optional `description`, and permission rows containing
  `sectionKey` and all permission booleans for modules where at least one action
  is selected. Completely unselected modules are omitted. Successful creation
  refreshes the role list and its included summary.
- `GET /tenant-laundries/pending-invites` with optional `page`, `limit`, and
  `keywords` query parameters.
- `GET /tenant-laundries/closed-invites` with optional `page`, `limit`,
  `keywords`, and `status`; status values are `rejected`, `expired`, and
  `cancelled`.
- `GET /tenant-laundries/invite-details?token=...` returning `data.invite`,
  `data.tenant`, `existingUser`, `existingLaundry`, `requiresProfile`, and
  `laundry`. The invitation token is used only to request details and is never
  rendered in the UI.
- `GET /tenant-laundries/handle-invite?token=...` handles a public invitation
  click and returns either `action: linked` or `action: signup_required` with
  `existingUser` and `requiresProfile`.
- `POST /tenant-laundries/accept-invite?token=...` accepts a public invitation.
  New Laundry profiles send `{ companyName, contactPersonName, password,
  confirmPassword, phone, address, city, state, country, postalCode }`.
- `GET /laundry-tenants/show` lists businesses connected to the authenticated
  Laundry and returns compact rows plus dashboard `counts`; it accepts `page`,
  `limit`, `keywords`, `status` (`active`/`suspend`), and `businessType`
  (`hotel`/`hospital`).
- `GET /laundry-tenants/show/:id` returns one connected tenant relationship.
- `GET /laundry-tenants/pending-requests` lists valid pending tenant connection
  requests with `page`, `limit`, and `keywords`.
- `PUT /laundry-tenants/pending-requests/:id/accept` accepts a request without a
  body.
- `PUT /laundry-tenants/pending-requests/:id/reject` rejects a request with an
  optional `{ rejectionReason }` body.
- `POST /laundry-staff/create`, `GET /laundry-staff/show`,
  `GET /laundry-staff/show/:id`, `PUT /laundry-staff/update/:id`, and
  `PUT /laundry-staff/update-status/:id` manage authenticated Laundry staff.
- `GET /laundry-staff/verify-email?token=...` verifies a Laundry staff email
  outside the dashboard shell.
- `POST /laundry-staff-roles/create`, `GET /laundry-staff-roles/show`,
  `GET /laundry-staff-roles/show/:id`,
  `PUT /laundry-staff-roles/update/:id`, and
  `PUT /laundry-staff-roles/update-status/:id` manage Laundry roles.
- `GET /laundry-access-sections/show` returns the Laundry permission matrix used
  by role create/edit.
- `GET /laundry-settings/timezones`, `GET /laundry-settings/date-formats`,
  `GET /laundry-settings/profile`, and `PUT /laundry-settings/profile` provide
  Laundry profile and regional settings.
- `GET /laundry-notification-preferences/show` and
  `PUT /laundry-notification-preferences/update` provide Laundry notification
  preferences.
- `GET /tenant-laundries/show` returns `data.items`, `data.pagination`, and the
  `{ key, label, count }[]` summary under `data.counts` for `totalLinked`,
  `pendingRequests`, `activeDispatches`, `itemsCurrentlySent`, and
  `delayedItems`; no separate linked-laundry summary endpoint is used. The
  linked tab shares its list response with the summary cards, and a minimal list
  request is made only when a pending/rejected tab is opened directly without
  an already loaded summary.
- `PUT /tenant-laundries/unlink/:id`, where `id` is the linked-laundry
  relationship UUID preserved as `apiId` by the list normalizer.
- Category services send `x-language`, defaulting to `en`.

These facts are not permission to guess future contracts. Use the exact method,
path, key names, values, pagination parameters, envelope, headers, and identifier
provided by the user/backend.

Business and Laundry login/signup authentication responses accept `accessToken`,
`access_token`, or `token`, then store:

- `accessToken`.
- `refreshToken` when returned.
- `authUser` as JSON when returned.

All three authentication values use `sessionStorage`, so they are scoped to the
current browser tab/session and are cleared when that tab closes. Legacy auth
keys are removed from `localStorage`; `clearAuthSession` removes the session
values as well. Updating the stored auth user emits the shared
`auth-session-user-updated` browser event; the dashboard Header subscribes so
saved business names, initials, email, and avatar update without a reload. Theme
preference is separately stored as `theme-mode` in `localStorage`. Never print
or expose stored values.

There is currently no automatic refresh-token flow. Authenticated `401`
responses use the global portal-aware login redirect described above.

## 9. Shared UI system

Reuse `src/Components/UI` before creating feature-local replacements:

- Overlays/actions: `ActionDropdown`, `Dropdown`, `Modal`, `SlideOver`, `Tooltip`.
- Inputs/navigation: `Input`, `Tabs`, `Toggle`, `Pagination`, `BusinessSelector`.
- Data display: `Table`, `TableSkeleton`, `CardSkeleton`, `Badge`, `Card`,
  `Alert`, `ProgressBar`, and the shared `Charts` primitives (`ChartCard`,
  `LineChart`, `BarChart`, `DonutChart`, and `SegmentedBarChart`).
- Identity/icons: `Avatar`, `InitialsAvatar`, `IconWrapper`.
- Primary action primitive: `Button`.

Important contracts:

- `Input.onChange` receives `(value, event)`, not only a native event. It supports
  errors/helper text, icons, passwords, multiline, and numeric constraints.
- `Dropdown` normally consumes `{ label, value }` options, emits selected values,
  supports search/multiple selection, and portals its menu.
- `Button` defaults to `type="button"` and supports variants, custom sizes,
  icons, loading, disabled state, and polymorphic rendering.
- `Toggle` is the shared accessible switch control. It accepts `checked`, emits
  the next boolean through `onChange`, supports labels, disabled state, and
  `sm`/`md`/`lg` sizes, and keeps off/on states visible in both themes.
- `Modal` portals to `document.body`, closes on Escape, locks body scroll, and can
  close on backdrop. Inspect and improve focus behavior when a task requires it.
- `Pagination` is zero-based: `forcePage` is zero-based and it emits
  `onPageChange({ selected })`. Convert to one-based API pages at the boundary.
- `Table` supports declarative columns, actions, row clicks, skeletons, empty
  state, nested accessors, and horizontal overflow. Data columns automatically
  receive client-side sorting; use `sortable: false` to opt out. `action` and
  `actions` keys opt out by default unless explicitly set to `sortable: true`.
  Consumers can still provide `onSort`, `sortBy`, and `sortDirection` for
  controlled/server sorting. Trace every consumer before changing this shared
  component.
- `ActionDropdown` portals its menu and expects labeled item callbacks. Keep item
  labels unique within the menu. Its `disabled` prop disables the complete
  actions trigger when a row has no permitted actions.
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
- `useDebouncedSearch` in `src/Hooks` is the shared search behavior: it trims
  input, waits 400ms, searches from two characters, and resets immediately when
  the query is cleared. Use it for server, client-side, and searchable-dropdown
  filtering instead of feature-local debounce timers.
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
