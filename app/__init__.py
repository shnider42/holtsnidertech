from flask import Flask

from .config import Config
from .routes.services import services_bp
from .routes.contact import contact_bp


def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    from .routes.main import main_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(contact_bp)

    return app
