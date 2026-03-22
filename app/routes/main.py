from flask import Blueprint, current_app, render_template

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def home():
    services = [
        {
            'title': 'Troubleshooting & Technical Problem Solving',
            'body': 'Diagnose software, workflow, integration, and operational issues and turn guesswork into a clear next step.'
        },
        {
            'title': 'Process Improvement & Automation',
            'body': 'Reduce repetitive work, improve reliability, and identify where sensible automation can save time.'
        },
        {
            'title': 'Web, Platform & Systems Support',
            'body': 'Support websites, business platforms, and technical decisions for teams without a full internal engineering staff.'
        },
        {
            'title': 'Inventory & Data Organization',
            'body': 'Clean up inconsistent naming, duplicate records, and spreadsheet-heavy workflows that have become hard to manage.'
        },
        {
            'title': 'Technical Translation',
            'body': 'Explain technical issues in plain language so clients can make better decisions before spending more time or money.'
        },
        {
            'title': 'Practical Project Planning',
            'body': 'Build realistic next steps around existing tools, budget, time, and real-world business constraints.'
        },
    ]

    return render_template(
        'home.html',
        business_name=current_app.config['BUSINESS_NAME'],
        contact_email=current_app.config['CONTACT_EMAIL'],
        contact_phone=current_app.config['CONTACT_PHONE'],
        services=services,
    )


@main_bp.route('/health')
def health():
    return {'status': 'ok'}, 200
