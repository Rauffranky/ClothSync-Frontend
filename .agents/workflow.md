# Mandatory Implementation Workflow

Use this workflow for every task. Scale the detail to the risk and size of the
change without skipping a phase.

## 1. Discover

- Read `AGENTS.md`, `.agents/README.md`, `.agents/project-context.md`, and all
  four specialist profiles completely.
- Read the user's request literally and extract fixed contracts.
- Check `git status` and preserve unrelated work.
- Classify the affected feature as live API-backed, local sample-data-backed, or
  placeholder by checking its imports and submit/action handlers.
- Trace the current route, page, section, shared component, hook, helper, and API
  path involved in the behavior.
- Find the nearest working implementation and mirror its conventions.
- Search for duplicate or sibling implementations that may need the same change.

## 2. Plan

- Choose the lead and supporting specialists.
- Identify the smallest complete set of files.
- Separate confirmed facts from assumptions.
- Define data flow, user states, permissions, failure behavior, and verification.
- Ask the user only when a missing decision materially changes the result and
  cannot be safely learned from the repository.

## 3. Implement

- Work in small, reviewable edits.
- Keep UI components focused on rendering and interaction.
- Keep transport details in `src/axios`, reusable state logic in hooks/helpers,
  and page composition in the existing Page/Section pattern.
- Reuse tokens and UI primitives. Do not create a competing design pattern.
- Preserve backward compatibility unless the task explicitly removes it.
- Do not add speculative abstractions for a single use case.
- Update `.agents/project-context.md` when the implementation changes a fact it
  documents. Do not add temporary task details that are not durable project
  knowledge.

## 4. Specialist review gates

Before verification, perform all four quick reviews:

- Code Structure: Is the code understandable, reusable where justified, and in
  the correct folder with clean state/effect boundaries?
- UI/UX: Are all interaction states responsive, accessible, and visually aligned
  with the existing product?
- API Integration: Are endpoint, method, parameters, payload, response shape,
  authentication, cancellation/stale updates, and errors correct?
- Architecture: Does the change respect feature boundaries, routes, permissions,
  dependencies, and future maintainability without unnecessary complexity?

## 5. Verify

Use checks proportional to the change:

1. Review the diff for accidental or unrelated edits.
2. Run file-scoped or feature-scoped lint/checks when available.
3. Run `npm.cmd run build`.
4. Run `npm.cmd run lint` when practical.
5. Manually reason through the happy path and relevant loading, empty, error,
   validation, permission, responsive, and retry paths.

Never claim a check passed unless it was actually run. If a check fails, include
the exact relevant failure and whether it is introduced by the current change.

## 6. Handoff

Lead with the result. Briefly report:

- What changed.
- Which important files changed.
- Which checks passed or failed.
- Any genuine remaining risk or required external dependency.
