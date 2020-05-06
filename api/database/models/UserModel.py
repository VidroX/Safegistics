from mongoengine import BooleanField

from database.models.BaseUserModel import BaseUserModel


class UserModel(BaseUserModel):
    is_staff = BooleanField(required=True, default=False)
