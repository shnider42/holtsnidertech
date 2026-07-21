from flask import Blueprint, Response, render_template, url_for

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template("matthew_granchelli.html")


@main.route("/holtsnidertech")
def holtsnidertech_preview():
    return render_template(
        "home.html",
        business_name="Holtsnider Tech",
        tagline="Practical technical consulting for businesses that need real solutions.",
    )


@main.route("/healthz")
def healthz():
    return {"status": "ok", "service": "matthew-granchelli-profile"}


@main.route("/robots.txt")
def robots_txt():
    sitemap_url = url_for("main.sitemap_xml", _external=True)
    body = f"User-agent: *\nAllow: /\nSitemap: {sitemap_url}\n"
    return Response(body, mimetype="text/plain")


@main.route("/sitemap.xml")
def sitemap_xml():
    home_url = url_for("main.home", _external=True)
    body = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{home_url}</loc>
    <priority>1.0</priority>
  </url>
</urlset>
"""
    return Response(body, mimetype="application/xml")
