import graphene
from graphene.relay import Node
from graphene_mongo import MongoengineObjectType
from api.models.CountableConnection import CountableConnection
from api.models.User import User
from database.models.BaseUserModel import BaseUserModel


class BaseUser(MongoengineObjectType):
    class Meta:
        model = BaseUserModel
        interfaces = (Node,)
        exclude_fields = ('password',)
        connection_class = CountableConnection

    is_staff = graphene.Boolean()
    manager = graphene.Field(User, required=False)
