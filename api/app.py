import os

from datetime import timedelta
from flask import Flask
from dotenv import load_dotenv
from flask_graphql import GraphQLView
from flask_jwt_extended import JWTManager
from api import schema
from database import database
from flask_cors import CORS

load_dotenv()

DEBUG = os.environ.get('DEBUG', False)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
    "http://192.168.1.62:3000",
    "http://192.168.1.62:5000"
]}})
app.debug = DEBUG

app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', '')

app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=1)

JWTManager(app)

database.init(app)

app.add_url_rule(
    "/graphql", view_func=GraphQLView.as_view("graphql", schema=schema.schema, graphiql=DEBUG)
)

if __name__ == '__main__':
    app.run()
