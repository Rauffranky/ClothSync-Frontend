# Internal Project AI Working Agreement

This file is the mandatory entry point for every AI task in this repository.

## Required startup sequence

Before analyzing, planning, or editing code, the AI must:

1. Read `.agents/README.md`.
2. Read `.agents/project-context.md` completely. It is the maintained map of
   this application's runtime, portals, routes, features, data sources, shared
   components, and known implementation boundaries.
3. Read all four specialist profiles:
   - `.agents/code-structure-agent.md`
   - `.agents/ui-ux-agent.md`
   - `.agents/api-integration-agent.md`
   - `.agents/architecture-agent.md`
4. Inspect the files directly related to the request and at least one existing,
   working implementation of the same pattern.
5. Select one lead specialist and any supporting specialists using the routing
   rules in `.agents/README.md`.
6. Follow `.agents/workflow.md` from discovery through verification.

These instructions apply even when a prompt looks small. The depth of analysis
may be proportional to the change, but the startup sequence must not be skipped.

## Project-wide non-negotiable rules

- Preserve the existing React 19, Vite, React Router, Tailwind CSS, Formik, Yup,
  Axios, and Lucide React stack unless the user explicitly authorizes a change.
- Reuse existing components from `src/Components/UI` before creating new ones.
- Keep route-level pages in `src/Page`, feature implementation in `src/Section`,
  shared UI in `src/Components`, API code in `src/axios`, hooks in `src/Hooks`,
  configuration in `src/Config`, and general helpers in `src/Utils`.
- Use the shared Axios client and endpoint constants. Do not place raw endpoint
  strings or direct Axios instances inside UI components.
- Treat user-provided endpoints, HTTP methods, payload keys, status values,
  query parameters, roles, permissions, colors, and visible labels as exact
  contracts.
- Never expose secrets from `.env`, tokens, credentials, or private user data.
- Do not silently rewrite unrelated code or discard existing user changes.
- Prefer the smallest complete change that matches an existing project pattern.
- Include loading, empty, error, success, disabled, validation, responsive, and
  accessible states wherever the feature needs them.
- Run focused checks first, then `npm.cmd run build`. Run `npm.cmd run lint` when
  practical and clearly separate pre-existing failures from failures introduced
  by the task.
- When a task changes routes, feature ownership, API/auth behavior, shared UI
  contracts, dependencies, commands, or implementation status, update
  `.agents/project-context.md` in the same change so future AI receives accurate
  repository knowledge.

## Resolving conflicts

Apply instructions in this order:

1. The user's current explicit requirements.
2. This root `AGENTS.md`.
3. The selected specialist profile(s).
4. Existing repository conventions and the nearest working implementation.

When requirements remain ambiguous and a wrong assumption would materially
change behavior, explain the ambiguity and ask one concise question. Otherwise,
state the reasonable assumption and continue.
