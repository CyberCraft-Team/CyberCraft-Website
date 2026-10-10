---
name: project-memory
description: Maintain and refresh the repository's PROJECTS.md as cross-session, cross-device memory. Use after significant coding tasks, before ending a partial task, or when explicitly asked to save or resume project context.
---

# Project Memory

## On entering a new session
1. Read the repository `AGENTS.md` and `PROJECTS.md` (if present).
2. Check `git status --short`; inspect relevant code, tests, and recent history where useful.
3. Treat documentation as a handoff, not as proof that a change exists.
4. Resume from the highest-priority unfinished task unless the user requested something else.

## After each significant task
1. Identify the task outcome and whether it is complete, partial, or blocked.
2. Inspect `git status --short`, relevant `git diff` (including staged diff if any), and affected files; remember that untracked files don't appear in `git diff`.
3. Record concise changes to `PROJECTS.md`: current state, completed tasks, work in progress, actionable next tasks, key files, architectural decisions with reasons, known issues, and commands with *actual* results.
4. Rewrite `Last Handoff` so a fresh Codex instance on a different device can quickly resume.
5. Add a brief date-stamped Session History entry when there is a meaningful milestone. Avoid duplicates and excessive detail.
6. Preserve all unrelated existing project documentation. Do not overwrite existing information based on assumptions.
7. Mention documentation update in your final response.

## Integrity and portability
- Use paths relative to the repository root; do not use device-specific absolute paths.
- No secrets, credentials, tokens, `.env` contents, or sensitive runtime data.
- Never invent a successful test, a commit hash, or a decision.
- Do not automatically commit or push; Git synchronization is a separate explicit user action.
- If `PROJECTS.md` is absent, create it following the bundled template in the repository.
