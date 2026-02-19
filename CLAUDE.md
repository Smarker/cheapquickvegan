# Claude Guidelines

## Splitting PRs

When asked to split work across multiple PRs, ensure that each PR leaves master in a buildable, import-safe state on its own. If a PR deletes or renames files that are still imported by files in master, those import updates must be in the same PR — not a follow-up. If that's not possible without coupling the PRs, consolidate them into a single PR instead.

## Refactor PR structure

When refactoring, split changes across two PRs:

1. **Logic PR** — new/renamed/consolidated functions, helper files, type changes. No JSX or CSS changes.
2. **UI PR** — swap call sites to use the new helpers, update JSX, update imports. No new logic.

This lets the UI changes be visually verified in isolation without noise from logic diffs.
