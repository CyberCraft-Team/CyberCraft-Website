# Repository Guidelines

## Project Structure & Module Organization

CyberCraft Website uses Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS 4.

- `app/[locale]/`: localized pages, layouts, and global styles; includes public, cabinet, and dashboard routes.
- `app/api/`: authentication handlers and the Django backend proxy.
- `components/`: shared UI; `ui/` contains primitives, while `cabinet/` and `dashboard/` contain feature components.
- `lib/api/`: client requests and types; `lib/server/`: server-only backend access and session handling.
- `i18n/` and `messages/{uz,ru,en}.json`: routing and translations. Uzbek is the default language.
- `hooks/`: reusable React hooks; `public/`: static assets; `scripts/`: repository checks.

## Build, Test, and Development Commands

Use Node.js 22, matching CI, and run commands from this repository:

- `npm ci`: install dependencies from `package-lock.json`.
- `npm run dev`: start the development server at `http://localhost:3000`.
- `npx tsc --noEmit`: check TypeScript without emitting files.
- `npm run check:colors`: detect raw Tailwind color utilities where semantic tokens are required.
- `npm run build`: generate the production build.
- `npm start`: serve an existing production build.

## Coding Style & Naming Conventions

Match surrounding code; prefer two-space indentation, double quotes, and semicolons. Use strict TypeScript, PascalCase component exports, `use` prefixes for hooks, and descriptive filenames. Import repository modules through `@/`.

Reuse UI primitives and semantic color tokens from `app/[locale]/globals.css`. Put user-facing copy in all three translation files. Use locale-aware links from `i18n/navigation`. Keep server-only code out of client components. No dedicated ESLint or Prettier configuration is currently provided.

## Testing Guidelines

No automated test runner or coverage threshold is configured. CI requires TypeScript and production build checks. Run those checks and the color check before submitting changes.

Manually verify affected flows against the local backend, including loading, error, and empty states. For UI changes, check mobile and desktop widths, all locales, and relevant guest/authenticated states. Include keyboard and dialog behavior when affected.

## Commit & Pull Request Guidelines

Follow existing Conventional Commit patterns: `feat(dashboard): ...`, `fix(auth): ...`, or `refactor: ...`. Keep commits focused.

Describe the problem, resulting behavior, and validation in each PR. Link relevant issues and include screenshots for visual changes.

## Configuration & Agent Instructions

Copy `.env.example` to `.env.local`; configure the backend API with its `/api/v1` prefix. Never commit credentials or session tokens; retain HttpOnly session handling.

Issues and specs live in GitHub Issues; follow `docs/agents/issue-tracker.md`. Follow `docs/agents/domain.md` for available glossary and architecture decision documents.

## Persistent Project Memory

Read `PROJECTS.md` and inspect Git status when starting a session. Update the handoff after significant work with verified outcomes, remaining tasks, and actual checks. Use `.agents/skills/project-memory/SKILL.md`; never store secrets or commit/push without user authorization.
