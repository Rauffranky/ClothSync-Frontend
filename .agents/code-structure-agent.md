# Code Structure Agent

## Mission

Produce React code that is easy to understand, change, test, and reuse while
following this repository's existing structure. Favor clear ownership and the
smallest complete implementation over clever abstractions.

Before applying this profile, read `.agents/project-context.md` and verify the
affected feature's current files. The context map explains expected ownership;
the source code confirms the current implementation.

## Activate this specialist when

- Any source file is created or edited.
- Components, hooks, helpers, routes, forms, or state logic change.
- Code is duplicated, overly large, difficult to follow, or in the wrong layer.
- A lint warning, runtime warning, or maintainability issue is involved.

## Repository map to enforce

- `src/Page`: thin route-level page composition.
- `src/Section`: feature/domain implementation grouped by portal.
- `src/Components/UI`: reusable presentation and interaction primitives.
- `src/Components/Layout`: shared shells, headers, sidebars, and layouts.
- `src/axios`: API client, endpoint constants, and domain request functions.
- `src/Hooks`: reusable React behavior.
- `src/Config`: navigation and application configuration.
- `src/Utils`: general pure helpers such as dates, themes, and toasts.

Follow the casing already used by the repository. Do not rename large directory
trees merely to normalize casing during an unrelated task.

## Analysis checklist

1. Trace imports and consumers before changing a shared module.
2. Inspect a nearby working feature with similar behavior.
3. Decide which layer owns data fetching, state, rendering, and transport.
4. Identify repeated logic, but extract only when reuse or complexity justifies it.
5. Check sibling portals/screens for intentionally shared or mirrored behavior.
6. Confirm effects have correct dependencies, cleanup, and stale-result protection.

## Implementation rules

- Keep components focused. Split a component when it has multiple independent
  responsibilities, not merely because it has many lines.
- Prefer derived values (`useMemo` only when useful) over duplicated state.
- Keep state close to its consumers; lift it only for real coordination.
- Use controlled form patterns already established by Formik and Yup.
- Avoid setting state in an effect solely to derive it from props or other state.
- Clean up timers, subscriptions, and asynchronous work.
- Use stable keys based on domain identifiers, not array indexes when records can
  be added, removed, sorted, or paginated.
- Reuse shared `Button`, `Input`, `Dropdown`, `Modal`, `Table`, `Pagination`,
  `Card`, `Badge`, alerts, and layout components before inventing replacements.
- Keep constants outside render functions when they do not depend on component
  state. Use clear names that describe domain intent.
- Remove debug code and dead imports. Do not leave commented-out replacement code
  unless the comment documents an intentionally deferred product requirement.
- Do not introduce a library or global state tool for a local problem without
  explicit architectural justification and user approval.

## Review checklist

- Correct folder and responsibility boundaries.
- Clear names and straightforward control flow.
- No unnecessary prop drilling, state duplication, or premature abstraction.
- Shared changes checked against all consumers.
- Effects, callbacks, timers, and async updates are safe.
- No new ESLint or React warnings.
- Existing public component/API behavior remains compatible unless intentionally
  changed by the request.

## Expected handoff

Report the structural choice, notable reuse, and any intentionally deferred
refactor. Mention exact checks run; never describe unrun tests as successful.
