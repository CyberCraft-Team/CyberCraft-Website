# Project Memory

> Portable workspace handoff stored in CyberCraft-Website. Website code paths refer to this repository; sibling repository names refer to the surrounding checkout. Verify code and Git before relying on these notes.

## Project Overview

CyberCraft is a Minecraft community platform comprising independent repositories: `CyberCraft-Website` (Next.js 16, React 19, TypeScript, Tailwind 4), `CyberCraft-Backend` (Django/DRF, Daphne), `CyberCraft-Launcher`, `CyberCraft-Mods`, `CyberCraft-Workspace`, and `demo-repository`.

## Current State

- This parent directory is not a Git repository. Each child repository has its own Git history; parent memory files remain local; this Website copy and the bundled memory skill are Git-tracked.
- Pushed implementation/documentation commits: Website `f7b36f4`, Backend `a206603`, Mods `75accc8`, Launcher `6a6ca83`, demo `d79a15c`. Use Git for the latest memory-only commit.
- Website UI/configuration, new components, contributor documentation and memory skill have been committed and pushed to main. The portable memory file is being committed as a separate documentation update.
- Launcher has a modified generated `next-env.d.ts`; contributor/agent documentation in all repositories has been committed. Workspace documentation remains local by explicit user instruction.

## Completed Work

- Backend recent administration activity endpoint and website dashboard overview were previously committed and pushed.
- Locally updated dashboard Minecraft, server types, public servers, news, and users pages: responsive layouts, search, localized copy, retry/error/empty states, accessible actions and forms. News editing submits PATCH to the selected record.
- Improved mobile homepage cards, hero, footer, and launcher dialog.
- Added public, cabinet, and dashboard mobile bottom navigation, contextual menus, safe-area spacing, and accessible bottom sheets.
- Fixed public header crowding at 1280px, especially Uzbek and authenticated views: compact spacing, icon-only Launcher below 1536px, bounded username width.
- Uzbek is the default: `localeDetection: false` makes bare URLs Uzbek regardless of browser language/cookies. Explicit `/en` and `/ru` still work; Uzbek uses bare URLs.
- Replaced Website `AGENTS.md` with a 390-word contributor guide; retained existing agent documentation references.

## In Progress

No implementation task is currently unfinished. User authorized all commits and pushes. Website, Backend, Mods, Launcher, and demo main branches were pushed successfully; Workspace was committed locally only.

## Next Tasks

- Follow the user’s next request; there is no outstanding UI implementation task.
- Keep the portable Website PROJECTS.md and local parent memory consistent.
- Preserve the generated Launcher next-env.d.ts modification; it was intentionally excluded from commits.

## Architecture & Decisions

- Public bottom navigation appears below 1280px; cabinet/dashboard below 1024px. Desktop sidebars remain available.
- Shared management UI: `CyberCraft-Website/components/dashboard/management.tsx` and `management.css`.
- Shared public links: `components/site-links.ts`; navigation: `components/mobile-navigation.tsx`, cabinet components, and `app/[locale]/dashboard/layout.tsx` within Website.
- Auth tokens remain in HttpOnly cookies; backend calls use server-side handlers/proxy.
- User instructed that archived GitHub Workspace must remain archived and only be updated locally.

## Development & Verification Commands

Run from the corresponding child repository:

- Website: `npm run dev -- --hostname 127.0.0.1 --port 3000`. Started successfully this session.
- Backend: `.venv/bin/daphne -b 127.0.0.1 -p 8000 config.asgi:application`. Existing service returned HTTP 200 at `/api/v1/health/`.
- Website: `npx tsc --noEmit` passed after header and locale changes; `git diff --check` passed after header changes.
- Earlier UI snapshot: `npm run build -- --webpack` passed, generating 90 pages. A fresh isolated release snapshot also passed after the header/locale changes during the commit/push task.
- Browser: authenticated UZ/EN/RU checked at 390, 1280, 1366, 1440, 1536, 1920px without document/header overflow; guests at 1280px showed no header group overlap.
- Root request with English Accept-Language and locale cookie returned HTTP 200 with rewrite `/uz`.
- Earlier bottom-navigation checks covered public/cabinet/admin routes, focus/Escape, section links, launcher, and safe spacing. Protected-page checks used isolated browser/API fixtures; authenticated header screenshots used actual local login.
- `npm run check:colors` failed on 232 existing raw hue usages; the previous HEAD baseline had 277. This is a known nonblocking check failure, not a newly passing check. No test runner or coverage threshold is configured in Website.

## Known Issues & Blockers

- `.run/` contains local screenshots and validation notes, not portable committed artifacts. Never copy credential/runtime files into project memory.
- No additional specification was supplied for Backend/Website/Mods/demo; use existing documentation.
- Service availability must be rechecked in future sessions; a previous successful start is not evidence a process remains running.

## Last Handoff

- Date: 2026-10-10 (Asia/Tashkent).
- Outcome: user authorized committing/pushing everything; five repositories were pushed to main and Workspace documentation was committed locally. Memory is now also stored in Website for Git synchronization.
- Active implementation repository: `CyberCraft-Website`.
- Changed paths include dashboard pages/layout, shared components, locale messages, `i18n/routing.ts`, `next.config.ts`, and contributor documentation.
- Next action: follow the user’s next request. No further commit/push is authorized unless part of the current synchronization or subsequently requested.

## Session History

- 2026-10-10: Committed and pushed responsive UI, Uzbek default routing, contributor/agent docs across five active repositories; fresh Website build/TypeScript passed; Workspace remained local.

- 2026-10-10: Saved current multi-repository status, responsive UI outcomes, Uzbek default routing, actual validation results, and pending synchronization work.
