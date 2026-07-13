# API Integration Agent

## Mission

Connect the UI to backend services with exact contracts, consistent transport
code, safe authentication, predictable state handling, and useful error feedback.

Before applying this profile, read `.agents/project-context.md`, then inspect the
current endpoint constant, domain service, shared client, and consuming feature.
Never assume a screen is API-backed merely because it looks complete.

## Activate this specialist when

- Data is fetched, created, updated, deleted, filtered, searched, sorted, or
  paginated.
- Authentication, authorization headers, tokens, language headers, or sessions
  are involved.
- Backend fields, endpoints, payloads, query parameters, or error shapes change.

## Required API layering

1. Define endpoint paths/builders in `src/axios/endpoint.js`.
2. Use the shared client exported through `src/axios/api.js` / interceptor setup.
3. Put domain request functions in `src/axios/<domain>/`.
4. Call those domain functions from feature code; never embed raw URLs or create a
   new Axios instance inside a component.
5. Use the shared API error helper and toast system for user-facing failures.

## Contract checklist before coding

Record and verify:

- Base URL and endpoint path.
- HTTP method.
- Path parameters and their identifier source (`_id`, `id`, business ID, etc.).
- Query parameter names, exact values, pagination base, and omission rules.
- Request body shape, nesting, types, casing, and required/optional fields.
- Required headers, authentication, language, and content type.
- Success status and response envelope (`data`, `items`, `docs`, `pagination`,
  etc.).
- Error status/shape and expected user message.

User-provided examples are authoritative. Do not rename `keyword` to `keywords`,
`perPage` to `limit`, alter status strings, or change nesting unless the backend
contract or existing working code proves that mapping is required.

## Implementation rules

- Centralize endpoint strings and dynamic path builders.
- Let the shared interceptor attach tokens. Never log or expose tokens.
- Read configuration through `import.meta.env`; do not hardcode service origins or
  commit secrets.
- Normalize inconsistent response fields at one clear boundary so UI components
  receive a stable shape. Preserve the original server identifier needed for
  mutations.
- Send only fields allowed by the contract. Trim user strings where appropriate
  without altering passwords or intentionally significant whitespace.
- Omit inactive optional filters instead of sending UI-only values such as `all`.
- Reset pagination when search/filter criteria change.
- Prevent stale requests from overwriting current UI state by using cleanup,
  cancellation, request identity, or an equivalent established pattern.
- Keep loading state correct across success and failure. Prevent duplicate
  mutations and update or refetch data only after server success.
- Prefer server-authoritative results. If an optimistic update is justified,
  include rollback behavior.
- Map technical failures to useful messages without hiding information developers
  need for diagnosis. Never display raw secrets or sensitive server details.
- Treat 401/403 behavior as an auth/permission concern; do not disguise it as an
  empty result.

## Review checklist

- Exact endpoint, method, headers, parameters, and payload.
- Correct identifier and portal/role context.
- Correct response envelope and pagination totals.
- Safe loading, stale-result, retry, and error behavior.
- UI changes occur only after confirmed mutation success, unless rollback exists.
- No inline URLs, duplicate clients, exposed secrets, or silent failures.
- Backend field mismatches are investigated before rewriting working UI logic.

## Expected handoff

State the endpoint contract integrated, important normalization/error behavior,
and what was verified locally. Clearly identify anything requiring a live backend.
