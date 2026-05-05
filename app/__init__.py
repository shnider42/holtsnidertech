from flask import Flask


_RESPONSE_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
}


def create_app() -> Flask:
    app = Flask(__name__)

    from app.routes import main
    app.register_blueprint(main)

    @app.after_request
    def add_response_headers(response):
        for name, value in _RESPONSE_HEADERS.items():
            response.headers.setdefault(name, value)
        return response

    return app
