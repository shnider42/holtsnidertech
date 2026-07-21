# Matthew Granchelli profile-site branch

This branch changes the Flask application's root route (`/`) into a standalone professional profile site for Matthew Granchelli.

## Branch

`agent/matthew-granchelli-profile-site`

## What changed

- Added a standalone, responsive profile template at `app/templates/matthew_granchelli.html`
- Added a dedicated visual system at `app/static/css/matthew-granchelli.css`
- Changed `/` to serve the Matthew Granchelli site
- Preserved the existing Holtsnider Tech homepage at `/holtsnidertech` for comparison
- Updated the health response and generated sitemap URLs for a branch-based deployment

## Deploy on Render

Create a new Render Web Service from the existing `shnider42/holtsnidertech` repository and select this branch.

- **Branch:** `agent/matthew-granchelli-profile-site`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** use the existing command from `render.yaml`
- **Health check path:** `/healthz`

Deploying this branch as a separate service will not change the current HoltsniderTech production site.

## Local preview

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Open `http://127.0.0.1:5000/`.
