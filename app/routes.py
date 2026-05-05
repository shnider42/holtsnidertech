from flask import Blueprint, render_template

main = Blueprint("main", __name__)


@main.route("/")
def home():
    return render_template(
        "home.html",
        business_name="Holtsnider Tech",
        tagline="Practical technical consulting for businesses that need real solutions.",
    )


@main.route("/proof")
def proof():
    return render_template(
        "proof.html",
        business_name="Holtsnider Tech",
        tagline="Proof of work and technical depth.",
    )
