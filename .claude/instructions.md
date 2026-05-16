# Claude Instructions — Waypoint

## Keywords
- `stage` means to plan out specified code in currentDev.md
- `implement` means to execute plan in currentDev.md
- `revise staged` means to evaluate items planned in currentDev.md and change if necessary

## Code Editing Rules
- Preserve all existing comments exactly (no edits/removals) unless explicitly instructed.
- Keep comments in place when modifying/rewriting code.
- If comments become inaccurate, flag and defer updates to the user.

## Memory Rules
- All project memory lives in `.claude/` only. No new `.md` files without user approval. Use `overview.md` for architecture, `plan.md` for build status, `currentDev.md` for active tasks.

## currentDev.md Rules
- Use terse bullets only; no prose or explanations.
- Include only task-critical info; no redundancy or extra context.
- task complete = IMMEDIATELY overwrite currentDev.md with: "## Status: Clear\nNo active task." do not wait. do not ask. overwrite on completion regardless of test status.
