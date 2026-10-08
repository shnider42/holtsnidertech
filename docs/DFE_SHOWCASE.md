# Daily Flyer Engine showcase

## Current presentation

The simple homepage at `/` features three examples: Galaxy Granite, Garage
Journey, and Grepper. `/projects` contains all 11 examples, Irish Today first.
The original Boston experience is retained at `/guided`; both Build/Improve
paths still show the complete collection. No DFE application is merged into
this website. The website remains on `feat/site-flow-clarity`.

The shared source of truth is now **`app/static/data/project-catalogue.json`**.
`app/showcase.py` loads that local data for the server-rendered pages. The guided
page embeds the same data as escaped JSON for `boston-visible-work-cards.js`.
There is no network dependency when loading the catalogue and no second URL list
in the new gallery. `plain_body`, `outcome`, and optional `technical` paragraphs
support a readable introduction without losing engineering explanations.
The guided card CSS and the Grepper demo implementation are unchanged.

## Deployment map — verified on 2026-10-05

These are historical observations from the authorized inspection of Render's
**My Workspace**, not a claim that branch heads or deployments never change.
All five applications are in `shnider42/daily_flyer`.

| Project | Render service | Configured branch | Observed live commit |
| --- | --- | --- | --- |
| Garage Journey | `jbmw` | `agent/garage-recovery` | `94709698c8e614c1f53a94d4a47cef07c9441e14` |
| DSL | `sl-jake` | `feat/ww2-tactics` | `49b750d133b3be81fd4a64ecbcb4bf5b2b63c3bb` |
| Bug Tracker | `hllv-bug-track` | `feature/hllv-bug-evidence-tracker` | `489ebb5a3c865df69e8cba230c32752719c8c6bb` |
| Soph Slump | `soph-slump` | `feat/qb-year-two-explorer` | `ef532d855269decba7a40bbd49b0ea59abe4e68f` |
| Galaxy Granite | `galgran` | `agent/galaxy-granite-daily` | `3bd28bdeb2c88949f098b018c1af5a06cd1f60a6` |

| Project | Destination | Routing reason |
| --- | --- | --- |
| Garage Journey | `https://jbmw.onrender.com/?theme=garage_journey` | Stable alias, not a pinned version or assumed DEFAULT_THEME. |
| DSL | `https://sl-jake.onrender.com/` | Opens the lobby, not a saved match. |
| Bug Tracker | `https://hllv-bug-track.onrender.com/` | Static tracker directory. |
| Soph Slump | `https://soph-slump.onrender.com/?theme=qb_year_two` | Explicit football entry; sport navigation remains inside the app. |
| Galaxy Granite | `https://galgran.onrender.com/?theme=galaxy_granite_daily` | Explicit journal prototype. |

Garage's auto-deploy was off. Its older `agent/e46-owner-companion` branch is not
its deployment source. DSL's `agent/dsl-move-pipeline-20261002` and
`agent/dsl-three-theaters-20261003` are separate experimental branches, not the
observed deployment source. Do not redeploy any of these merely to edit a link.

## Verification and boundaries

The external-link workflow reads the shared JSON catalogue, performs bounded
GET-only checks, requires HTTP 200 and expected page identity, rejects off-host
redirects, and uploads a timestamped report. It does not run game JavaScript,
join a match, submit a form, use Render credentials, or poll on a schedule.
The five destinations passed this check in the original link pass; inspect the
current workflow result before making a new availability claim.

The Flask/browser suite separately checks exact link parity across the homepage,
gallery and guided experience, keyboard interaction, and responsive layout.
External destinations in browser tests are intercepted; app data freshness and
complete app behavior are not established by a website test. Existing Irish
Today, Your Passage, Loudsource, Jiporady, Career Compass, and Grepper destinations
are preserved, not newly certified. Galaxy Granite is a prototype, not an
endorsement or evidence of measured commercial results.

To update a project, change its one JSON record and matching expectations in the
tests. Keep repo/branch/deployment notes here rather than on the visitor's first
screen. A future unpublished entry can omit `href` and use the accessible
About this build fallback. See `CLIENT_FIRST.md` for page architecture and scope.
