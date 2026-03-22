import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-me')
    BUSINESS_NAME = os.environ.get('BUSINESS_NAME', 'Holtsnider Tech')
    CONTACT_EMAIL = os.environ.get('CONTACT_EMAIL', 'youremail@holtsnidertech.com')
    CONTACT_PHONE = os.environ.get('CONTACT_PHONE', '123-456-7890')
