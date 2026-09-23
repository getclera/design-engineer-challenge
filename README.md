# Design Engineering Challenge — the Review board

Clera introduces startups to candidates. Every week a hiring manager at one of our client companies opens **Review**, a queue of people we picked for their open roles, and decides on each one:

- **Request intro:** we reach out to the candidate and set up a first call.
- **Pass:** the candidate leaves the queue, and the reason trains what we send next.

The people using this screen are founders and hiring managers going through 20–60 candidates between meetings. Most decisions take a few seconds. A good board makes those seconds count: it shows the right signal first, makes the decision one keystroke away, and never loses their place.

This repo contains a working but rough version of that board, on top of a mock API with realistic data. Your job is to make it great.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck
```

Node 22+. You won't need any accounts, env vars, or a database.

## Signing in

The app is behind a mock login. The password for both accounts is `review-demo`:

| Email | Role |
|---|---|
| `robin@tidewater.example` | owner, who can decide on candidates |
| `sam@tidewater.example` | viewer, who is read-only (actions return 403) |

## The task

Redesign and rebuild the review board. Plan for about **4–6 hours**. We care much more about depth on the core loop than about coverage.

It should include:

1. **List + detail.** Scan the queue, open a candidate, and see why we think they fit.
2. **Decide.** Request an intro or pass, with an optional reason (the categories are in `src/lib/categories.ts`).
3. **Keyboard flow.** `↵` requests the intro, `⌫` passes, `↑`/`↓` move through the queue. The next candidate should be ready when you land on it.
4. **Undo.** Mistakes happen at this speed.
5. **Real-world states:** loading, empty (one role has nobody waiting, and one is paused), errors, and slow responses.
6. **Mobile.** Hiring managers review on their phones too.
7. **Sign-in and roles.** The login page is part of the redesign, and viewers need a read-only board that makes sense.

Choose your own stack inside the Next.js app. Any component or animation library is fine; tell us why you picked it. Anything you don't have time for, write down in `NOTES.md`.

## The mock API

| Endpoint | What it does |
|---|---|
| `POST /api/auth/login` | `{ email, password }`, which sets the session cookie. Wrong credentials return 401 |
| `POST /api/auth/logout` | Clears the session |
| `GET /api/me` | The signed-in user (`name`, `email`, `companyName`, `role`) |
| `GET /api/roles` | The company's roles, some `open` and one `paused` |
| `GET /api/review?roleId=` | The review feed (`ReviewListData`). Omit `roleId` for all roles |
| `GET /api/talents/:talentId` | Full candidate profile (`TalentProfile`) |
| `POST /api/review/actions` | `{ talentId, jobId, action: "request_intro" \| "pass", noFitCategories?, interestCompanyCategory?, text? }` |
| `DELETE /api/review/actions` | `{ talentId, jobId }`, which undoes a decision |

Types live in `src/types.ts` and the data in `src/data/`. Every endpoint except login returns 401 when you're signed out. Decisions are stored in memory and reset when the dev server restarts.

The API behaves like a real network on purpose: responses take **300–1500 ms**, and **about 1 in 10 actions fails** with a 500.

## The data is messy, on purpose

The feed was modelled on what our production data looks like, not on a design mock. Some things you'll run into:

- **Missing fields:** no avatar, no one-liner, no headline, no school, no received date, no role at all (a candidate who isn't tied to one role yet).
- **`fitReason` in many formats:** a labelled multi-line pitch, a single sentence, literal `\n` escapes, Slack markup (`*bold*`, `<url|label>`), a numbered list, a paragraph far too long for a card, and `null`. `src/lib/fit-reason.ts` has the helper we use in production to pull out a short "hook". It is deliberately conservative: it returns `null` for single-line reasons. Use it, change it, or replace it, and tell us why.
- **Strings of every length:** a 68-character name, a one-word name, non-Latin script, diacritics, emoji-heavy headlines, one-liners that don't fit, and a company name longer than most sentences.
- **Company chips:** zero companies, eight companies (including the same company twice), a missing logo, and a logo URL that 404s.
- **The same person under two roles.** A candidate is identified by talent *and* role (`reviewItemKey` in `src/lib/categories.ts`).
- **Counts that don't match the list:** the feed is paged (`truncated`, `totalCount`), and `byRole` / `pausedPending` include people who aren't in `items`.
- **Time:** received 5 minutes ago, 400 days ago, in the future (clock skew), or never.
- **Profiles:** no experience at all, 15 roles over 20 years, overlapping current jobs, missing dates, `yearsExperience: 0`, malformed links, and one profile that returns 404.

The current UI gets most of these wrong. That's part of the brief.

## What to send back

- A link to your fork or a zip, with your commits intact. We read the history.
- `NOTES.md` covering the decisions you made, what you'd do with another day, and anything you'd push back on in this brief.
- Optional: a 3–5 minute screen recording walking through it.

## How we'll look at it

- **Craft:** hierarchy, typography, spacing, motion that helps rather than decorates.
- **Interaction:** how fast and safe the decide-next loop feels, including when the network misbehaves.
- **Robustness:** how the messy data above is handled.
- **Code:** clear components, sensible state, nothing clever for its own sake.
- **Accessibility:** keyboard, focus, contrast, screen-reader labels.

Everything in `src/data/` is fictional. Any resemblance to real people or companies is accidental.
