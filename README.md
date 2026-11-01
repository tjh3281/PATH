# PathFinder FCSIT

PathFinder FCSIT helps students choose a bachelor programme in the Faculty of Computer Science and Information Technology (FCSIT), Universiti Malaya. It turns the faculty's programme handbook into something you can explore: what each programme teaches, where it leads, and which one fits you.

It covers the six Bachelor of Computer Science programmes, shown in this order: **Artificial Intelligence**, **Software Engineering**, **Computer System & Network**, **Multimedia Computing**, **Data Science** and **Information Systems**.

> **Status:** work in progress. The Programme Explorer overview is built. Career Insights, Senior Insights and the Match Quiz are planned.

## Features

| Module               | Status      | What it does                                                                                          |
| -------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| Programme Explorer   | In progress | Folder-tab view of each programme with an intro, key facts and an interactive topic breakdown         |
| Career Insights      | Planned     | Job roles, key skills and industry demand for each programme                                          |
| Senior Insights      | Planned     | Tips and experiences from current students                                                            |
| Programme Match Quiz | Planned     | Rule-based scoring ranks the programmes for you, then Gemini AI explains the result in plain language |

### Programme Explorer (built so far)

- **Folder tabs.** One tab per programme, each with its own theme colour (AI blue, SE green, CSN gold, MM amber, DS red, IS rose).
- **Overview.** Degree, programme intro and quick facts: duration, industrial training and how many electives you pick.
- **"What you'll study" donut.** Every core course and elective option, grouped by topic. Hover a slice or a topic to see its share.
- **Course drill-down.** Click a topic and the chart morphs into that topic's course list, showing code, credits and an Elective tag. Hover a course for a one-line description.
- **AI emblem.** The AI programme has an animated header emblem with flowing wave rings.

All animation follows the user's reduced-motion setting.

## Tech stack

| Area      | Choice                                                                   |
| --------- | ------------------------------------------------------------------------ |
| Framework | Next.js 16 (App Router, Cache Components), React 19, TypeScript (strict) |
| Styling   | Tailwind CSS v4, shadcn/ui on Base UI, custom glass utilities            |
| Animation | Motion (shared-element transitions), CSS keyframes, SVG                  |
| AI        | Google Gemini via `@google/genai`, server-side only                      |
| Data      | Typed static files in `src/data/`, **no database**                       |
| Quality   | ESLint, Prettier, Vitest + Testing Library                               |
| Hosting   | Vercel, auto-deployed from GitHub                                        |

## Getting started

You need **Node.js 22 or later** (24 recommended, see `.nvmrc`) and **npm**.

```bash
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
npm run dev
```

Then open http://localhost:3000/programmes.

The app runs without any API key. Only the planned AI quiz explanation needs one: get a free key from [Google AI Studio](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY` in `.env.local`.

| Variable         | Required        | Default            | Purpose                            |
| ---------------- | --------------- | ------------------ | ---------------------------------- |
| `GEMINI_API_KEY` | For AI features | none               | Google Gemini API key              |
| `GEMINI_MODEL`   | No              | `gemini-2.5-flash` | Gemini model used for explanations |

## Scripts

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start the dev server                                |
| `npm run build`        | Production build (the same build Vercel runs)       |
| `npm run start`        | Serve the production build                          |
| `npm run lint`         | Run ESLint                                          |
| `npm run typecheck`    | Generate route types, then run the TypeScript check |
| `npm run format`       | Format all files with Prettier                      |
| `npm run format:check` | Check formatting without changing files             |
| `npm test`             | Run the unit tests once                             |
| `npm run test:watch`   | Run the unit tests in watch mode                    |

Before pushing, run:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Project structure

```
src/
  app/
    layout.tsx                 Root layout: fonts, background, site header
    programmes/
      layout.tsx               Folder tabs around every programme page
      page.tsx                 Redirects to the first programme
      [slug]/page.tsx          Programme overview, prerendered for all six programmes
  components/
    brand/logo.tsx             Animated branching-path logo
    layout/site-header.tsx     Sticky glass navigation and mobile menu
    programmes/
      programme-folder.tsx     Folder-style programme tabs
      topic-explorer.tsx       Topic donut and course drill-down
      ai-emblem.tsx            Animated AI header emblem
    ui/                        shadcn/ui primitives
  data/
    labels.ts                  The 15 topic labels
    courses.ts                 99 course records
    course-summaries.ts        One-line description per course
    programmes.ts              The six programmes and their courses
  lib/
    programme-profile.ts       Topic breakdown calculation (+ tests)
    env.ts                     Server-only environment validation
    ai/gemini.ts               Server-only Gemini client
  types/curriculum.ts          Shared curriculum types
public/assets/                 Images
```

## Curriculum data

All course data comes from the **FCSIT Undergraduate Programme Handbook, session 2025/2026**. It lives in `src/data/` as typed files, so there is no database to run.

- **Programmes** link to their faculty core, programme core and elective courses. Five programmes share an 11-course core and each adds 3 core courses of its own. Data Science has its own core and faculty electives.
- **Courses** store code, name, credits and topic labels (one primary label, up to two secondary).
- **Labels** group courses by topic. There are 13 subject labels and 2 general ones.

| Kind    | Labels                                                                                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Subject | AI & ML, Programming, Math & Stats, Data & Analytics, Databases, Software Engineering, Web & Mobile, Networking, Cybersecurity, Systems & Hardware, Graphics, Media & Games, Design & UX, Business & IS |
| General | Projects & Industry, University & Soft Skills                                                                                                                                                           |

General labels cover courses every programme takes, such as industrial training and university courses. The topic breakdown leaves them out so the differences between programmes stay visible.

To change a course's topic, edit its `primary` or `secondary` label in `src/data/courses.ts`. Every chart updates automatically, and the tests in `src/lib/programme-profile.test.ts` check that the data stays consistent.

## Development notes

- **Keep secrets on the server.** `src/lib/env.ts` and `src/lib/ai/*` import `server-only`, so importing them from a client component fails the build. Call Gemini only from route handlers or server components. Never commit `.env.local`.
- **Write `backdrop-filter` unprefixed.** The build adds the `-webkit-` prefix itself. A hand-written `-webkit-` copy makes the minifier drop the standard property, which turns the blur off in Chrome.
- **Read Next.js 16 docs from the package.** This version differs from older Next.js. Check `node_modules/next/dist/docs/` before using a routing or caching API (see `AGENTS.md`).
- **If a style change doesn't show up** in `npm run dev`, save `src/app/globals.css` again or restart the dev server. Production builds are not affected.

## Deploying to Vercel

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the repo. The Next.js preset is detected automatically.
3. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` and `GEMINI_MODEL` for **Production** and **Preview**.
4. Deploy. After that, every push to `main` deploys to production, and every pull request gets its own preview URL.

## Roadmap

- [x] Project setup, design system and navigation
- [x] Curriculum data model, course data and topic labels
- [x] Programme Explorer: overview and interactive topic breakdown
- [ ] Programme Explorer: year-by-year study plan
- [ ] Career Insights
- [ ] Senior Insights
- [ ] Programme Match Quiz with AI explanation
