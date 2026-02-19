# Claude Guidelines

## Splitting PRs

When asked to split work across multiple PRs, ensure that each PR leaves master in a buildable, import-safe state on its own. If a PR deletes or renames files that are still imported by files in master, those import updates must be in the same PR — not a follow-up. If that's not possible without coupling the PRs, consolidate them into a single PR instead.
