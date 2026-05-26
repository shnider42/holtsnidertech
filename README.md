# Boston Practical + staging background local test v2

This replaces the broken patch with a safer PowerShell-based drop-in.

## Goal

Keep **Boston Practical** as the page style while letting the current staging background treatment show through.

This means:

- no separate Boston Practical SVG background
- no embedded raster data URL
- no recreated logo
- staging remains the visual source of truth
- Boston Practical remains the typography/layout/card/diagnostic-selector style

## Files

```text
app/static/css/boston-practical-staging-background.css
scripts/apply-boston-practical-staging-background.ps1
```

## How to test locally on Windows PowerShell

From your repo root:

```powershell
# 1. Extract this ZIP into the repo root so the app/ and scripts/ folders line up.

# 2. Optional dry run:
powershell -ExecutionPolicy Bypass -File .\scripts\apply-boston-practical-staging-background.ps1 -DryRun

# 3. Apply:
powershell -ExecutionPolicy Bypass -File .\scripts\apply-boston-practical-staging-background.ps1

# 4. Inspect:
git diff -- app/templates/base.html app/templates/style_variants/boston_practical.html app/static/css/boston-practical-staging-background.css
```

Then restart Flask if needed and hard refresh:

```text
/style-lab/boston-practical
```

## What the script does

1. Removes these failed experimental links from `base.html`, if present:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/boston-practical-raster-logo.css') }}" />
<link rel="stylesheet" href="{{ url_for('static', filename='css/boston-practical-background-layer.css') }}" />
```

2. Adds this line after the inline `</style>` in `app/templates/style_variants/boston_practical.html`:

```html
<link rel="stylesheet" href="{{ url_for('static', filename='css/boston-practical-staging-background.css') }}" />
```

3. Leaves the normal staging CSS load order alone:

```html
site.css
responsive-fixes.css
staging-polish.css
staging-background-boost.css
desktop-background-flow.css
warm-canvas-experiment.css
theme-toggle.css
```

## If the script does not work

Do the same two edits manually and copy the CSS file into:

```text
app/static/css/boston-practical-staging-background.css
```
