from graphene.relay import Node
from graphene_mongo import MongoengineObjectType

from api.models.CountableConnection import CountableConnection
from database.models.DeviceModel import DeviceModel
from database.models.DriverModel import DriverModel


class Device(MongoengineObjectType):
    class Meta:
        model = DeviceModel
        interfaces = (Node,)
        exclude_fields = ('device_pass',)
        connection_class = CountableConnection
