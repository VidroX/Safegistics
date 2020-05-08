from mongoengine import NULLIFY
from mongoengine.fields import ReferenceField
from database.models.BaseUserModel import BaseUserModel
from database.models.UserModel import UserModel


class DriverModel(BaseUserModel):
    meta = {
        'indexes': [
            {
                'fields': ['$email', "$mobile_phone", "$first_name", "$last_name", "$patronymic"],
                'default_language': 'english',
                'weights': {'email': 10, 'mobile_phone': 8, 'last_name': 6, 'patronymic': 4, 'first_name': 2}
            }
        ]
    }

    manager = ReferenceField(UserModel, null=True, reverse_delete_rule=NULLIFY)
