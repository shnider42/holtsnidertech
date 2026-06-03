from app import create_app


def test_homepage_renders_canonical_boston_practical_site():
    app = create_app()
    app.testing = True

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200
    assert b"Holtsnider Tech" in response.data
    assert b"Where should we start?" in response.data or b"What are you looking for?" in response.data


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
