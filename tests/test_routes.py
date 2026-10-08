from app import create_app


def make_test_app():
    app = create_app()
    app.testing = True
    return app


def test_homepage_is_server_rendered_client_first():
    with make_test_app().test_client() as client:
        response = client.get("/")
    assert response.status_code == 200
    assert b"Holtsnider Tech" in response.data
    assert b"Fix what isn't working." in response.data
    assert b"Talk about a problem or project" in response.data
    assert b"bos-start-panel" not in response.data
    assert response.data.count(b'<article class="cf-project ') == 3


def test_homepage_uses_isolated_client_assets():
    with make_test_app().test_client() as client:
        response = client.get("/")
    assert response.status_code == 200
    assert b"js/client-first.js" in response.data
    assert b"css/client-first.css" in response.data
    assert b"js/boston-site.js" not in response.data
    assert b"js/site-flow-clarity.js" not in response.data


def test_guided_keeps_original_assets_and_shared_catalogue():
    with make_test_app().test_client() as client:
        response = client.get("/guided")
    assert response.status_code == 200
    for asset in (b"js/boston-site.js", b"js/boston-nav-cleanup.js", b"js/site-flow-clarity.js", b"css/site-flow-clarity.css"):
        assert asset in response.data
    assert b'id="project-catalogue"' in response.data
    assert b"Back to the simple homepage" in response.data


def test_homepage_has_clear_public_metadata():
    with make_test_app().test_client() as client:
        response = client.get("/")
    assert response.status_code == 200
    assert b"Technical Problem Solving" in response.data
    assert b"Project Building" in response.data
    assert b"https://holtsnidertech.com/" in response.data
    assert b'property="og:title"' in response.data
    assert b'name="twitter:card"' in response.data


def test_new_pages_have_their_own_canonical_urls():
    with make_test_app().test_client() as client:
        for path in ("/projects", "/technical", "/guided"):
            response = client.get(path)
            assert response.status_code == 200
            assert f'href="https://holtsnidertech.com{path}"'.encode() in response.data


def test_clarity_assets_are_served():
    with make_test_app().test_client() as client:
        script = client.get("/static/js/site-flow-clarity.js")
        stylesheet = client.get("/static/css/site-flow-clarity.css")
    assert script.status_code == 200
    assert stylesheet.status_code == 200
    assert b"Fix a Problem" in script.data
    assert b"bos-default-context" in stylesheet.data


def test_public_local_demos_are_served():
    demo_paths = ["/static/demos/grepper.html", "/static/demos/loudsource-vote.html", "/static/demos/jiporady.html"]
    with make_test_app().test_client() as client:
        responses = [client.get(path) for path in demo_paths]
    assert all(response.status_code == 200 for response in responses)


def test_legacy_style_lab_redirects_home():
    with make_test_app().test_client() as client:
        response = client.get("/style-lab")
        variant_response = client.get("/style-lab/workshop")
    assert response.status_code == 302
    assert response.headers["Location"].endswith("/")
    assert variant_response.status_code == 302
    assert variant_response.headers["Location"].endswith("/")


def test_sitemap_tracks_public_pages_and_local_demos():
    with make_test_app().test_client() as client:
        response = client.get("/sitemap.xml")
    assert response.status_code == 200
    assert response.mimetype == "application/xml"
    for path in ("/projects", "/technical", "/guided", "/static/demos/grepper.html", "/static/demos/loudsource-vote.html", "/static/demos/jiporady.html"):
        assert path.encode() in response.data


def test_robots_points_to_public_sitemap():
    with make_test_app().test_client() as client:
        response = client.get("/robots.txt")
    assert response.status_code == 200
    assert response.mimetype == "text/plain"
    assert b"Allow: /" in response.data
    assert b"https://holtsnidertech.com/sitemap.xml" in response.data


def test_healthz_reports_ok():
    with make_test_app().test_client() as client:
        response = client.get("/healthz")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "service": "holtsnidertech"}
