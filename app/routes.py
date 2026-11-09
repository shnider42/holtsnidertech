from pathlib import Path
import unicodedata

from flask import Blueprint, Response, jsonify, redirect, render_template, request, url_for

from app.project_catalog import get_featured_projects, get_projects

main = Blueprint("main", __name__)

PROJECT_TYPES = {"games": "Games", "tools": "Tools", "catch-up": "Catch up", "stories": "Stories & culture"}


def _project_records():
    """Use local covers; new catalog artwork falls back until it is included."""
    artwork = Path(__file__).parent / "static" / "img" / "projects"
    result = get_projects()
    for project in result:
        art = project["art"] if (artwork / (project["art"] + ".svg")).is_file() else "dayboard"
        project["art_url"] = url_for("static", filename=f"img/projects/{art}.svg")
    return result


def _search_text(value):
    return "".join(c for c in unicodedata.normalize("NFKD", value) if not unicodedata.combining(c)).lower()


@main.route("/")
def home():
    projects = _project_records()
    return render_template(
        "home.html", business_name="Holtsnider Tech",
        featured_projects=get_featured_projects(projects), project_count=len(projects),
    )


@main.route("/projects")
def projects():
    catalog = _project_records()
    project_type = request.args.get("type", "all")
    if project_type not in PROJECT_TYPES:
        project_type = "all"
    query = request.args.get("q", "")[:200].strip()
    sort = request.args.get("sort", "newest")
    if sort not in {"newest", "oldest", "name", "type"}:
        sort = "newest"
    kind = request.args.get("kind", "")[:80] if project_type == "games" else ""
    tokens = _search_text(query).split()
    visible = []
    for project in catalog:
        if project_type != "all" and project["type"] != project_type:
            continue
        if kind and project.get("subtype") != kind:
            continue
        searchable = _search_text(" ".join([
            *(str(project.get(key, "")) for key in
              ("title", "subtitle", "description", "id", "type", "subtype", "url")),
            PROJECT_TYPES[project["type"]], *project.get("aliases", []), *project.get("tags", []),
        ]))
        if all(token in searchable for token in tokens):
            visible.append(project)
    visible.sort(key=lambda p: p["title"].casefold())
    if sort in {"newest", "oldest"}:
        dated = [p for p in visible if p.get("datePrecision") != "unknown" and p.get("createdAt")]
        unknown = [p for p in visible if p not in dated]
        dated.sort(key=lambda p: p["createdAt"], reverse=sort == "newest")
        visible = dated + unknown
    elif sort == "type":
        visible.sort(key=lambda p: (PROJECT_TYPES[p["type"]], p["title"].casefold()))
    return render_template(
        "projects.html", business_name="Holtsnider Tech", catalog=catalog,
        visible_projects=visible, featured_projects=get_featured_projects(catalog),
        project_types=PROJECT_TYPES, project_count=len(catalog),
        active_type=project_type, query=query, sort=sort, kind=kind,
        game_kinds=sorted({p["subtype"] for p in catalog if p["type"] == "games"}),
    )


@main.route("/api/projects")
def project_catalog():
    projects = _project_records()
    response = jsonify({"projects": projects, "total": len(projects)})
    response.headers["Cache-Control"] = "public, max-age=60, stale-while-revalidate=300"
    return response


@main.route("/style-lab")
def style_lab():
    """Legacy experiment URL retained as a safe redirect to the canonical homepage."""
    return redirect(url_for("main.home"), code=302)


@main.route("/style-lab/<path:_slug>")
def style_lab_variant(_slug):
    """Legacy style-preview URLs retained as safe redirects to the canonical homepage."""
    return redirect(url_for("main.home"), code=302)


@main.route("/privacy")
def privacy():
    return render_template("privacy.html", business_name="Holtsnider Tech")


@main.route("/healthz")
def healthz():
    return {"status": "ok", "service": "holtsnidertech"}


@main.route("/robots.txt")
def robots_txt():
    body = "User-agent: *\nAllow: /\nSitemap: https://holtsnidertech.com/sitemap.xml\n"
    return Response(body, mimetype="text/plain")


@main.route("/sitemap.xml")
def sitemap_xml():
    body = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://holtsnidertech.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/privacy</loc>
    <priority>0.4</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/projects</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/static/demos/grepper.html</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/static/demos/loudsource-vote.html</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/static/demos/jiporady.html</loc>
    <priority>0.7</priority>
  </url>
</urlset>
"""
    return Response(body, mimetype="application/xml")
