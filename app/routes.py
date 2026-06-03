from flask import Blueprint, Response, redirect, render_template, url_for

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template(
        "style_variants/boston_practical.html",
        business_name="Holtsnider Tech",
    )


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
    <loc>https://holtsnidertech.com/static/demos/grepper.html</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/static/demos/loudsource-vote.html</loc>
    <priority>0.7</priority>
  </url>
</urlset>
"""
    return Response(body, mimetype="application/xml")
