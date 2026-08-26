from app import create_app


def make_test_app():
    app = create_app()
    app.testing = True
    return app


def test_homepage_renders_canonical_boston_practical_site():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Holtsnider Tech" in response.data
    assert b"Where should we start?" in response.data or b"What are you looking for?" in response.data


def test_homepage_uses_current_boston_and_clarity_assets():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"js/boston-site.js" in response.data
    assert b"js/boston-nav-cleanup.js" in response.data
    assert b"js/site-flow-clarity.js" in response.data
    assert b"css/site-flow-clarity.css" in response.data
    assert b"js/site.js" not in response.data


def test_homepage_has_clear_public_metadata():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Technical Problem Solving" in response.data
    assert b"Project Building" in response.data
    assert b"https://holtsnidertech.com/" in response.data
    assert b'property="og:title"' in response.data
    assert b'name="twitter:card"' in response.data


def test_clarity_assets_are_served():
    app = make_test_app()

    with app.test_client() as client:
        script = client.get("/static/js/site-flow-clarity.js")
        stylesheet = client.get("/static/css/site-flow-clarity.css")

    assert script.status_code == 200
    assert stylesheet.status_code == 200
    assert b"Fix a Problem" in script.data
    assert b"bos-default-context" in stylesheet.data


def test_public_local_demos_are_served():
    app = make_test_app()
    demo_paths = [
        "/static/demos/grepper.html",
        "/static/demos/loudsource-vote.html",
        "/static/demos/jiporady.html",
    ]

    with app.test_client() as client:
        responses = [client.get(path) for path in demo_paths]

    assert all(response.status_code == 200 for response in responses)


def test_legacy_style_lab_redirects_home():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/style-lab")
        variant_response = client.get("/style-lab/workshop")

    assert response.status_code == 302
    assert response.headers["Location"].endswith("/")
    assert variant_response.status_code == 302
    assert variant_response.headers["Location"].endswith("/")


def test_sitemap_tracks_public_local_demos():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/sitemap.xml")

    assert response.status_code == 200
    assert response.mimetype == "application/xml"
    assert b"/static/demos/grepper.html" in response.data
    assert b"/static/demos/loudsource-vote.html" in response.data
    assert b"/static/demos/jiporady.html" in response.data


def test_robots_points_to_public_sitemap():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/robots.txt")

    assert response.status_code == 200
    assert response.mimetype == "text/plain"
    assert b"Allow: /" in response.data
    assert b"https://holtsnidertech.com/sitemap.xml" in response.data


def test_healthz_reports_ok():
    app = make_test_app()

    with app.test_client() as client:
        response = client.get("/healthz")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "service": "holtsnidertech"}
