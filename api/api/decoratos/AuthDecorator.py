from flask_jwt_extended import get_jwt_identity
from graphql import GraphQLError
from graphql_relay import from_global_id
from mongoengine import ValidationError

from api.mutations.types.AuthTypes import USER_TYPES, DEVICE_TYPES
from api.statuses import STATUS_CODE
from api.utils.UserUtils import check_user_integrity
from database.models.BaseUserModel import BaseUserModel
from database.models.DeviceModel import DeviceModel
from database.models.UserModel import UserModel


def user_integrity_check(func):
    def check_user_integrity_decorator(*args, **kwargs):
        user_payload = get_jwt_identity()

        if not check_user_integrity(user_payload):
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        return func(*args, **kwargs)

    return check_user_integrity_decorator


def admin_status_required(func):
    def check_admin_status(*args, **kwargs):
        user_payload = get_jwt_identity()

        if not check_user_integrity(user_payload):
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        try:
            user_id = from_global_id(user_payload['id'])[1]
            user = BaseUserModel.objects.get(id=user_id)
        except ValidationError:
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})
        except BaseUserModel.DoesNotExist:
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        if not isinstance(user, UserModel):
            raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        if not user.is_staff:
            raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        return func(*args, **kwargs)

    return check_admin_status


def device_only(func):
    def check_device(*args, **kwargs):
        device_payload = get_jwt_identity()

        if not check_user_integrity(device_payload):
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        try:
            user_id = from_global_id(device_payload['id'])[1]
            device = DeviceModel.objects.get(id=user_id)
        except ValidationError:
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})
        except DeviceModel.DoesNotExist:
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        if not isinstance(device, DeviceModel):
            raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        return func(*args, **kwargs)

    return check_device


def device_or_admin_only(func):
    def check_device_and_admin(*args, **kwargs):
        user_payload = get_jwt_identity()

        if not check_user_integrity(user_payload):
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        user = None
        try:
            user_id = from_global_id(user_payload['id'])[1]
            if user_payload["type"] == "user":
                user = UserModel.objects.get(id=user_id)
            elif user_payload["type"] in DEVICE_TYPES:
                user = DeviceModel.objects.get(id=user_id)
        except ValidationError:
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})
        except DeviceModel.DoesNotExist:
            raise GraphQLError(STATUS_CODE[1], extensions={'code': 1})

        if not isinstance(user, DeviceModel) and not isinstance(user, UserModel):
            raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        if isinstance(user, UserModel) and not user.is_staff:
            raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        return func(*args, **kwargs)

    return check_device_and_admin
