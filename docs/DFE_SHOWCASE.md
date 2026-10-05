# Daily Flyer Engine showcase

This is a website presentation/link change, not a DFE branch merge or repository
cleanup. The website changes belong to `shnider42/holtsnidertech`, branch
`feat/site-flow-clarity`. Do not merge or delete DFE branches as part of this pass.

## Customer-facing source of truth

`app/static/js/boston-visible-work-cards.js` owns the example catalogue for both
`new-build` and `improve-existing` in **Build or Improve**. All 11 examples remain
in their existing order, with Irish Today first. The five newer DFE builds now
have direct links; the six older destinations are unchanged. Grepper's demo,
the separate Experience & Work portfolio, and contact/resume behavior are outside
this change. Galaxy Granite remains explicitly described as a prototype.

`app/static/css/dfe-project-showcase.css` is unchanged in the link pass. Its compact
responsive cards retain four columns on large screens and one column on phones.
The native details/summary fallback remains available for a future catalogue
entry without a public destination; no current card is overview-only.

## Render deployment mapping checked on 2026-10-05

The user authorized read-only inspection of **My Workspace**. Service metadata
and the latest live deploys were read from Render, not inferred from branch names.
All five services below belong to `shnider42/daily_flyer` and were not suspended.
The commit column records the **deployed commit**, not an assumption about the
latest remote branch HEAD. Deployments can advance independently of this note.

| Showcase entry | Render service | Configured branch | Live deployed commit |
| --- | --- | --- | --- |
| Garage Journey | `jbmw` | `agent/garage-recovery` | `94709698c8e614c1f53a94d4a47cef07c9441e14` |
| DSL | `sl-jake` | `feat/ww2-tactics` | `49b750d133b3be81fd4a64ecbcb4bf5b2b63c3bb` |
| Bug Tracker / Infierno Liberado | `hllv-bug-track` | `feature/hllv-bug-evidence-tracker` | `489ebb5a3c865df69e8cba230c32752719c8c6bb` |
| Soph(more) Slump(?) | `soph-slump` | `feat/qb-year-two-explorer` | `ef532d855269decba7a40bbd49b0ea59abe4e68f` |
| Galaxy Granite | `galgran` | `agent/galaxy-granite-daily` | `3bd28bdeb2c88949f098b018c1af5a06cd1f60a6` |

### Destinations and route checks

| Entry | Public destination | Reason for this route |
| --- | --- | --- |
| Garage Journey | `https://jbmw.onrender.com/?theme=garage_journey` | Deployed `web.py` maps the stable `garage_journey` alias to `garage_journey_v18`, including the Cars/Guitars switch. Avoid a version-pinned route or dependence on `DEFAULT_THEME`. |
| DSL | `https://sl-jake.onrender.com/` | Deployed `ww2_web.py` serves the static game lobby at `/`. No match code, join request, or order is embedded. |
| Bug Tracker | `https://hllv-bug-track.onrender.com/` | Render publishes the `hllv_tracker` directory as a static site. |
| Soph(more) Slump(?) | `https://soph-slump.onrender.com/?theme=qb_year_two` | Explicit football entry point; deployed `daily_flyer/year_two_sports.py` links the football, baseball, and bowling themes through the same sport switch. |
| Galaxy Granite | `https://galgran.onrender.com/?theme=galaxy_granite_daily` | Explicit theme supported by the deployed Flask theme route and the Galaxy Granite implementation described in DFE PR #21. |

These explicit theme URLs prevent an unrelated default DFE theme from being
shown if a service's `DEFAULT_THEME` configuration differs. External project
cards use `target="_blank"` and `rel="noopener noreferrer"`.

### Deployment boundaries

- Garage auto-deploy is **off**. Its live deploy was manual. Do not enable it or
  redeploy it merely to add a portfolio link.
- DSL's live service is on `feat/ww2-tactics`, not either of the experimental
  `agent/dsl-move-pipeline-20261002` or `agent/dsl-three-theaters-20261003` branches.
- Garage's older `agent/e46-owner-companion` is not the deployment source.
- The website preview `holtsnidertech-exp` tracks `feat/site-flow-clarity` with
  auto-deploy enabled. Production `holtsnidertech` tracks `master` with auto-deploy
  disabled. No service configuration, production deploy, DFE code, or saved game
  was changed for this link pass.

### Verification scope

The initial direct public-page checks failed because the chat browsing tool
could not access these hosts and the container could not resolve their DNS.
That is not evidence that the apps are down. Render's `live` status confirms a
successful deployment, but does not alone prove that a particular page renders.

`.github/workflows/showcase-links.yml` therefore checks the five actual catalogue
URLs independently from GitHub's runner. It performs only bounded public GETs,
requires HTTP 200 plus HTML with project-specific text, disallows off-host or
non-HTTPS redirects, and uploads a timestamped JSON report. It never submits a
form, executes game JavaScript, creates/joins a match, or uses Render credentials.
Check the actual workflow result before describing the pages as HTTP-verified.
This check is separate from the deterministic site regression suite: a remote
outage should be distinguishable from a homepage code regression. No scheduled
polling or deployment action is added.

Page reachability is not a guarantee of complete application correctness, fresh
bug data, or a commercial endorsement. The sports app uses historical data;
Galaxy Granite is a hosted prototype rather than the company's official site.
Existing Irish Today, Your Passage, Loudsource, Jiporady, Career Compass, and
Grepper destinations are preserved by this pass, not newly certified.

## Updating an entry

1. Confirm the configured branch, live deployed commit, and intended public route
   separately. Never construct a Render hostname from a branch name.
2. Edit the catalogue entry in `boston-visible-work-cards.js`, not a second copy in
   `boston-site.js`. Update the expected browser-test URL and this mapping.
3. Keep a truthful action label. An absent `href` still uses a keyboard-accessible
   overview. Keep its `details` description for that fallback.
4. For a newly checked project, update the link-check workflow's allowed host and
   identity markers. It reads URLs from the actual JavaScript catalogue.

The grid is marked before it is rewritten; its observer does not watch attributes.
Unrelated page mutations must not rebuild cards, lose keyboard focus, duplicate
the intro, or reset contact fields.

## Validation

- `node --check app/static/js/boston-visible-work-cards.js`
- `python -m pytest -q` runs the full Flask site suite, including both visitor paths,
  exact destinations, safe new-tab keyboard activation with intercepted network
  requests, the unpublished-build fallback, input/focus retention, real text bounds,
  mobile layouts, and dark/light screenshots.
- `DFE public links` performs the separate real-network check described above.
- Review the preview deployment before merging to staging. No staging/master merge
  is part of this change.
