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
    if query is not None and isinstance(query, dict):
        join_object = kwargs.get('join_object', None)

        if join_object is not None:
            if not is_staff:
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
                    object_to_find = query

                if order_by is not None:
                    new_query = class_objects.filter(**object_to_find).order_by(order_by)
                else:
                    new_query = class_objects.filter(**object_to_find)
            else:
                if order_by is not None:
                    new_query = class_objects.all().order_by(order_by)
                else:
                    new_query = class_objects.all()

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


class ApiQuery(graphene.ObjectType):
    node = Node.Field()
    all_users = MongoengineConnectionField(
        BaseUser,
        order_by=graphene.String(required=False),
        user_id=graphene.ID(required=False),
        search=graphene.String(required=False)
    )
    current_user = MongoengineConnectionField(BaseUser)
    users = MongoengineConnectionField(User)
    drivers = MongoengineConnectionField(Driver)
    devices = MongoengineConnectionField(Device)
    warnings = MongoengineConnectionField(
        WarningGraphModel,
        order_by=graphene.String(required=False),
        device_id=graphene.ID(required=False)
    )

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_all_users(self, info, **kwargs):
        current_user = get_jwt_identity()
        order_by = kwargs.get('order_by', None)
        user_id = kwargs.get('user_id', None)
        search = kwargs.get('search', None)
        result = None

        is_staff = False
        if isinstance(current_user, dict) and current_user.get('is_staff', None) is not None:
            is_staff = current_user.get('is_staff', False)

        if is_staff and user_id is not None:
            user_id = from_global_id(user_id)[1]

            if order_by is not None:
                return list(WarningModel.objects.filter(id=user_id).order_by(order_by))

            return list(BaseUserModel.objects.filter(id=user_id))

        if search is not None:
            search_query = Q(mobile_phone__icontains=search) | Q(email__icontains=search) |\
                           Q(last_name__icontains=search) | Q(first_name__icontains=search) |\
                           Q(patronymic__icontains=search)
            
            result = BaseUserModel.objects.filter(search_query) if is_staff else\
                BaseUserModel.objects(email=current_user.get('email', None)).filter(search_query)

        if order_by is not None:
            if result is None:
                result = fetch_objects(get_jwt_identity(), BaseUserModel.objects, order_by=order_by)
            else:
                result = result.order_by(order_by)

        if result is None:
            result = fetch_objects(get_jwt_identity(), BaseUserModel.objects)

        return result

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_warnings(self, info, **kwargs):
        current_user = get_jwt_identity()
        order_by = kwargs.get('order_by', None)
        device_id = kwargs.get('device_id', None)
        device = None
        user_type = current_user.get("type", None)

        is_staff = False
        if isinstance(current_user, dict) and current_user.get('is_staff', None) is not None:
            is_staff = current_user.get('is_staff', False)

        if is_staff and device_id is not None:
            device_id = from_global_id(device_id)[1]
            device = DeviceModel.objects(id=device_id).first()

            if order_by is not None:
                return list(WarningModel.objects.filter(device=device).order_by(order_by))

            return list(WarningModel.objects.filter(device=device))

        if current_user.get("device_id", None) is not None:
            device = DeviceModel.objects(device_id=current_user.get("device_id", None)).first()

        if not is_staff and user_type == 'driver':
            driver_id = from_global_id(current_user.get('id', None))[1]
            driver = DriverModel.objects(id=driver_id).first()
            device = list(DeviceModel.objects(driver=driver))

        if order_by is not None:
            return list(WarningModel.objects.order_by(order_by)) if is_staff else\
                list(WarningModel.objects.filter(device__in=device).order_by(order_by)) if isinstance(device, list)\
                else list(WarningModel.objects.filter(device=device).order_by(order_by))

        return list(WarningModel.objects.all()) if is_staff else\
            list(WarningModel.objects.filter(device__in=device)) if isinstance(device, list)\
            else list(WarningModel.objects.filter(device=device))

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_current_user(self, info, **kwargs):
        return BaseUserModel.objects(email=get_jwt_identity().get('email', None))

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_users(self, info, **kwargs):
        return fetch_objects(get_jwt_identity(), UserModel.objects)

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_drivers(self, info, **kwargs):
        return fetch_objects(get_jwt_identity(), DriverModel.objects)

    @staticmethod
    @jwt_required
    @user_integrity_check
    def resolve_devices(self, info, **kwargs):
        identity = get_jwt_identity()
        return fetch_objects(
            identity,
            DeviceModel.objects,
            query_by={'driver__email': identity['email']},
            join_object=DriverModel.objects
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
