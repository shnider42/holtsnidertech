from app import create_app


def test_homepage_renders_canonical_boston_practical_site():
    app = create_app()
    app.testing = True

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Holtsnider Tech" in response.data
    assert b"Where should we start?" in response.data or b"What are you looking for?" in response.data


def test_homepage_uses_current_boston_and_clarity_assets():
    app = create_app()
    app.testing = True

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"js/boston-site.js" in response.data
    assert b"js/site-flow-clarity.js" in response.data
    assert b"css/site-flow-clarity.css" in response.data
    assert b"js/site.js" not in response.data


def test_homepage_has_clear_public_metadata():
    app = create_app()
    app.testing = True

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Technical Problem Solving" in response.data
    assert b"Project Building" in response.data
    assert b"https://holtsnidertech.com/" in response.data
    assert b'property="og:title"' in response.data
    assert b'name="twitter:card"' in response.data


def test_legacy_style_lab_redirects_home():
    app = create_app()
    app.testing = True

    with app.test_client() as client:
        response = client.get("/style-lab")
        variant_response = client.get("/style-lab/workshop")

    assert response.status_code == 302
    assert response.headers["Location"].endswith("/")
    assert variant_response.status_code == 302
    assert variant_response.headers["Location"].endswith("/")


def test_healthz_reports_ok():
    app = create_app()
    app.testing = True

    with app.test_client() as client:
        response = client.get("/healthz")

    assert response.status_code == 200
    assert response.get_json() == {"status": "ok", "service": "holtsnidertech"}
