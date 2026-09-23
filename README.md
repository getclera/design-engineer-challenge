# Design Engineer Challenge — the Review board

Clera introduces startups to candidates. Every week a hiring manager at one of our client companies signs in and opens **Review**, a queue of people we picked for their open roles. They decide on each one:

- **Request intro:** we reach out to the candidate and set up a first call.
- **Pass:** the candidate leaves the queue, and the reason trains what we send next.

The people using this screen are founders and hiring managers working through 20–60 candidates between meetings. Most decisions take a few seconds.

**This repo is our real interface.** The login page, the org dashboard shell, and the Review board are the production frontend code, copied out of our monorepo. They run against a mock API seeded with fictional data. What you see after `pnpm dev` is what our customers see.

## Getting started

```bash
pnpm install
pnpm dev        # http://localhost:3000 → redirects to the review board
pnpm typecheck
```

Node 22+. You won't need any accounts, env vars, or a database.

### Signing in

| Method | Signs you in as |
|---|---|
| Continue with Google / LinkedIn | Robin Keller (owner) |
| Continue with email → `robin@tidewater.example` | Robin Keller (owner), who can decide on candidates |
| Continue with email → `sam@tidewater.example` | Sam Ortiz (viewer), who is read-only; decisions return 403 |

The email code is always **`424242`**. Any other address gets "no account found". To sign out, use the profile menu at the bottom of the sidebar.

## The challenge

**Four hours, maximum.** Stop when the time is up, even mid-change, and write down what you'd do next. We'd rather see three screens with clear priorities than one polished corner.

Build the hiring manager's side of Clera as three screens, on top of the real code in this repo:

1. **Review. This matters most, so spend most of your time here.** Redesign and rebuild the review experience so a hiring manager can go through 40 candidates quickly and safely. It already works; make it clearly better. Places we'd look:
   - **The decide-next loop.** `↵` requests an intro, `⌫` passes, and there's a follow-up "similar candidates" step after an intro. How fast and safe does it feel over 40 candidates, and over a flaky network?
   - **Signal first.** Do the card and the detail pane show what a hiring manager needs in the first two seconds?
   - **The messy data** (see below). The current UI handles some of it well and some of it badly.
   - **States:** loading, empty (one role has nobody waiting, and one is paused), errors, viewer permissions, and mobile.
2. **Dashboard: your own, from scratch.** This is the sidebar's **Home**, at `/organization/[orgId]`, and it doesn't exist yet. Design a clear landing screen that answers "what needs me this week?", using the data the mock API already has (review queue and counts per role, roles, pipeline numbers on roles). Link into Review wherever it helps.
3. **Settings.** This is the sidebar's **Settings**, at `/organization/[orgId]/settings/company`, and it doesn't exist yet either. Build a settings screen for the company: at least the company profile and the team (`GET …/members` already returns owners and viewers). Add mock endpoints under `app/api/` and data under `mock/` for anything else you want to show or save.

Refactor, restyle, or replace components as you see fit. Our design system (`src/components/`, the `v2-*` tokens) is there to use, extend, or deliberately move beyond. Say which you did and why.

### How to work

- **Commit and push directly to this repository** as you go. Make small, frequent commits with messages that say why, and don't squash. We read the history as part of the review: it shows how you prioritised and where the time went.
- Put your first commit within the first 15 minutes. It should be `NOTES.md` with a short critique of the current review screen (what's working, what isn't, what you'll change first) and your plan for the four hours.
- Your last commit updates `NOTES.md` with what you shipped, what you cut, and what you'd do next.

## How the repo is laid out

| Path | What it is |
|---|---|
| `app/(main)/login`, `app/(main)/organization/[orgId]/…` | Real routes: login, org shell, review page |
| `src/features/org-review/` | The review board (start here) |
| `src/features/org-shared-cards/`, `org-shared-modals/`, `talent-profile/` | Card, decision panel, profile pane |
| `src/components/`, `src/styles/v2-globals.css` | Our design system: primitives and tokens (`v2-*`) |
| `packages/` | Shared helpers vendored from our monorepo |
| `mock/` | **Fictional data** and the in-memory decision store |
| `app/api/**` | **Mock API** at the same URLs production uses |
| `stubs/` | Stand-ins for backend-only types and services; you shouldn't need to touch these |
| `src/features/auth/use-auth-flow.ts` | Mock sign-in that replaces our auth provider behind the real login UI |

The API behaves like a real network on purpose: responses take **250–1500 ms**, and **about 1 in 10 decisions fails** with a 500. Decisions are stored in memory and reset when the dev server restarts. Unmocked endpoints return 404 and log `[mock-api]` in the terminal. Home and Settings in the sidebar point at the pages you'll build. Pipeline and Roles go to pages that aren't part of this challenge.

## The data is messy, on purpose

Everything in `mock/` is fictional, and it was modelled on what our production data really looks like:

- **Missing fields:** no avatar, no one-liner, no headline, no school, no received date, and no role at all (a candidate not tied to a role, so the intro needs a role picker).
- **`fitReason` in many formats:** a labelled multi-line pitch, a single sentence (our hook extractor returns nothing for it), literal `\n` escapes, Slack markup, a numbered list, a paragraph far too long, and `null`.
- **Strings of every length:** a 68-character name, a one-word name, Chinese script, diacritics, emoji-heavy headlines, and a one-liner that doesn't fit.
- **Company chips:** zero, eight (including the same company twice), a missing logo, a logo URL that 404s, and an 83-character company name.
- **The same person under two roles.**
- **Counts that don't match the list:** the feed is paged (`truncated`, `totalCount`), and `byRole` / `pausedPending` count people who aren't in `items`.
- **Time:** received 5 minutes ago, 400 days ago, in the future (clock skew), or never.
- **Profiles:** no experience at all, 15 roles over 20 years, overlapping current jobs, missing dates, `yearsExperience: 0`, malformed links, and one profile that returns 404.
- **Roles:** the ML role's hiring manager has no calendar link, so an intro there hits the hiring-manager gate. One role is paused, and one has nobody waiting.

## What we expect at the end

- Your commits pushed to this repository, with the history intact.
- Working **Review**, **Dashboard**, and **Settings** screens, all reachable from the sidebar.
- `NOTES.md` with your critique, your plan, what you shipped, what you cut, and anything you'd push back on in this brief.
- Optional: a 3–5 minute screen recording walking through it.

## How we'll look at it

- **Judgement:** did the review screen get most of the time, and did you find the changes that matter most for a hiring manager?
- **Clarity:** does the dashboard tell a hiring manager what needs them, and is settings straightforward?
- **Craft:** hierarchy, typography, spacing, motion that helps rather than decorates, and consistency with (or a deliberate evolution of) our design system.
- **Interaction:** how fast and safe the decide-next loop feels, including when the network misbehaves.
- **Robustness:** how the messy data is handled.
- **Code:** clear components and sensible state, working with the codebase rather than around it.

This repository contains Clera's proprietary source code and is shared with you only for this challenge. Please don't publish it or reuse it elsewhere.
