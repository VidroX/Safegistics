import graphene

from flask_jwt_extended import jwt_required, get_jwt_identity
from graphene.relay import Node
from graphene_mongo import MongoengineConnectionField
from graphql_relay import from_global_id
from mongoengine.queryset.visitor import Q

from api.decoratos.AuthDecorator import user_integrity_check
from api.models.BaseUser import BaseUser
from api.models.Device import Device
from api.models.Driver import Driver
from api.models.User import User
from api.models.Warning import WarningGraphModel
from api.mutations.DeviceMutations import DeviceRegister, DeviceLogin, RemoveDevice
from api.mutations.UserMutations import Register, Login, DeleteUser, UpdateUser
from api.mutations.WarningMutations import AddWarning
from database.models.BaseUserModel import BaseUserModel
from database.models.DeviceModel import DeviceModel
from database.models.DriverModel import DriverModel
from database.models.UserModel import UserModel
from database.models.WarningModel import WarningModel


def fetch_objects(user_payload, class_objects, **kwargs):
    query = kwargs.get('query_by', None)
    is_staff = user_payload.get('is_staff', None)
    order_by = kwargs.get('order_by', None)
    ignore_admin = kwargs.get('ignore_admin', False)
    if query is not None and isinstance(query, dict):
        join_object = kwargs.get('join_object', None)

        if join_object is not None:
            try:
                key = str(next(iter(query.keys()))).split("__")
                value = next(iter(query.values()))

                join_query = {
                    key[1]: value
                }
                object_to_find = {
                    key[0]: join_object(**join_query)[0]
                }
            except IndexError:
                if "__" in str(next(iter(query.keys()))):
                    object_to_find = {}
                else:
                    object_to_find = query

            if not is_staff:
                if order_by is not None:
                    new_query = class_objects.filter(**object_to_find).order_by(order_by)
                else:
                    new_query = class_objects.filter(**object_to_find)
            else:
                new_query = None

                if ignore_admin:
                    new_query = class_objects.filter(**object_to_find)

                if new_query is None:
                    new_query = class_objects.all()

                if order_by is not None:
                    new_query = new_query.order_by(order_by)

        else:
            if order_by is not None:
                new_query = class_objects.all().order_by(order_by) if is_staff else \
                    class_objects.filter(**query).order_by(order_by)
            else:
                new_query = class_objects.all() if is_staff else \
                    class_objects.filter(**query)

        return new_query

    if order_by is not None:
        return class_objects.all().order_by(order_by) if is_staff else \
            class_objects.filter(email=user_payload.get('email', None)).order_by(order_by)

    return class_objects.all() if is_staff else \
        class_objects.filter(email=user_payload.get('email', None))


def fetch_users(user_payload, model, **kwargs):
    is_staff = False
    if isinstance(user_payload, dict) and user_payload.get('is_staff', None) is not None:
        is_staff = user_payload.get('is_staff', False)

    user_id = kwargs.get('user_id', None)
    order_by = kwargs.get('order_by', None)
    search = kwargs.get('search', None)
    result = None

    if is_staff and user_id is not None:
        user_id = from_global_id(user_id)[1]

        if order_by is not None:
            return list(model.objects.filter(id=user_id).order_by(order_by))

        return list(model.objects.filter(id=user_id))

    if search is not None:
        if model.__name__ == "BaseUserModel":
            search_query = Q(mobile_phone__icontains=search) | Q(email__icontains=search) | \
                           Q(last_name__icontains=search) | Q(first_name__icontains=search) | \
                           Q(patronymic__icontains=search)

            result = model.objects.filter(search_query) if is_staff else \
                model.objects(email=user_payload.get('email', None)).filter(search_query)
        else:
            result = model.objects.search_text(search) if is_staff else \
                model.objects(email=user_payload.get('email', None)).search_text(search)

    if order_by is not None:
        if result is None:
            result = fetch_objects(get_jwt_identity(), model.objects, order_by=order_by)
        else:
            result = result.order_by(order_by)

    if result is None:
        result = fetch_objects(get_jwt_identity(), model.objects)

    return result


class ApiQuery(graphene.ObjectType):
    node = Node.Field()
    all_users = MongoengineConnectionField(
        BaseUser,
        order_by=graphene.String(required=False),
        user_id=graphene.ID(required=False),
        search=graphene.String(required=False)
    )
    current_user = MongoengineConnectionField(BaseUser)
    users = MongoengineConnectionField(
        User,
        order_by=graphene.String(required=False),
        user_id=graphene.ID(required=False),
        search=graphene.String(required=False)
    )
    drivers = MongoengineConnectionField(
        Driver,
        order_by=graphene.String(required=False),
        user_id=graphene.ID(required=False),
        search=graphene.String(required=False)
    )
    devices = MongoengineConnectionField(
        Device,
        user_id=graphene.ID(required=False)
    )
    warnings = MongoengineConnectionField(
        WarningGraphModel,
        order_by=graphene.String(required=False),
        device_id=graphene.ID(required=False),
        from_date=graphene.Date(required=False),
        to_date=graphene.Date(required=False)
    )

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_all_users(self, info, **kwargs):
        current_user = get_jwt_identity()
        order_by = kwargs.get('order_by', None)
        user_id = kwargs.get('user_id', None)
        search = kwargs.get('search', None)

        return fetch_users(current_user, BaseUserModel, order_by=order_by, user_id=user_id, search=search)

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_warnings(self, info, **kwargs):
        current_user = get_jwt_identity()
        order_by = kwargs.get('order_by', None)
        device_id = kwargs.get('device_id', None)
        device = None
        user_type = current_user.get("type", None)
        from_date = kwargs.get('from_date', None)
        to_date = kwargs.get('to_date', None)

        is_staff = False
        if isinstance(current_user, dict) and current_user.get('is_staff', None) is not None:
            is_staff = current_user.get('is_staff', False)

        if is_staff and device_id is not None:
            device_id = from_global_id(device_id)[1]
            device = DeviceModel.objects(id=device_id).first()

            filter_args = {
                "device": device
            }

            if from_date is not None:
                filter_args["date_issued__gte"] = from_date

            if to_date is not None:
                filter_args["date_issued__lte"] = to_date

            result = WarningModel.objects.filter(**filter_args)

            if order_by is not None:
                result = result.order_by(order_by)

            return result

        if current_user.get("device_id", None) is not None:
            device = DeviceModel.objects(device_id=current_user.get("device_id", None)).first()

        if not is_staff and user_type == 'driver':
            driver_id = from_global_id(current_user.get('id', None))[1]
            driver = DriverModel.objects(id=driver_id).first()
            device = list(DeviceModel.objects(driver=driver))

        if isinstance(device, list):
            filter_args = {
                "device__in": device
            }
        else:
            filter_args = {
                "device": device
            }

        if from_date is not None:
            filter_args["date_issued__gte"] = from_date

        if to_date is not None:
            filter_args["date_issued__lte"] = to_date

        if is_staff:
            if filter_args['device'] is None:
                del filter_args['device']

            result = WarningModel.objects.all().filter(**filter_args)
        else:
            result = WarningModel.objects.filter(**filter_args)

        if order_by is not None:
            result = result.order_by(order_by)

        return result

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_current_user(self, info, **kwargs):
        return BaseUserModel.objects(email=get_jwt_identity().get('email', None))

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_users(self, info, **kwargs):
        current_user = get_jwt_identity()
        order_by = kwargs.get('order_by', None)
        user_id = kwargs.get('user_id', None)
        search = kwargs.get('search', None)

        return fetch_users(current_user, UserModel, order_by=order_by, user_id=user_id, search=search)

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_drivers(self, info, **kwargs):
        current_user = get_jwt_identity()
        order_by = kwargs.get('order_by', None)
        user_id = kwargs.get('user_id', None)
        search = kwargs.get('search', None)

        return fetch_users(current_user, DriverModel, order_by=order_by, user_id=user_id, search=search)

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_devices(self, info, **kwargs):
        identity = get_jwt_identity()
        user_id = kwargs.get('user_id', None)
        ignore_admin = False
        query_by = {
            'driver__email': identity.get('email', None)
        }

        is_staff = False
        if isinstance(identity, dict) and identity.get('is_staff', None) is not None:
            is_staff = identity.get('is_staff', False)

        if is_staff and user_id is not None:
            user_id = from_global_id(user_id)[1]
            ignore_admin = True
            query_by = {
                'driver__id': user_id
            }

        return fetch_objects(
            identity,
            DeviceModel.objects,
            query_by=query_by,
            join_object=DriverModel.objects,
            ignore_admin=ignore_admin
        )


class ApiMutation(graphene.ObjectType):
    login = Login.Field()
    register = Register.Field()
    device_login = DeviceLogin.Field()
    device_register = DeviceRegister.Field()
    remove_device = RemoveDevice.Field()
    delete_user = DeleteUser.Field()
    update_user = UpdateUser.Field()
    add_warning = AddWarning.Field()


schema = graphene.Schema(query=ApiQuery, mutation=ApiMutation, types=[User, Driver])
