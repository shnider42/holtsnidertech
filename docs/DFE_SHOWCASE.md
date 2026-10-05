# Daily Flyer Engine showcase

This is a website presentation change, not a DFE branch merge or repository cleanup.
The website changes belong to `shnider42/holtsnidertech`, branch
`feat/site-flow-clarity`. Do not merge or delete DFE branches as part of this pass.

## Customer-facing source of truth

`app/static/js/boston-visible-work-cards.js` owns the example catalogue for both
`new-build` and `improve-existing` in **Build or Improve**. The six previous
examples remain, and the five requested DFE builds are added. Irish Today remains
first. Grepper's demo implementation, the separate Experience & Work portfolio,
and all contact/resume behavior are outside this change.

`app/static/css/dfe-project-showcase.css` is loaded by the canonical homepage.
Its rules are scoped to the enhanced example grid. Cards use four columns on
large screens, adapt to the available space on smaller screens, and become one
column on phones. Text is never line-clamped. Native details/summary elements
provide keyboard-accessible overviews for projects without a verified destination.

## Branch provenance checked on 2026-10-05

All of the following source branches are in `shnider42/daily_flyer`. These are
verified remote branch references, **not confirmation of Render's deployed
branch or currently running commit**.

| Showcase entry | Source branch | Observed HEAD | Presentation/link status |
| --- | --- | --- | --- |
| Garage Journey | `agent/garage-recovery` | `94709698c8e614c1f53a94d4a47cef07c9441e14` | Expandable overview; no public URL verified for this pass. |
| DSL | `feat/ww2-tactics` | `fe2fbb8c2cc1ce5dea8640c2a4885b5422841b68` | Expandable overview; deployed branch needs confirmation. |
| Bug Tracker / Infierno Liberado | `feature/hllv-bug-evidence-tracker` | `489ebb5a3c865df69e8cba230c32752719c8c6bb` | Retains the user-established `https://hllv-bug-track.onrender.com/` address; current availability was not verified. |
| Soph(more) Slump(?) | `feat/qb-year-two-explorer` | `ef532d855269decba7a40bbd49b0ea59abe4e68f` | Expandable overview; no public URL verified for this pass. |
| Galaxy Granite | `agent/galaxy-granite-daily` | `3bd28bdeb2c88949f098b018c1af5a06cd1f60a6` | Expandable prototype overview; DFE draft PR #21 describes the implementation. |

### Related branches that must not be confused with the above

- Garage's older `agent/e46-owner-companion` still exists at
  `22915eb0de3e62ff31ff8a5d3928a7e16cfc7848`; the recovery branch is the working
  context for the multi-vehicle and guitar work. Do not fall back to the older
  branch simply because its name looks familiar.
- DSL also has `agent/dsl-move-pipeline-20261002` at
  `5860525109024ebf807cce6ec8a0965620af9017`, and
  `agent/dsl-three-theaters-20261003` at
  `b407230998b49074321e596859b989ab1c838e7c`.
  Their existence does not establish which branch currently serves active games.

### Link verification boundary

Render service discovery returned "no workspace selected". No workspace was
selected implicitly, and no services or deployments were changed. Public URL
checks were unsuccessful in this environment. Do not invent URLs from branch
names or mark these projects as verified live. Four entries therefore show an
honest **About this build** overview instead of a fake "Open site" link.

Existing Irish Today, Your Passage, Loudsource, Jiporady, Career Compass, and
Grepper destinations are preserved. The bug tracker's known URL is added without
claiming that its data is live, continuously refreshed, or exhaustively verified.
The sports explorer is described as historical data, not a live feed. Galaxy
Granite is a prototype, not a claim of a deployed client site or commercial result.

## Updating an entry

1. Confirm its source branch and intended public deployment separately.
2. Edit the existing catalogue entry; do not add a second copy in `boston-site.js`.
3. Supply `href` and a truthful action label only after confirming the destination.
   An absent `href` intentionally uses `details` as an overview, not a disabled link.
4. Keep repository names and branch labels in this document rather than in customer
   cards. Update the browser tests when adding or removing an entry.

The grid is marked before it is rewritten, and the observer does not watch
attributes. Unrelated page mutations must not rebuild cards, close overviews,
lose keyboard focus, duplicate the intro, or reset contact fields.

## Validation

- `node --check app/static/js/boston-visible-work-cards.js`
- `python -m pytest -q` runs the existing site suite plus
  `tests/test_project_showcase_browser.py` against the real Flask homepage in CI.
- The new browser coverage checks both Build/Improve choices, preservation of
  existing destinations, external-link safety, native overview interaction,
  observer idempotence, small-screen overflow, and dark/light screenshots.
- Also review the actual preview deployment before merging to staging; isolated
  component checks are not a substitute for a complete site regression run.
