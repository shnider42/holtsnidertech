# Peter M. Musial — Engineering Leadership Site

A responsive, dependency-free personal website based on Peter M. Musial's résumé and designed in the same practical, dark, high-contrast visual family as HoltsniderTech.com.

## What is included

- Responsive one-page résumé / leadership site
- Mobile navigation
- Accessible semantic HTML
- Scroll reveal effects with reduced-motion support
- Print stylesheet for **Print / Save as PDF**
- Render static-site blueprint
- No frameworks, package manager, or build step

## Run locally

### Windows PowerShell

From the repository root:

```powershell
cd peter-musial-site
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Stop the server with `Ctrl+C`.

### macOS / Linux

```bash
cd peter-musial-site
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

You can also open `index.html` directly, but using a local server gives behavior closer to deployment.

## Deploy to Render

### Option A: Blueprint

This repository includes `render-peter-musial.yaml` at the repository root.

1. Push the site files to the `pm1` branch.
2. In Render, choose **New → Blueprint** and select the `pm1` branch.
3. Connect this GitHub repository.
4. Set the Blueprint file path to:

   ```text
   render-peter-musial.yaml
   ```

5. Apply the Blueprint.

Render will publish the files in `peter-musial-site/` as a static site.

### Option B: Manual static site

1. In Render, choose **New → Static Site**.
2. Connect this GitHub repository and select the `pm1` branch.
3. Use these settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `peter-musial-site` |
   | Build Command | leave blank |
   | Publish Directory | `.` |

4. Create the site.

## Customize

- Content: `index.html`
- Visual design: `styles.css`
- Navigation, reveal effects, and print action: `script.js`
- Browser icon: `assets/favicon.svg`

## Privacy note

The site currently uses the email address, telephone number, LinkedIn URL, and location supplied in the résumé. Remove or replace any of those values before public deployment if they should not be public.
