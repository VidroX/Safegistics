import graphene

from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from graphql import GraphQLError
from graphql_relay import from_global_id, to_global_id
from mongoengine import NotUniqueError, DoesNotExist
from binascii import Error
from passlib.hash import argon2
from api.decoratos.AuthDecorator import admin_status_required, user_integrity_check
from api.models.BaseUser import BaseUser
from api.mutations.types.AuthTypes import LoginInputData, TokenData, get_type_by_obj, RegisterInputData, USER_TYPES, \
    UserUpdateInputData
from api.statuses import STATUS_CODE
from database.models.BaseUserModel import BaseUserModel
from database.models.DriverModel import DriverModel
from database.models.UserModel import UserModel


class Login(graphene.Mutation):
    class Arguments:
        login_data = LoginInputData(required=True)

    user = graphene.Field(BaseUser)
    token = graphene.Field(TokenData)

    @staticmethod
    def mutate(self, info, login_data=None):
        user = BaseUserModel.objects.get(email=login_data.email)

        if not argon2.verify(login_data.password, user.password):
            raise GraphQLError(STATUS_CODE[100], extensions={'code': 100})

        token_data = TokenData()
        identity = {
            "id": to_global_id(BaseUser.__name__, str(user.id)),
            "email": user.email,
            "type": get_type_by_obj(user),
            "is_staff": user.is_staff if hasattr(user, 'is_staff') else False
        }
        token_data.access_token = create_access_token(identity=identity)
        token_data.refresh_token = create_refresh_token(identity=identity)

        return Login(user=user, token=token_data)


class Register(graphene.Mutation):
    class Arguments:
        register_data = RegisterInputData(required=True)

    user = graphene.Field(BaseUser)
    token = graphene.Field(TokenData)

    @staticmethod
    def mutate(self, info, register_data=None):
        if register_data.type is None:
            register_data.type = USER_TYPES[0]

        if register_data.type not in USER_TYPES:
            raise GraphQLError(STATUS_CODE[101], extensions={'code': 101})

        user = UserModel(
            email=register_data.email,
            password=register_data.password,
            mobile_phone=register_data.mobile_phone,
            first_name=register_data.first_name,
            last_name=register_data.last_name,
            patronymic=register_data.patronymic,
            birthday=register_data.birthday,
        )

        is_staff = user.is_staff

        if register_data.type == 'driver':
            is_staff = False
            manager = None

            if register_data.manager is not None:
                manager_id = from_global_id(register_data.manager)[1]
                manager = UserModel.objects(id=manager_id).first()

            user = DriverModel(
                email=register_data.email,
                password=register_data.password,
                mobile_phone=register_data.mobile_phone,
                first_name=register_data.first_name,
                last_name=register_data.last_name,
                patronymic=register_data.patronymic,
                birthday=register_data.birthday,
                manager=manager
            )

        try:
            user.save()
        except NotUniqueError:
            raise GraphQLError(STATUS_CODE[102], extensions={'code': 102})

        token_data = TokenData()
        identity = {
            "id": to_global_id(BaseUser.__name__, str(user.id)),
            "email": user.email,
            "type": register_data.type,
            "is_staff": is_staff
        }
        token_data.access_token = create_access_token(identity=identity)
        token_data.refresh_token = create_refresh_token(identity=identity)

        return Register(user=user, token=token_data)


class DeleteUser(graphene.Mutation):
    class Arguments:
        user_id = graphene.ID(required=True)

    result = graphene.String()

    @staticmethod
    @jwt_required
    @admin_status_required
    def mutate(self, info, user_id=None):
        current_user = get_jwt_identity()
        message = None

        if user_id is not None:
            try:
                user_global_id = from_global_id(user_id)[1]
                current_user_global_id = from_global_id(current_user.get('id', None))[1]
            except UnicodeDecodeError:
                raise GraphQLError(STATUS_CODE[104], extensions={'code': 104})
            except Error:  # binascii.Error
                raise GraphQLError(STATUS_CODE[104], extensions={'code': 104})

            if user_global_id == current_user_global_id:
                raise GraphQLError(STATUS_CODE[105], extensions={'code': 105})

            try:
                user = BaseUserModel.objects.get(id=user_global_id)
                user.delete()

                message = STATUS_CODE[103]
            except DoesNotExist:
                raise GraphQLError(STATUS_CODE[104], extensions={'code': 104})

        return DeleteUser(result=message)


class UpdateUser(graphene.Mutation):
    class Arguments:
        user_update_id = graphene.ID(required=False)
        user_data = UserUpdateInputData(required=True)

    user = graphene.Field(BaseUser)
    token = graphene.Field(TokenData)

    @staticmethod
    @jwt_required
    @user_integrity_check
    def mutate(self, info, user_data=None, user_update_id=None):
        current_user_id = get_jwt_identity().get('id', None)

        try:
            user_id = from_global_id(current_user_id)[1]
            if user_update_id is not None:
                user_update_id = from_global_id(user_update_id)[1]
        except UnicodeDecodeError:
            raise GraphQLError(STATUS_CODE[104], extensions={'code': 104})
        except Error:  # binascii.Error
            raise GraphQLError(STATUS_CODE[104], extensions={'code': 104})

        current_user = BaseUserModel.objects(id=user_id).first()
        is_staff = current_user['is_staff'] or False

        user_to_change = None
        if user_update_id is not None:
            user_to_change = BaseUserModel.objects(id=user_update_id).first()

        filtered_user_data = {'set__' + k: v for k, v in user_data.items() if v is not None and k != 'type'}

        user_type = user_data.get('type', None)
        if user_type is not None and user_type not in USER_TYPES:
            raise GraphQLError(STATUS_CODE[101], extensions={'code': 101})

        password = filtered_user_data.get('set__password', None)
        if password is not None:
            if not argon2.identify(password):
                filtered_user_data['set__password'] = argon2.using(rounds=4).hash(password)

        is_active = filtered_user_data.get('set__is_active', None)
        if is_active is not None:
            if is_staff is None or not is_staff:
                raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        is_staff_changing = filtered_user_data.get('set__is_staff', None)
        if is_staff_changing is not None:
            if is_staff is None or not is_staff:
                raise GraphQLError(STATUS_CODE[2], extensions={'code': 2})

        email = filtered_user_data.get('set__email', None)
        mobile_phone = filtered_user_data.get('set__mobile_phone', None)
        if email is not None:
            if user_to_change is not None and email == user_to_change['email'] or\
                    user_to_change is None and current_user is not None and current_user['email'] == email:
                filtered_user_data.pop('set__email')
        if mobile_phone is not None:
            if mobile_phone == user_to_change['mobile_phone'] or\
                    user_to_change is None and current_user is not None and\
                    current_user['mobile_phone'] == mobile_phone:
                filtered_user_data.pop('set__mobile_phone')

        try:
            if user_update_id is not None and user_to_change is not None:
                user_to_change.update(**filtered_user_data)
                user_to_change.reload()
            else:
                current_user.update(**filtered_user_data)
                current_user.reload()
        except NotUniqueError:
            raise GraphQLError(STATUS_CODE[102], extensions={'code': 102})

        if user_to_change is not None and hasattr(user_to_change, 'is_staff'):
            is_staff = user_to_change['is_staff'] or False
        elif current_user is not None and hasattr(current_user, 'is_staff'):
            is_staff = current_user['is_staff'] or False
        else:
            is_staff = False

        user_type = get_jwt_identity().get('type', None)
        if filtered_user_data.get('type', None) is not None and user_to_change is None:
            user_type = filtered_user_data.get('type', None)

        token_data = TokenData()
        identity = {
            "id": to_global_id(BaseUser.__name__, str(current_user.id)),
            "email": current_user.email,
            "type": user_type,
            "is_staff": is_staff
        }

        token_data.access_token = create_access_token(identity=identity)
        token_data.refresh_token = create_refresh_token(identity=identity)

        return UpdateUser(user=current_user, token=token_data)
