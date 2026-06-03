# Holtsnider Tech

Holtsnider Tech is a small Flask site for Chris Holtsnider's public technical consulting / portfolio presence.

The current direction is **Boston Practical**. The site is no longer being treated as a style lab. The homepage should guide visitors through a practical decision path so they can quickly choose why they are here and what kind of help they may need.

## Current site direction

The homepage is built around a flowchart-style first impression:

1. **Solve** — something is broken, unclear, inefficient, risky, or stuck.
2. **Launch an idea / Opportunity Engineering** — there is a project, workflow, automation idea, or prototype worth shaping.
3. **HT Experience** — the visitor wants background, credibility, visible work, resume context, or role-fit information.
4. **Start a discovery** — the visitor is not sure whether the issue is tooling, process, infrastructure, website, vendor confusion, or something else.

The intent is visual uniqueness without making the site confusing: strong Boston Practical styling, clear cards, practical copy, and fast paths to relevant proof/contact sections.

## Tech stack

- Python 3.12 on Render
- Flask
- Gunicorn
- Jinja templates
- Static CSS / JavaScript

## Project structure

```text
.
├── app.py                     # Local debug entry point
├── run.py                     # Render/Gunicorn entry point
├── requirements.txt           # Runtime dependencies
├── requirements-dev.txt       # Runtime + test dependencies
├── render.yaml                # Render deployment config
├── Procfile                   # Alternative process declaration
├── app/
│   ├── __init__.py            # Flask app factory and security headers
│   ├── routes.py              # Canonical routes and legacy redirects
│   ├── templates/
│   │   ├── base.html
│   │   ├── home.html          # Canonical homepage entry point
│   │   ├── privacy.html
│   │   └── style_variants/
│   │       └── boston_practical.html  # Active Boston Practical implementation
│   └── static/
│       ├── css/               # Site styling and Boston Practical polish layers
│       ├── js/                # Motion, scroll, and card behavior
│       ├── demos/             # Static project demos
│       └── html/              # Static injected fragments / project detail content
└── tests/
    └── test_routes.py         # Route smoke tests
```

## Local setup

Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install runtime dependencies:

```powershell
pip install -r requirements.txt
```

Run locally:

```powershell
python run.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Running tests

Install development dependencies:

```powershell
pip install -r requirements-dev.txt
```

Run the smoke tests:

```powershell
pytest
```

The current tests check that:

- `/` renders the canonical Boston Practical homepage
- legacy `/style-lab` URLs redirect home instead of breaking
- `/healthz` returns the expected service status

## Deployment

Render uses `render.yaml`:

```yaml
buildCommand: pip install -r requirements.txt
startCommand: gunicorn run:app
```

`run.py` exposes the Flask app as `app`, which is what Gunicorn imports.

## Cleanup direction

The repo should keep moving toward:

- one canonical homepage direction, not multiple style experiments
- less runtime copy rewriting in JavaScript
- reusable template sections where it reduces duplication
- small route tests before larger cleanup commits
- visual uniqueness centered on the path-picker / decision-flow concept

Good next cleanup candidates:

- flatten `style_variants/boston_practical.html` into `home.html` when it can be done safely as a proper file move
- move copy that is currently rewritten in `site.js` directly into the Jinja template in small patches
- split large CSS polish files only when the split makes the active page easier to reason about
- keep static demos, but make sure each one is intentionally linked from the homepage or sitemap
