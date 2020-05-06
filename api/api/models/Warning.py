from graphene.relay import Node
from graphene_mongo import MongoengineObjectType
from api.models.CountableConnection import CountableConnection
from database.models.WarningModel import WarningModel


class WarningGraphModel(MongoengineObjectType):
    class Meta:
        model = WarningModel
        interfaces = (Node,)
        connection_class = CountableConnection
