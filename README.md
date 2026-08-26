# Holtsnider Tech

Holtsnider Tech is a small Flask site for Chris Holtsnider's public technical consulting / portfolio presence.

The visual direction is **Boston Practical**: a strong, distinctive first screen wrapped around a simple question — *why are you here, and what is the most useful next step?*

The site is no longer a style lab. It is a customer-facing decision path, credibility surface, and portfolio.

## Current homepage flow

The first screen uses four visitor intents:

1. **Fix a Problem** — something is broken, unreliable, confusing, recurring, or wasting time.
2. **Build or Improve** — there is a new idea, workflow, site, tool, process, or existing thing worth improving.
3. **Experience & Work** — the visitor wants engineering background, public projects, enterprise systems context, or role-fit information.
4. **Not Sure Yet** — the visitor knows something needs attention but does not yet know the technical category.

The paths intentionally behave differently:

- **Fix a Problem** and **Build or Improve** use a short guided flow to narrow context.
- **Experience & Work** skips intake and opens the browseable credibility / portfolio path directly.
- **Not Sure Yet** goes straight into discovery rather than asking the visitor to classify the problem first.

The final contact behavior is deliberately low-friction: visitors can email immediately, or optionally add context that is carried into the generated email draft.

## Public positioning

The plain-English positioning is:

> Technical problem solving + project building.

The homepage reinforces that with:

> I help untangle technical problems, improve systems and workflows, and turn rough ideas into working projects.

This language should stay understandable to a cold visitor. Internal terms such as *Solutions Engineering* or *Opportunity Engineering* can still describe the work, but they should not be required vocabulary for navigating the site.

## Tech stack

- Python 3.12 on Render
- Flask
- Gunicorn
- Jinja templates
- Static CSS / JavaScript

## Branch workflow

The intended release flow is:

```text
feat/* -> staging -> master -> Render production
```

- `master` is the production baseline and should be what Render production tracks.
- `staging` is the integration / pre-production branch.
- Feature branches should normally start from current `staging`.
- Changes should not reach `master` until they have been reviewed on `staging`.

`LIVE_CHECKLIST.md` contains the manual journey and deployment checks to run before promotion.

## Project structure

```text
.
├── app.py                         # Local debug entry point
├── run.py                         # Render/Gunicorn entry point
├── requirements.txt               # Runtime dependencies
├── requirements-dev.txt           # Runtime + test dependencies
├── render.yaml                    # Render deployment config
├── Procfile                       # Alternative process declaration
├── LIVE_CHECKLIST.md              # Manual UX / release verification
├── app/
│   ├── __init__.py                # Flask app factory and security headers
│   ├── routes.py                  # Canonical routes, sitemap, and legacy redirects
│   ├── templates/
│   │   ├── base.html
│   │   ├── home.html              # Canonical homepage + public metadata
│   │   ├── privacy.html
│   │   └── style_variants/
│   │       └── boston_practical.html  # Active large Boston Practical implementation
│   └── static/
│       ├── css/
│       │   └── site-flow-clarity.css  # Final UX/polish layer for the active flow
│       ├── js/
│       │   ├── boston-site.js         # Core guided-flow implementation
│       │   └── site-flow-clarity.js   # Current customer-facing flow normalization
│       ├── demos/                 # Public static project demos
│       └── html/                  # Project detail / supporting fragments
└── tests/
    └── test_routes.py             # Route, asset, metadata, sitemap smoke tests
```

## Local setup

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install development dependencies:

```powershell
pip install -r requirements-dev.txt
```

Run tests:

```powershell
pytest
```

Run locally:

```powershell
python run.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Current automated checks

The route tests cover that:

- `/` renders the canonical homepage
- the current Boston + flow-clarity assets are loaded
- the removed legacy `site.js` is not loaded
- public title / sharing metadata exists
- legacy `/style-lab` URLs redirect home instead of breaking
- the sitemap includes the intentionally public local demos
- `/healthz` returns the expected service status

The JavaScript-heavy visitor journeys still require the manual checks in `LIVE_CHECKLIST.md`.

## Deployment

Render uses `render.yaml`:

```yaml
buildCommand: pip install -r requirements.txt
startCommand: gunicorn run:app
```

`run.py` exposes the Flask app as `app`, which is what Gunicorn imports.

Production should track `master`.

## Architecture note

The active homepage still has some history in it. `style_variants/boston_practical.html` contains the large underlying layout, while `boston-site.js` performs much of the original runtime flow construction. The current clarity pass is intentionally isolated in `site-flow-clarity.js` and `site-flow-clarity.css` so the customer experience can be improved without destabilizing the known-good visual system.

That is a transition state, not the ideal final architecture.

## Cleanup direction

Once the revised customer flow is visually approved, the repo should move toward:

- flattening `style_variants/boston_practical.html` into the canonical homepage structure
- moving stable customer-facing copy out of runtime JavaScript and into Jinja/HTML
- merging the proven clarity behavior into the core flow instead of maintaining multiple behavior generations
- removing obsolete CSS/JS layers only after confirming they are no longer carrying needed visual behavior
- keeping public demos intentionally linked from the homepage and sitemap
- preserving small automated route/asset tests plus the manual journey checklist

The order matters: **prove the customer experience first, then simplify the implementation underneath it.**
