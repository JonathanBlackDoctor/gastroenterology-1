---
name: study-cycle
description: Import and update a course timetable from Excel, preserve immutable class-session numbers across schedule changes, connect lecture-note groups to NotebookLM and study materials, and maintain the private progress/notification workflow. Use when starting a new course block, receiving a revised timetable, detecting new lecture PDFs, generating pre-class or post-class briefs, or catching up NotebookLM artifacts.
---

# Study Cycle

Use this workflow for one course block at a time. Treat session sequence numbers as permanent identities and dates/times as mutable schedule fields.

## Workflow

1. Locate the newest official timetable workbook and the prior private `courses/current.json`, if one exists.
2. Run `scripts/import_timetable.py`. For a revision, always pass `--previous`; never rebuild numbering from row order.
3. Review every session with `status: review`. Do not guess ambiguous matches.
4. Check the lecture-material source for newly uploaded or changed PDFs. One PDF/source group becomes one NotebookLM notebook, even when it spans several sessions.
5. For a next-day session still missing a current-year PDF at 23:00, consult the private `sources/legacy-materials.json` catalog and include the matched previous-year candidate (or `not found`) in the Telegram alert. Never expose the raw Drive URL in message text.
6. At 01:00 Asia/Seoul, if the current-year PDF is still missing and the user has not explicitly put the candidate on hold, activate the eligible previous-year candidate in `automation/legacy-fallbacks.json` and use it for briefs and NotebookLM catch-up. A later current-year upload always supersedes the fallback.
7. Generate the three archived briefs described in `references/prompts.md`: warm-up, immediate recall, and note-organization guide. Clearly label briefs grounded in a previous-year fallback until a current-year note replaces it.
8. In NotebookLM, name each notebook `<first>~<last>. <title>(<professor>)` or `<number>. <title>(<professor>)`. Create standard-count, standard-difficulty flashcards plus one medium and one hard quiz, both with the highest available question count.
9. Save private manifest/material updates, refresh the private site, and dispatch only the brief appropriate to the current schedule window.

## Timetable Rules

- On the first import, number matching course rows in chronological workbook order, excluding examinations.
- On later imports, preserve prior `sequence` and `id` values. Update only `scheduledAt`, room, online status, and change notes when the same class moved.
- Retain a missing prior session as `cancelled`; never reuse its number.
- Append genuinely new sessions after the previous maximum number.
- Match exact normalized title and professor first, then a conservative base-title match. When multiple candidates remain equally plausible, mark `review`.
- `originalScheduledAt` never changes after first assignment.

## Automation Boundaries

- Cloud tasks may read connected Drive files, generate text, update private data, and send ChatGPT/Telegram notifications.
- Consumer NotebookLM browser actions require an available signed-in Chrome session. Queue them and catch up when the PC is on.
- Never place timetable data, lecture PDFs, generated medical study content, authentication tokens, bot tokens, or private repository tokens in the public code repository.
- Medical summaries are study aids, not clinical decision support. Preserve uncertainty and do not invent claims absent from the lecture source.
- Treat previous-year notes as provisional. State the source year in generated artifacts, preserve any professor-change warning, and replace them when the current-year PDF arrives.

## Import Command

Use the bundled spreadsheet-capable Python runtime when available:

```powershell
python scripts/import_timetable.py timetable.xlsx --course "소화기(1)" --slug "gastroenterology-1" --sheet "의학1" --output private-data/course-manifest.json --previous private-data/course-manifest.json --materials private-data/materials.json --env-file .env.local
```

Omit `--previous` only for the initial baseline. Inspect the printed summary and review flags before publishing.
