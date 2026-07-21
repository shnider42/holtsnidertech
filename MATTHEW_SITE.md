# Matthew Granchelli Portfolio Branch

This branch contains a standalone professional profile site for Matthew Granchelli. It reuses the existing Flask deployment structure from HoltsniderTech while replacing the public-facing design and copy.

## Branch

`matthew-granchelli-site`

## Local run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

On macOS or Linux, activate the environment with `source .venv/bin/activate`.

## Render deployment

The branch includes a dedicated `render.yaml` service:

- Service name: `matthew-granchelli-portfolio`
- Runtime: Python
- Branch: `matthew-granchelli-site`
- Health check: `/healthz`
- Auto deploy: every commit to this branch

Create a new Render Blueprint from this repository and select this branch. This keeps the existing HoltsniderTech deployment separate.

## Main files

- `app/templates/home.html` — page content and structure
- `app/templates/base.html` — metadata and asset loading
- `app/static/css/matthew.css` — complete visual system
- `app/static/js/matthew.js` — navigation and reveal behavior
- `app/routes.py` — Flask routes, health check, robots, and sitemap

## Content note

The initial copy is based only on publicly available professional information. Before treating the site as Matthew's official portfolio, confirm the preferred biography, contact details, role history, and any additional work examples directly with him.
