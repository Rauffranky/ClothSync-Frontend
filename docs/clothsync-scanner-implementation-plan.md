# ClothSync Scanner Frontend and Android APK Implementation Plan

## Purpose

Implement the scanner administration experience in the existing React/Vite
portal and the scanner workflow in `android/r501-scanner`, using the production
scanner backend contract. Offline scanning is out of scope: login, enrollment,
configuration, authorization, heartbeat, and scan submission require an active
internet connection.

This is an implementation plan, not proof that any API, vendor RFID callback,
APK build, device installation, or end-to-end scan has been verified.

## Repository ownership and boundaries

| Concern | Location |
| --- | --- |
| Routes and lazy page wrappers | `src/Routes`, `src/Page` |
| Business scanner screens | `src/Section/Tenant/Scanner` |
| Laundry scanner screens | `src/Section/Laundry/Scanners` |
| Shared controls and states | `src/Components/UI` |
| Scanner API constants/client functions | `src/axios/endpoint.js`, `src/axios/scanners` |
| Authentication and permissions | `src/Auth`, `src/Routes`, `src/Utils/permissions.js` |
| Realtime scanner updates | `src/socket/events.js`, `src/Hooks/useSocketEvent.js` |
| Portable Android scanner | `android/r501-scanner` |

Pages remain thin composition layers. Feature logic belongs in Sections, API
calls remain in `src/axios`, and shared UI must reuse existing primitives before
new components are introduced. The current source is authoritative whenever it
differs from this plan or from a pasted backend endpoint name.

## Canonical contract

### Scanner identity

The clients must distinguish:

- Hardware identifier: Android ID or the approved device identifier.
- Logical scanner identity: backend-generated ClothSync scanner ID.
- Database scanner UUID: backend-only identifier used where required by APIs.

The logical scanner ID is backend-owned and must never be typed or edited by an
operator. Historical scans remain attached to the logical scanner after hardware
replacement.

### Scanner mode and manual action

`scannerMode` has exactly these values: `entry`, `exit`, `manual`, and `auto`.
`read_only` is a manual `scanAction`, not a scanner mode.

When `scannerMode` is `manual`, the APK shows exactly:

```text
[ Check In ] [ Check Out ] [ Read Only ]
```

Valid actions are `check_in`, `check_out`, and `read_only`. Only manual mode
sends `scanAction`; read-only must not perform movement or show movement-success
wording.

## Client API surface to verify and implement

Confirm each path against the existing endpoint constants and backend before
coding. Do not put raw endpoint strings or direct Axios instances in UI files.

### Android

```text
POST /api/mobile-scanner/login
POST /api/mobile-scanner/device/identify
POST /api/mobile-scanner/refresh
POST /api/mobile-scanner/logout
GET  /api/mobile-scanner/scanners
POST /api/mobile-scanner/sessions/start
POST /api/mobile-scanner/sessions/:id/scans
POST /api/mobile-scanner/sessions/:id/stop
PUT  /api/mobile-scanner/sessions/:id/clear
POST /api/mobile-scanner/heartbeat
```

Normal operation uses the backend-bound scanner automatically; scanner selection
is recovery-only. A scan request contains a client UUID and normalized,
deduplicated EPCs. The same request ID may retry only the same payload.

### Portal administration

```text
GET /api/tenant-scanners/show
GET /api/tenant-scanners/show/:id
PUT /api/tenant-scanners/configure/:id
PUT /api/tenant-scanners/update-status/:id
PUT /api/tenant-scanners/reconnect-device/:id
PUT /api/tenant-scanners/replace-device/:id
PUT /api/tenant-scanners/access/:id
PUT /api/tenant-scanners/rotate-key/:id
PUT /api/tenant-scanners/revoke-key/:id
GET /api/tenant-scanners/show/:id/logs
```

Use the actual portal client prefix and existing Business/Laundry equivalents.

## Portal work

### Scanner list

Display scanner name, logical scanner ID, device model, masked hardware status,
fixed/portable type, mode, location, lifecycle status, last authenticated time,
and last activity time.

Filters: Configuration Required, Active, Inactive, Blocked, Replaced, Retired,
Fixed, Portable, Entry, Exit, Manual, and Auto. Never expose Read Only as a
mode filter.

### Configure Scanner

Read-only: logical ID, database UUID when permitted, model, platform, hardware
status, first seen, and last seen.

Editable: name, type, mode, location, notes, and lifecycle status subject to
backend rules. Fixed scanners require a location before activation. Activation
must be confirmed by the backend response; the UI must not infer active state
from a successful form submission.

`pending_configuration` renders **Configuration Required**, with Configure and
View Hardware Details actions, and never exposes an Active scanning state.

### Recovery, access, credentials, and history

- Reconnect binds replacement hardware to the same logical scanner.
- Replace marks old hardware as no longer current while preserving history.
- Access policies support all authorized staff, multiple specific staff, and
  multiple specific roles; one scanner must not be limited to one employee.
- Rotate displays the raw key once with copy and warning text. Revoke updates
  state. Raw keys never enter normal portal state, logs, analytics, or storage.
- Logs show configuration version, mode, manual action, logical ID, hardware
  binding when available, staff/user, EPC/tag/asset, location, event time, and
  rejection reason.

## Android APK work

Use protected storage for refresh token, bound scanner identity/UUID,
enrollment state, and last successful configuration time. Do not store raw
scanner API keys in ordinary preferences or logs.

Startup: read the device identifier automatically, authenticate if needed,
identify the device, resolve the existing/enrolled/blocked state, refresh
configuration, verify status and staff access, then show Ready to Scan or an
actionable blocked state. Employees must not choose a scanner during normal use.

Scanning is allowed only when the account, mobile session, device association,
organization, scanner status, and access policy all pass. Handle statuses:
`pending_configuration`, `active`, `inactive`, `blocked`, `replaced`, and
`retired` with explicit UI and disabled controls.

Entry, Exit, and Auto show their configured workflows without manual action
selection. Manual shows Check In, Check Out, and Read Only; the selected action
is visible before scanning and in the result summary. Show per-EPC accepted or
rejected reasons.

Before login, enrollment, session start, and scan submission, check connectivity.
When unavailable, show: `Internet connection required. Reconnect to continue
scanning.` Do not queue scans or claim acceptance offline.

Heartbeat includes scanner UUID, app version, battery, network state, RFID
connection state, and device metadata. Refresh authorization on login, resume,
session refresh, heartbeat response, and authorization failure. Remote inactive,
blocked, replaced, or unauthorized responses disable scanning immediately.

## Error contract

Provide actionable, non-secret messages for invalid credentials, expired or
revoked sessions, unregistered or cross-organization devices, inactive/
blocked/pending/replaced scanners, unauthorized staff, hardware conflicts,
invalid or missing manual actions, illegal non-manual `scanAction`, changed
payloads using an existing request ID, per-EPC rejection, backend failure, and
internet failure.

## Phase-wise implementation plan

The phases below are the client-side execution plan for the backend Phases 1–10.
Each phase must be completed and verified before the next dependent phase is
started.

### Phase 1 — Shared contract and project discovery

**Frontend:** Verify backend routes, methods, payloads, response envelopes,
status values, permissions, and existing Business/Laundry scanner APIs. Add or
correct constants and normalizers in `src/axios/endpoint.js` and
`src/axios/scanners`.

**Android:** Confirm the mobile API models, authentication envelope, scanner
identity fields, and protected-storage requirements in `android/r501-scanner`.

**Exit criteria:** One canonical mapping exists for scanner identity, lifecycle
status, `scannerMode`, and manual `scanAction`; no UI contains transport logic.

### Phase 2 — Scanner enrollment and device identity

**Frontend:** Support the scanner list and detail data needed for pending,
active, blocked, replaced, and retired devices. Keep logical scanner ID and
hardware identity read-only.

**Android:** Read Android/device identity automatically, authenticate, call
device identify, and handle existing, newly enrolled, unregistered, and
cross-organization states.

**Exit criteria:** Normal staff cannot manually choose or claim a scanner;
unknown and cross-organization devices are blocked with actionable messages.

### Phase 3 — Portal Configure Scanner flow

**Frontend:** Implement the Configure Scanner screen in the existing scanner
Section/Page pattern. Add editable name, type, mode, location, notes, and
backend-confirmed lifecycle activation. Enforce location for fixed scanners.

**Android:** Refresh the bound scanner configuration after login and show
Configuration Required when the backend returns `pending_configuration`.

**Exit criteria:** Configuration Required is visible, Active is never inferred,
and pending scanners cannot scan.

### Phase 4 — Scanner lifecycle and authorization

**Frontend:** Render and filter `pending_configuration`, `active`, `inactive`,
`blocked`, `replaced`, and `retired` accurately. Apply existing route and
permission guards.

**Android:** Verify account, mobile session, device association, organization,
scanner status, and staff access before enabling scan controls. Refresh on login,
resume, token refresh, heartbeat response, and authorization failure.

**Exit criteria:** Inactive, blocked, replaced, retired, and unauthorized states
disable scanning and explain the required action.

### Phase 5 — Scanner hardware recovery

**Frontend:** Add Reconnect Device and Replace Device administrator actions with
confirmation, backend response handling, and preserved logical scanner history.

**Android:** Refresh binding after recovery and require configuration/activation
again whenever the backend returns that state.

**Exit criteria:** Reconnect preserves logical identity; replacement preserves
historical attribution; old hardware cannot continue as current hardware.

### Phase 6 — Access policies and credentials

**Frontend:** Implement all-authorized-staff, multiple specific staff, and
multiple specific role policies. Add rotate/revoke credential controls.

**Android:** Enforce the returned access policy before scanning and handle
revoked mobile sessions or credentials without exposing secrets.

**Exit criteria:** Multi-user fixed scanner access works; raw API keys appear
only once after rotation and never enter ordinary state, logs, or local storage.

### Phase 7 — Scanner modes and manual actions

**Frontend:** Display and filter only `entry`, `exit`, `manual`, and `auto`.
Never present `read_only` as a scanner mode.

**Android:** Implement Entry, Exit, Auto, and Manual workflows. Manual shows
Check In, Check Out, and Read Only, with the selected action visible before and
after scanning.

**Exit criteria:** Missing/invalid actions are blocked; non-manual requests do
not contain `scanAction`; Read Only has no movement or movement-success UI.

### Phase 8 — Online scanning and idempotent results

**Android:** Start a bound session, normalize/deduplicate EPCs, generate stable
request IDs, submit online scan batches, handle stored idempotent responses, and
display per-EPC accepted/rejected reasons.

**Frontend:** Consume scanner activity and result updates through existing API
and Socket.IO patterns, preserving loading, empty, error, and retry states.

**Exit criteria:** Same request ID plus same payload is safely repeatable; a
changed payload with the same ID is rejected; no scan is queued offline.

### Phase 9 — Heartbeat, realtime, and error handling

**Android:** Send scanner UUID, app version, battery, network state, RFID state,
and device metadata. Stop scanning when heartbeat or server authorization
reports a blocking lifecycle state.

**Frontend and Android:** Handle invalid credentials, expired tokens, revoked
sessions, unavailable backend/internet, hardware conflicts, invalid actions,
and per-EPC rejection without exposing secrets or internal details.

**Exit criteria:** Remote state changes disable the scanner promptly and the
portal receives the expected realtime activity/results.

### Phase 10 — Testing, hardware validation, and release readiness

**Automated checks:** Add focused portal and APK tests for enrollment,
permissions, lifecycle states, access policies, manual actions, Read Only,
idempotency, error states, and credential safety.

**End-to-end check:** Install the APK, enroll/configure/activate it, log in as
staff, verify authorization, capture a real RFID EPC, confirm backend ingest,
per-EPC result, realtime portal update, audit log, and historical attribution.

**Exit criteria:** Database migrations, source checks, APK install, real EPC
callback, backend processing, portal update, and release gates all pass
independently. A successful build alone is not hardware verification.

## Verification and release gates

Run focused checks first, then `npm.cmd run build` and `npm.cmd run lint` when
practical. Separately verify Android build/install, the authorized device/model,
real RFID EPC callback, backend ingest, per-EPC results, Socket.IO/portal
updates, and historical attribution after replacement. Source checks alone do
not prove hardware or end-to-end behavior.

Do not release until migrations are applied, frontend/APK mode/action values
match, normal users cannot manually select or enroll devices, cross-organization
hardware is blocked, Read Only causes no movement, blocked lifecycle states stop
scanning, offline behavior is blocked, and a real EPC has completed the full
portal-to-backend-to-history flow.

## Specialist routing

- Lead: Architecture Agent, because this spans portal routes, API boundaries,
  permissions, realtime behavior, and Android ownership.
- Supporting: API Integration Agent for exact contracts; Code Structure Agent
  for placement and reuse; UI/UX Agent for states, accessibility, and responsive
  workflows.

## Current implementation status

- **Phase 1 — Shared contract and project discovery: Complete.** Verified the
  backend mobile and tenant scanner routes, inspected the existing frontend
  scanner services and Android API/repository, added missing portal endpoint
  constants/services, and added Android device-identification contract models.
  Frontend production build passed with `npm run build`.
- **Phase 2 — Scanner enrollment and device identity: Complete.** The Android
  client now reads Android ID automatically after login, calls
  `device/identify`, binds the returned logical scanner without normal manual
  selection, shows enrollment/configuration messaging, and blocks non-active
  scanners from starting. Frontend build and Android debug unit-test/compile
  checks passed.
- **Phase 3 — Portal Configure Scanner flow: Complete.** The shared scanner
  details screen now reuses `AddScannerModal` for configuration, calls the
  backend configure/update endpoint for Business/Laundry, keeps scanner identity
  fields read-only, and passes the correct staff-options service per portal.
  Frontend production build and Android debug test/compile checks passed.
- The second authorized device exposes `com.uhf288.scanlable`,
  `com.rfid.trans2000.UHFLib`, and `/dev/ttyS0`; an isolated UHF288 adapter now
  selects this interface only when that vendor package is present. APK build,
  installation, and launch passed on both devices. Real EPC callback and
  backend-ingest verification remain pending.
- **Phase 4 — Scanner lifecycle and authorization: Complete.** Android now keeps
  non-active scanner records visible, disables scan start unless the scanner is
  active, stops an active session when refresh detects inactive/blocked/replaced/
  retired state, and shows an actionable lifecycle message. Both portable and
  fixed flavor tests and debug builds passed.
- **Phase 5 — Scanner hardware recovery: Complete.** The frontend now supports
  reconnect and replacement actions with hardware identity, device metadata,
  replacement confirmation, logical Scanner ID preservation messaging, and
  configuration-required guidance. Recovery success refreshes scanner details;
  scanning remains disabled until the scanner is configured and active. Source
  build verification passed; live endpoint verification remains dependent on
  the backend scanner-device migration being applied.
- **UHF288 fixed-scanner behavior:** When the fixed APK identifies an authorized
  scanner whose backend status is `active`, it automatically creates the scan
  session and starts RFID inventory. The portable R501 APK retains manual scan
  start behavior.
- **Phase 6 — Access policies and credentials: Complete.** Tenant scanner
  details now support all-authorized-staff, multiple specific staff, and
  multiple specific role policies, plus one-time credential rotation display
  and credential revocation. Raw keys are held only in the recovery modal's
  transient state and are not persisted.
- **Phase 7 — Scanner modes and manual actions: Complete.** Portal mode
  choices are limited to Entry, Exit, Manual, and Auto; Read Only is available
  only as a Manual action. Android validates canonical modes, sends a scan
  action only for Manual mode, and preserves Read Only as a non-movement
  result action.
- **Phase 8 — Online scanning and idempotent results: Complete.** Android now
  starts bound sessions, normalizes and deduplicates EPC batches, generates
  UUID request IDs, submits online-only scan requests, and renders per-EPC
  backend results and rejection reasons. Failed requests are surfaced for
  retry and are not queued offline.
- **Phase 9 — Heartbeat, realtime, and error handling: Complete.** Android
  heartbeats now include scanner ID, app/device metadata, network state, and
  RFID connection state. Backend deactivation, revoked/unauthorized sessions,
  conflicts, and heartbeat/network failures stop scanning and show an
  actionable message. Android HTTP body logging is disabled so credentials and
  scan payloads are not exposed in logs.
- **Phase 10 — Testing, hardware validation, and release readiness: Source
  verification complete; hardware/E2E validation pending.** Frontend build and
  focused lint passed, and portable/fixed debug APK assembly plus unit tests
  passed. APK installation, real EPC callback, backend ingest, Socket.IO portal
  update, and signed release verification require a functioning ADB daemon,
  migrated backend database, and physical RFID tag test.

Android compilation, APK installation, hardware callbacks, live backend ingest,
and end-to-end portal verification remain unverified and are intentionally not
claimed by completion of Phase 1.
