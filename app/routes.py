from flask import Blueprint, Response, render_template

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template(
        "home.html",
        business_name="Holtsnider Tech",
        tagline="Practical technical consulting for businesses that need real solutions.",
    )


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
