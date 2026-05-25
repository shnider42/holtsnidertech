from flask import Blueprint, Response, abort, render_template

main = Blueprint("main", __name__)

STYLE_VARIANTS = {
    "field-notes": {
        "name": "Field Notes",
        "class_name": "variant-field-notes",
        "eyebrow": "Field Notes / Chris Explains It",
        "hero_title": "I help people untangle the tech mess in front of them.",
        "hero_body": "This version makes the site feel like a working notebook instead of a brochure: what I build, what I notice, where I can help, and what the next useful step might be.",
        "cta_primary": "Read the notes",
        "cta_secondary": "Start with the problem",
        "panel_title": "Working style",
        "panel_body": "Plain English first. Less polish-for-polish-sake. More direct examples of the messy middle between an idea, a tool, and the person who has to use it.",
        "services_title": "The kind of problems I like",
        "services": [
            ("Messy systems", "Old spreadsheets, unclear workflows, hidden duplicates, strange handoffs, and tools that people work around instead of with."),
            ("Small useful builds", "A prototype, a cleanup script, a better project page, or a simple internal tool that proves the idea before it gets big."),
            ("Technical translation", "Turning the low-level details into something a business owner, client, or teammate can actually act on."),
        ],
        "proof_title": "Sample voice",
        "proof_items": [
            "This site is a workbench, not a brochure.",
            "You do not have to explain the problem perfectly. That is part of the work.",
            "The first win is usually making the problem smaller and clearer.",
        ],
        "contact_title": "Send the rough version.",
        "contact_body": "A screenshot, a bad spreadsheet, a vague idea, or a half-broken workflow is enough to start.",
    },
    "daily-flyer": {
        "name": "Daily Flyer Inspired",
        "class_name": "variant-daily-flyer",
        "eyebrow": "Daily Flyer Inspired",
        "hero_title": "A living flyer for projects, services, and useful little systems.",
        "hero_body": "This version borrows the best Daily Flyer lesson: small, themed cards make a complicated project easier to scan, explain, reuse, and build on.",
        "cta_primary": "Open the cards",
        "cta_secondary": "See the pattern",
        "panel_title": "Inputs → engine → output",
        "panel_body": "Dates, themes, client notes, messy data, source material, and ideas become structured pages, prototypes, explainers, or lightweight tools.",
        "services_title": "What each card can become",
        "services": [
            ("Portfolio cards", "Irish Today, birthday concepts, topic mappers, demos, and future builds shown as compact project stories."),
            ("Service cards", "Each service becomes easy to understand: what you bring in, what I clean up, and what you get back."),
            ("Reusable formats", "The site can grow through repeatable cards rather than one static page that gets stale."),
        ],
        "proof_title": "Daily Flyer pattern",
        "proof_items": [
            "Inputs: dates, topics, people, places, and source material.",
            "Engine: templates, cleanup, rendering logic, and theme rules.",
            "Outputs: mini-sites, pages, demos, reports, and client-ready prototypes.",
        ],
        "contact_title": "Bring a theme or a recurring idea.",
        "contact_body": "This direction is strongest if Holtsnider Tech becomes a home base for many small, useful, repeatable projects.",
    },
    "workshop": {
        "name": "Technical Workshop",
        "class_name": "variant-workshop",
        "eyebrow": "Technical Workshop",
        "hero_title": "Bring the weird problem. I’ll help take it apart.",
        "hero_body": "This version leans into troubleshooting, test instincts, reliability, small tools, and practical engineering judgment. It feels more like a bench than a pitch deck.",
        "cta_primary": "Open the workbench",
        "cta_secondary": "Describe the failure",
        "panel_title": "Diagnose, repair, harden",
        "panel_body": "Start with symptoms, isolate layers, prove what still works, fix the current friction, and leave the system easier to understand than it was.",
        "services_title": "Workshop lanes",
        "services": [
            ("Diagnose", "What changed? What fails? What still works? What can be reproduced? What layer are we actually in?"),
            ("Repair", "Fix the current blocker without pretending every issue needs a platform migration or total rebuild."),
            ("Harden", "Document the fix, reduce repeat failures, and make the handoff easier for the next person."),
        ],
        "proof_title": "Operating rules",
        "proof_items": [
            "Ambiguity is allowed; guessing forever is not.",
            "A boring fix that holds up is better than a clever one nobody trusts.",
            "The problem should get smaller as the work goes on.",
        ],
        "contact_title": "Send the symptom, not the solution.",
        "contact_body": "A failing page, a confusing integration, a workflow nobody trusts, or a tool that keeps surprising people is enough.",
    },
    "tech-translator": {
        "name": "Tech Translator",
        "class_name": "variant-tech-translator",
        "eyebrow": "Small Business Tech Translator",
        "hero_title": "Tech help for people who do not want to become tech people.",
        "hero_body": "This version is warmer and more client-facing. It explains the work through recognizable problems: websites, spreadsheets, inventory, confusing tools, repeated manual work, and unclear next steps.",
        "cta_primary": "Explain it badly",
        "cta_secondary": "See common problems",
        "panel_title": "Plain English is part of the service",
        "panel_body": "You should not need perfect terminology before asking for help. The work is translating the messy version into a practical next step.",
        "services_title": "Common starting points",
        "services": [
            ("The site does not explain us", "Clarify what you do, who it is for, and what someone should do next."),
            ("The spreadsheet is scary", "Clean names, categories, duplicates, hidden assumptions, and manual steps."),
            ("We keep doing this by hand", "Turn repeat work into a small tool, form, script, checklist, or workflow."),
        ],
        "proof_title": "Client-friendly promises",
        "proof_items": [
            "You can describe the problem in normal words.",
            "We can start small before anyone commits to a big rebuild.",
            "The goal is less confusion, not more software for its own sake.",
        ],
        "contact_title": "Start with the annoying thing.",
        "contact_body": "The thing that wastes time, causes confusion, or makes you avoid the task is usually the right place to begin.",
    },
    "boston-practical": {
        "name": "Boston Practical",
        "class_name": "variant-boston-practical",
        "eyebrow": "Boston Practical / Local Operator",
        "hero_title": "Practical technical help, built close to the problem.",
        "hero_body": "This version keeps the dramatic background but makes the voice more grounded: less startup gloss, more accountable, direct, and useful.",
        "cta_primary": "See the work",
        "cta_secondary": "Start local",
        "panel_title": "No theater",
        "panel_body": "Clear scope, honest tradeoffs, practical next steps, and enough polish to be trusted without sounding inflated.",
        "services_title": "What this style emphasizes",
        "services": [
            ("Restraint", "Fewer buzzwords, more confidence, and less need to prove every sentence is technical."),
            ("Accountability", "A site that feels like someone stands behind it, not a generic agency template."),
            ("Local usefulness", "A subtle New England practicality without forcing landmarks or clichés."),
        ],
        "proof_title": "Tone checks",
        "proof_items": [
            "No theater. Just a clearer way through the problem.",
            "Good technical work should survive contact with real people.",
            "Built around constraints, not buzzwords.",
        ],
        "contact_title": "Keep it simple.",
        "contact_body": "A direct note about what you need, what is not working, or what you are trying to build is enough.",
    },
}


@main.route("/")
def home():
    return render_template(
        "home.html",
        business_name="Holtsnider Tech",
        tagline="Practical technical consulting for businesses that need real solutions.",
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
    if variant is None:
        abort(404)
    return render_template(
        "style_lab_variant.html",
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
    <loc>https://holtsnidertech.com/style-lab</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/style-lab/field-notes</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/style-lab/daily-flyer</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/style-lab/workshop</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/style-lab/tech-translator</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://holtsnidertech.com/style-lab/boston-practical</loc>
    <priority>0.6</priority>
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
