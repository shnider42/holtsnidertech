# Holtsnider Tech Flask Starter

A modular Flask starter for holtsnidertech.com that runs locally first and is structured so it can deploy cleanly to Render later.

## Project structure

```text
holtsnidertech_scaffold/
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── routes/
│   │   └── main.py
│   ├── static/
│   │   └── css/
│   │       └── site.css
│   └── templates/
│       ├── base.html
│       └── home.html
├── run.py
├── requirements.txt
└── render.yaml
```

## Local setup

### 1. Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Run locally

```powershell
python run.py
```

Then open:

```text
http://127.0.0.1:5000
```

## Future growth ideas

- Add a real contact form with Flask-WTF or an email service
- Break out separate pages for services, about, and case studies
- Add Jinja partials/macros for reusable components
- Add environment-specific config classes
- Add tests with pytest
- Add a blog or notes section later

## Render deployment

This repo includes a basic `render.yaml` for a web service.
