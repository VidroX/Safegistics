import graphene

from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required
from graphql import GraphQLError
from graphql_relay import from_global_id, to_global_id
from mongoengine import NotUniqueError, DoesNotExist
from passlib.hash import argon2

from api.decoratos.AuthDecorator import admin_status_required
from api.models.Device import Device
from api.mutations.types.AuthTypes import TokenData, DeviceLoginInputData, DeviceRegisterInputData, DEVICE_TYPES
from api.statuses import STATUS_CODE
from database.models.DeviceModel import DeviceModel
from database.models.DriverModel import DriverModel


class DeviceLogin(graphene.Mutation):
    class Arguments:
        login_data = DeviceLoginInputData(required=True)

    device = graphene.Field(Device)
    token = graphene.Field(TokenData)

    @staticmethod
    def mutate(self, info, login_data=None):
        device = DeviceModel.objects.get(device_id=login_data.device_id)

        if not argon2.verify(login_data.device_pass, device.device_pass):
            raise GraphQLError(STATUS_CODE[204], extensions={'code': 204})

        token_data = TokenData()
        identity = {
            "id": to_global_id(Device.__name__, str(device.id)),
            "device_id": device.device_id,
            "type": DEVICE_TYPES[0]
        }
        token_data.access_token = create_access_token(identity=identity)
        token_data.refresh_token = create_refresh_token(identity=identity)

        return DeviceLogin(device=device, token=token_data)


class DeviceRegister(graphene.Mutation):
    class Arguments:
        register_data = DeviceRegisterInputData(required=True)

    device = graphene.Field(Device)
    token = graphene.Field(TokenData)

    @staticmethod
    @jwt_required
    @admin_status_required
    def mutate(self, info, register_data=None):
        driver = None

        if register_data.driver is not None:
            driver_id = from_global_id(register_data.driver)[1]
            driver = DriverModel.objects.get(id=driver_id)

        if register_data.driver is not None and driver is None:
            raise GraphQLError(STATUS_CODE[203], extensions={'code': 203})

        device = DeviceModel(
            driver=driver,
            name=register_data.name,
            device_id=register_data.device_id,
            device_pass=register_data.device_pass
        )

        try:
            device.save()
        except NotUniqueError:
            raise GraphQLError(STATUS_CODE[202], extensions={'code': 202})

        token_data = TokenData()
        identity = {
            "id": to_global_id(Device.__name__, str(device.id)),
            "device_id": device.device_id,
            "type": DEVICE_TYPES[0]
        }
        token_data.access_token = create_access_token(identity=identity)
        token_data.refresh_token = create_refresh_token(identity=identity)

        return DeviceRegister(device=device, token=token_data)


class RemoveDevice(graphene.Mutation):
    class Arguments:
        device_id = graphene.String(required=True)

    result = graphene.String()

    @staticmethod
    @jwt_required
    @admin_status_required
    def mutate(self, info, device_id=None):
        message = None

        if device_id is not None:
            try:
                device_id = from_global_id(device_id)[1]
                device = DeviceModel.objects.get(id=device_id)
                device.delete()

                message = STATUS_CODE[201]
            except DoesNotExist:
                raise GraphQLError(STATUS_CODE[200], extensions={'code': 200})

        return RemoveDevice(result=message)
