# PathFinder FCSIT

A web app that helps students choose the best-fit bachelor programme in the Faculty of Computer Science and Information Technology (FCSIT), Universiti Malaya.

- **Programme Explorer**: intro, fees, duration, Year 1 → final year pathway, core and elective courses
- **Career Insights**: job roles, key skills, industry demand
- **Programme Match Quiz**: rule-based scoring ranks the programmes, and Gemini AI explains the result
- **Senior Insights**: real tips from seniors

Programmes: Artificial Intelligence, Computer System and Network, Information Systems, Multimedia, Software Engineering, Data Science.

## Tech stack

| Area      | Choice                                               |
| --------- | ---------------------------------------------------- |
| Framework | Next.js (App Router) + React + TypeScript            |
| Styling   | Tailwind CSS v4 + shadcn/ui                          |
| AI        | Google Gemini via `@google/genai` (server-side only) |
| Data      | Static typed files in `src/data/` (**no database**)  |
| Quality   | ESLint, Prettier, Vitest + Testing Library           |
| Hosting   | Vercel (auto-deploy from GitHub)                     |

## Getting started

Prerequisites: **Node.js 22+** (24 recommended, see `.nvmrc`) and **npm**.

```bash
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env.local   # Windows PowerShell: Copy-Item .env.example .env.local
```

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) and paste it into `.env.local` as `GEMINI_API_KEY`. The app still runs without a key. Only the AI explanation needs it.

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command                | What it does                      |
| ---------------------- | --------------------------------- |
| `npm run dev`          | Start the dev server              |
| `npm run build`        | Production build (same as Vercel) |
| `npm run start`        | Serve the production build        |
| `npm run lint`         | ESLint                            |
| `npm run typecheck`    | TypeScript type check             |
| `npm run format`       | Format all files with Prettier    |
| `npm run format:check` | Check formatting (no changes)     |
| `npm test`             | Run unit tests once               |
| `npm run test:watch`   | Run tests in watch mode           |

Before pushing, run: `npm run lint && npm run typecheck && npm test && npm run build`

## Project structure

```
src/
  app/             Routes (pages, layouts, API route handlers)
  components/
    ui/            shadcn/ui primitives (add more with `npx shadcn@latest add <name>`)
  data/            Static content: programmes, careers, senior insights, quiz questions and weights
  lib/
    ai/gemini.ts   Server-only Gemini client
    env.ts         Server-only env var validation
    utils.ts       `cn()` class name helper
  types/           Shared TypeScript types
public/            Images and logos
```

**Rules**

- Never import `src/lib/env.ts` or `src/lib/ai/*` from a client component. They import `server-only`, so the build fails if you try. Call Gemini only from route handlers or server components.
- Never commit `.env.local` or API keys.

## Deploying to Vercel

1. Push the repo to GitHub.
2. On [vercel.com](https://vercel.com), go to **Add New → Project**, then import the GitHub repo. The Next.js preset is detected automatically.
3. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` and `GEMINI_MODEL` for **Production** and **Preview**.
4. Deploy. After that, every push to `main` deploys to production, and every pull request gets its own preview URL.
