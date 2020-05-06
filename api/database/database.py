import os

from flask_mongoengine import MongoEngine, MongoEngineSessionInterface


db = MongoEngine()


def init(app):
    app.session_interface = MongoEngineSessionInterface(db)
    app.config['MONGODB_SETTINGS'] = {
        'alias': 'default',
        'db': os.environ.get('DB_NAME', ''),
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': int(os.environ.get('DB_PORT', 27017)),
        'username': os.environ.get('DB_USER', 'admin'),
        'password': os.environ.get('DB_PASS', '')
    }
    db.init_app(app)
