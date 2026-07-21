from flask import Blueprint, Response, render_template, request

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template(
        "home.html",
        business_name="Matthew Granchelli",
        tagline="Senior Accountant and construction project accounting professional.",
    )


@main.route("/healthz")
def healthz():
    return {"status": "ok", "service": "matthew-granchelli-portfolio"}


@main.route("/robots.txt")
def robots_txt():
    base_url = request.url_root.rstrip("/")
    body = f"User-agent: *\nAllow: /\nSitemap: {base_url}/sitemap.xml\n"
    return Response(body, mimetype="text/plain")


@main.route("/sitemap.xml")
def sitemap_xml():
    base_url = request.url_root.rstrip("/")
    body = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{base_url}/</loc>
    <priority>1.0</priority>
  </url>
</urlset>
"""
    return Response(body, mimetype="application/xml")
