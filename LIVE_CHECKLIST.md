# Holtsnider Tech live checklist

Use this before merging a site-flow change into `staging`, and again before promoting `staging` to `master` / production.

## Branch flow

The intended branch model is:

```text
feat/* -> staging -> master -> Render production
```

- `master` is the production baseline.
- `staging` is the integration / pre-production branch.
- Feature work should start from current `staging` and merge back only after review.
- Render production should track `master`.

## Local smoke test

Switch to the branch being reviewed, then run:

```powershell
git pull origin <branch-name>
py -m pip install -r requirements-dev.txt
pytest
py -m flask --app app:create_app run --debug
```

Open and verify:

- http://127.0.0.1:5000/
- http://127.0.0.1:5000/static/demos/grepper.html
- http://127.0.0.1:5000/static/demos/loudsource-vote.html
- http://127.0.0.1:5000/static/demos/jiporady.html
- http://127.0.0.1:5000/healthz
- http://127.0.0.1:5000/robots.txt
- http://127.0.0.1:5000/sitemap.xml

## Homepage journey checks

### First screen

- Hero clearly explains what Holtsnider Tech does in plain English.
- The four starting choices are visible and understandable without prior context:
  - **Fix a Problem**
  - **Build or Improve**
  - **Experience & Work**
  - **Not Sure Yet**
- There is no redundant "default context" panel below the cards.
- Desktop header shows only useful shortcuts (`Experience & Work`, `Contact`).
- Mobile stays focused and does not inherit unnecessary desktop navigation.

### Fix a Problem

- Opens two useful choices: recent breakage vs recurring/systemic problem.
- A detail path shows representative examples.
- `Email Chris` is immediately available without completing a form.
- `Add context (optional)` reveals the questions.
- Entered context is included in the generated email draft.
- `Back to starting points` returns cleanly to the four-card view.

### Build or Improve

- Opens new-build vs improve-existing choices.
- Project examples open the intended live sites / demos.
- The contact action is available without completing optional fields.
- Optional context is carried into the email draft.

### Experience & Work

- Goes directly to browsing; it should not open another questionnaire.
- Engineering background reads as proof, not a keyword dump.
- The systems/technology strip moves only when the visitor scrolls, drags, or uses keyboard controls.
- `See public projects` scrolls to the public work section.
- Irish Today, Grepper, LoudSource, and Your Passage point to the intended destinations.
- `See professional work` continues naturally into the non-public experience section.
- LinkedIn opens correctly in a new tab.

### Not Sure Yet

- Skips any pointless one-option intermediary.
- Goes directly to the discovery detail.
- The copy makes it clear that the visitor does not need to know the technical category yet.
- Back navigation returns to the four starting choices instead of looping into discovery again.

### Contact

- Contact language explicitly says a polished brief is not required.
- Email links open with useful subjects / starter context.
- The final section works for project, role-fit, troubleshooting, and unclear inquiries.

## Visual and accessibility checks

- Dark and light themes remain readable.
- Card art does not obscure text.
- Focus indicators are visible with keyboard navigation.
- External project links are visually distinguishable and open as expected.
- Mobile cards stay readable without horizontal page overflow.
- Reduced-motion system preference does not create awkward animation behavior.
- Experience horizontal scrolling works with mouse/trackpad, drag, touch, and arrow keys where applicable.

## Public metadata checks

View page source and verify:

- Page title describes Holtsnider Tech rather than an internal style name.
- Canonical URL is `https://holtsnidertech.com/`.
- Open Graph title/description are present.
- Twitter summary metadata is present.

## Deployment checks

- `staging` contains only changes intended for the next release.
- `master` is unchanged until promotion is intentional.
- Render production is pointed at `master`.
- Latest intended `master` commit is deployed.
- Clear build cache only if assets look stale.
- Hard refresh after deployment.
- Verify https://holtsnidertech.com/ on desktop and mobile after deploy.
- Re-check `/healthz` after deploy.
