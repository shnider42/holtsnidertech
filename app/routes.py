from flask import Blueprint, Response, abort, render_template

main = Blueprint("main", __name__)

STYLE_VARIANTS = {
    "field-notes": {
        "name": "Field Notes",
        "hero_title": "I help people untangle the tech mess in front of them.",
        "hero_body": "A working-notebook direction: warmer, rougher, more personal, and less like a polished agency page.",
        "proof_items": ["This site is a workbench, not a brochure."],
    },
    "daily-flyer": {
        "name": "Daily Flyer Inspired",
        "hero_title": "A living flyer for projects, services, and useful little systems.",
        "hero_body": "A bright, editorial, modular direction inspired by the Daily Flyer concept rather than the current corporate layout.",
        "proof_items": ["The pattern matters more than one finished page."],
    },
    "workshop": {
        "name": "Technical Workshop",
        "hero_title": "Bring the weird problem. I’ll help take it apart.",
        "hero_body": "A darker diagnostic bench direction with technical grit, terminal/blueprint influence, and less marketing polish.",
        "proof_items": ["The first job is making the problem smaller."],
    },
    "tech-translator": {
        "name": "Tech Translator",
        "hero_title": "Tech help for people who do not want to become tech people.",
        "hero_body": "A softer, warmer, non-technical client direction with simpler language and a calmer interface.",
        "proof_items": ["You can explain the problem badly. That is allowed."],
    },
    "boston-practical": {
        "name": "Boston Practical",
        "hero_title": "Practical technical help, built close to the problem.",
        "hero_body": "A restrained, grounded, local-operator direction with less gloss and more confidence.",
        "proof_items": ["No theater. Just a clearer way through the problem."],
    },
}

STYLE_TEMPLATES = {
    "field-notes": "style_variants/field_notes.html",
    "daily-flyer": "style_variants/daily_flyer.html",
    "workshop": "style_variants/workshop.html",
    "tech-translator": "style_variants/tech_translator.html",
    "boston-practical": "style_variants/boston_practical.html",
}


@main.route("/")
def home():
    return render_template(
        "style_variants/boston_practical.html",
        business_name="Holtsnider Tech",
        variants=STYLE_VARIANTS,
        slug="boston-practical",
        variant=STYLE_VARIANTS["boston-practical"],
    )


@main.route("/style-lab")
def style_lab():
    return render_template(
        "style_lab.html",
        business_name="Holtsnider Tech",
        variants=STYLE_VARIANTS,
    )


@main.route("/style-lab/<slug>")
def style_lab_variant(slug):
    variant = STYLE_VARIANTS.get(slug)
    template_name = STYLE_TEMPLATES.get(slug)
    if variant is None or template_name is None:
        abort(404)
    return render_template(
        template_name,
        business_name="Holtsnider Tech",
        variants=STYLE_VARIANTS,
        slug=slug,
        variant=variant,
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
