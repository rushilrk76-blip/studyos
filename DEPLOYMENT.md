# StudyOS — Deployment Guide

Deploying StudyOS to [Vercel](https://vercel.com). Everything here is
beginner-friendly — no backend setup is required.

## What StudyOS is

A **local-first** Class 12 study platform. Student data is stored in the
browser's localStorage. There is:

- ✅ No authentication
- ✅ No backend API
- ✅ No database
- ✅ No environment secrets to manage

## Prerequisites

- [Node.js](https://nodejs.org/) 18.18 or later
- [Git](https://git-scm.com/)
- A (free) [Vercel account](https://vercel.com/signup)

## 1. Install dependencies

```bash
npm install
```

## 2. Run locally

```bash
npm run dev
```

Open **http://localhost:3000**.

## 3. Create a production build

```bash
npm run build
```

You should see all pages prerendered with no errors. If the build
succeeds locally, it will succeed on Vercel.

## 4. Test the production build locally

```bash
npm run start
```

Open **http://localhost:3000** and walk through the key pages to
confirm everything works exactly as it will in production.

## 5. Deploy to Vercel

### Option A — via the Vercel dashboard (easiest)

1. Push your code to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new).
3. Click **Import Project** → pick your repository.
4. Vercel auto-detects **Next.js** — don't change any settings.
5. Click **Deploy**.

### Option B — via the CLI

```bash
npm install -g vercel
vercel            # preview deployment
vercel --prod     # production deployment
```

## 6. Environment variables

**None are required.**

The `.env` file in this project contains `DATABASE_URL`, which is only
used by the internal `/api/health` route in development. You do **not**
need to configure this on Vercel — do not add any secrets.

## 7. How routing works (no special config needed)

StudyOS uses **Next.js App Router** with file-based routes. Every real
page exists as a static route:

```
/dashboard    /syllabus    /planner    /homework    /marks
/portfolio    /practice    /profile    /settings    /get-started
```

Vercel serves these directly at their URLs — opening
`yourdomain.com/dashboard` in a fresh tab works out of the box.
**No `vercel.json` is required.**

## 8. Security headers

`next.config.ts` adds basic security headers (`X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy`). These require no additional setup.

## 9. Important limitation

**Student data is stored locally in the browser.**

What this means for the student:

- Each device/browser has its own separate data
- Clearing browser data may remove progress
- Use **Settings → Data & Backup → Backup My StudyOS Data** regularly

## 10. Quality checks before deploy

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript
```

## 11. After deploying

Visit your live URL and walk through:

1. Landing → onboarding → dashboard
2. Settings → Data & Backup → create a backup
3. Clear data → restore the backup

If both work, you're done.
