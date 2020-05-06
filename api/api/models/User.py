from graphene.relay import Node
from graphene_mongo import MongoengineObjectType

from api.models.CountableConnection import CountableConnection
from database.models.UserModel import UserModel


class User(MongoengineObjectType):
    class Meta:
        model = UserModel
        interfaces = (Node,)
        exclude_fields = ('password',)
        connection_class = CountableConnection
