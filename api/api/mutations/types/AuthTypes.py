import graphene

from database.models.DeviceModel import DeviceModel
from database.models.DriverModel import DriverModel
from database.models.UserModel import UserModel

USER_TYPES = ['user', 'driver']
DEVICE_TYPES = ['device']


def get_type_by_obj(obj):
    if isinstance(obj, UserModel):
        return USER_TYPES[0]
    elif isinstance(obj, DriverModel):
        return USER_TYPES[1]
    elif isinstance(obj, DeviceModel):
        return DEVICE_TYPES[0]

    return None


class TokenData(graphene.ObjectType):
    access_token = graphene.String()
    refresh_token = graphene.String(required=False)


class LoginInputData(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)


class DeviceLoginInputData(graphene.InputObjectType):
    device_id = graphene.String(required=True)
    device_pass = graphene.String(required=True)


class RegisterInputData(graphene.InputObjectType):
    type = graphene.String(required=False, choices=USER_TYPES)
    email = graphene.String(required=True)
    password = graphene.String(required=True)
    mobile_phone = graphene.String(required=True)
    first_name = graphene.String(required=True)
    last_name = graphene.String(required=True)
    patronymic = graphene.String(required=False)
    birthday = graphene.Date(required=True)
    manager = graphene.ID(required=False)


class DeviceRegisterInputData(graphene.InputObjectType):
    driver = graphene.ID(required=False)
    name = graphene.String(required=True)
    device_id = graphene.String(required=True)
    device_pass = graphene.String(required=True)


class UserUpdateInputData(graphene.InputObjectType):
    type = graphene.String(required=False, choices=USER_TYPES)
    email = graphene.String(required=False)
    password = graphene.String(required=False)
    mobile_phone = graphene.String(required=False)
    first_name = graphene.String(required=False)
    last_name = graphene.String(required=False)
    patronymic = graphene.String(required=False)
    birthday = graphene.Date(required=False)
    is_staff = graphene.Boolean(required=False)
    is_active = graphene.Boolean(required=False)
    manager = graphene.ID(required=False)
