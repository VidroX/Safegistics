from graphene.relay import Node
from graphene_mongo import MongoengineObjectType

from api.models.CountableConnection import CountableConnection
from database.models.DriverModel import DriverModel


class Driver(MongoengineObjectType):
    class Meta:
        model = DriverModel
        interfaces = (Node,)
        exclude_fields = ('password',)
        connection_class = CountableConnection
