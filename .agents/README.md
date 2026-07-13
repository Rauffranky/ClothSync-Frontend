# Specialist Agent System

This directory defines four complementary review perspectives for all AI-assisted
work in this repository. These are operating instructions, not background
documentation: read them before implementation and use them throughout the task.

## Mandatory reading order

1. `../AGENTS.md` - repository-wide authority and startup rules.
2. `project-context.md` - concrete map of how the current application works.
3. `code-structure-agent.md` - implementation-quality rules.
4. `ui-ux-agent.md` - interface and accessibility rules.
5. `api-integration-agent.md` - frontend/backend contract rules.
6. `architecture-agent.md` - boundaries, routing, and system decisions.
7. `workflow.md` - execution and verification sequence.

Do not implement from these documents alone. They help the AI locate and
understand code, but the directly affected source files remain the final source
of truth. If documentation and code disagree, verify the code path, follow the
user's current requirement, and update `project-context.md` when appropriate.

## The four specialists

| Specialist | Primary responsibility | Typical ownership |
| --- | --- | --- |
| Code Structure Agent | Maintainable React code and repository consistency | Components, hooks, naming, state boundaries, reuse, cleanup |
| UI/UX Agent | Usable, accessible, responsive, consistent interfaces | Layout, interactions, visual states, forms, tables, modals |
| API Integration Agent | Correct and resilient frontend/backend contracts | Endpoints, methods, payloads, queries, auth, normalization, errors |
| Architecture Agent | Safe system-level boundaries and long-term decisions | Feature placement, routing, permissions, cross-cutting design, risk |

## How to route a task

Every task has one lead specialist. Add supporting specialists whenever their
area is affected.

- Visual styling, layouts, forms, tables, modals, responsiveness, or interaction:
  UI/UX leads; Code Structure supports.
- Endpoint wiring, authentication, server data, filters, mutations, or errors:
  API Integration leads; Code Structure supports.
- Refactoring, reusable components/hooks, file organization, or lint cleanup:
  Code Structure leads; Architecture supports for cross-feature changes.
- New feature boundaries, navigation, roles/permissions, dependencies, shared
  state, or changes spanning several modules: Architecture leads; all affected
  specialists support.
- Full-stack frontend feature: Architecture defines boundaries, API Integration
  owns the contract, UI/UX owns behavior, and Code Structure owns implementation
  quality.

Small changes still receive a quick pass from every specialist. A specialist may
report "not materially affected" after checking its concerns.

## Required task header

Before editing, the AI should internally establish:

```text
Task:
Lead specialist:
Supporting specialists:
Files likely affected:
Exact contracts supplied by the user:
Existing pattern to inspect:
Current implementation status (live API, local data, or placeholder):
Main risks:
Verification plan:
```

The AI does not need to print this block unless it helps the user, but it must use
the information to guide the work.

## Shared definition of done

A change is complete only when:

- The requested behavior works through the real code path, not a placeholder.
- Existing project patterns and shared primitives were reused where appropriate.
- API details and role/permission rules match the specified contract exactly.
- Loading, empty, error, validation, success, and disabled states are handled.
- Keyboard access, labels, focus behavior, and responsive layout were considered.
- No secrets, debug logs, mock-only behavior, or unrelated rewrites were added.
- Focused checks pass, the production build is attempted, and any remaining
  blocker is reported precisely.
- The final response names the important files changed and the checks performed.
- `project-context.md` remains accurate if the change altered documented
  architecture, routes, contracts, shared primitives, or feature status.

## Important limitation

Markdown profiles cannot independently execute or guarantee that every external
AI product will auto-load them. `../AGENTS.md` is the repository entry point that
requires compatible AI coding tools to load this system. If a tool does not
support `AGENTS.md`, tell it explicitly: "Read AGENTS.md before implementation."
