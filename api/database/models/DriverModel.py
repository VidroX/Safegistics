from mongoengine.fields import ReferenceField
from database.models.BaseUserModel import BaseUserModel
from database.models.UserModel import UserModel


class DriverModel(BaseUserModel):
    manager = ReferenceField(UserModel, null=True)
