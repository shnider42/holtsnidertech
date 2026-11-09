# Daily Flyer project catalog

HoltsniderTech reads the catalog published at
`https://dfe-directory.onrender.com/projects.json`. The maintained source is
`apps/directory/projects.json` on the `feat/dfe-directory` branch of
`shnider42/daily_flyer`.

`app/static/data/dfe-projects.json` is the startup fallback, copied from directory
commit `311ba3ed6de44ed70fa3a2d35ba54729f13e5a26`. It is a recovery snapshot, not a
second catalog to maintain. Normal changes belong in the directory's source.

## Application API

```python
from app.project_catalog import get_projects, get_featured_projects

projects = get_projects()
featured_projects = get_featured_projects(projects)
project_count = len(projects)
```

`get_projects()` returns a fresh list of canonical project dictionaries. The
featured function selects `irish-today`, `infierno`, `gridiron`, and `further-in`
in that order and adds `focus` and `context` text. Canonical metadata stays intact.
Each normalized record has an HTTPS `url`: its app URL when supplied, otherwise
its `sourceUrl`. Source-only records retain `linkKind: "source"` so the interface
can label them appropriately. An app may omit `sourceUrl`; that field normalizes
to `null`. At least one valid destination is required, and a supplied nonempty
URL must be HTTPS.
Removed projects are skipped; new valid projects appear in the full catalog
automatically. Pass an existing list to keep a page's count and featured items on
the same snapshot, or omit it to read the current cache.

## Refresh and availability

- The first request returns the checked-in snapshot and starts a daemon refresh.
- Each process allows only one refresh at a time. Network work never runs in the
  page request, and readers keep using their last valid snapshot.
- Successful refreshes are cached for 15 minutes. Failures back off from one
  minute to five minutes. The next request after the interval starts a refresh.
- The fetch has a three-second socket timeout and a 512 KiB body limit. Only the
  fixed public URL is requested; redirects are rejected.
- A catalog must contain 1–512 valid records, unique safe IDs, supported types,
  safe artwork keys, bounded text/lists, HTTPS destinations, and valid dates.
  One invalid record rejects the entire update.
- Gunicorn workers cache independently. Restarting returns them to the bundled
  snapshot until their next successful refresh.

There are no directory writes, scheduled jobs, account credentials, or per-project
uptime requests in this integration.

Run the offline checks with `python -m pytest tests/test_project_catalog.py -q`.

## Site integration

`/projects` is the native portfolio directory. It provides server-rendered
category/search/sort results, with browser enhancements for saved projects,
cover/list views, shared filter URLs, and copying launch links. The homepage
features four projects and links into the complete directory from navigation,
the starting points, selected work, and both Build/Improve paths. Existing
contact drafts and the professional experience flow are retained.

The original illustrated SVG covers and the pure browser catalog helpers were
adapted from `apps/directory/artwork.js` and `apps/directory/catalog.js` at the
same source commit as the snapshot. These are presentation assets; they are
not screenshots. A new or renamed cover uses the local Dayboard illustration
until its artwork is added, without affecting its project link or metadata.

The native directory starts with all project types and newest-first sorting;
the standalone DFE directory keeps its own games-first default. Saved projects
are local to this site's browser storage. The standalone directory and project
deployments are unchanged by this integration.
