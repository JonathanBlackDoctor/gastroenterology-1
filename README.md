# 진도실 · Study Cycle Tracker

Private, ChatGPT-authenticated progress tracker for repeatable course blocks. The public repository contains only generic app and automation code; real timetables, lecture materials, generated study briefs, links, and secrets stay outside version control.

## What it tracks

Every class session has permanent numbering and repeatable counters for warm-up, immediate recall, lecture-note review, note organization, past questions, flashcards, medium quiz, and hard quiz. Schedule revisions update notification times without renumbering existing sessions.

## Local development

```powershell
npm install
npm run dev
```

The private course manifest is supplied through `COURSE_MANIFEST_JSON` in `.env.local`, or at runtime from a private GitHub repository with `GITHUB_DATA_TOKEN`, `GITHUB_DATA_REPOSITORY`, and optional `GITHUB_DATA_PATH`.

## Timetable import

Use the reusable skill under `.agents/skills/study-cycle`. Its importer reads `.xlsx` files, separates exams, preserves stable IDs across revisions, marks ambiguous matches for review, and can emit a local environment file.

## Durable state

Progress counts are stored in Cloudflare D1 and keyed by the authenticated ChatGPT user, course, session, and study item. The deployment remains private and requires ChatGPT sign-in.
